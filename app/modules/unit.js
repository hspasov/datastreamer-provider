import Client from "./client";
const electron = window.require("electron");
const ipcRenderer = electron.ipcRenderer;

ipcRenderer.on("initialize", (event, clientId, selectedRootDirectory) => {
    const client = new Client(clientId, selectedRootDirectory);
});
console.log("here");