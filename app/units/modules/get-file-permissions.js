const fs = window.require("fs-extra");

function getFilePermissions(path) {
    return {
        read: canRead(path),
        write: canWrite(path),
        execute: canWrite(path)
    };
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