const fs = window.require("fs-extra");

async function getFilePermissions(path) {
    return {
        read: await canRead(path),
        write: await canWrite(path),
        execute: await canWrite(path)
    };
}

async function canRead(path) {
    try {
        await fs.access(path, fs.constants.R_OK);
        return true;
    } catch (e) {
        return false;
    }
}

async function canWrite(path) {
    try {
        await fs.accessSync(path, fs.constants.W_OK);
        return true;
    } catch (e) {
        return false;
    }
}

async function canExecute(path) {
    try {
        await fs.accessSync(path, fs.constants.X_OK);
        return true;
    } catch (e) {
        return false;
    }
}

export default getFilePermissions;