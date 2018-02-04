function setClientAccessRules(clientAccessRules) {
    return {
        type: "SET_CLIENT_ACCESS_RULES",
        payload: clientAccessRules
    };
}

export {
    setClientAccessRules
};