import Socket from "../connection/socket";

const electron = window.require("electron");
const ipcRenderer = electron.ipcRenderer;

class ConnectorMain {
    constructor(token, pageAccessor) {
        this.socket = new Socket(this, token, pageAccessor).socket;

        this.selectedRootDirectory = "";
        this.initializeScan = this.initializeScan.bind(this);
        this.connectToClients = this.connectToClients.bind(this);
        this.deleteAll = this.deleteAll.bind(this);

        ipcRenderer.on("send description", (event, clientId, description) => {
            console.log("inside send description with desc=", description);
            this.socket.emit("connectToClient", clientId, description);
        });

        ipcRenderer.on("send ICE candidate", (event, clientId, candidate) => {
            console.log(`Sending ICE candidate ${candidate} to ${clientId}`);
            this.socket.emit("sendICECandidate", candidate, clientId);
        });

        ipcRenderer.on("request P2P connection", (event, clientId) => {
            this.socket.emit("requestP2PConnection", clientId);
        });

        ipcRenderer.on("reset connection", (event, clientId) => {
            this.socket.emit("resetClientConnection", clientId);
        });
    }

    createUnit(clientId, selectedRootDirectory) {
        ipcRenderer.send("create unit", clientId, selectedRootDirectory);
    }

    receiveDescription(clientId, description) {
        ipcRenderer.send("receive description", clientId, description);
    }

    receiveICECandidate(clientId, candidate) {
        ipcRenderer.send("receive ICE candidate", clientId, candidate);
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

    deleteClient(clientId, error=null) {
        ipcRenderer.send("delete client", clientId, error);
    }
}

export default ConnectorMain;