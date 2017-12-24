const path = require("path").posix;
const url = require("url");
const { BrowserWindow, ipcMain } = require("electron");

function ipcHandler(mainWindow) {
    let socketIdUnitMap = new Map();

    ipcMain.on("create unit", (event, unitData, selectedRootDirectory) => {
        const browserWindow = new BrowserWindow({
            parent: mainWindow,
            show: false
        });
        socketIdUnitMap.set(unitData.clientSocketId, {
            browserWindow,
            token: unitData.token,
            accessRules: unitData.accessRules
        });
        let unit = socketIdUnitMap.get(unitData.clientSocketId);
        unit.browserWindow.webContents.openDevTools();
        unit.browserWindow.loadURL(url.format({
            pathname: path.join(__dirname, "app/units/provider-unit.html"),
            protocol: "file:",
            slashes: true
        }));
        unit.browserWindow.once("ready-to-show", () => {
            unit.browserWindow.show();
            unit.browserWindow.webContents.send("initialize", unitData, selectedRootDirectory);
        });
    });

    ipcMain.on("receive description", (event, clientSocketId, description) => {
        let unit = socketIdUnitMap.get(clientSocketId);
        unit.browserWindow.webContents.send("receive description", description);
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
        unit.browserWindow.webContents.send("receive ICE candidate", candidate);
    });

    ipcMain.on("reset connection", (event, clientSocketId) => {
        mainWindow.webContents.send("reset connection", clientSocketId);
    });

    ipcMain.on("initialize scan", (event, selectedRootDirectory) => {
        socketIdUnitMap.forEach(unit => {
            unit.browserWindow.webContents.send("initialize scan", selectedRootDirectory);
        });
    });

    ipcMain.on("delete client", (event, clientSocketId, error) => {
        let unit = socketIdUnitMap.get(clientSocketId);
        unit.browserWindow.webContents.send("delete client", error);
        unit.browserWindow.close();
        unit.browserWindow = null;
        socketIdUnitMap.delete(clientSocketId);
    });

    ipcMain.on("reset unit", (event, clientSocketId) => {
        let unit = socketIdUnitMap.get(clientSocketId);
        const unitData = {
            clientSocketId,
            token: unit.token,
            username: unit.token,
            accessRules: unit.accessRules
        };
        unit.browserWindow.close();
        unit.browserWindow = new BrowserWindow({
            parent: mainWindow,
            show: false
        });
        socketIdUnitMap.set(clientSocketId, unit);
        unit.browserWindow.webContents.openDevTools();
        unit.browserWindow.loadURL(url.format({
            pathname: path.join(__dirname, "app/modules/provider-unit.html"),
            protocol: "file:",
            slashes: true
        }));
        unit.browserWindow.once("ready-to-show", () => {
            unit.browserWindow.show();
            unit.browserWindow.webContents.send("initialize", unitData, selectedRootDirectory);
        });
    });

    ipcMain.on("delete all", () => {
        socketIdUnitMap = null;
    });
}

module.exports = ipcHandler;