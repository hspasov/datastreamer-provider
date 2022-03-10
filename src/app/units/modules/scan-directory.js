const pathModule = window.require("path").posix;
const chokidar = window.require("chokidar");
const mime = window.require("mime-types");

function scanDirectory() {
    let isCurrentDirectory = true;
    const path = pathModule.join(this.selectedMainDirectory, this.currentDirectory);
    if (this.watcher) {
        this.watcher.close();
    }
    this.watcher = chokidar.watch(path, this.watcherOptions);

    this.sendMessage("newScan");
    this.watcher
        .on("add", (path, stats) => {
            const mimeType = mime.lookup(path);
            this.getFileMetadata(path, stats, mimeType).then(fileMetadata => {
                this.sendMessage("add", fileMetadata);
            }).catch(error => {
                // todo: Handle error;
            });
        })
        .on("addDir", (path, stats) => {
            if (isCurrentDirectory) {
                isCurrentDirectory = false;
            } else {
                this.getFileMetadata(path, stats, "inode/directory").then(fileMetadata => {
                    this.sendMessage("addDir", fileMetadata);
                }).catch(error => {
                    // todo: Handle error
                });
            }
        })
        .on("change", (path, stats) => {
            const mimeType = mime.lookup(path);
            this.getFileMetadata(path, stats, mimeType).then(fileMetadata => {
                this.sendMessage("change", fileMetadata);
            }).catch(error => {
                // todo: Handle error
            });
        })
        .on("unlink", path => {
            this.sendMessage("unlink", this.getRelativePath(path));
        })
        .on("unlinkDir", path => {
            this.sendMessage("unlinkDir", this.getRelativePath(path));
        })
        .on("error", error => {
            // todo: Handle error
        })
        .on("ready", () => {
            this.sendMessage("scanFinished");
        });
}

export default scanDirectory;
