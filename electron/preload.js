const { contextBridge, ipcRenderer } = require('electron');

// Brindamos una API segura al frontend
contextBridge.exposeInMainWorld('electronAPI', {
    // Ventana y App
    windowManage: (action) => ipcRenderer.invoke('window-manage', { action }),
    updateThemeIcon: (theme) => ipcRenderer.send('update-theme-icon', theme),
    updateShortcuts: (settings) => ipcRenderer.send('update-shortcuts', settings),
    updateSnippetShortcuts: (snippets) => ipcRenderer.send('update-snippet-shortcuts', snippets),
    isProcessElevated: () => ipcRenderer.invoke('is-process-elevated'),
    relaunchElevated: () => ipcRenderer.invoke('relaunch-elevated'),
    rebootToBios: () => ipcRenderer.invoke('reboot-to-bios'),
    showNotification: (payload) => ipcRenderer.handle('show-notification', payload),
    getWingetUpdates: () => ipcRenderer.invoke('get-winget-updates'),
    updateWingetApp: (appId) => ipcRenderer.invoke('update-winget-app', appId),
    checkShortcut: (shortcut) => ipcRenderer.invoke('check-shortcut', shortcut),
    
    // Red e Interfaces
    getWindowsInterfaces: () => ipcRenderer.invoke('get-windows-interfaces'),
    toggleInterface: (payload) => ipcRenderer.invoke('toggle-interface', payload),
    changeIpConfig: (payload) => ipcRenderer.invoke('change-ip-config', payload),
    findAndSetIp: (payload) => ipcRenderer.invoke('find-and-set-ip', payload),
    executeNetworkCommand: (payload) => ipcRenderer.invoke('execute-network-command', payload),
    pingTarget: (payload) => ipcRenderer.invoke('ping-target', payload),
    scanRange: (payload) => ipcRenderer.invoke('scan-range', payload),
    stopScanRange: () => ipcRenderer.send('stop-scan-range'),
    scanMdns: () => ipcRenderer.invoke('scan-mdns'),
    checkPort: (payload) => ipcRenderer.invoke('check-port', payload),
    openExternalCmd: (payload) => ipcRenderer.invoke('open-external-cmd', payload),
    toggleFirewall: (payload) => ipcRenderer.invoke('toggle-firewall', payload),
    runTraceroute: (payload) => ipcRenderer.invoke('run-traceroute', payload),
    
    // Sistema y Archivos
    getSystemStats: () => ipcRenderer.invoke('get-system-stats'),
    getSystemEvents: () => ipcRenderer.invoke('get-system-events'),
    openEventViewer: () => ipcRenderer.invoke('open-event-viewer'),
    getInstalledPrograms: () => ipcRenderer.invoke('get-installed-programs'),
    exportPrograms: (payload) => ipcRenderer.invoke('export-programs', payload),
    checkDiskErrors: (drive) => ipcRenderer.invoke('check-disk-errors', drive),
    selectExecutableFile: () => ipcRenderer.invoke('select-executable-file'),
    launchExternalApp: (appPath) => ipcRenderer.invoke('launch-external-app', appPath),
    fetchOuiDatabase: () => ipcRenderer.invoke('fetch-oui-database'),
    
    // Notificaciones
    sendCustomToast: (payload) => ipcRenderer.send('show-custom-toast', payload),
    notificationWindowEmpty: () => ipcRenderer.send('notification-window-empty'),
    
    // Snippets y Portapapeles
    manualSnippetAction: (payload) => ipcRenderer.send('manual-snippet-action', payload),
    
    // Eventos (Escuchadores)
    onNavigateTo: (callback) => ipcRenderer.on('navigate-to', (_event, target) => callback(target)),
    onSystemResume: (callback) => ipcRenderer.on('system-resume', () => callback()),
    onWingetProgress: (callback) => ipcRenderer.on('winget-update-status', (_event, data) => callback(data)),
    onScanRangeProgress: (callback) => ipcRenderer.on('scan-range-progress', (_event, data) => callback(data)),
    onShowCustomToast: (callback) => ipcRenderer.on('show-custom-toast', (_event, toast) => callback(toast)),
    onTracerouteData: (callback) => ipcRenderer.on('traceroute-data', (_event, data) => callback(data)),
    
    // Limpieza de escuchadores (Opcional pero recomendado)
    removeListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
