const reducer = (state = { mainDirectory: "N/A"}, action) => {
    switch (action.type) {
        case "SET_MAIN_DIR":
            return {
                ...state,
                mainDirectory: action.payload
            };
    }
    return state;
}

export default reducer;