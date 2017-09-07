export function setSession(id) {
    return {
        type: "SET_SESSION",
        payload: id
    }
}

export function endSession() {
    return {
        type: "END_SESSION",
        payload: null
    }
}