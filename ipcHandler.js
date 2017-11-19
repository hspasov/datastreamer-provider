const path = require("path");
const url = require("url");
const electron = require("electron");
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

function ipcHandler(mainWindow) {
    const units = new Map();

    ipcMain.on("create unit", (event, clientId, selectedRootDirectory) => {
        console.log(clientId);
        console.log(selectedRootDirectory);
        units.set(clientId, new BrowserWindow({
            parent: mainWindow,
            show: false
        }));
        let unit = units.get(clientId);
        unit.webContents.openDevTools();
        unit.loadURL(url.format({
            pathname: path.join(__dirname, "app/modules/provider-unit.html"),
            protocol: "file:",
            slashes: true
        }));
        unit.once("ready-to-show", () => {
            console.log("ready to show");
            unit.show();
            unit.webContents.send("initialize", clientId, selectedRootDirectory);
        });
    });

    ipcMain.on("receive description", (event, clientId, description) => {
        let unit = units.get(clientId);
        unit.webContents.send("receive description", description);
    });

    ipcMain.on("send description", (event, clientId, description) => {
        console.log("inside send description, with desc=", description);
        mainWindow.webContents.send("send description", clientId, description);
    });

    ipcMain.on("request P2P connection", (event, clientId, arg) => {
        mainWindow.webContents.send("request P2P connection", clientId);
    });

    ipcMain.on("send ICE candidate", (event, clientId, candidate) => {
        mainWindow.webContents.send("send ICE candidate", clientId, candidate);
    });

    ipcMain.on("receive ICE candidate", (event, clientId, candidate) => {
        let unit = units.get(clientId);
        unit.webContents.send("receive ICE candidate", candidate);
    });

    ipcMain.on("reset connection", (event, clientId) => {
        mainWindow.webContents.send("reset connection", clientId);
    });

    ipcMain.on("initialize scan", (event, selectedRootDirectory) => {
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

    ipcMain.on("delete client", (event, clientId, error) => {
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