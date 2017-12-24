import Socket from "./socket";

const electron = window.require("electron");
const ipcRenderer = electron.ipcRenderer;

class MainToUnitConnector {
    constructor(token, pageAccessor) {
        this.socket = new Socket(this, token, pageAccessor).socket;

        this.selectedRootDirectory = "";
        this.initializeScan = this.initializeScan.bind(this);
        this.connectToClients = this.connectToClients.bind(this);
        this.deleteAll = this.deleteAll.bind(this);

        ipcRenderer.on("send description", (event, clientSocketId, description) => {
            console.log("inside send description with desc=", description);
            this.socket.emit("connectToClient", clientSocketId, description);
        });

        ipcRenderer.on("send ICE candidate", (event, clientSocketId, candidate) => {
            console.log(`Sending ICE candidate ${candidate} to ${clientSocketId}`);
            this.socket.emit("sendICECandidate", candidate, clientSocketId);
        });

        ipcRenderer.on("request P2P connection", (event, clientSocketId) => {
            this.socket.emit("requestP2PConnection", clientSocketId);
        });

        ipcRenderer.on("reset connection", (event, clientSocketId) => {
            this.socket.emit("resetClientConnection", clientSocketId);
        });
    }

    createUnit(unitData, selectedRootDirectory) {
        ipcRenderer.send("create unit", unitData, selectedRootDirectory);
    }

    receiveDescription(clientSocketId, description) {
        ipcRenderer.send("receive description", clientSocketId, description);
    }

    receiveICECandidate(clientSocketId, candidate) {
        ipcRenderer.send("receive ICE candidate", clientSocketId, candidate);
    }

    connectToClients() {
        this.socket.emit("connectToClients");
    }

    initializeScan() {
        if (!this.selectedRootDirectory) {
            console.log("Please select a directory to scan");
        } else {
            ipcRenderer.send("initialize scan", this.selectedRootDirectory);
        }
    }

    deleteAll() {
        this.socket.disconnect();
        ipcRenderer.send("delete all");
    }

    deleteClient(clientSocketId, error=null) {
        ipcRenderer.send("delete client", clientSocketId, error);
    }

    resetUnit(clientSocketId) {
        ipcRenderer.send("reset unit", clientSocketId, this.selectedRootDirectory);
    }
}

export default MainToUnitConnector;