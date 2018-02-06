function importRules(clientAccessRules) {
    return {
        type: "IMPORT_RULES",
        payload: clientAccessRules
    };
}

function setClientAccessRule(clientAccessRule) {
    return {
        type: "SET_CLIENT_ACCESS_RULE",
        payload: clientAccessRule
    };
}

function removeClientAccessRule(clientUsername) {
    return {
        type: "REMOVE_CLIENT_ACCESS_RULE",
        payload: clientUsername
    };
}

function clearClientAccessRules() {
    return { type: "CLEAR_CLIENT_ACCESS_RULES" };
}

export {
    importRules,
    setClientAccessRule,
    removeClientAccessRule,
    clearClientAccessRules
};