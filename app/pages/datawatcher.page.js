import React from "react";
import { connect } from "react-redux";
import io from "socket.io-client";
import formurlencoded from "form-urlencoded";

import getFileType from "../modules/getFileType";
import getFilePermissions from "../modules/getFilePermissions";

class DataWatcher extends React.Component {
    constructor(props) {
        const pathModule = window.require("path");
        super(props);
        this.state = {
            selectedRootDirectory: "",
            currentDirectory: ".",
            scannedFiles: new Map(),
            watcher: null,
            watcherOptions: {
                ignored: /[\/\\]\./,
                persistent: true,
                usePolling: true,
                depth: 0
            },
            socket: io("http://localhost:3000", {
                query: `type=provider&id=${this.props.provider.providerId}`
            })
        };

        this.state.socket.on("getAllData", receiver => {
            this.state.scannedFiles.forEach((file, key) => {
                this.state.socket.emit("sendData", receiver, {
                    action: "init",
                    value: file
                });
            });
        });

        this.state.socket.on("openDirectory", (receiver, selectedDirectory) => {
            console.log(`Current directory: ${this.state.currentDirectory}, Requested to open directory ${selectedDirectory}`);
            this.setState({
                currentDirectory: selectedDirectory,
                scannedFiles: new Map()
            });
            this.scanDirectory(receiver);
        })

        this.handleSelectRootDirectory = this.handleSelectRootDirectory.bind(this);
        this.initialScan = this.initialScan.bind(this);
        this.scanDirectory = this.scanDirectory.bind(this);
        this.changeScannedFiles = this.changeScannedFiles.bind(this);
        this.removeFromScannedFiles = this.removeFromScannedFiles.bind(this);
        this.deleteSession = this.deleteSession.bind(this);
        this.getFileMetadata = this.getFileMetadata.bind(this);
    }

    componentDidMount() {
        if (this.props.provider.providerId) {
            window.addEventListener('beforeunload', this.deleteSession);
        }
        this.state.socket.emit("connectToClients", this.props.provider.providerId);
    }

    componentWillUnmount() {
        if (this.props.provider.providerId) {
            this.deleteSession();
            window.removeEventListener('beforeunload', this.deleteSession);
        }
    }

    deleteSession() {
        if (this.state.watcher != null) {
            this.state.watcher.close();
        }
        this.state.socket.disconnect();
        this.setState({
            selectedRootDirectory: "",
            currentDirectory: ".",
            scannedFiles: null,
            watcher: null,
            socket: null
        });
    }

    initialScan() {
        this.scanDirectory(null);
    }

    scanDirectory(receiver) {
        const pathModule = window.require("path");
        const path = pathModule.join(this.state.selectedRootDirectory, this.state.currentDirectory);

        const chokidar = window.require("chokidar");

        if (this.state.watcher !== null) {
            this.state.watcher.close();
        }

        this.state.watcher = chokidar.watch(path, this.state.watcherOptions);

        let onWatcherReady = () => {
            console.info("Initial scan has been completed.");
        }

        this.state.watcher
            .on("raw", function (event, path, details) {
                // This event should be triggered everytime something happens.
                console.log("Raw event info:", event, path, details);
            })
            .on("add", path => {
                this.changeScannedFiles(path);
                this.state.socket.emit("sendData", receiver, {
                    action: "add",
                    value: this.state.scannedFiles.get(path)
                });
            })
            .on("addDir", path => {
                this.changeScannedFiles(path);
                this.state.socket.emit("sendData", receiver, {
                    action: "addDir",
                    value: this.state.scannedFiles.get(path)
                });
            })
            .on("change", path => {
                this.changeScannedFiles(path);
                this.state.socket.emit("sendData", receiver, {
                    action: "change",
                    value: this.state.scannedFiles.get(path)
                });
            })
            .on("unlink", path => {
                this.state.socket.emit("sendData", receiver, {
                    action: "unlink",
                    value: this.state.scannedFiles.get(path)
                });
                this.removeFromScannedFiles(path);
            })
            .on("unlinkDir", path => {
                this.state.socket.emit("sendData", receiver, {
                    action: "unlinkDir",
                    value: this.state.scannedFiles.get(path)
                });
                this.removeFromScannedFiles(path);
            })
            .on("error", error => {
                console.log("Error happened", error);
            })
            .on("ready", onWatcherReady);
    }

    getFileMetadata(path) {
        const pathModule = window.require("path");
        const fs = window.require("fs");
        let metadata = {};
        let stats = fs.lstatSync(path);
        // size in bytes:
        metadata.name = pathModule.basename(path);
        metadata.path = (path == pathModule.join(this.state.selectedRootDirectory, this.state.currentDirectory)) ?
            this.state.currentDirectory : pathModule.join(this.state.currentDirectory, metadata.name);
        metadata.type = getFileType(path);
        metadata.size = stats["size"];
        metadata.access = getFilePermissions(path);
        return metadata;
    }

    changeScannedFiles(path) {
        let fileMetadata = this.getFileMetadata(path);
        this.state.scannedFiles.set(path, fileMetadata);
    }

    removeFromScannedFiles(path) {
        this.state.scannedFiles.delete(path);
    }

    _addDirectory(node) {
        if (node) {
            node.webkitdirectory = true;
        }
    }

    selectDirectory() {
        const dialog = window.require("electron").dialog;

        dialog.showOpenDialog(mainWindow, {
            properties: ["openDirectory"]
        });
    }

    handleSelectRootDirectory(event) {
        let dirPath = event.target.files[0].path;
        this.setState({
            selectedRootDirectory: dirPath
        });
    }

    render() {
        if (!this.props.provider.providerId) {
            return (
                <p>Please login or register.</p>
            );
        }
        return (
            <div>
                <input ref={node => this._addDirectory(node)} type="file" onChange={this.handleSelectRootDirectory} />
                <button id="scanDirectory" onClick={this.initialScan}>Scan Directory</button>
            </div>
        );
    }
}

const DataWatcherPage = connect(store => {
    return {
        provider: store.provider,
    };
})(DataWatcher);

export default DataWatcherPage;