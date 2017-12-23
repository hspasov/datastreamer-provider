const setMainDirectory = selectedDirectory => {
    return {
        type: "SET_MAIN_DIR",
        payload: selectedDirectory
    };
}

const setDefaultAccess = (readable, writable) => {
    return {
        type: "SET_ACCESS",
        payload: { readable, writable }
    };
}

const toggleDefaultReadable = () => {
    return { type: "TOGGLE_READABLE" };
}

const toggleDefaultWritable = () => {
    return { type: "TOGGLE_WRITABLE" };
}

export {
    setMainDirectory,
    setDefaultAccess,
    toggleDefaultReadable,
    toggleDefaultWritable
};