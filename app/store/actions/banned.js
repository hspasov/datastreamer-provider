const addAllBanned = banned => {
    return {
        type: "ADD_ALL_BANNED",
        payload: banned
    };
};

const removeAllBanned = () => {
    return { type: "REMOVE_ALL_BANNED" };
};

const addBanned = banned => {
    return {
        type: "ADD_BANNED",
        payload: banned
    };
};

const removeBanned = bannedUsername => {
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