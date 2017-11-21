import mime from "mime";
import fileExtension from "file-extension";
import ConnectorUnit from "./connectorUnit";
import getFileType from "./getFileType";
import getFilePermissions from "./getFilePermissions";
import scanDirectory from "../modules/scanDirectory";
import {
    prepareConnectionInitialization,
    exchangeDescriptions,
    receiveICECandidate
} from "../connection/RTCInitialization";

const fs = window.require("fs");
const pathModule = window.require("path");

class Client {
    constructor(id, selectedRootDirectory, currentDirectory = ".", watcherOptions = {
        ignored: /[\/\\]\./,
        persistent: true,
        usePolling: true,
        alwaysStat: true,
        depth: 0
    }) {
        this.id = id;
        this.selectedRootDirectory = selectedRootDirectory;
        this.currentDirectory = currentDirectory;
        this.scannedFiles = new Map();
        this.watcher = null;
        this.watcherOptions = watcherOptions;
        this.connector = new ConnectorUnit(this);

        this.servers = null;
        this.peerConnectionConstraint = null;
        this.dataConstraint = null;

        this.prepareConnectionInitialization = prepareConnectionInitialization.bind(this);
        this.exchangeDescriptions = exchangeDescriptions.bind(this);
        this.receiveICECandidate = receiveICECandidate.bind(this);
        this.initializeScan = this.initializeScan.bind(this);
        this.sendFile = this.sendFile.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.scanDirectory = scanDirectory.bind(this);
        this.setWatcher = this.setWatcher.bind(this);
        this.changeDirectory = this.changeDirectory.bind(this);
        this.changeScannedFiles = this.changeScannedFiles.bind(this);
        this.removeFromScannedFiles = this.removeFromScannedFiles.bind(this);
        this.getFileMetadata = this.getFileMetadata.bind(this);
        this.restart = this.restart.bind(this);
        this.delete = this.delete.bind(this);

        this.prepareConnectionInitialization();
    }

    initializeScan(selectedDirectory) {
        this.restart();
        this.selectedRootDirectory = selectedDirectory;
        if (this.sendMessageChannel && this.sendMessageChannel.readyState === "open") {
            this.scanDirectory();
        }
    }

    processMessage(message) {
        switch (message.action) {
            case "openDirectory":
                this.changeDirectory(message.selectedDirectory);
                this.scanDirectory();
                break;
            case "downloadFile":
                this.sendFile(message.filePath);
                break;
            case "message":
                console.log(message.message);
                break;
        }
    }

    sendFile(filePath) {
        try {
            this.sendMessage("sendFileMetadata", {
                path: filePath,
                mime: mime.getType(fileExtension(filePath))
            });
            const path = pathModule.join(this.selectedRootDirectory, filePath);
            const readStream = fs.createReadStream(path);
            readStream.on("data", chunk => {
                this.sendFileChannel.send(chunk);
            });
            readStream.on("end", () => {
                console.log("end of file streaming");
            });
        } catch (e) {
            if (!this.sendFileChannel) {
                console.log("Can't finish task. Connection to provider lost.");
            } else {
                throw e;
            }
        }
    }

    sendMessage(action, data) {
        try {
            this.sendMessageChannel.send(JSON.stringify({
                action: action,
                data: data
            }));
        } catch (e) {
            if (!this.sendMessageChannel) {
                console.log("Can't finish task. Connection to provider lost.");
            } else {
                throw e;
            }
        }
    }

    setWatcher(watcher) {
        if (this.watcher) {
            this.watcher.close();
        }
        this.watcher = watcher;
    }

    changeDirectory(selectedDirectory) {
        if (!selectedDirectory) {
            throw `Invalid directory ${selectedDirectory}`;
        }
        if (this.watcher) {
            this.watcher.close();
        }
        this.watcher = null;
        this.currentDirectory = selectedDirectory;
        this.scannedFiles = new Map();
    }

    changeScannedFiles(path, stats, isCurrentDirectory = false) {
        if (!path) {
            throw `Invalid path ${path}`;
        }
        let fileMetadata = this.getFileMetadata(path, stats, isCurrentDirectory);
        this.scannedFiles.set(path, fileMetadata);
    }

    removeFromScannedFiles(path) {
        if (!path) {
            throw `Invalid path ${path}`;
        }
        this.scannedFiles.delete(path);
    }

    getFileMetadata(path, stats, isCurrentDirectory = false) {
        if (!path) {
            throw `Invalid path, ${path}`;
        }
        const fileName = pathModule.basename(path);
        return {
            name: fileName,
            path: isCurrentDirectory ?
                this.currentDirectory : pathModule.join(this.currentDirectory, fileName),
            type: getFileType(path, stats),
            size: stats["size"],
            access: getFilePermissions(path)
        };
    }

    restart() {
        this.delete();
        this.currentDirectory = ".";
        this.scannedFiles = new Map();
    }

    delete() {
        if (this.watcher) {
            this.watcher.close();
        }
    }

    deleteP2PConnection(error=null) {
        this.sendMessageChannel && console.log("Closed data channel with label: " + this.sendMessageChannel.label);
        this.sendMessageChannel && this.sendMessageChannel.close();
        this.sendFileChannel && console.log("Closed data channel with label: " + this.sendFileChannel.label);
        this.sendFileChannel && this.sendFileChannel.close();
        this.receiceMessageChannel && console.log("Closed data channel with label: " + this.receiveMessageChannel.label);
        this.receiveMessageChannel && this.receiveMessageChannel.close();
        this.peerConnection && this.peerConnection.close();
        console.log("Closed peer connection");
        if (error) {
            this.connector.resetConnection();
        }
    }
};

export default Client;