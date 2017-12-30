import io from "socket.io-client";

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

    this.socket.on("connect_reject", () => {
        pageAccessor(function () {
            this.statusHandler({ event: "invalid_token" });
        });
    });

    this.socket.on("client_disconnect", clientSocketId => {
        this.connector.deleteClient(clientSocketId);
        pageAccessor(function () {
            this.props.removeClient(clientSocketId);
        });
    });

    this.socket.on("client_connect", (clientSocketId, token, username, accessRules) => {
        this.connector.createUnit({
            clientSocketId, token, username, accessRules
        }, this.connector.selectedMainDirectory);
        pageAccessor(function () {
            this.props.addClient({
                id: clientSocketId,
                token,
                username,
                readable: accessRules.readable,
                writable: accessRules.writable,
                directory: this.connector.selectedMainDirectory
            });
        });
    });

    this.socket.on("description", (clientSocketId, description) => {
        this.connector.receiveDescription(clientSocketId, description);
    });

    this.socket.on("connect_reset", clientSocketId => {
        this.connector.resetUnit(clientSocketId);
    });

    this.socket.on("ice_candidate", (clientSocketId, candidate) => {
        this.connector.receiveICECandidate(clientSocketId, candidate);
    });
}

export default Socket;