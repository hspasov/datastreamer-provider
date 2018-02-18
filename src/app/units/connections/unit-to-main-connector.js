const { ipcRenderer } = window.require("electron");

class UnitToMainConnector {
    constructor(client) {
        this.client = client;
        ipcRenderer.on("delete client", (event, error=null) => {
            this.client.deleteP2PConnection(error);
        });

        ipcRenderer.on("receive description", (event, remoteDescription) => {
            console.log(remoteDescription);
            this.client.respondToOffer(JSON.parse(remoteDescription));
        });

        ipcRenderer.on("receive ICE candidate", (event, candidate) => {
            console.log(candidate);
            this.client.receiveICECandidate(JSON.parse(candidate));
        });

        ipcRenderer.on("initialize scan", (event, selectedMainDirectory) => {
            this.client.initializeScan(selectedMainDirectory);
        });

        ipcRenderer.on("lock file fail", (event, filePath) => {
            this.client.lockFileHandlers.delete(filePath);
            // todo: send message to client
        });

        ipcRenderer.on("lock file success", (event, filePath) => {
            this.client.lockFileHandlers.get(filePath)();
            this.client.lockFileHandlers.delete(filePath);
        });

        ipcRenderer.send("inside unit");
        console.log("fired inside unit");
    }

    requestP2PConnection() {
        ipcRenderer.send("request P2P connection", this.client.id);
        console.log("sent request P2P connection with this.client.id=", this.client.id);
    }

    sendDescription(localDescription) {
        console.log("inside sendDescription with desc=", localDescription);
        ipcRenderer.send("send description", this.client.id, JSON.stringify(localDescription));
    }

    sendICECandidate(candidate) {
        ipcRenderer.send("send ICE candidate", this.client.id, JSON.stringify(candidate));
    }

    resetConnection() {
        ipcRenderer.send("reset connection", this.client.id);
    }

    deleteClient(error=null) {
        ipcRenderer.send("delete client", this.client.id, error);
    }

    changeDirectory(directory) {
        ipcRenderer.send("change directory", this.client.id, directory);
    }

    lockFile(filePath, onSuccess) {
        const path = this.client.getAbsolutePath(filePath);
        this.client.lockFileHandlers.set(path, onSuccess.bind(this.client));
        ipcRenderer.send("lock file", path);
    }

    unlockFile(filePath) {
        const path = this.client.getAbsolutePath(filePath);
        ipcRenderer.send("unlock file", path);
    }
}

export default UnitToMainConnector;