import React from "react";
import { connect } from "react-redux";
import io from "socket.io-client";
import fileExtension from "file-extension";
import mime from "mime";

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
            query: `type=provider&username=${this.props.provider.username}`
        });
        this.clients = new Map();

        this.socket.on("unsubscribedClient", clientId => {
            let client = this.clients.get(clientId);
            this.deleteP2PConnection(client);
        });

        this.socket.on("subscribedClient", clientId => {
            this.clients.set(clientId, new Client(clientId));
            console.log("Just set clientId", clientId);
            const client = this.clients.get(clientId);
            this.initializeP2PConnection(client);
        });

        this.socket.on("initConnection", (clientId, description) => {
            console.log("initting connection");
            const client = this.clients.get(clientId);
            try {
                client.peerConnection.setRemoteDescription(description);

                client.peerConnection.createAnswer().then(
                    description => {
                        client.peerConnection.setLocalDescription(description);
                        console.log("Answer from remoteConnection \n" + description.sdp);
                        this.socket.emit("connectToClient", clientId, description);
                    },
                    error => {
                        console.log("there was an error while creating an answer", error);
                        this.deleteP2PConnection(client, error);
                    }
                );
            } catch (e) {
                if (!client || !client.peerConnection) {
                    console.log("Connection to client lost.");
                } else {
                    throw e;
                }
            }
        });

        this.socket.on("resetConnection", clientId => {
            const client = this.clients.get(clientId);
            this.deleteP2PConnection(client);
            this.initializeP2PConnection(client);
        });

        this.socket.on("receiveICECandidate", (clientId, candidate) => {
            const client = this.clients.get(clientId);
            console.log("receiving ice candidate from clientId: ", clientId);
            console.log("all clients: ", this.clients);
            try {
                client.peerConnection.addIceCandidate(candidate).then(
                    () => {
                        console.log("AddIceCandidate success");
                    },
                    error => {
                        console.log("failed to add candidate", error);
                        this.deleteP2PConnection(client, error);
                    }
                );
                console.log("Local ICE candidate: \n " + candidate);
            } catch (e) {
                if (!client || !client.peerConnection) {
                    console.log("Connection to client lost.");
                } else {
                    throw e;
                }
            }
        });

        this.handleSelectRootDirectory = this.handleSelectRootDirectory.bind(this);
        this.connectToClients = this.connectToClients.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.processMessage = this.processMessage.bind(this);
        this.initializeScan = this.initializeScan.bind(this);
        this.initializeP2PConnection = this.initializeP2PConnection.bind(this);
        this.sendFile = this.sendFile.bind(this);
        this.scanDirectory = this.scanDirectory.bind(this);
        this.deleteClientSession = this.deleteP2PConnection.bind(this);
        this.deleteSession = this.deleteSession.bind(this);
    }

    componentDidMount() {
        if (this.props.provider.username) {
            window.addEventListener("beforeunload", this.deleteSession);
        }
        this.connectToClients();
    }

    componentWillUnmount() {
        if (this.props.provider.username) {
            this.deleteSession();
            window.removeEventListener("beforeunload", this.deleteSession);
        }
    }

    connectToClients() {
        this.socket.emit("connectToClients", this.props.provider.username);
    }

    initializeP2PConnection(client) {
        try {
            client.servers = null;
            client.peerConnectionConstraint = null;
            client.dataConstraint = null;
            client.peerConnection = new RTCPeerConnection(client.servers, client.peerConnectionConstraint);
            console.log("Created local peer connection object localConnection");
            client.peerConnection.onicecandidate = event => {
                console.log("local ice callback");
                if (event.candidate) {
                    this.socket.emit("sendICECandidate", "client", this.props.provider.username, event.candidate);
                }
            };

            client.peerConnection.ondatachannel = event => {
                console.log("Receive Channel Callback");
                client.receiveMessageChannel = event.channel;
                client.receiveMessageChannel.binaryType = "arraybuffer";
                client.receiveMessageChannel.onmessage = event => {
                    console.log("receive message: ", JSON.parse(event.data));
                    this.processMessage(client, JSON.parse(event.data));
                }
            }

            client.sendMessageChannel = client.peerConnection.createDataChannel("sendMessageChannel", client.dataConstraint);
            client.sendFileChannel = client.peerConnection.createDataChannel("sendFileChannel", client.dataConstraint);
            client.sendFileChannel.binaryType = "arraybuffer";
            console.log("Created send data channel");

            client.sendMessageChannel.onopen = () => {
                console.log("send channel state is: " + client.sendMessageChannel.readyState);
                client.sendMessageChannel.send(JSON.stringify({
                    action: "message",
                    message: "It works, from provider"
                }));
                if (this.selectedRootDirectory) {
                    this.scanDirectory(client);
                }
            }
            console.log("Requesting P2P connection");
            this.socket.emit("requestP2PConnection", client.id);
        } catch (e) {
            if (!client || !client.sendMessageChannel || !client.receiveMessageChannel || !client.peerConnection) {
                console.log("Connection with client lost");
            } else {
                throw e;
            }
        }
    }

    deleteP2PConnection(client, error = null) {
        if (client) {
            client.delete();
            client.sendMessageChannel && console.log("Closed data channel with label: " + client.sendMessageChannel.label);
            client.sendMessageChannel && client.sendMessageChannel.close();
            client.sendFileChannel && console.log("Closed data channel with label: " + client.sendFileChannel.label);
            client.sendFileChannel && client.sendFileChannel.close();
            client.receiceMessageChannel && console.log("Closed data channel with label: " + client.receiveMessageChannel.label);
            client.receiveMessageChannel && client.receiveMessageChannel.close();
            client.peerConnection && client.peerConnection.close();
            console.log("Closed peer connection");
            this.clients.delete(client.id);
            if (error) {
                this.socket.emit("resetClientConnection", client.id);
            }
        }
    }

    deleteSession() {
        this.socket.disconnect();
        this.clients.forEach((client, clientId) => {
            this.deleteP2PConnection(client);
            client.delete();
        });
    }

    initializeScan() {
        if (!this.selectedRootDirectory) {
            console.log("Please select a directory to scan");
        } else {
            this.clients.forEach((client, clientId) => {
                client.restart();
                if (client.sendMessageChannel && client.sendMessageChannel.readyState == "open") {
                    this.scanDirectory(client);
                }
            });
        }
    }

    processMessage(client, message) {
        switch (message.action) {
            case "openDirectory":
                try {
                    client.changeDirectory(message.selectedDirectory);
                    this.scanDirectory(client);
                } catch (e) {
                    if (!client) {
                        console.log("Connection to client lost.");
                    } else {
                        throw e;
                    }
                }
                break;
            case "downloadFile":
                this.sendFile(client, message.filePath);
                break;
            case "message":
                console.log(message.message);
                break;
        }
    }

    sendMessage(client, action, data) {
        try {
            client.sendMessageChannel.send(JSON.stringify({
                action: action,
                data: data
            }));
        } catch (e) {
            if (!client.sendMessageChannel) {
                console.log("Can't finish task. Connection to provider lost.");
            } else {
                throw e;
            }
        }
    }

    sendFile(client, filePath) {
        try {
            console.log(`Filepath is ${filePath}`);
            console.log(`Extension is ${fileExtension(filePath)}`);
            console.log(`Mime is ${mime.getType(fileExtension(filePath))}`);
            this.sendMessage(client, "sendFileMetadata", {
                path: filePath,
                mime: mime.getType(fileExtension(filePath))
            });
            const path = pathModule.join(this.selectedRootDirectory, filePath);
            const readStream = fs.createReadStream(path);
            readStream.on("data", chunk => {
                console.log(chunk);
                console.log(chunk.length);
                client.sendFileChannel.send(chunk);
            });
            readStream.on("end", () => {
                console.log("end of file streaming");
            });
        } catch (e) {
            if (!client.sendFileChannel) {
                console.log("Can't finish task. Connection to provider lost.");
            } else {
                throw e;
            }
        }
    }

    scanDirectory(client) {
        let isCurrentDirectory = true;
        const path = pathModule.join(this.selectedRootDirectory, client.currentDirectory);
        client.setWatcher(chokidar.watch(path, client.watcherOptions));

        client.watcher
            .on("raw", (event, path, details) => {
                // This event should be triggered everytime something happens.
                console.log("Raw event info:", event, path, details);
            })
            .on("add", (path, stats) => {
                client.changeScannedFiles(path, stats);
                this.sendMessage(client, "add", client.scannedFiles.get(path));
            })
            .on("addDir", (path, stats) => {
                client.changeScannedFiles(path, stats, isCurrentDirectory);
                if (isCurrentDirectory) {
                    isCurrentDirectory = false;
                    this.sendMessage(client, "sendCurrentDirectory", client.scannedFiles.get(path));
                } else {
                    this.sendMessage(client, "addDir", client.scannedFiles.get(path));
                }
            })
            .on("change", (path, stats) => {
                client.changeScannedFiles(path, stats);
                this.sendMessage(client, "change", client.scannedFiles.get(path));
            })
            .on("unlink", path => {
                this.sendMessage(client, "unlink", client.scannedFiles.get(path));
                client.removeFromScannedFiles(path);
            })
            .on("unlinkDir", path => {
                this.sendMessage(client, "unlinkDir", client.scannedFiles.get(path));
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
        if (event.target.files[0]) {
            let dirPath = event.target.files[0].path;
            this.selectedRootDirectory = dirPath;
        }
    }

    render() {
        if (!this.props.provider.username) {
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