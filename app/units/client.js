import sanitize from "sanitize-filename";
import ConnectorUnit from "./connections/unit-to-main-connector";
import getFileType from "./modules/get-file-type";
import getFilePermissions from "./modules/get-file-permissions";
import scanDirectory from "./modules/scan-directory";
import {
    prepareConnectionInitialization,
    exchangeDescriptions,
    receiveICECandidate
} from "./connections/rtc-initialization";

const fs = window.require("fs-extra");
const trash = window.require("trash");
const pathModule = window.require("path").posix;

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
        this.bufferedAmountHighThreshold = 15 * 1024 * 1024; // 15 MB, WebRTC fails at 16MB

        this.prepareConnectionInitialization = prepareConnectionInitialization.bind(this);
        this.exchangeDescriptions = exchangeDescriptions.bind(this);
        this.receiveICECandidate = receiveICECandidate.bind(this);
        this.scanDirectory = scanDirectory.bind(this);

        this.prepareConnectionInitialization(unitData.accessRules);
    }

    initializeScan(selectedDirectory) {
        if (this.watcher) {
            this.watcher.close();
        }
        this.currentDirectory = ".";
        this.scannedFiles = new Map();
        this.selectedMainDirectory = selectedDirectory;
        if (this.sendMessageChannel && this.sendMessageChannel.readyState === "open") {
            this.scanDirectory();
        }
    }

    errorHandler(error) {
        console.log(error);
    }

    handleMessageWritable(message) {
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
                this.prepareUpload(message.data);
                break;
            default:
                this.handleMessage(message);
        }
    }

    handleMessage(message) {
        switch (message.type) {
            case "openDirectory":
                this.changeDirectory(message.payload);
                this.scanDirectory();
                break;
            case "downloadFile":
                console.log(message.payload);
                this.sendFile(message.payload);
                break;
            case "message":
                console.log(message.message);
                break;
        }
    }

    handleChunk(chunk) {
        try {
            this.receivedBytes += chunk.byteLength;
            if (this.receivedBytes >= this.uploadedFileData.size) {
                this.writeStream.end(Buffer.from(chunk));
                console.log("end of file");
            } else {
                this.writeStream.write(Buffer.from(chunk));
            }
        } catch (error) {
            console.log(error);
        }
    }

    prepareUpload(fileData) {
        this.uploadedFileData = fileData;
        const sanitizedFileName = sanitize(path.basename(fileData.name));
        if (!sanitizedFileName) {
            console.log("Invalid file name");
            return;
        }
        const filePath = pathModule.join(
            this.selectedMainDirectory,
            this.currentDirectory,
            sanitizedFileName
        );
        this.writeStream = fs.createWriteStream(filePath);
        this.writeStream.on("finish", () => {
            this.writeStream = null;
            this.uploadedFileData = null;
        });
        this.writeStream.on("error", error => {
            this.writeStream.end();
            console.log(error);
        });
        this.receivedBytes = 0;
        this.sendMessage("readyForFile");
    }

    sendFile(filePath) {
        console.log(filePath);
        try {
            const path = this.resolvePath(filePath);
            console.log(path);
            this.readStream = fs.createReadStream(path);
            this.sendFileChannel.onbufferedamountlow = () => {
                if (this.readStream) {
                    this.readStream.resume();
                }
            }
            this.readStream.on("data", chunk => {
                if (this.sendFileChannel.bufferedAmount > this.bufferedAmountHighThreshold) {
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

    copyFile(filePath) {
        const source = this.resolvePath(filePath);
        const basename = sanitize(pathModule.basename(filePath));
        if (!basename) {
            console.log("Invalid path");
            return;
        }
        const destination = pathModule.join(this.selectedMainDirectory, this.currentDirectory, basename);
        fs.copy(source, destination, {
            overwrite: false,
            errorOnExist: true
        }).then(() => {
            console.log(`${source} copied`);
        }).catch(error => {
            console.log(error);
        });
    }

    moveFile(filePath) {
        const source = this.resolvePath(filePath);
        const basename = sanitize(pathModule.basename(filePath));
        if (!basename) {
            console.log("Invalid path");
            return;
        }
        const destination = pathModule.join(this.selectedMainDirectory, this.currentDirectory, basename);
        fs.move(source, destination).then(() => {
            console.log(`${source} moved`);
        }).catch(error => {
            console.log(error);
        });
    }

    deleteFile(filePath) {
        const source = this.resolvePath(filePath);
        trash([source], { glob: false }).then(() => {
            console.log("deleted");
        }).catch(error => {
            console.log(error);
        });
    }

    changeDirectory(selectedDirectory) {
        const path = this.resolvePath(selectedDirectory);
        if (!selectedDirectory) {
            throw `Invalid directory ${selectedDirectory}`;
        }
        if (this.watcher) {
            this.watcher.close();
        }
        this.watcher = null;
        this.currentDirectory = path.substring(this.selectedMainDirectory.length);
        console.log(this.currentDirectory);
        this.connector.changeDirectory(path);
        this.scannedFiles = new Map();
    }

    async changeScannedFiles(path, stats, mime, isCurrentDirectory = false) {
        if (!path) {
            throw `Invalid path ${path}`;
        }
        try {
            const fileMetadata = await this.getFileMetadata(path, stats, mime, isCurrentDirectory);
            this.scannedFiles.set(path, fileMetadata);
            return fileMetadata;
        } catch (error) {
            console.log(error);
        }
    }

    removeFromScannedFiles(path) {
        if (!path) {
            throw `Invalid path ${path}`;
        }
        this.scannedFiles.delete(path);
    }

    async getFileMetadata(path, stats, mime, isCurrentDirectory = false) {
        if (!path) {
            throw `Invalid path, ${path}`;
        }
        const fileName = pathModule.basename(path);
        return {
            name: fileName,
            path: isCurrentDirectory ?
                this.currentDirectory : pathModule.join(this.currentDirectory, fileName),
            type: getFileType(path, stats),
            access: await getFilePermissions(path),
            size: stats.size,
            mime
        };
    }

    resolvePath(path) {
        const splitAndSanitized = path.split(pathModule.sep).map(segment => sanitize(segment));
        return pathModule.join(this.selectedMainDirectory, ...splitAndSanitized);
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