const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
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

    if (!kuzcoCore.apiKeyExists()) {
        promptForApiKey(mainWindow);
    }
}

ipcMain.on('submit-api-key', (event, apiKey) => {
    const configDir = path.join(os.homedir(), '.kuzco-cli');
    const configPath = path.join(configDir, 'config.json');

    if (!fs.existsSync(configDir)){
        fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify({ API_KEY: apiKey }, null, 2), 'utf8');
    event.reply('api-key-saved');

    app.relaunch();
    app.quit();
});


let inputWindow;

function promptForApiKey() {
    inputWindow = new BrowserWindow({
        width: 300,
        height: 200,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    inputWindow.loadFile('prompt.html');
    inputWindow.on('closed', () => {
        inputWindow = null;
    });
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

ipcMain.handle('send-prompt', async (event, { prompt, model }) => {
    console.log("Received model in main process:", model);
    return await kuzcoCore.sendPrompt(prompt, model);
});

ipcMain.on('abort-prompt', () => {
    kuzcoCore.abortFetch();
});