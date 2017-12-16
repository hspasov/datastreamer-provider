const reducer = (state={token: "", username: ""}, action) => {
    switch (action.type) {
        case "LOGIN_PROVIDER": {
            return {
                ...state,
                token: action.payload.token,
                username: action.payload.username
            };
        }
    }
    return state;
}

export default reducer;