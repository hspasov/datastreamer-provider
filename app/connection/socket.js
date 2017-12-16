import io from "socket.io-client";
import Client from "../modules/client";
import { add, remove } from "../modules/clients";

function Socket(connector, token, pageAccessor) {
    this.connector = connector;
    this.socket = io("https://datastreamer.local:3000", {
        query: `token=${token}`,
        secure: true
    });

    this.socket.on("connect", () => {
        pageAccessor(function () {
            this.statusHandler({ event: "connect" });
        });
    });

    this.socket.on("connect_error", error => {
        pageAccessor(function () {
            this.statusHandler({ event: "connect_error" });
        });
        console.log(error);
    });

    this.socket.on("connect_timeout", timeout => {
        pageAccessor(function () {
            this.statusHandler({ event: "connect_timeout" });
        });
        console.log(timeout);
    });

    this.socket.on("error", error => {
        pageAccessor(function () {
            this.statusHandler({ event: "error" });
        });
        console.log(error);
    });

    this.socket.on("disconnect", reason => {
        pageAccessor(function () {
            this.statusHandler({ event: "disconnect" });
        });
        console.log(reason);
    });

    this.socket.on("reconnect_failed", () => {
        pageAccessor(function () {
            this.statusHandler({ event: "reconnect_failed" });
        });
    });

    this.socket.on("unsubscribedClient", clientId => {
        console.log("unsubscribed client");
        this.connector.deleteClient(clientId);
        pageAccessor(function () {
            this.setState(prevState => ({
                clients: remove(prevState.clients, clientId)
            }));
        });
    });

    this.socket.on("subscribedClient", clientId => {
        this.connector.createUnit(clientId, this.connector.selectedRootDirectory);
        pageAccessor(function () {
            this.setState(prevState => ({
                clients: add(prevState.clients, clientId)
            }));
        });
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