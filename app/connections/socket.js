import io from "socket.io-client";
import { addClient, removeClient } from "../store/actions/connections";

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

    this.socket.on("connectFail", () => {
        pageAccessor(function () {
            this.statusHandler({ event: "invalid_token" });
        });
    });

    this.socket.on("unsubscribedClient", clientSocketId => {
        console.log("unsubscribed client");
        this.connector.deleteClient(clientSocketId);
        pageAccessor(function () {
            this.props.dispatch(removeClient(clientSocketId));
        });
    });

    this.socket.on("subscribedClient", (clientSocketId, token, username, accessRules) => {
        this.connector.createUnit({
            clientSocketId, token, username, accessRules
        }, this.connector.selectedRootDirectory);
        pageAccessor(function () {
            this.props.dispatch(addClient({
                id: clientSocketId,
                token,
                username,
                readable: accessRules.readable,
                writable: accessRules.writable,
                directory: this.connector.selectedRootDirectory
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