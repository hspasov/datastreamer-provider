import Client from "./client";
const electron = window.require("electron");
const ipcRenderer = electron.ipcRenderer;

ipcRenderer.on("initialize", (event, unitData, selectedRootDirectory) => {
    const client = new Client(unitData, selectedRootDirectory);
});
console.log("here");