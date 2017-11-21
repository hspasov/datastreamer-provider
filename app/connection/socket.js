import io from "socket.io-client";
import Client from "../modules/client";

function Socket(connector, token) {
    this.connector = connector;
    this.socket = io("https://datastreamer.local:3000", {
        query: `token=${token}`,
        secure: true
    });

    this.socket.on("unsubscribedClient", clientId => {
        console.log("unsubscribed client");
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
        this.connector.deleteClient(clientId);
        this.connector.createUnit(clientId, this.connector.selectedRootDirectory);
    });

    this.socket.on("receiveICECandidate", (clientId, candidate) => {
        this.connector.receiveICECandidate(clientId, candidate);
    });
}

export default Socket;