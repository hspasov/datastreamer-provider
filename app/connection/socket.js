import io from "socket.io-client";
import Client from "../modules/client";

class Socket {
    constructor(connector, token) {
        this.connector = connector;
        this.socket = io("https://datastreamer.local:3000", {
            query: `token=${token}`,
            secure: true
        });

        this.socket.on("unsubscribedClient", clientId => {
            this.connector.deleteClient(clientId);
        });

        this.socket.on("subscribedClient", clientId => {
            this.connector.createUnit(clientId, this.connector.selectedRootDirectory);
        });

        this.socket.on("initConnection", (clientId, description) => {
            console.log("initting connection");
            this.connector.receiveDescription(clientId, description);
        });

        this.socket.on("resetConnection", clientId => {
            console.log("inside resetConnection, leaving");
            return;
            this.connector.deleteClient(clientId);
            this.connector.createUnit(clientId, this.connector.selectedRootDirectory);
        });

        this.socket.on("receiveICECandidate", (clientId, candidate) => {
            this.connector.receiveICECandidate(clientId, candidate);
        });
    }
}

export default Socket;