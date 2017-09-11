import React from "react";
import { connect } from "react-redux";
import io from "socket.io-client";
import formurlencoded from "form-urlencoded";
import TreeModel from "tree-model";

import getFileType from "../modules/getFileType";
import getFilePermissions from "../modules/getFilePermissions";

const pathModule = window.require("path");
const chokidar = window.require("chokidar");
const fs = window.require("fs");
const dialog = window.require("electron").dialog;
const tree = new TreeModel();

class DataWatcher extends React.Component {
    constructor(props) {
        super(props);
        this.selectedRootDirectory = "";
        this.clientsCurrentDirectory = new Map();
        this.scannedFiles = null;
        this.watcher = null;
        this.watcherOptions = {
            ignored: /[\/\\]\./,
            persistent: true,
            usePolling: true
        };
        this.socket = io("http://localhost:3000", {
            query: `type=provider&id=${this.props.provider.providerId}`
        });

        this.socket.on("subscribedClient", clientId => {
            this.clientsCurrentDirectory.set(clientId, this.selectedRootDirectory);
            if (this.scannedFiles !== null) {
                this.socket.emit("sendDirectoryData", clientId, this.scannedFiles.model.value);
                this.scannedFiles.children.forEach(node => {
                    this.socket.emit("sendData", clientId, {
                        action: "init",
                        value: node.model.value
                    });
                });
            }
        });

        this.socket.on("openDirectory", (clientId, selectedDirectory) => {
            const path = selectedDirectory === pathModule.sep ?
                this.selectedRootDirectory : pathModule.join(this.selectedRootDirectory, selectedDirectory);
            this.clientsCurrentDirectory.set(clientId, path);
            let directoryNode = this.scannedFiles.first(node => {
                return node.model.id === path;
            });
            this.socket.emit(
                "sendDirectoryData",
                clientId,
                directoryNode.model.value // todo: read TreeModel's docs
            );
            directoryNode.children.forEach(node => {
                this.socket.emit("sendData", clientId, {
                    action: "init",
                    value: (node.value) ? node.value : node.model.value // todo: check TreeModel's docs
                });
            });
        });

        this.socket.on("removeClient", clientId => {
            this.clientsCurrentDirectory.delete(clientId);
        });

        this.handleSelectRootDirectory = this.handleSelectRootDirectory.bind(this);
        this.scanDirectory = this.scanDirectory.bind(this);
        this.addFile = this.addFile.bind(this);
        this.changeFile = this.changeFile.bind(this);
        this.removeFile = this.removeFile.bind(this);
        this.deleteSession = this.deleteSession.bind(this);
        this.getFileMetadata = this.getFileMetadata.bind(this);
    }

    componentDidMount() {
        if (this.props.provider.providerId) {
            window.addEventListener("beforeunload", this.deleteSession);
        }
        this.socket.emit("connectToClients", this.props.provider.providerId);
    }

    componentWillUnmount() {
        if (this.props.provider.providerId) {
            this.deleteSession();
            window.removeEventListener("beforeunload", this.deleteSession);
        }
    }

    deleteSession() {
        if (this.watcher != null) {
            this.watcher.close();
        }
        this.socket.disconnect();
        this.selectedRootDirectory = "";
        this.scannedFiles = null;
        this.watcher = null;
        this.socket = null;
    }

    scanDirectory() {
        if (this.watcher !== null) {
            this.watcher.close();
        }

        this.scannedFiles = tree.parse({
            id: this.selectedRootDirectory,
            value: this.getFileMetadata(this.selectedRootDirectory),
            children: []
        });

        this.watcher = chokidar.watch(this.selectedRootDirectory, this.watcherOptions);

        let onWatcherReady = () => {
            console.info("Initial scan has been completed.");
            console.log(this.scannedFiles);
        }

        this.watcher
            .on("raw", (event, path, details) => {
                // This event should be triggered everytime something happens.
                console.log("Raw event info:", event, path, details);
            })
            .on("add", path => {
                let fileMetadata = this.addFile(path);
                let parent = pathModule.dirname(path);
                this.clientsCurrentDirectory.forEach((currentDirectory, client) => {
                    // emit only to clients that are in the directory where the change
                    // is happening
                    if (parent === currentDirectory) {
                        this.socket.emit("sendData", client, {
                            action: "add",
                            value: fileMetadata
                        });
                    }
                });
            })
            .on("addDir", path => {
                let fileMetadata = this.addFile(path);
                let parent = pathModule.dirname(path);
                this.clientsCurrentDirectory.forEach((currentDirectory, client) => {
                    if (parent === currentDirectory) {
                        this.socket.emit("sendData", client, {
                            action: "addDir",
                            value: fileMetadata
                        });
                    }
                });
            })
            .on("change", path => {
                let fileMetadata = this.changeFile(path);
                let parent = pathModule.dirname(path);
                this.clientsCurrentDirectory.forEach((currentDirectory, client) => {
                    if (parent === currentDirectory) {
                        this.socket.emit("sendData", receiver, {
                            action: "change",
                            value: fileMetadata
                        });
                    }
                });
            })
            .on("unlink", path => {
                let fileMetadata = this.removeFile(path);
                let parent = pathModule.dirname(path);
                this.clientsCurrentDirectory.forEach((currentDirectory, client) => {
                    if (parent === currentDirectory) {
                        this.socket.emit("sendData", receiver, {
                            action: "unlink",
                            value: fileMetadata
                        });
                    }
                });
            })
            .on("unlinkDir", path => {
                let fileMetadata = this.removeFile(path);
                let parent = pathModule.dirname(path);
                this.clientsCurrentDirectory.forEach((currentDirectory, client) => {
                    if (parent === currentDirectory) {
                        this.socket.emit("sendData", receiver, {
                            action: "unlinkDir",
                            value: fileMetadata
                        });
                    }
                });
            })
            .on("error", error => {
                console.log("Error happened", error);
            })
            .on("ready", onWatcherReady);
    }

    getFileMetadata(path) {
        let metadata = {};
        let stats = fs.lstatSync(path);
        // size in bytes:
        metadata.name = pathModule.basename(path);
        metadata.path = (path == this.selectedRootDirectory) ?
            path.sep : path.replace(this.selectedRootDirectory, ""); // hide absolute path
        metadata.type = getFileType(path);
        metadata.size = stats["size"];
        metadata.access = getFilePermissions(path);
        return metadata;
    }

    addFile(path) {
        const fileMetadata = this.getFileMetadata(path);
        const parentPath = pathModule.dirname(path);
        if (path !== this.selectedRootDirectory) {
            let parent = this.scannedFiles.first(node => {
                return node.model.id === parentPath;
            });
            parent.addChild(tree.parse({
                id: path,
                value: fileMetadata,
                children: []
            }));
        }
        return fileMetadata;
    }

    changeFile(path) {
        const fileMetadata = this.getFileMetadata(path);
        let file = this.scannedFiles.first(node => {
            return node.model.id === path;
        });
        file.model.value = fileMetadata;
        return fileMetadata;
    }

    removeFile(path) {
        let file = this.scannedFiles.first(node => {
            return node.model.id === path;
        });
        file.drop();
        return fileMetadata;
    }

    _addDirectory(node) {
        if (node) {
            node.webkitdirectory = true;
        }
    }

    selectDirectory() {
        dialog.showOpenDialog(mainWindow, {
            properties: ["openDirectory"]
        });
    }

    handleSelectRootDirectory(event) {
        let dirPath = event.target.files[0].path;
        this.selectedRootDirectory = dirPath;
        this.clientsCurrentDirectory.forEach((currentDirectory, client) => {
            this.clientsCurrentDirectory.set(client, dirPath);
            this.socket.emit("sendDirectoryData", client, this.getFileMetadata(dirPath));
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
                <button id="scanDirectory" onClick={this.scanDirectory}>Scan Directory</button>
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