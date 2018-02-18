import Socket from "./socket";

const { ipcRenderer } = window.require("electron");

class MainToUnitConnector {
    constructor(token, pageAccessor) {
        this.socket = new Socket(this, token, pageAccessor).socket;

        this.selectedMainDirectory = "";

        ipcRenderer.on("send description", (event, clientSocketId, description) => {
            this.socket.emit("description", description, clientSocketId);
        });

        ipcRenderer.on("send ICE candidate", (event, clientSocketId, candidate) => {
            this.socket.emit("ice_candidate", candidate, clientSocketId);
        });

        ipcRenderer.on("request P2P connection", (event, clientSocketId) => {
            this.socket.emit("p2p_request", clientSocketId);
        });

        ipcRenderer.on("reset connection", (event, clientSocketId) => {
            this.socket.emit("connect_reset", clientSocketId);
        });

        ipcRenderer.on("change directory", (event, clientSocketId, directory) => {
            pageAccessor(function () {
                this.props.changeClientDirectory(clientSocketId, directory);
            });
        });
    }

    createUnit(unitData, selectedMainDirectory) {
        ipcRenderer.send("create unit", unitData, selectedMainDirectory);
    }

    receiveDescription(clientSocketId, description) {
        ipcRenderer.send("receive description", clientSocketId, description);
    }

    receiveICECandidate(clientSocketId, candidate) {
        ipcRenderer.send("receive ICE candidate", clientSocketId, candidate);
    }

    connectToClients() {
        this.socket.emit("client_tokens_request");
    }

    initializeScan() {
        ipcRenderer.send("initialize scan", this.selectedMainDirectory);
    }

    deleteAll() {
        this.socket.disconnect();
        ipcRenderer.send("delete all");
    }

    deleteClient(clientSocketId, error = null) {
        this.socket.emit("close_client_connection", clientSocketId);
        ipcRenderer.send("delete client", clientSocketId, error);
    }

    resetUnit(clientSocketId) {
        ipcRenderer.send("reset unit", clientSocketId, this.selectedMainDirectory);
    }
}

export default MainToUnitConnector;