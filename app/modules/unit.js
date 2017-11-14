const electron = window.require("electron");
const ipcRenderer = electron.ipcRenderer;

ipcRenderer.send("inside unit");
console.log("fired inside unit");