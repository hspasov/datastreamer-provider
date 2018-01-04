const { ipcRenderer } = window.require("electron");

class UnitToMainConnector {
    constructor(client) {
        this.client = client;
        ipcRenderer.on("delete client", (event, error=null) => {
            this.client.deleteP2PConnection(error);
        });

        ipcRenderer.on("receive description", (event, remoteDescription) => {
            console.log(remoteDescription);
            this.client.exchangeDescriptions(JSON.parse(remoteDescription));
        });

        ipcRenderer.on("receive ICE candidate", (event, candidate) => {
            console.log(candidate);
            this.client.receiveICECandidate(JSON.parse(candidate));
        });

        ipcRenderer.on("initialize scan", (event, selectedMainDirectory) => {
            this.client.initializeScan(selectedMainDirectory);
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
}

export default UnitToMainConnector;