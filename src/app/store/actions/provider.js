function loginProvider(providerData) {
    return {
        type: "LOGIN_PROVIDER",
        payload: providerData
    };
}

function logoutProvider() {
    return { type: "LOGOUT_PROVIDER" };
}

export {
    loginProvider,
    logoutProvider
};