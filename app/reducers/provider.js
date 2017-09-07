export default function reducer(
    state = {
        name: null,
        providerId: null
    }, action) {
    switch (action.type) {
        case "REGISTER_PROVIDER": {
            return {
                ...state,
                name: action.payload.name,
                providerId: action.payload.providerId
            };
        }
    }
    return state;
}