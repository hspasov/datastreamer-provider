const reducer = (state = { rules: [] }, action) => {
    switch (action.type) {
        case "SET_CLIENT_ACCESS_RULES":
            return {
                ...state,
                rules: action.payload
            };
    }
    return state;
};

export default reducer;