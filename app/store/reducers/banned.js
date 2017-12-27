const reducer = (state = { clients: [] }, action) => {
    switch (action.type) {
        case "ADD_ALL_BANNED":
            return {
                ...state,
                clients: action.payload
            };
        case "REMOVE_ALL_BANNED":
            return {
                ...state,
                clients: []
            };
        case "ADD_BANNED":
            return {
                ...state,
                clients: state.clients.concat([action.payload])
            };
        case "REMOVE_BANNED":
            return {
                ...state,
                clients: state.clients.filter(c => c.username !== action.payload)
            };
    }
    return state;
};

export default reducer;