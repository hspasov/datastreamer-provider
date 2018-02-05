const reducer = (state = { rules: [] }, action) => {
    switch (action.type) {
        case "IMPORT_RULES":
            return {
                ...state,
                rules: action.payload
            };
        case "SET_CLIENT_ACCESS_RULE":
            if (state.rules.find(rule => rule.username === action.payload.username)) {
                return {
                    ...state,
                    rules: state.rules.map(rule => {
                        if (rule.username === action.payload.username) {
                            return {
                                ...rule,
                                readable: action.payload.readable,
                                writable: action.payload.writable
                            };
                        } else {
                            return rule;
                        }
                    })
                };
            } else {
                return {
                    ...state,
                    rules: [...rules, action.payload]
                };
            }
        case "REMOVE_CLIENT_ACCESS_RULE":
            return {
                ...state,
                rules: state.rules.filter(rule => rule.username !== action.payload)
            };
    }
    return state;
};

export default reducer;