function connectSuccess() {
    return { type: "CONNECT_SUCCESS" };
}

function connectError() {
    return { type: "CONNECT_ERROR" };
}

function invalidToken() {
    return { type: "INVALID_TOKEN" };
}

function invalidClientToken() {
    return { type: "INVALID_CLIENT_TOKEN" };
}

function invalidRequest() {
    return { type: "INVALID_REQUEST" };
}

function connectTimeout() {
    return { type: "CONNECT_TIMEOUT" };
}

function disconnect() {
    return { type: "DISCONNECT" };
}

function reconnectFail() {
    return { type: "RECONNECT_FAIL" };
}

function error() {
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