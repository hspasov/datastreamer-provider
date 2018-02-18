const reducer = (state = { mainDirectory: "N/A", readable: false, writable: false }, action) => {
    switch (action.type) {
        case "SET_MAIN_DIR":
            return {
                ...state,
                mainDirectory: action.payload
            };
        case "SET_ACCESS":
            return {
                ...state,
                readable: action.payload.readable,
                writable: action.payload.writable
            };
        case "TOGGLE_READABLE":
            return {
                ...state,
                readable: !state.readable
            };
        case "TOGGLE_WRITABLE":
            return {
                ...state,
                writable: !state.writable
            };
        case "CLEAR_SETTINGS":
            return {
                mainDirectory: "N/A",
                readable: false,
                writable: false
            };
    }
    return state;
}

export default reducer;