const loginProvider = providerData => {
    return {
        type: "LOGIN_PROVIDER",
        payload: providerData
    }
}

export default loginProvider;