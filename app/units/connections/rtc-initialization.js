function prepareConnectionInitialization(accessRules) {
    try {
        this.peerConnection = new RTCPeerConnection(this.servers, this.peerConnectionConstraint);
        console.log("Created local peer connection object localConnection");
        this.peerConnection.onicecandidate = event => {
            console.log("local ice callback");
            if (event.candidate) {
                console.log("sending ice candidate", event.candidate);
                this.connector.sendICECandidate(event.candidate);
            }
        };

        this.peerConnection.ondatachannel = event => {
            switch (event.channel.label) {
                case "clientMessage":
                    if (accessRules.readable) {
                        this.receiveMessageChannel = event.channel;
                        this.receiveMessageChannel.onmessage = event => {
                            this.processMessage(JSON.parse(event.data));
                        };
                    }
                    break;
                case "clientMessageWritable":
                    if (accessRules.readable && accessRules.writable) {
                        this.receiveMessageWritableChannel = event.channel;
                        this.receiveMessageWritableChannel.onmessage = event => {
                            console.log(event.data);
                            this.processMessageWritable(JSON.parse(event.data));
                        };
                    }
                    break;
                case "clientFile":
                    if (accessRules.readable && accessRules.writable) {
                        this.receiveFileChannel = event.channel;
                        this.receiveFileChannel.binaryType = "arraybuffer";
                        this.receiveFileChannel.onmessage = event => {
                            this.receivedBytes += event.data.byteLength;
                            console.log(event.data);
                            console.log(event.data.byteLength);
                            if (this.receivedBytes >= this.uploadedFileData.size) {
                                this.writeStream.end(Buffer.from(event.data));
                                console.log("end of file");
                            } else {
                                this.writeStream.write(Buffer.from(event.data));
                            }
                        };
                    }
                    break;
            }
        }

        this.sendMessageChannel = this.peerConnection.createDataChannel("providerMessage", this.dataConstraint);
        this.sendFileChannel = this.peerConnection.createDataChannel("providerFile", this.dataConstraint);
        this.sendFileChannel.binaryType = "arraybuffer";

        this.sendMessageChannel.onopen = () => {
            this.sendMessageChannel.send(JSON.stringify({
                action: "connectSuccess",
                message: null
            }));
            if (this.selectedRootDirectory) {
                this.scanDirectory();
            }
        }
        this.connector.requestP2PConnection();
    } catch (e) {
        if (!this.sendMessageChannel || !this.receiveMessageChannel || !this.peerConnection) {
            console.log("Connection with client lost");
            console.log(e);
        } else {
            throw e;
        }
    }
}

function exchangeDescriptions(remoteDesctiption) {
    try {
        console.log("setting remote description", remoteDesctiption);
        this.peerConnection.setRemoteDescription(remoteDesctiption);
        this.peerConnection.createAnswer().then(localDescription => {
            this.peerConnection.setLocalDescription(localDescription);
            console.log("Answer from remoteConnection \n" + localDescription.sdp);
            this.connector.sendDescription(localDescription);
        }, error => {
            console.log("there was an error while creating an answer", error);
            this.connector.deleteClient(error);
        });
    } catch (e) {
        if (!this.peerConnection) {
            console.log("Connection to client lost.");
        } else {
            throw e;
        }
    }
}

function receiveICECandidate(candidate) {
    try {
        console.log("adding ice candidate", candidate);
        this.peerConnection.addIceCandidate(candidate).then(() => { }, error => {
            console.log("failed to add candidate", error);
            this.connector.deleteClient(error);
        });
        console.log("Local ICE candidate: \n " + candidate);
    } catch (e) {
        if (!this.peerConnection) {
            console.log("Connection to client lost.");
        } else {
            throw e;
        }
    }
}

export {
    prepareConnectionInitialization,
    exchangeDescriptions,
    receiveICECandidate
};