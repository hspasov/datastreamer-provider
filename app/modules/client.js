import getFileType from "../modules/getFileType";
import getFilePermissions from "../modules/getFilePermissions";

const pathModule = window.require("path");
const fs = window.require("fs");

class Client {
    constructor(id, currentDirectory = ".", watcherOptions = {
        ignored: /[\/\\]\./,
        persistent: true,
        usePolling: true,
        depth: 0
    }) {
        this.id = id;
        this.currentDirectory = currentDirectory;
        this.scannedFiles = new Map();
        this.watcher = null;
        this.watcherOptions = watcherOptions;

        this.setWatcher = this.setWatcher.bind(this);
        this.changeDirectory = this.changeDirectory.bind(this);
        this.changeScannedFiles = this.changeScannedFiles.bind(this);
        this.removeFromScannedFiles = this.removeFromScannedFiles.bind(this);
        this.getFileMetadata = this.getFileMetadata.bind(this);
        this.restart = this.restart.bind(this);
        this.delete = this.delete.bind(this);
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
        this.currentDirectory = selectedDirectory;
        this.scannedFiles = new Map();
        this.watcher = null;
    }

    changeScannedFiles(path, isCurrentDirectory = false) {
        if (!path) {
            throw `Invalid path ${path}`;
        }
        let fileMetadata = this.getFileMetadata(path, isCurrentDirectory);
        this.scannedFiles.set(path, fileMetadata);
    }

    removeFromScannedFiles(path) {
        if (!path) {
            throw `Invalid path ${path}`;
        }
        this.scannedFiles.delete(path);
    }

    getFileMetadata(path, isCurrentDirectory = false) {
        if (!path) {
            throw `Invalid path, ${path}`;
        }
        let metadata = {};
        let stats = fs.lstatSync(path);
        // size in bytes:
        metadata.name = pathModule.basename(path);
        metadata.path = isCurrentDirectory ?
            this.currentDirectory : pathModule.join(this.currentDirectory, metadata.name);
        metadata.type = getFileType(path);
        metadata.size = stats["size"];
        metadata.access = getFilePermissions(path);
        return metadata;
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
};

export default Client;