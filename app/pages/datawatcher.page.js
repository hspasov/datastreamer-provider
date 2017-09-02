import React from "react";
import io from "socket.io-client";

class DataWatcher extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRootDirectory: "",
            currentDirectory: "",
            scannedFiles: new Map(),
            watcher: null,
            watcherOptions: {
                ignored: /[\/\\]\./,
                persistent: true,
                usePolling: true,
                depth: 0
            },
            socket: io("http://localhost:3000")
        };

        this.state.socket.on("serverHandshake", msg => {
            console.log(msg);
        });

        this.handleSelectRootDirectory = this.handleSelectRootDirectory.bind(this);
        this.scanDirectory = this.scanDirectory.bind(this);
        this.addToScannedFiles = this.addToScannedFiles.bind(this);
        this.removeFromScannedFiles = this.removeFromScannedFiles.bind(this);
        this.getFileMetadata = this.getFileMetadata.bind(this);
        this.getFilePermissions = this.getFilePermissions.bind(this);
    }

    componentWillUnmount() {
        this.state.watcher.close();
        this.state.socket.disconnect();
        this.setState({
            selectedRootDirectory: "",
            currentDirectory: "",
            scannedFiles: null,
            watcher: null,
            socket: null
        });
    }

    scanDirectory() {
        const path = this.state.currentDirectory;
        const chokidar = window.require("chokidar");

        if (this.state.watcher !== null) {
            this.state.watcher.close();
        }

        this.state.watcher = chokidar.watch(path, this.state.watcherOptions);

        let onWatcherReady = () => {
            console.info("Initial scan has been completed.");
            // A check for connection is needed
            console.log(this.state.socket.id);
            console.log(this.state.socket);
            this.state.socket.emit("serverHandshake", "Ready");
        }

        this.state.watcher
            .on("raw", function (event, path, details) {
                // This event should be triggered everytime something happens.
                console.log("Raw event info:", event, path, details);
            })
            .on("add", path => {
                this.addToScannedFiles(path);
                this.state.socket.emit("demo", `File ${path} has been added.`, this.state.scannedFiles.get(path));
                console.log("File", path, "has been added");
            })
            .on("addDir", path => {
                this.addToScannedFiles(path);
                this.state.socket.emit("demo", `Directory ${path} has been added`, this.state.scannedFiles.get(path));
                console.log("Directory", path, "has been added");
            })
            .on("change", path => {
                this.addToScannedFiles(path);
                this.state.socket.emit("demo", `File ${path} has been changed`, this.state.scannedFiles.get(path));
                console.log("File", path, "has been changed");
            })
            .on("unlink", path => {
                this.removeFromScannedFiles(path);
                this.state.socket.emit("demo", `File ${path} has been removed`);
                console.log("File", path, "has been removed");
            })
            .on("unlinkDir", path => {
                this.removeFromScannedFiles(path);
                this.state.socket.emit("demo", `Directory ${path} has been changed`);
                console.log("Directory", path, "has been removed");
            })
            .on("error", error => {
                console.log("Error happened", error);
            })
            .on("ready", onWatcherReady);
    }

    addToScannedFiles(path) {
        let fileMetadata = this.getFileMetadata(path);
        this.state.scannedFiles.set(path, fileMetadata);
    }

    removeFromScannedFiles(path) {
        this.state.scannedFiles.delete(path);
    }

    getFileType(path) {
        const fs = window.require("fs");
        let result = "error";
        let stats = fs.lstatSync(path);
        if (stats.isBlockDevice()) {
            result = "blockDevice";
        } else if (stats.isCharacterDevice()) {
            result = "characterDevice";
        } else if (stats.isDirectory()) {
            result = "directory";
        } else if (stats.isFIFO()) {
            result = "fifo";
        } else if (stats.isFile()) {
            result = "file";
        } else if (stats.isSocket()) {
            result = "socket";
        } else if (stats.isSymbolicLink()) {
            result = "symbolicLink";
        }
        return result;
    }

    canRead(path) {
        const fs = window.require("fs");
        try {
            fs.accessSync(path, fs.constants.R_OK);
            return true;
        } catch (e) {
            return false;
        }
    }

    canWrite(path) {
        const fs = window.require("fs");
        try {
            fs.accessSync(path, fs.constants.W_OK);
            return true;
        } catch (e) {
            return false;
        }
    }

    canExecute(path) {
        const fs = window.require("fs");
        try {
            fs.accessSync(path, fs.constants.X_OK);
            return true;
        } catch (e) {
            return false;
        }
    }

    getFilePermissions(path) {
        let filePermissions = {};
        filePermissions.read = this.canRead(path);
        filePermissions.write = this.canWrite(path);
        filePermissions.execute = this.canWrite(path);
        console.log(filePermissions);
        return filePermissions;
    }

    getFileMetadata(path) {
        const pathModule = window.require("path");
        const fs = window.require("fs");
        let metadata = {};
        let stats = fs.lstatSync(path);
        // size in bytes:
        metadata.name = pathModule.basename(path);
        metadata.type = this.getFileType(path);
        metadata.size = stats["size"];
        metadata.access = this.getFilePermissions(path);
        return metadata;
    }

    _addDirectory(node) {
        if (node) {
            node.webkitdirectory = true;
        }
    }

    selectDirectory() {
        const dialog = window.require("electron").dialog;

        dialog.showOpenDialog(mainWindow, {
            properties: ["openDirectory"]
        });
    }

    handleSelectRootDirectory(event) {
        let dirPath = event.target.files[0].path;
        this.setState({
            selectedRootDirectory: dirPath,
            currentDirectory: dirPath
        });
    }

    render() {
        return (
            <div>
                <input ref={node => this._addDirectory(node)} type="file" onChange={this.handleSelectRootDirectory} />
                <button id="scanDirectory" onClick={this.scanDirectory}>Scan Directory</button>
            </div>
        );
    }
}

export default DataWatcher