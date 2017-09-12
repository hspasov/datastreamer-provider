import React from "react";
import { connect } from "react-redux";
import io from "socket.io-client";
import formurlencoded from "form-urlencoded";

import Client from "../modules/client";

const pathModule = window.require("path");
const chokidar = window.require("chokidar");
const dialog = window.require("electron").dialog;

class DataWatcher extends React.Component {
    constructor(props) {
        super(props);
        this.selectedRootDirectory = "";
        this.socket = io("http://localhost:3000", {
            query: `type=provider&id=${this.props.provider.providerId}`
        });
        this.clients = new Map();

        this.socket.on("subscribedClient", clientId => {
            this.clients.set(clientId, new Client(clientId));
            if (this.selectedRootDirectory) {
                this.scanDirectory(this.clients.get(clientId));
            }
        });

        this.socket.on("unsubscribedClient", clientId => {
            let client = this.clients.get(clientId);
            client.delete();
            this.clients.delete(clientId);
        });

        this.socket.on("openDirectory", (clientId, selectedDirectory) => {
            const client = this.clients.get(clientId);
            client.changeDirectory(selectedDirectory);
            this.scanDirectory(this.clients.get(clientId));
        })

        this.handleSelectRootDirectory = this.handleSelectRootDirectory.bind(this);
        this.initializeScan = this.initializeScan.bind(this);
        this.scanDirectory = this.scanDirectory.bind(this);
        this.deleteSession = this.deleteSession.bind(this);
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
        this.socket.disconnect();
        this.clients.forEach((client, clientId) => {
            client.delete();
        });
    }

    initializeScan() {
        if (!this.selectedRootDirectory) {
            console.log("Please select a directory to scan");
        } else {
            this.clients.forEach((client, clientId) => {
                client.restart();
                this.scanDirectory(client);
            });
        }
    }

    scanDirectory(client) {
        let sendDirectoryData = true;
        const path = pathModule.join(this.selectedRootDirectory, client.currentDirectory)
        client.setWatcher(chokidar.watch(path, client.watcherOptions));

        client.watcher
            .on("raw", (event, path, details) => {
                // This event should be triggered everytime something happens.
                console.log("Raw event info:", event, path, details);
            })
            .on("add", path => {
                client.changeScannedFiles(path, sendDirectoryData);
                if (sendDirectoryData) {
                    sendDirectoryData = false;
                    this.socket.emit("sendDirectoryData", client.id, client.scannedFiles.get(path));
                } else {
                    this.socket.emit("sendData", client.id, {
                        action: "add",
                        value: client.scannedFiles.get(path)
                    });
                }
            })
            .on("addDir", path => {
                client.changeScannedFiles(path, sendDirectoryData);
                if (sendDirectoryData) {
                    sendDirectoryData = false;
                    this.socket.emit("sendDirectoryData", client.id, client.scannedFiles.get(path));
                } else {
                    this.socket.emit("sendData", client.id, {
                        action: "addDir",
                        value: client.scannedFiles.get(path)
                    });
                }
            })
            .on("change", path => {
                client.changeScannedFiles(path);
                this.socket.emit("sendData", client.id, {
                    action: "change",
                    value: client.scannedFiles.get(path)
                });
            })
            .on("unlink", path => {
                this.socket.emit("sendData", client.id, {
                    action: "unlink",
                    value: client.scannedFiles.get(path)
                });
                client.removeFromScannedFiles(path);
            })
            .on("unlinkDir", path => {
                this.socket.emit("sendData", client.id, {
                    action: "unlinkDir",
                    value: client.scannedFiles.get(path)
                });
                client.removeFromScannedFiles(path);
            })
            .on("error", error => {
                console.log("Error happened", error);
            })
            .on("ready", () => {
                console.info("Initial scan has been completed.");
            });
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
                <button id="scanDirectory" onClick={this.initializeScan}>Scan Directory</button>
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