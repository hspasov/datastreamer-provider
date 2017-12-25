const connectSuccess = () => {
    return { type: "CONNECT_SUCCESS" };
}

const connectError = () => {
    return { type: "CONNECT_ERROR" };
}

const invalidToken = () => {
    return { type: "INVALID_TOKEN" };
}

const invalidClientToken = () => {
    return { type: "INVALID_CLIENT_TOKEN" };
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
    invalidToken,
    connectTimeout,
    disconnect,
    reconnectFail,
    error
};