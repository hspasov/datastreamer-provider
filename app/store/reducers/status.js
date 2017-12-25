const reducer = (state = { isError: false, connection: true, message: "Please select main directory!" }, action) => {
    switch (action.type) {
        case "CONNECT_SUCCESS":
            return {
                ...state,
                isError: false,
                connection: true,
                message: ""
            };
        case "CONNECT_ERROR":
            return {
                ...state,
                isError: true,
                connection: false,
                message: "Can't connect to server"
            };
        case "INVALID_TOKEN":
            return {
                ...state,
                isError: true,
                connection: true,
                message: "Invalid session, please authenticate again!"
            };
        case "INVALID_CLIENT_TOKEN":
            return {
                ...state,
                connetion: true,
                message: "Client needs to reconnect."
            };
        case "INVALID_REQUEST":
            return {
                ...state,
                connection: true,
                message: "Invalid request was sent to server."
            };
        case "CONNECT_TIMEOUT":
            return {
                ...state,
                isError: true,
                connection: false,
                message: "Connection timeout"
            };
        case "DISCONNECT":
            return {
                ...state,
                isError: true,
                connection: false,
                message: "Disconnected"
            };
        case "RECONNECT_FAIL":
            return {
                ...state,
                isError: true,
                connection: false,
                message: "Reconnect failed"
            };
        case "ERROR":
            return {
                ...state,
                isError: true,
                connection: false,
                message: "Unknown error"
            };
    }
    return state;
}

export default reducer;