import React from 'react';

class DataWatcher extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selectedDirectory: '', watcher: null };

        this.handleSelectDirectory = this.handleSelectDirectory.bind(this);
        this.scanDirectory = this.scanDirectory.bind(this);
    }

    componentWillUnmount() {
        this.state.watcher.close();
        this.setState({ selectedDirectory: '', watcher: null });
    }

    scanDirectory() {
        const path = this.state.selectedDirectory;
        const chokidar = window.require("chokidar");

        if (this.state.watcher !== null) {
            this.state.watcher.close();
        }

        this.state.watcher = chokidar.watch(path, {
            ignored: /[\/\\]\./,
            persistent: true
        });

        let onWatcherReady = () => {
            console.info('Initial scan has been completed.');
        }

        this.state.watcher
            .on('add', path => {
                console.log('File', path, 'has been added');
            })
            .on('addDir', path => {
                console.log('Directory', path, 'has been added');
            })
            .on('change', path => {
                console.log('File', path, 'has been changed');
            })
            .on('unlink', path => {
                console.log('File', path, 'has been removed');
            })
            .on('unlinkDir', path => {
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