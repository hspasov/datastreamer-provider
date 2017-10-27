const reducer = (state={token: null}, action) => {
    switch (action.type) {
        case "LOGIN_PROVIDER": {
            return {
                ...state,
                token: action.payload.token
            };
        }
    }
    return state;
}

export default reducer;