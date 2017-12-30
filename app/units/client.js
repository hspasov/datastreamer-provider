import { promisify } from "bluebird";
import ConnectorUnit from "./connections/unit-to-main-connector";
import getFileType from "./modules/get-file-type";
import getFilePermissions from "./modules/get-file-permissions";
import scanDirectory from "./modules/scan-directory";
import scaleImageMeasures from "./modules/scale-image-measures"
import {
    prepareConnectionInitialization,
    exchangeDescriptions,
    receiveICECandidate
} from "./connections/rtc-initialization";

const fs = window.require("fs-extra");
const trash = window.require("trash");
const pathModule = window.require("path").posix;
const getImageSize = window.require("image-size");
const resizeImg = window.require("resize-img");

const sizeOf = promisify(getImageSize);

class Client {
    constructor(unitData, selectedMainDirectory, currentDirectory = ".", watcherOptions = {
        ignored: /[\/\\]\./,
        persistent: true,
        usePolling: true,
        alwaysStat: true,
        depth: 0
    }) {
        this.id = unitData.clientSocketId;
        this.selectedMainDirectory = selectedMainDirectory;
        this.currentDirectory = currentDirectory;
        this.scannedFiles = new Map();
        this.watcher = null;
        this.watcherOptions = watcherOptions;
        this.connector = new ConnectorUnit(this);

        this.servers = null;
        this.peerConnectionConstraint = null;
        this.dataConstraint = null;
        this.sendMessageChannel = null;
        this.sendFileChannel = null;
        this.receiveMessageChannel = null;
        this.receiveMessageWritableChannel = null;
        this.receiveFileChannel = null;

        this.readStream = null;
        this.uploadedFileData = null;
        this.writeStream = null
        this.receivedBytes = 0;

        this.prepareConnectionInitialization = prepareConnectionInitialization.bind(this);
        this.exchangeDescriptions = exchangeDescriptions.bind(this);
        this.receiveICECandidate = receiveICECandidate.bind(this);
        this.scanDirectory = scanDirectory.bind(this);

        this.prepareConnectionInitialization(unitData.accessRules);
    }

    initializeScan(selectedDirectory) {
        this.restart();
        this.selectedMainDirectory = selectedDirectory;
        if (this.sendMessageChannel && this.sendMessageChannel.readyState === "open") {
            this.scanDirectory();
        }
    }

    errorHandler(error) {
        console.log(error);
    }

    processMessageWritable(message) {
        switch (message.type) {
            case "copyFile":
                this.copyFile(message.payload);
                break;
            case "moveFile":
                this.moveFile(message.payload);
                break;
            case "deleteFile":
                this.deleteFile(message.payload);
                break;
            case "uploadFile":
                this.uploadedFileData = message.payload;
                console.log(message);
                console.log(message.payload);
                this.writeStream = fs.createWriteStream(pathModule.join(this.selectedMainDirectory, this.currentDirectory, message.payload.name));
                this.receivedBytes = 0;
                this.sendMessage("readyForFile");
                break;
            default:
                this.processMessage(message);
        }
    }

    processMessage(message) {
        switch (message.type) {
            case "openDirectory":
                this.changeDirectory(message.payload);
                this.scanDirectory();
                break;
            case "downloadFile":
                this.sendFile(message.payload);
                break;
            case "getImage":
                this.sendFile(message.payload);
                break;
            case "getText":
                this.sendFile(message.payload);
                break;
            case "message":
                console.log(message.message);
                break;
        }
    }

    sendFile(filePath) {
        try {
            const path = pathModule.join(this.selectedMainDirectory, filePath);
            this.readStream = fs.createReadStream(path);
            const bufferedAmountHighThreshold = 15 * 1024 * 1024; // 15 MB, WebRTC fails at 16MB
            this.sendFileChannel.bufferedAmountLowThreshold = 1024 * 1024; // 1 MB
            this.sendFileChannel.onbufferedamountlow = () => {
                if (this.readStream) {
                    this.readStream.resume();
                }
            }
            this.readStream.on("data", chunk => {
                if (this.sendFileChannel.bufferedAmount > bufferedAmountHighThreshold) {
                    this.readStream.pause();
                }
                this.sendFileChannel.send(chunk);
            });
            this.readStream.on("end", () => {
                console.log("end of file streaming");
                this.readStream = null;
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

    copyFile(filePath) {
        const source = pathModule.join(this.selectedMainDirectory, filePath);
        const basename = pathModule.basename(filePath);
        const destination = pathModule.join(this.selectedMainDirectory, this.currentDirectory, basename);
        fs.copy(source, destination, {
            overwrite: false,
            errorOnExist: true
        }).then(() => {
            console.log(`${filePath} copied`);
        }).catch(error => {
            console.log(error);
        });
    }

    moveFile(filePath) {
        const source = pathModule.join(this.selectedMainDirectory, filePath);
        const basename = pathModule.basename(filePath);
        const destination = pathModule.join(this.selectedMainDirectory, this.currentDirectory, basename);
        fs.move(source, destination).then(() => {
            console.log(`${filePath} moved`);
        }).catch(error => {
            console.log(error);
        });
    }

    deleteFile(filePath) {
        const source = pathModule.join(this.selectedMainDirectory, filePath);
        trash([source], { glob: false }).then(() => {
            console.log("deleted");
        }).catch(error => {
            console.log(error);
        });
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
        this.connector.changeDirectory(pathModule.join(this.selectedMainDirectory, this.currentDirectory));
        this.scannedFiles = new Map();
    }

    changeScannedFiles(path, stats, mime, isCurrentDirectory = false) {
        if (!path) {
            throw `Invalid path ${path}`;
        }
        let fileMetadata = this.getFileMetadata(path, stats, mime, isCurrentDirectory);
        this.scannedFiles.set(path, fileMetadata);
    }

    removeFromScannedFiles(path) {
        if (!path) {
            throw `Invalid path ${path}`;
        }
        this.scannedFiles.delete(path);
    }

    getFileMetadata(path, stats, mime, isCurrentDirectory = false) {
        if (!path) {
            throw `Invalid path, ${path}`;
        }
        const fileName = pathModule.basename(path);
        return {
            name: fileName,
            path: isCurrentDirectory ?
                this.currentDirectory : pathModule.join(this.currentDirectory, fileName),
            type: getFileType(path, stats),
            access: getFilePermissions(path),
            size: stats.size,
            mime
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
        this.sendMessageChannel && this.sendMessageChannel.close();
        this.sendFileChannel && this.sendFileChannel.close();
        this.receiveMessageChannel && this.receiveMessageChannel.close();
        this.receiveMessageWritableChannel && this.receiveMessageWritableChannel.close();
        this.receiveFileChannel && this.receiveFileChannel.close();
        this.peerConnection && this.peerConnection.close();
        if (error) {
            this.connector.resetConnection();
        }
    }
};

export default Client;