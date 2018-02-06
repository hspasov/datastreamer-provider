function addClient(client) {
    return {
        type: "ADD",
        payload: client
    };
}

function removeClient(id) {
    return {
        type: "REMOVE",
        payload: id
    };
}

function setAccess(id, readable, writable) {
    return {
        type: "SET_ACCESS",
        payload: { id, readable, writable }
    };
}

function toggleReadable(id) {
    return {
        type: "TOGGLE_READABLE",
        payload: id
    };
}

function toggleWritable(id) {
    return {
        type: "TOGGLE_WRITABLE",
        payload: id
    };
}

function changeClientDirectory(id, directory) {
    return {
        type: "CHANGE_DIRECTORY",
        payload: { id, directory }
    };
}

function clearConnections() {
    return { type: "CLEAR_CONNECTIONS" };
}

export {
    addClient,
    setAccess,
    removeClient,
    toggleReadable,
    toggleWritable,
    changeClientDirectory,
    clearConnections
};