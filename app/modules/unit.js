import { ipcRenderer } from "electron";

ipcRenderer.send("inside unit");
console.log("fired inside unit");