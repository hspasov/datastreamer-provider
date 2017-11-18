const pathModule = window.require("path");
const chokidar = window.require("chokidar");

export default function scanDirectory() {
    let isCurrentDirectory = true;
    const path = pathModule.join(this.selectedRootDirectory, this.currentDirectory);
    this.setWatcher(chokidar.watch(path, this.watcherOptions));

    this.watcher
        .on("raw", (event, path, details) => {
            // This event should be triggered everytime something happens.
            console.log("Raw event info:", event, path, details);
        })
        .on("add", (path, stats) => {
            this.changeScannedFiles(path, stats);
            this.sendMessage("add", this.scannedFiles.get(path));
        })
        .on("addDir", (path, stats) => {
            this.changeScannedFiles(path, stats, isCurrentDirectory);
            if (isCurrentDirectory) {
                isCurrentDirectory = false;
                this.sendMessage("sendCurrentDirectory", this.scannedFiles.get(path));
            } else {
                this.sendMessage("addDir", this.scannedFiles.get(path));
            }
        })
        .on("change", (path, stats) => {
            this.changeScannedFiles(path, stats);
            this.sendMessage("change", this.scannedFiles.get(path));
        })
        .on("unlink", path => {
            this.sendMessage("unlink", this.scannedFiles.get(path));
            this.removeFromScannedFiles(path);
        })
        .on("unlinkDir", path => {
            this.sendMessage("unlinkDir", this.scannedFiles.get(path));
            this.removeFromScannedFiles(path);
        })
        .on("error", error => {
            console.log("Error happened", error);
        })
        .on("ready", () => {
            console.info("Initial scan has been completed.");
            this.sendMessage("doneSending");
        });
}