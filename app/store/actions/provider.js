const loginProvider = providerData => {
    return {
        type: "LOGIN_PROVIDER",
        payload: providerData
    };
}

const logoutProvider = () => {
    return { type: "LOGOUT_PROVIDER" };
}

export {
    loginProvider,
    logoutProvider
};