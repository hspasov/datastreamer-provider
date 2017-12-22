const path = require("path").posix;
const url = require("url");
const electron = require("electron");
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

function ipcHandler(mainWindow) {
    let socketIdUnitMap = new Map();

    ipcMain.on("create unit", (event, unitData, selectedRootDirectory) => {
        const browserWindow = new BrowserWindow({
            parent: mainWindow,
            show: false
        });
        socketIdUnitMap.set(unitData.clientSocketId, browserWindow);
        let unit = socketIdUnitMap.get(unitData.clientSocketId);
        unit.webContents.openDevTools();
        unit.loadURL(url.format({
            pathname: path.join(__dirname, "app/modules/provider-unit.html"),
            protocol: "file:",
            slashes: true
        }));
        unit.once("ready-to-show", () => {
            unit.show();
            unit.webContents.send("initialize", unitData, selectedRootDirectory);
        });
    });

    ipcMain.on("receive description", (event, clientSocketId, description) => {
        let unit = socketIdUnitMap.get(clientSocketId);
        unit.webContents.send("receive description", description);
    });

    ipcMain.on("send description", (event, clientSocketId, description) => {
        mainWindow.webContents.send("send description", clientSocketId, description);
    });

    ipcMain.on("request P2P connection", (event, clientSocketId, arg) => {
        mainWindow.webContents.send("request P2P connection", clientSocketId);
    });

    ipcMain.on("send ICE candidate", (event, clientSocketId, candidate) => {
        mainWindow.webContents.send("send ICE candidate", clientSocketId, candidate);
    });

    ipcMain.on("receive ICE candidate", (event, clientSocketId, candidate) => {
        let unit = socketIdUnitMap.get(clientSocketId);
        unit.webContents.send("receive ICE candidate", candidate);
    });

    ipcMain.on("reset connection", (event, clientSocketId) => {
        mainWindow.webContents.send("reset connection", clientSocketId);
    });

    ipcMain.on("initialize scan", (event, selectedRootDirectory) => {
        socketIdUnitMap.forEach(unit => {
            unit.webContents.send("initialize scan", selectedRootDirectory);
        });
    });

    ipcMain.on("delete client", (event, clientSocketId, error) => {
        let unit = socketIdUnitMap.get(clientSocketId);
        unit.webContents.send("delete client", error);
        unit.close();
        unit = null;
        socketIdUnitMap.delete(clientSocketId);
    });

    ipcMain.on("delete all", () => {
        socketIdUnitMap = null;
    });
}

module.exports = ipcHandler;