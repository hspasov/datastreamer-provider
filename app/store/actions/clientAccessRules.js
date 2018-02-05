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

export {
    importRules,
    setClientAccessRule,
    removeClientAccessRule
};