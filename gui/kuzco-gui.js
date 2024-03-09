const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const KuzcoCore = require('./kuzcoCore');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
        },
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

const kuzcoCore = new KuzcoCore();

ipcMain.handle('send-prompt', async (event, prompt) => {
    return await kuzcoCore.sendPrompt(prompt);
});
