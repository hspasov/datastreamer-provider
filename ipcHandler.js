const path = require("path");
const url = require("url");
const electron = require("electron");
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

function ipcHandler(mainWindow) {
    const units = new Map();

    ipcMain.on("create unit", (clientId, selectedRootDirectory) => {
        units.set(clientId, new BrowserWindow({
            parent: mainWindow,
            show: true
        }));
        let unit = units.get(clientId);
        unit.webContents.openDevTools();
        unit.loadURL(url.format({
            pathname: path.join(__dirname, "app/modules/provider-unit.html"),
            protocol: "file:",
            slashes: true
        }));
        unit.webContents.send("initialize", clientId, selectedRootDirectory);
    });

    ipcMain.on("receive description", (clientId, description) => {
        let unit = units.get(clientId);
        unit.webContents.send("receive description", description);
    });

    ipcMain.on("send description", (clientId, description) => {
        mainWindow.webContents.send("send description", clientId, description);
    });

    ipcMain.on("request P2P connection", clientId => {
        mainWindow.webContents.send("request P2P connection", clientId);
    });

    ipcMain.on("send ICE candidate", (clientId, candidate) => {
        mainWindow.webContents.send("send ICE candidate", clientId, candidate);
    });

    ipcMain.on("receive ICE candidate", (clientId, candidate) => {
        let unit = units.get(clientId);
        unit.webContents.send("receive ICE candidate", candidate);
    });

    ipcMain.on("reset connection", clientId => {
        mainWindow.webContents.send("reset connection", clientId);
    });

    ipcMain.on("initialize scan", selectedRootDirectory => {
        units.forEach(unit => {
            unit.webContents.send("initialize scan", selectedRootDirectory);
        });
    });

    ipcMain.on("inside unit", () => {
        console.log("inside unit fired");
    });

    ipcMain.on("pong", (event, arg) => {
        console.log("inside pong fired");
        mainWindow.webContents.send("pong", arg);
    });

    ipcMain.on("delete client", (clientId, error) => {
        let unit = units.get(clientId);
        unit.webContents.send("delete client", error);
        unit = null;
        units.delete(clientId);
    });

    ipcMain.on("delete all", () => {
        units = null;
    });
}

module.exports = ipcHandler;