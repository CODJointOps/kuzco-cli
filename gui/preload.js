const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendPrompt: (prompt) => ipcRenderer.invoke('send-prompt', prompt),
    onApiKeySaved: (callback) => ipcRenderer.on('api-key-saved', callback),
});
