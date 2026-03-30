const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('notificationAPI', {
    onShowToast: (callback) => ipcRenderer.on('show-custom-toast', (_event, toast) => callback(toast)),
    onClearToasts: (callback) => ipcRenderer.on('clear-custom-toasts', () => callback()),
    notifyEmpty: () => ipcRenderer.send('notification-window-empty'),
    removeListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});
