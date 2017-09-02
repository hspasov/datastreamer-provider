import React from 'react';
import io from 'socket.io-client';

class DataWatcher extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRootDirectory: '',
            currentDirectory: '',
            watcher: null,
            watcherOptions: {
                ignored: /[\/\\]\./,
                persistent: true,
                usePolling: true,
                depth: 0
            },
            socket: io('http://localhost:3000')
        };

        this.state.socket.on('serverHandshake', msg => {
            console.log(msg);
        });

        this.handleSelectRootDirectory = this.handleSelectRootDirectory.bind(this);
        this.scanDirectory = this.scanDirectory.bind(this);
    }

    componentWillUnmount() {
        this.state.watcher.close();
        this.state.socket.disconnect();
        this.setState({ selectedRootDirectory: '', watcher: null, socket: null });
    }

    scanDirectory() {
        const path = this.state.selectedRootDirectory;
        const chokidar = window.require("chokidar");

        if (this.state.watcher !== null) {
            this.state.watcher.close();
        }

        this.state.watcher = chokidar.watch(path, this.state.watcherOptions);

        let onWatcherReady = () => {
            console.info('Initial scan has been completed.');
            // A check for connection is needed
            console.log(this.state.socket.id);
            console.log(this.state.socket);
            this.state.socket.emit('serverHandshake', "Ready");
        }

        this.state.watcher
            .on('add', path => {
                this.state.socket.emit('demo', `File ${path} has been added`);
                console.log('File', path, 'has been added');
            })
            .on('addDir', path => {
                this.state.socket.emit('demo', `Directory ${path} has been added`);
                console.log('Directory', path, 'has been added');
            })
            .on('change', path => {
                this.state.socket.emit('demo', `File ${path} has been changed`);
                console.log('File', path, 'has been changed');
            })
            .on('unlink', path => {
                this.state.socket.emit('demo', `File ${path} has been removed`);
                console.log('File', path, 'has been removed');
            })
            .on('unlinkDir', path => {
                this.state.socket.emit('demo', `Directory ${path} has been changed`);
                console.log('Directory', path, 'has been removed');
            })
            .on('error', error => {
                console.log('Error happened', error);
            })
            .on('ready', onWatcherReady)
            .on('raw', function (event, path, details) {
                // This event should be triggered everytime something happens.
                console.log('Raw event info:', event, path, details);
            });
    }

    _addDirectory(node) {
        if (node) {
            node.webkitdirectory = true;
        }
    }

    selectDirectory() {
        const dialog = window.require('electron').dialog;

        dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        });
    }

    handleSelectRootDirectory(event) {
        this.setState({ selectedRootDirectory: event.target.files[0].path });
    }

    render() {
        return (
            <div>
                <input ref={node => this._addDirectory(node)} type="file" onChange={this.handleSelectRootDirectory} />
                <button id="scanDirectory" onClick={this.scanDirectory}>Scan Directory</button>
            </div>
        );
    }
}

export default DataWatcher