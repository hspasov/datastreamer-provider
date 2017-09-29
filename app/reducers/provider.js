const reducer = (state={username: null}, action) => {
    switch (action.type) {
        case "LOGIN_PROVIDER": {
            return {
                ...state,
                username: action.payload.username
            };
        }
    }
    return state;
}

export default reducer;