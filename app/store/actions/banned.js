function addAllBanned(banned) {
    return {
        type: "ADD_ALL_BANNED",
        payload: banned
    };
};

function removeAllBanned() {
    return { type: "REMOVE_ALL_BANNED" };
};

function addBanned(banned) {
    return {
        type: "ADD_BANNED",
        payload: banned
    };
};

function removeBanned(bannedUsername) {
    return {
        type: "REMOVE_BANNED",
        payload: bannedUsername
    };
}

export {
    addAllBanned,
    removeAllBanned,
    addBanned,
    removeBanned
};