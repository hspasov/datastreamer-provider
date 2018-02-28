const pathModule = window.require("path").posix;
const chokidar = window.require("chokidar");
const Magic = window.require("promise-mmmagic");
const magic = new Magic(Magic.MAGIC_MIME_TYPE);

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
            magic.detectFile(path).then(mime => {
                return this.getFileMetadata(path, stats, mime);
            }).then(fileMetadata => {
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
            magic.detectFile(path).then(mime => {
                return this.getFileMetadata(path, stats, mime);
            }).then(fileMetadata => {
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