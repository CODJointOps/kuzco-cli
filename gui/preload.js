const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendPrompt: (prompt) => ipcRenderer.invoke('send-prompt', prompt),
});

contextBridge.exposeInMainWorld('api', {
    submitApiKey: (apiKey) => ipcRenderer.send('submit-api-key', apiKey)
});