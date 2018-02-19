function prepareConnectionInitialization(accessRules) {
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
        this.resets = 0;
        switch (event.channel.label) {
            case "clientMessage":
                if (accessRules.readable) {
                    this.receiveMessageChannel = event.channel;
                    this.receiveMessageChannel.onmessage = event => {
                        this.handleMessage(JSON.parse(event.data));
                    };
                }
                break;
            case "clientMessageWritable":
                if (accessRules.readable && accessRules.writable) {
                    this.receiveMessageWritableChannel = event.channel;
                    this.receiveMessageWritableChannel.onmessage = event => {
                        this.handleMessageWritable(JSON.parse(event.data));
                    };
                }
                break;
            case "clientFile":
                if (accessRules.readable && accessRules.writable) {
                    this.receiveFileChannel = event.channel;
                    this.receiveFileChannel.binaryType = "arraybuffer";
                    this.receiveFileChannel.onmessage = event => {
                        this.handleChunk(event.data);
                    };
                }
                break;
        }
    }

    this.sendMessageChannel = this.peerConnection.createDataChannel("providerMessage", this.dataConstraint);
    this.sendFileChannel = this.peerConnection.createDataChannel("providerFile", this.dataConstraint);
    this.sendFileChannel.binaryType = "arraybuffer";
    this.sendFileChannel.bufferedAmountLowThreshold = 1024 * 1024; // 1 MB

    this.sendMessageChannel.onopen = () => {
        console.log("send message channel is open!");
        if (this.selectedMainDirectory) {
            this.scanDirectory();
        }
    }
    this.connector.requestP2PConnection();
}

function respondToOffer(remoteDesctiption) {
    try {
        this.peerConnection.setRemoteDescription(remoteDesctiption);
        this.peerConnection.createAnswer().then(localDescription => {
            return this.peerConnection.setLocalDescription(localDescription);
        }).then(() => {
            this.connector.sendDescription(this.peerConnection.localDescription);
        }).catch(error => {
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
        this.peerConnection.addIceCandidate(candidate).catch(error => {
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

export {
    prepareConnectionInitialization,
    respondToOffer,
    receiveICECandidate
};