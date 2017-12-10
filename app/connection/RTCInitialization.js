function prepareConnectionInitialization() {
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
            console.log("there is data channel");
            this.receiveMessageChannel = event.channel;
            this.receiveMessageChannel.onmessage = event => {
                this.processMessage(JSON.parse(event.data));
            }
        }

        this.sendMessageChannel = this.peerConnection.createDataChannel("sendMessageChannel", this.dataConstraint);
        this.sendFileChannel = this.peerConnection.createDataChannel("sendFileChannel", this.dataConstraint);
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