const setMainDirectory = selectedDirectory => {
    return {
        type: "SET_MAIN_DIR",
        payload: selectedDirectory
    };
}

export {
    setMainDirectory
};