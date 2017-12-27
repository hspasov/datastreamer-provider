import Socket from "./socket";
import { changeClientDirectory } from "../store/actions/connections";

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
            this.socket.emit("description", description, clientSocketId);
        });

        ipcRenderer.on("send ICE candidate", (event, clientSocketId, candidate) => {
            console.log(`Sending ICE candidate ${candidate} to ${clientSocketId}`);
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
                this.props.dispatch(changeClientDirectory(clientSocketId, directory));
            });
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
        this.socket.emit("client_tokens_request");
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

    deleteClient(clientSocketId, error = null) {
        this.socket.emit("close_client_connection", clientSocketId);
        ipcRenderer.send("delete client", clientSocketId, error);
    }

    resetUnit(clientSocketId) {
        ipcRenderer.send("reset unit", clientSocketId, this.selectedRootDirectory);
    }
}

export default MainToUnitConnector;