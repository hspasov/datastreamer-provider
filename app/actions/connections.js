const addClient = client => {
    return {
        type: "ADD",
        payload: client
    };
}

const removeClient = id => {
    return {
        type: "REMOVE",
        payload: id
    };
}

const toggleReadable = id => {
    return {
        type: "TOGGLE_READABLE",
        payload: id
    };
}

const toggleWritable = id => {
    return {
        type: "TOGGLE_WRITABLE",
        payload: id
    };
}

export {
    addClient,
    removeClient,
    toggleReadable,
    toggleWritable
};