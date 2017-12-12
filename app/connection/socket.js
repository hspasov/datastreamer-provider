import io from "socket.io-client";
import Client from "../modules/client";

function Socket(connector, token, statusHandler) {
    this.connector = connector;
    this.socket = io("https://datastreamer.local:3000", {
        query: `token=${token}`,
        secure: true
    });

    this.socket.on("connect", () => {
        statusHandler({ event: "connect" });
    });

    this.socket.on("connect_error", error => {
        statusHandler({
            event: "connect_error"
        });
        console.log(error);
    });

    this.socket.on("connect_timeout", timeout => {
        statusHandler({ event: "connect_timeout" });
        console.log(timeout);
    });

    this.socket.on("error", error => {
        statusHandler({ event: "error" });
        console.log(error);
    });

    this.socket.on("disconnect", reason => {
        statusHandler({ event: "disconnect" });
        console.log(reason);
    });

    this.socket.on("reconnect_failed", () => {
        statusHandler({ event: "reconnect_failed" });
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