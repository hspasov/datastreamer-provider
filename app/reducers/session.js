export default function reducer(
    state = {
        id: null,
    }, action) {
    switch (action.type) {
        case "SET_SESSION": {
            return {
                ...state,
                id: action.payload.id
            };
        }
        case "END_SESSION": {
            return {
                ...state,
                id: null
            }
        }
    }
    return state;
}