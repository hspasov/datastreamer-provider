var getFilePermissions = path => {
    let filePermissions = {};
    filePermissions.read = canRead(path);
    filePermissions.write = canWrite(path);
    filePermissions.execute = canWrite(path);
    console.log(filePermissions);
    return filePermissions;
}

function canRead(path) {
    const fs = window.require("fs");
    try {
        fs.accessSync(path, fs.constants.R_OK);
        return true;
    } catch (e) {
        return false;
    }
}

function canWrite(path) {
    const fs = window.require("fs");
    try {
        fs.accessSync(path, fs.constants.W_OK);
        return true;
    } catch (e) {
        return false;
    }
}

function canExecute(path) {
    const fs = window.require("fs");
    try {
        fs.accessSync(path, fs.constants.X_OK);
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = getFilePermissions;