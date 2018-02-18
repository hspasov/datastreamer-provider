function setMainDirectory(selectedDirectory) {
    return {
        type: "SET_MAIN_DIR",
        payload: selectedDirectory
    };
}

function setDefaultAccess(readable, writable) {
    return {
        type: "SET_ACCESS",
        payload: { readable, writable }
    };
}

function toggleDefaultReadable() {
    return { type: "TOGGLE_READABLE" };
}

function toggleDefaultWritable() {
    return { type: "TOGGLE_WRITABLE" };
}

function clearSettings() {
    return { type: "CLEAR_SETTINGS" };
}

export {
    setMainDirectory,
    setDefaultAccess,
    toggleDefaultReadable,
    toggleDefaultWritable,
    clearSettings
};