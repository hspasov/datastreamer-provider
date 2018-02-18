import "babel-polyfill";
import Client from "./client";
const { ipcRenderer } = window.require("electron");

ipcRenderer.on("initialize", (event, unitData, selectedMainDirectory) => {
    const client = new Client(unitData, selectedMainDirectory);
});