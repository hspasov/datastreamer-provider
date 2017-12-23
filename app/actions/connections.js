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

const setAccess = (id, readable, writable) => {
    return {
        type: "SET_ACCESS",
        payload: { id, readable, writable }
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
    setAccess,
    removeClient,
    toggleReadable,
    toggleWritable
};