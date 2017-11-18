const electron = window.require("electron");
const ipcRenderer = electron.ipcRenderer;

class ConnectorUnit {
    constructor(client) {
        ipcRenderer.on("ping", (event, arg) => {
            console.log(arg);
            ipcRenderer.send("pong", "Hello from unit!");
            let start = new Date().getTime();
            let i = 0;
            while (i < 10 * 10 * 10 * 10 * 100 * 10 * 10 * 10 * 10) {
                i = i + 1;
            }
            console.log(i);
            console.log(new Date().getTime() - start);
        });

        ipcRenderer.on("delete client", (error=null) => {
            client.deleteP2PConnection(error);
        });

        ipcRenderer.on("receive description", remoteDescription => {
            client.exchangeDescriptions(remoteDescription);
        });

        ipcRenderer.on("receive ICE candidate", candidate => {
            client.receiveICECandidate(candidate);
        });

        ipcRenderer.on("initialize scan", selectedRootDirectory => {
            client.initializeScan(selectedRootDirectory);
        });

        ipcRenderer.send("inside unit");
        console.log("fired inside unit");

        this.resetConnection = this.resetConnection.bind(this);
    }

    requestP2PConnection() {
        ipcRenderer.send("request P2P connection", client.id);
    }

    sendDescription(localDescription) {
        ipcRenderer.send("send description", client.id, localDescription);
    }

    sendICECandidate(candidate) {
        ipcRenderer.send("send ICE candidate", client.id, candidate);
    }

    resetConnection() {
        ipcRenderer.send("reset connection", client.id);
    }

    deleteClient(error=null) {
        ipcRenderer.send("delete client", client.id, error);
    }
}

export default ConnectorUnit;