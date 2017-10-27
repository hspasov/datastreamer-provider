import io from "socket.io-client";
import Client from "../modules/client";

class Socket {
    constructor(RTC, token) {
        this.RTC = RTC;
        this.socket = io("https://datastreamer.local:3000", {
            query: `token=${token}`,
            secure: true
        });

        this.socket.on("unsubscribedClient", clientId => {
            const client = this.RTC.clients.get(clientId);
            this.RTC.deleteP2PConnection(client);
        });

        this.socket.on("subscribedClient", clientId => {
            this.RTC.clients.set(clientId, new Client(clientId));
            const client = this.RTC.clients.get(clientId);
            this.RTC.initializeP2PConnection(client);
        });

        this.socket.on("initConnection", (clientId, description) => {
            console.log("initting connection");
            const client = this.RTC.clients.get(clientId);
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
                        this.RTC.deleteP2PConnection(client, error);
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
            const client = this.RTC.clients.get(clientId);
            this.RTC.deleteP2PConnection(client);
            this.RTC.initializeP2PConnection(client);
        });

        this.socket.on("receiveICECandidate", (clientId, candidate) => {
            const client = this.RTC.clients.get(clientId);
            try {
                client.peerConnection.addIceCandidate(candidate).then(
                    () => { },
                    error => {
                        console.log("failed to add candidate", error);
                        this.RTC.deleteP2PConnection(client, error);
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
    }
}

export default Socket;