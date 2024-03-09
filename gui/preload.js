const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendPrompt: (prompt, model) => ipcRenderer.invoke('send-prompt', { prompt, model }),
    onApiKeySaved: (callback) => ipcRenderer.on('api-key-saved', callback),
});