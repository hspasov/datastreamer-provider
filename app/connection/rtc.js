import mime from "mime";
import fileExtension from "file-extension";
import Socket from "./socket";
import scanDirectory from "../modules/scanDirectory";

const fs = window.require("fs");
const pathModule = window.require("path");

class RTC {
    constructor(token) {
        this.socket = new Socket(this, token).socket;
        this.clients = new Map();
        this.token = token;
        this.selectedRootDirectory = "";

        this.servers = null;
        this.peerConnectionConstraint = null;
        this.dataConstraint = null;

        this.connectToClients = this.connectToClients.bind(this);
        this.initializeP2PConnection = this.initializeP2PConnection.bind(this);
        this.initializeScan = this.initializeScan.bind(this);
        this.sendFile = this.sendFile.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.processMessage = this.processMessage.bind(this);
        this.deleteP2PConnection = this.deleteP2PConnection.bind(this);
        this.deleteSession = this.deleteSession.bind(this);
    }

    connectToClients() {
        this.socket.emit("connectToClients", this.token);
    }

    initializeP2PConnection(client) {
        try {
            client.peerConnection = new RTCPeerConnection(this.servers, this.peerConnectionConstraint);
            console.log("Created local peer connection object localConnection");
            client.peerConnection.onicecandidate = event => {
                console.log("local ice callback");
                if (event.candidate) {
                    this.socket.emit("sendICECandidate", "client", client.id, event.candidate);
                }
            };

            client.peerConnection.ondatachannel = event => {
                client.receiveMessageChannel = event.channel;
                client.receiveMessageChannel.onmessage = event => {
                    this.processMessage(client, JSON.parse(event.data));
                }
            }

            client.sendMessageChannel = client.peerConnection.createDataChannel("sendMessageChannel", this.dataConstraint);
            client.sendFileChannel = client.peerConnection.createDataChannel("sendFileChannel", this.dataConstraint);
            client.sendFileChannel.binaryType = "arraybuffer";

            client.sendMessageChannel.onopen = () => {
                client.sendMessageChannel.send(JSON.stringify({
                    action: "message",
                    message: "It works, from provider"
                }));
                if (this.selectedRootDirectory) {
                    scanDirectory(client, this.selectedRootDirectory, this.sendMessage);
                }
            }
            this.socket.emit("requestP2PConnection", client.id);
        } catch (e) {
            if (!client || !client.sendMessageChannel || !client.receiveMessageChannel || !client.peerConnection) {
                console.log("Connection with client lost");
            } else {
                throw e;
            }
        }
    }

    initializeScan() {
        if (!this.selectedRootDirectory) {
            console.log("Please select a directory to scan");
        } else {
            this.clients.forEach((client, clientId) => {
                client.restart();
                if (client.sendMessageChannel && client.sendMessageChannel.readyState == "open") {
                    scanDirectory(client, this.selectedRootDirectory, this.sendMessage);
                } else {
                    console.log("Error initializing scan: client.sendMessageChannel.readyState is", client.sendMessageChannel.readyState);
                }
            });
        }
    }

    sendFile(client, filePath) {
        try {
            this.sendMessage(client, "sendFileMetadata", {
                path: filePath,
                mime: mime.getType(fileExtension(filePath))
            });
            const path = pathModule.join(this.selectedRootDirectory, filePath);
            const readStream = fs.createReadStream(path);
            readStream.on("data", chunk => {
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

    processMessage(client, message) {
        switch (message.action) {
            case "openDirectory":
                try {
                    client.changeDirectory(message.selectedDirectory);
                    scanDirectory(client, this.selectedRootDirectory, this.sendMessage);
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
}

export default RTC;