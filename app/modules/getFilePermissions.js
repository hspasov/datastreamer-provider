const fs = window.require("fs");

function getFilePermissions(path) {
    let filePermissions = {};
    filePermissions.read = canRead(path);
    filePermissions.write = canWrite(path);
    filePermissions.execute = canWrite(path);
    return filePermissions;
}

function canRead(path) {
    try {
        fs.accessSync(path, fs.constants.R_OK);
        return true;
    } catch (e) {
        return false;
    }
}

function canWrite(path) {
    try {
        fs.accessSync(path, fs.constants.W_OK);
        return true;
    } catch (e) {
        return false;
    }
}

function canExecute(path) {
    try {
        fs.accessSync(path, fs.constants.X_OK);
        return true;
    } catch (e) {
        return false;
    }
}

export default getFilePermissions;