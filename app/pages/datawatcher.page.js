import React from "react";
import { connect } from "react-redux";
import io from "socket.io-client";
import formurlencoded from "form-urlencoded";

import Client from "../modules/client";

const fs = window.require("fs");
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

        this.socket.on("unsubscribedClient", clientId => {
            let client = this.clients.get(clientId);
            client.delete();
            this.clients.delete(clientId);
        });

        this.socket.on("setRemoteDescription", (clientId, description) => {
            this.clients.set(clientId, new Client(clientId));
            const client = this.clients.get(clientId);
            client.servers = null;
            client.peerConnectionConstraint = null;
            client.dataConstraint = null;
            client.peerConnection = new RTCPeerConnection(client.servers, client.peerConnectionConstraint);
            console.log("created peer connection", client.peerConnection);
            client.peerConnection.onicecandidate = event => {
                console.log("ice callback");
                if (event.candidate) {
                    console.log("sending candidate", event.candidate);
                    this.socket.emit("sendICECandidate", "client", this.props.provider.providerId, event.candidate);
                }
            };

            client.peerConnection.ondatachannel = event => {
                console.log("Receive channel callback");
                client.receiveChannel = event.channel;
                client.receiveChannel.onmessage = event => {
                    this.processMessage(client, JSON.parse(event.data));
                }
            }

            client.receiveChannel = client.peerConnection.createDataChannel("receiveDataChannel", client.dataConstraint);
            console.log("created receive channel", client.receiveChannel);
            client.sendChannel = client.peerConnection.createDataChannel("sendDataChannel", client.dataConstraint);
            console.log("created send channel", client.receiveChannel);
            console.log("setting remote description", description);

            client.sendChannel.onopen = () => {
                console.log("Send channel is ", client.sendChannel.readyState);
                client.sendChannel.send(JSON.stringify({
                    action: "message",
                    message: "It works, from provider"
                }));
                if (this.selectedRootDirectory) {
                    this.scanDirectory(client);
                }
            }

            client.peerConnection.setRemoteDescription(description);

            client.peerConnection.createAnswer().then(
                description => {
                    console.log("creating answer");
                    console.log("setting local description", description);
                    client.peerConnection.setLocalDescription(description);
                    this.socket.emit("connectToClient", clientId, description);
                },
                error => {
                    console.log("there was an error while creating an answer", error);
                }
            );
        });

        this.socket.on("receiveICECandidate", (clientId, candidate) => {
            console.log("receiving ICE Candidate");
            const client = this.clients.get(clientId);
            client.peerConnection.addIceCandidate(candidate).then(
                () => {
                    console.log("added ice candidate", candidate);
                },
                error => {
                    console.log("failed to add candidate", error);
                }
            );
        });

        this.handleSelectRootDirectory = this.handleSelectRootDirectory.bind(this);
        this.connectToClients = this.connectToClients.bind(this);
        this.processMessage = this.processMessage.bind(this);
        this.initializeScan = this.initializeScan.bind(this);
        this.scanDirectory = this.scanDirectory.bind(this);
        this.deleteSession = this.deleteSession.bind(this);
    }

    componentDidMount() {
        if (this.props.provider.providerId) {
            window.addEventListener("beforeunload", this.deleteSession);
        }
        this.connectToClients();
    }

    componentWillUnmount() {
        if (this.props.provider.providerId) {
            this.deleteSession();
            window.removeEventListener("beforeunload", this.deleteSession);
        }
    }

    connectToClients() {
        this.socket.emit("connectToClients", this.props.provider.providerId);
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

    processMessage(client, message) {
        switch (message.action) {
            case "openDirectory":
                client.changeDirectory(message.selectedDirectory);
                this.scanDirectory(client);
                break;
            case "message":
                console.log(message.message);
                break;
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
                    client.sendChannel.send(JSON.stringify({
                        action: "sendDirectoryData",
                        data: client.scannedFiles.get(path)
                    }));
                } else {
                    client.sendChannel.send(JSON.stringify({
                        action: "add",
                        data: client.scannedFiles.get(path)
                    }));
                }
            })
            .on("addDir", path => {
                client.changeScannedFiles(path, sendDirectoryData);
                if (sendDirectoryData) {
                    sendDirectoryData = false;
                    client.sendChannel.send(JSON.stringify({
                        action: "sendDirectoryData",
                        data: client.scannedFiles.get(path)
                    }));
                } else {
                    client.sendChannel.send(JSON.stringify({
                        action: "addDir",
                        data: client.scannedFiles.get(path)
                    }));
                }
            })
            .on("change", path => {
                client.changeScannedFiles(path);
                client.sendChannel.send(JSON.stringify({
                    action: "change",
                    data: client.scannedFiles.get(path)
                }));
            })
            .on("unlink", path => {
                client.sendChannel.send(JSON.stringify({
                    action: "unlink",
                    data: client.scannedFiles.get(path)
                }));
                client.removeFromScannedFiles(path);
            })
            .on("unlinkDir", path => {
                client.sendChannel.send(JSON.stringify({
                    action: "unlinkDir",
                    data: client.scannedFiles.get(path)
                }));
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