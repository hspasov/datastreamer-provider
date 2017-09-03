import React from "react";
import io from "socket.io-client";

import getFileType from "../modules/getFileType";
import getFilePermissions from "../modules/getFilePermissions";

class DataWatcher extends React.Component {
    constructor(props) {
        const pathModule = window.require("path");
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

        /*
            Examlpe of socket.io communication with server:
            Prints message sent by server when server emits "serverHandshake"
        */
        this.state.socket.on("serverHandshake", msg => {
            console.log(msg);
        });

        /*
            Listen for "opendirProvider" from server. When received,
            that means a folder is opened. Component's state is changed
            to keep the newly opened directory's path.
            Finally a function to scan the newly opened directory is called
            Note: doesn't work. User session is needed
        */
        this.state.socket.on("opendirProvider", selectedDir => {
            this.setState({ currentDirectory: pathModule.join(this.state.currentDirectory, selectedDir) });
            this.scanDirectory();
        });

        this.handleSelectRootDirectory = this.handleSelectRootDirectory.bind(this);
        this.scanDirectory = this.scanDirectory.bind(this);
        this.addToScannedFiles = this.addToScannedFiles.bind(this);
        this.removeFromScannedFiles = this.removeFromScannedFiles.bind(this);
    }

    componentWillUnmount() {
        if (this.state.watcher != null) {
            this.state.watcher.close();
        }
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

    getFileMetadata(path) {
        const pathModule = window.require("path");
        const fs = window.require("fs");
        let metadata = {};
        let stats = fs.lstatSync(path);
        // size in bytes:
        metadata.name = pathModule.basename(path);
        metadata.path = pathModule.join(
            this.state.currentDirectory.replace(
                this.state.selectedRootDirectory, ""
            ), metadata.name
        );
        console.log(getFileType);
        metadata.type = getFileType(path);
        metadata.size = stats["size"];
        metadata.access = getFilePermissions(path);
        return metadata;
    }

    addToScannedFiles(path) {
        let fileMetadata = this.getFileMetadata(path);
        this.state.scannedFiles.set(path, fileMetadata);
    }

    removeFromScannedFiles(path) {
        this.state.scannedFiles.delete(path);
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
        /*if (this.props.authentication.auth().currentUser === null) {
            return (
                <p>Please login or register.</p>
            );
        }
        console.log(this.props.authentication.auth().currentUser);
        */
        return (
            <div>
                <input ref={node => this._addDirectory(node)} type="file" onChange={this.handleSelectRootDirectory} />
                <button id="scanDirectory" onClick={this.scanDirectory}>Scan Directory</button>
            </div>
        );
    }
}

export default DataWatcher