const connectSuccess = () => {
    return { type: "CONNECT_SUCCESS" };
}

const connectError = () => {
    return { type: "CONNECT_ERROR" };
}

const connectTimeout = () => {
    return { type: "CONNECT_TIMEOUT" };
}

const disconnect = () => {
    return { type: "DISCONNECT" };
}

const reconnectFail = () => {
    return { type: "RECONNECT_FAIL" };
}

const error = () => {
    return { type: "ERROR" };
}

export {
    connectSuccess,
    connectError,
    connectTimeout,
    disconnect,
    reconnectFail,
    error
};