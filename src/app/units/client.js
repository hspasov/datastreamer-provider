import sanitize from "sanitize-filename";
import UnitToMainConnector from "./connections/unit-to-main-connector";
import getFileType from "./modules/get-file-type";
import getFilePermissions from "./modules/get-file-permissions";
import scanDirectory from "./modules/scan-directory";
import {
    prepareConnectionInitialization,
    respondToOffer,
    receiveICECandidate
} from "./connections/rtc-initialization";

const fs = window.require("fs-extra");
const trash = window.require("trash");
const pathModule = window.require("path").posix;

class Client {
    constructor(unitData, selectedMainDirectory, currentDirectory = ".", watcherOptions = {
        ignored: /[\/\\]\./,
        alwaysStat: true,
        usePolling: true,
        depth: 0
    }) {
        this.id = unitData.clientSocketId;
        this.selectedMainDirectory = selectedMainDirectory;
        this.currentDirectory = currentDirectory;
        this.watcher = null;
        this.watcherOptions = watcherOptions;
        this.connector = new UnitToMainConnector(this);

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

        this.resetsLimit = 10;
        this.resets = 0;

        this.prepareConnectionInitialization = prepareConnectionInitialization.bind(this);
        this.respondToOffer = respondToOffer.bind(this);
        this.receiveICECandidate = receiveICECandidate.bind(this);
        this.scanDirectory = scanDirectory.bind(this);

        this.lockFileHandlers = new Map();

        this.prepareConnectionInitialization(unitData.accessRules);
    }

    initializeScan(selectedDirectory) {
        if (selectedDirectory) {
            if (this.watcher) {
                this.watcher.close();
            }
            this.currentDirectory = ".";
            this.selectedMainDirectory = selectedDirectory;
            if (this.sendMessageChannel && this.sendMessageChannel.readyState === "open") {
                this.scanDirectory();
            }
        }
    }

    errorHandler(error) {
        // todo
    }

    handleMessageWritable(message) {
        switch (message.type) {
            case "copyFile":
                this.connector.lockFile(message.payload, () => {
                    this.copyFile(message.payload);
                });
                break;
            case "moveFile":
                this.connector.lockFile(message.payload, () => {
                    this.moveFile(message.payload);
                });
                break;
            case "deleteFile":
                this.connector.lockFile(message.payload, () => {
                    this.deleteFile(message.payload);
                });
                break;
            case "uploadFile":
                this.prepareUpload(message.payload);
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
                this.connector.lockFile(message.payload, () => {
                    this.sendFile(message.payload);
                });
                break;
        }
    }

    handleChunk(chunk) {
        try {
            this.receivedBytes += chunk.byteLength;
            if (this.receivedBytes >= this.uploadedFileData.size) {
                this.writeStream.end(Buffer.from(chunk));
            } else {
                this.writeStream.write(Buffer.from(chunk));
            }
        } catch (error) {
            // todo: Handle error
        }
    }

    prepareUpload(fileData) {
        this.uploadedFileData = fileData;
        const sanitizedFileName = sanitize(pathModule.basename(fileData.name));
        if (!sanitizedFileName) {
            // todo: handle invalid name
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
            // todo: Error message
        });
        this.receivedBytes = 0;
        this.sendMessage("readyForFile");
    }

    sendFile(filePath) {
        try {
            const path = this.getAbsolutePath(filePath);
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
                this.readStream = null;
                this.connector.unlockFile(filePath);
            });
        } catch (e) {
            if (!this.sendFileChannel) {
                // todo: Handle unexpectedly closed connection
                return;
            } else {
                // todo: Handle error
                return;
            }
        }
    }

    sendMessage(type, payload) {
        try {
            this.sendMessageChannel.send(JSON.stringify({ type, payload }));
        } catch (e) {
            if (!this.sendMessageChannel) {
                // todo: Handle unexpectedly closed connection
                return;
            } else {
                // todo: Handle error
                return;
            }
        }
    }

    copyFile(filePath) {
        const source = this.getAbsolutePath(filePath);
        const basename = sanitize(pathModule.basename(filePath));
        if (!basename) {
            // todo: Handle invalid file path
            return;
        }
        const destination = pathModule.join(this.selectedMainDirectory, this.currentDirectory, basename);
        fs.copy(source, destination, {
            overwrite: false,
            errorOnExist: true
        }).then(() => {
            this.connector.unlockFile(filePath);
        }).catch(error => {
            // todo: Handle error
        });
    }

    moveFile(filePath) {
        const source = this.getAbsolutePath(filePath);
        const basename = sanitize(pathModule.basename(filePath));
        if (!basename) {
            return;
        }
        const destination = pathModule.join(this.selectedMainDirectory, this.currentDirectory, basename);
        fs.move(source, destination).then(() => {
            this.connector.unlockFile(filePath);
        }).catch(error => {
            this.sendMessage("error", error);
        });
    }

    deleteFile(filePath) {
        const source = this.getAbsolutePath(filePath);
        trash([source], { glob: false }).then(() => {
            this.connector.unlockFile(filePath);
        }).catch(error => {
            this.sendMessage("error", error);
        });
    }

    changeDirectory(selectedDirectory) {
        const path = this.getAbsolutePath(selectedDirectory);
        if (!selectedDirectory) {
            // todo: Handle invalid directory
            return;
        }
        if (this.watcher) {
            this.watcher.close();
        }
        this.watcher = null;
        this.currentDirectory = path.substring(this.selectedMainDirectory.length);
        this.connector.changeDirectory(path);
    }

    async getFileMetadata(path, stats, mime) {
        if (!path) {
            // todo: Handle invalid path
        }
        return {
            name: pathModule.basename(path),
            path: this.getRelativePath(path),
            type: getFileType(path, stats),
            access: await getFilePermissions(path),
            size: stats.size,
            mime
        };
    }

    getAbsolutePath(path) {
        const splitAndSanitized = path.split(pathModule.sep).map(segment => sanitize(segment));
        return pathModule.join(this.selectedMainDirectory, ...splitAndSanitized);
    }

    getRelativePath(path) {
        return pathModule.join(this.currentDirectory, pathModule.basename(path));
    }

    deleteP2PConnection(error=null) {
        this.sendMessageChannel && this.sendMessageChannel.close();
        this.sendFileChannel && this.sendFileChannel.close();
        this.receiveMessageChannel && this.receiveMessageChannel.close();
        this.receiveMessageWritableChannel && this.receiveMessageWritableChannel.close();
        this.receiveFileChannel && this.receiveFileChannel.close();
        this.peerConnection && this.peerConnection.close();
        if (error) {
            if (this.resets >= this.resetsLimit) {
                this.connector.deleteClient();
            } else {
                this.resets++;
                this.connector.resetConnection();
            }
        }
    }
};

export default Client;