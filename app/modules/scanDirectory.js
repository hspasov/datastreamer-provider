const pathModule = window.require("path");
const chokidar = window.require("chokidar");

export default function scanDirectory(client, rootDirectory, sendMessage) {
    let isCurrentDirectory = true;
    const path = pathModule.join(rootDirectory, client.currentDirectory);
    client.setWatcher(chokidar.watch(path, client.watcherOptions));

    client.watcher
        .on("raw", (event, path, details) => {
            // This event should be triggered everytime something happens.
            console.log("Raw event info:", event, path, details);
        })
        .on("add", (path, stats) => {
            client.changeScannedFiles(path, stats);
            sendMessage(client, "add", client.scannedFiles.get(path));
        })
        .on("addDir", (path, stats) => {
            client.changeScannedFiles(path, stats, isCurrentDirectory);
            if (isCurrentDirectory) {
                isCurrentDirectory = false;
                sendMessage(client, "sendCurrentDirectory", client.scannedFiles.get(path));
            } else {
                sendMessage(client, "addDir", client.scannedFiles.get(path));
            }
        })
        .on("change", (path, stats) => {
            client.changeScannedFiles(path, stats);
            sendMessage(client, "change", client.scannedFiles.get(path));
        })
        .on("unlink", path => {
            sendMessage(client, "unlink", client.scannedFiles.get(path));
            client.removeFromScannedFiles(path);
        })
        .on("unlinkDir", path => {
            sendMessage(client, "unlinkDir", client.scannedFiles.get(path));
            client.removeFromScannedFiles(path);
        })
        .on("error", error => {
            console.log("Error happened", error);
        })
        .on("ready", () => {
            console.info("Initial scan has been completed.");
            sendMessage(client, "doneSending");
        });
}