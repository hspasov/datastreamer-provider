const loginProvider = provider => {
    return {
        type: "LOGIN_PROVIDER",
        payload: provider
    }
}

export default loginProvider;