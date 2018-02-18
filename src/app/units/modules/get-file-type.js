function getFileType(path, stats) {
    let result = "error";
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
};

export default getFileType;