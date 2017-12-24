import Client from "./client";
const { ipcRenderer } = window.require("electron");

ipcRenderer.on("initialize", (event, unitData, selectedRootDirectory) => {
    const client = new Client(unitData, selectedRootDirectory);
});
console.log("here");