import React from 'react';

class DataWatcher extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selectedDirectory: '', watcher: null, socket: null };

        this.handleSelectDirectory = this.handleSelectDirectory.bind(this);
        this.scanDirectory = this.scanDirectory.bind(this);
    }

    componentWillUnmount() {
        this.state.watcher.close();
        this.state.socket.disconnect();
        this.setState({ selectedDirectory: '', watcher: null, socket: null });
    }

    scanDirectory() {
        this.state.socket = require('socket.io-client')('http://localhost:3000');
        const path = this.state.selectedDirectory;
        const chokidar = window.require("chokidar");

        if (this.state.watcher !== null) {
            this.state.watcher.close();
        }

        this.state.watcher = chokidar.watch(path, {
            ignored: /[\/\\]\./,
            persistent: true,
            usePolling: true
        });

        let onWatcherReady = () => {
            console.info('Initial scan has been completed.');
            // A check for connection is needed
            this.state.socket.emit('demo', "Ready");
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

    handleSelectDirectory(event) {
        this.setState({ selectedDirectory: event.target.files[0].path });
    }

    render() {
        return (
            <div>
                <input ref={node => this._addDirectory(node)} type="file" onChange={this.handleSelectDirectory} />
                <button id="scanDirectory" onClick={this.scanDirectory}>Scan Directory</button>
            </div>
        );
    }
}

export default DataWatcher