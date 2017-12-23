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

    this.socket.on("unsubscribedClient", clientSocketId => {
        console.log("unsubscribed client");
        this.connector.deleteClient(clientSocketId);
        pageAccessor(function () {
            this.setState(prevState => ({
                clients: remove(prevState.clients, clientSocketId)
            }));
        });
    });

    this.socket.on("subscribedClient", (clientSocketId, token, username, accessRules) => {
        this.connector.createUnit({ clientSocketId, token, username, accessRules }, this.connector.selectedRootDirectory);
        pageAccessor(function () {
            let readable, writable;
            switch (accessRules) {
                case "N":
                    readable = writable = false;
                    break;
                case "R":
                    readable = true;
                    writable = false;
                    break;
                case "RW":
                    readable = writable = true;
                    break;
                default:
                    console.log("ERROR: invalid accessRules:", accessRules);
            };
            this.setState(prevState => ({
                clients: add(prevState.clients, { id: clientSocketId, token, username, readable, writable })
            }));
        });
    });

    this.socket.on("initConnection", (clientSocketId, description) => {
        console.log("initting connection");
        this.connector.receiveDescription(clientSocketId, description);
    });

    this.socket.on("resetConnection", clientSocketId => {
        this.connector.resetUnit(clientSocketId);
    });

    this.socket.on("receiveICECandidate", (clientSocketId, candidate) => {
        this.connector.receiveICECandidate(clientSocketId, candidate);
    });
}

export default Socket;