const reducer = (state = { clients: [] }, action) => {
    switch (action.type) {
        case "ADD":
            return {
                ...state,
                clients: state.clients.concat([action.payload])
            };
        case "REMOVE":
            return {
                ...state,
                clients: state.clients.filter(c => c.id !== id)
            };
        case "TOGGLE_READABLE":
            return {
                ...state,
                clients: state.clients.map(c => {
                    if (c.id !== action.payload) {
                        return c;
                    } else {
                        return {
                            ...c,
                            readable: !c.readable
                        };
                    }
                })
            };
        case "TOGGLE_WRITABLE":
            return {
                ...state,
                clients: state.clients.map(c => {
                    if (c.id !== action.payload) {
                        return c;
                    } else {
                        return {
                            ...c,
                            writable: !c.writable
                        };
                    }
                })
            };
    }
    return state;
}

export default reducer;