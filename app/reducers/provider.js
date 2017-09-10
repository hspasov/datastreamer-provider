const reducer = (state={name: null, providerId: null}, action) => {
    switch (action.type) {
        case "LOGIN_PROVIDER": {
            return {
                ...state,
                name: action.payload.name,
                providerId: action.payload.providerId
            };
        }
    }
    return state;
}

export default reducer;