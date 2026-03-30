
import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, shell, dialog, globalShortcut, clipboard, powerMonitor, Notification, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { exec, spawn } from 'child_process';
import net from 'net';
import os from 'os';
import uiohookPkg from 'uiohook-napi';
const { uiohook } = uiohookPkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- LOGGING HELPER ---
const LOG_FILE = path.join(app.getPath('userData'), 'notifications.log');
function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    try {
        fs.appendFileSync(LOG_FILE, logEntry);
    } catch (e) {
        console.error('Failed to write to log:', e);
    }
}
logToFile('--- Application Start ---');

// Identificador para Windows (Ayuda a agrupar iconos, notificaciones y cambios dinámicos)
if (app.isPackaged) {
    app.setAppUserModelId('com.netmajik.desktop');
} else {
    app.setAppUserModelId(process.execPath);
}

// --- SECURITY HELPERS ---
const isValidIp = (ip) => {
    return /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
};

const isSafeString = (str) => {
    if (typeof str !== 'string' || !str) return false;
    // Allow only alphanumeric, spaces, hyphens, dots, underscores and parentheses. 
    // No semicolons, ampersands, pipes or backticks that could break shell commands.
    return /^[a-zA-Z0-9\s\-\._\(\)]+$/.test(str);
};

const isValidDriveLetter = (letter) => {
    return /^[a-zA-Z]$/.test(letter);
};

if (!app.isPackaged) {
    const userDataPath = path.join(app.getPath('temp'), 'netmajik-dev-cache');
    app.setPath('userData', userDataPath);
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();   // Reveals from tray if hidden
            mainWindow.focus();
        }
    });
    app.whenReady().then(() => {
        createWindow();

        powerMonitor.on('resume', () => {
            if (mainWindow) mainWindow.webContents.send('system-resume');
        });
        powerMonitor.on('unlock-screen', () => {
            if (mainWindow) mainWindow.webContents.send('system-resume');
        });
        setupKeywordHook();
    });
}

let mainWindow;
let notificationWindow;
let tray = null;

function getAppIcon() {
    const possiblePaths = [
        path.join(__dirname, '../public/dark_icon.ico'),
        path.join(__dirname, '../public/__icon.ico'),
        path.join(__dirname, '../public/icon.ico'),
        path.join(__dirname, '../public/Dark.PNG'),
        path.join(__dirname, '../dist/icon.ico'),
        path.join(__dirname, '../dist/Dark.PNG'),
        path.join(process.resourcesPath, 'icon.ico'),
        path.join(process.resourcesPath, 'Dark.PNG')
    ];
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) return nativeImage.createFromPath(p);
    }
    return nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADFJREFUOE9jZGBg+M+AhYGBIQ6I///5MwMRyjA0YIqNYQAzYmCjC0ZNIB0NGEI2gH4AAL14Ew1/qO0dAAAAAElFTkSuQmCC');
}

function getThemedIcon(theme) {
    if (!theme) return getAppIcon();
    // Normalize theme name
    const themeName = theme.charAt(0).toUpperCase() + theme.slice(1);
    const themeNameLower = theme.toLowerCase();

    const possiblePaths = [
        // Prioritize thematic .ico for Windows taskbar and tray
        path.join(__dirname, `../public/${themeName}_icon.ico`),
        path.join(__dirname, `../public/${themeNameLower}_icon.ico`),
        path.join(__dirname, `../dist/${themeName}_icon.ico`),
        path.join(__dirname, `../dist/${themeNameLower}_icon.ico`),
        path.join(process.resourcesPath, `${themeName}_icon.ico`),

        // Fallback to PNGs
        path.join(__dirname, `../public/${themeName}.PNG`),
        path.join(__dirname, `../dist/${themeName}.PNG`),
        path.join(process.resourcesPath, `${themeName}.PNG`),

        // Final fallbacks
        path.join(__dirname, '../public/dark_icon.ico'),
        path.join(__dirname, '../public/__icon.ico'),
        path.join(__dirname, '../public/icon.ico')
    ];

    for (const p of possiblePaths) {
        if (fs.existsSync(p)) return nativeImage.createFromPath(p);
    }
    return getAppIcon();
}

function getWindowIcon(theme) {
    if (theme) return getThemedIcon(theme);
    const possiblePaths = [
        path.join(__dirname, '../public/icon.ico'),
        path.join(__dirname, '../public/Dark.PNG'),
        path.join(__dirname, '../dist/icon.ico'),
        path.join(__dirname, '../dist/Dark.PNG'),
        path.join(process.resourcesPath, 'icon.ico'),
        path.join(process.resourcesPath, 'Dark.PNG')
    ];
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) return nativeImage.createFromPath(p);
    }
    return getAppIcon();
}

function getTrayIcon(theme) {
    if (theme) return getThemedIcon(theme);
    const possiblePaths = [
        path.join(__dirname, '../public/tray_simple.png'),
        path.join(__dirname, '../public/tray.ico'),
        path.join(__dirname, '../public/tray.png'),
        path.join(__dirname, '../dist/tray_simple.png'),
        path.join(__dirname, '../dist/tray.png'),
        path.join(process.resourcesPath, 'tray_simple.png'),
        path.join(process.resourcesPath, 'tray.png')
    ];
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) return nativeImage.createFromPath(p);
    }
    return getAppIcon();
}

function createWindow() {
    const windowIcon = getWindowIcon();

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        icon: windowIcon,
        backgroundColor: '#0f172a',
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
        },
        autoHideMenuBar: true,
        frame: false,
    });

    mainWindow.removeMenu();

    const isDev = !app.isPackaged;

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http:') || url.startsWith('https:')) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('close', (event) => {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide();
            if (!tray) {
                // We use a small delay to ensure settings might have been sent,
                // but usually they are not yet. We'll try to get current theme if possible.
                createTray();
            }
            return false;
        }
        return true;
    });
}

ipcMain.handle('window-manage', async (event, { action }) => {
    if (!mainWindow) return;
    if (action === 'minimize') mainWindow.minimize(); // Always to taskbar
    if (action === 'maximize') {
        if (mainWindow.isMaximized()) mainWindow.unmaximize();
        else mainWindow.maximize();
    }
    if (action === 'close') mainWindow.close(); // Always to tray (handled by 'close' event)
});

function createNotificationWindow() {
    if (notificationWindow) return;

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    logToFile(`Creating Notification Window - Work Area: ${width}x${height}, Position: ${width - 400},${height - 600}`);

    notificationWindow = new BrowserWindow({
        width: 400,
        height: 600,
        x: width - 400,
        y: height - 600,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        show: false,
        focusable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload-notification.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Make it truly transparent and click-through as needed (mostly on Windows)
    notificationWindow.setIgnoreMouseEvents(true, { forward: true });

    const isDev = !app.isPackaged;
    if (isDev) {
        notificationWindow.loadURL('http://localhost:5173/?window=notification');
    } else {
        notificationWindow.loadFile(path.join(__dirname, '../dist/index.html'), { query: { window: 'notification' } });
    }

    notificationWindow.on('closed', () => {
        notificationWindow = null;
    });
}

ipcMain.on('show-custom-toast', (event, payload) => {
    // Determine whether we got a legacy toast object or the new { toast, playSound } payload
    const isWrapper = payload && typeof payload.playSound !== 'undefined';
    const toast = isWrapper ? payload.toast : payload;
    const playSound = isWrapper ? payload.playSound : false;
    const isMinimized = mainWindow?.isMinimized();
    const isVisible = mainWindow?.isVisible();

    logToFile(`Notification Triggered: ${toast.title} - ${toast.body || ''} (Sound: ${playSound})`);
    logToFile(`Main Window Status: Minimized=${isMinimized}, Visible=${isVisible}`);

    if (playSound && process.platform === 'win32') {
        // We use a slightly more aggressive PS sound method to ensure it's heard
        const psCommand = `powershell -Command "(New-Object Media.SoundPlayer 'C:\\Windows\\Media\\notify.wav').PlaySync();"`;
        logToFile(`Executing sound command: ${psCommand}`);
        exec(psCommand, (error) => {
            if (error) {
                logToFile(`First sound attempt failed, trying fallback Asterisk...`);
                exec('powershell -Command "[System.Media.SystemSounds]::Asterisk.Play();"', (err2) => {
                    if (err2) logToFile(`Sound Command Fallback Error: ${err2.message}`);
                    else logToFile(`Sound Command Fallback Executed`);
                });
            } else {
                logToFile(`Sound Command Executed Successfully`);
            }
        });
    }

    if (!notificationWindow) {
        logToFile('Creating notification window...');
        createNotificationWindow();
    }

    // Check if window is visible or if it was hidden
    logToFile(`Notification Window Status: IsVisible=${notificationWindow.isVisible()}, IsAlwaysOnTop=${notificationWindow.isAlwaysOnTop()}`);


    // Wait a bit for window to be ready
    if (notificationWindow.webContents.isLoading()) {
        logToFile('Notification window is loading, waiting for ready...');
        notificationWindow.webContents.once('did-finish-load', () => {
            logToFile('Notification window ready, sending toast.');
            notificationWindow.showInactive();
            notificationWindow.webContents.send('show-custom-toast', toast);
        });
    } else {
        logToFile('Notification window ready, sending toast.');
        notificationWindow.showInactive();
        notificationWindow.webContents.send('show-custom-toast', toast);
    }
});

ipcMain.on('notification-window-empty', () => {
    if (notificationWindow) {
        notificationWindow.hide();
    }
});

let currentAppTheme = 'dark'; // Fallback variable to track theme

function createTray(theme) {
    if (tray) tray.destroy();

    const activeTheme = theme || currentAppTheme;
    const icon = getThemedIcon(activeTheme);

    // Create tray from native image (Electron handles sizing better on Windows with ICO/PNG)
    tray = new Tray(icon);
    tray.setToolTip('NetMajik');

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Abrir NetMajik', click: () => mainWindow.show() },
        { type: 'separator' },
        {
            label: 'Salir', click: () => {
                app.isQuiting = true;
                if (tray) tray.destroy();
                app.exit(0);
            }
        }
    ]);

    tray.setContextMenu(contextMenu);
    tray.on('click', () => mainWindow.show());
}

ipcMain.on('update-theme-icon', (event, theme) => {
    if (!mainWindow) return;

    currentAppTheme = theme;
    const baseIcon = getThemedIcon(theme);

    try {
        mainWindow.setIcon(baseIcon);

        // On Windows, the taskbar icon is cached by the OS and won't refresh with just setIcon().
        // The only reliable way to force a redraw is to temporarily set an overlay icon
        // (even a transparent 1x1 pixel one) and then clear it.
        if (process.platform === 'win32') {
            const transparentPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
            const overlayImg = nativeImage.createFromDataURL(transparentPixel);
            mainWindow.setOverlayIcon(overlayImg, 'updating');
            setTimeout(() => {
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.setOverlayIcon(null, '');
                }
            }, 100);
        }
    } catch (e) {
        console.error('Failed to set window icon:', e);
    }

    // Update tray icon too
    if (tray) {
        try {
            tray.setImage(baseIcon);
        } catch (e) {
            console.error('Failed to set tray icon:', e);
        }
    }
});

function registerAppShortcuts(settings) {
    globalShortcut.unregisterAll();
    if (!settings || !settings.globalShortcuts) return;

    try {
        if (settings.appHotkey) {
            globalShortcut.register(settings.appHotkey, () => {
                if (mainWindow.isVisible()) {
                    mainWindow.hide();
                } else {
                    mainWindow.show();
                    mainWindow.focus();
                }
            });
        }
    } catch (e) {
        console.error("Failed to register shortcuts:", e);
    }
}

ipcMain.on('update-shortcuts', (event, settings) => {
    registerAppShortcuts(settings);
});

// Removed typeKeywordDirectly and Keyword triggers

let registeredSnippetShortcuts = [];
ipcMain.on('update-snippet-shortcuts', (event, snippets) => {
    registeredSnippetShortcuts.forEach(accelerator => {
        globalShortcut.unregister(accelerator);
    });
    registeredSnippetShortcuts = [];

    if (!snippets || !Array.isArray(snippets)) return;
    snippets.forEach(snippet => {
        if (snippet.shortcut) {
            try {
                const success = globalShortcut.register(snippet.shortcut, () => {
                    // 1. Escribir al portapapeles
                    clipboard.writeText(snippet.value);

                    // 2. Si tiene autoPaste, simulamos Ctrl+V
                    if (snippet.autoPaste) {
                        setTimeout(() => {
                            if (process.platform === 'win32') {
                                const powershellPaste = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^v')"`;
                                exec(powershellPaste);
                            }
                        }, 100);
                    }
                });
                if (success) {
                    registeredSnippetShortcuts.push(snippet.shortcut);
                }
            } catch (e) {
                console.error("Failed to register snippet shortcut", snippet.shortcut, e);
            }
        }
    });
});

ipcMain.on('manual-snippet-action', (event, { autoPaste, value }) => {
    if (autoPaste) {
        // Al hacer click, la ventana tiene el foco. Para pegar/escribir, minimizamos y damos tiempo al foco anterior.
        mainWindow.minimize();
        setTimeout(() => {
            if (process.platform === 'win32') {
                const psPaste = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^v')"`;
                exec(psPaste, (err) => {
                    if (err) console.error("Paste Error:", err);
                });
            }
        }, 500);
    }
});

ipcMain.handle('check-shortcut', async (event, accelerator) => {
    try {
        const isRegistered = globalShortcut.isRegistered(accelerator);
        if (isRegistered) return false;

        // Try to register and unregister to see if it's available
        const success = globalShortcut.register(accelerator, () => { });
        if (success) {
            globalShortcut.unregister(accelerator);
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

// --- SYSTEM & ADMIN ---

ipcMain.handle('is-process-elevated', async () => {
    return new Promise((resolve) => {
        if (process.platform !== 'win32') {
            resolve(false);
            return;
        }
        exec('net session', (err) => resolve(!err));
    });
});

ipcMain.handle('select-executable-file', async () => {
    // Obtener ProgramData dinámicamente
    const programData = process.env.ALLUSERSPROFILE || 'C:\\ProgramData';
    const defaultProgramsPath = path.join(programData, 'Microsoft\\Windows\\Start Menu\\Programs');

    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Seleccionar Programa o Acceso Directo',
        defaultPath: fs.existsSync(defaultProgramsPath) ? defaultProgramsPath : 'C:\\',
        buttonLabel: 'Elegir',
        properties: ['openFile'],
        filters: [
            { name: 'Aplicaciones y Accesos Directos', extensions: ['exe', 'lnk', 'bat', 'cmd'] },
            { name: 'Todos los archivos', extensions: ['*'] }
        ]
    });

    if (result.canceled || result.filePaths.length === 0) {
        return { success: false };
    }

    let fullPath = result.filePaths[0];
    let fileName = path.basename(fullPath, path.extname(fullPath));

    // RESOLVER DESTINO SI ES UN ACCESO DIRECTO (.lnk)
    // Esto ayuda a obtener el icono de la app original en lugar del icono genérico de "acceso directo"
    let iconFetchPath = fullPath;
    if (fullPath.toLowerCase().endsWith('.lnk')) {
        try {
            const linkInfo = shell.readShortcutLink(fullPath);
            if (linkInfo && linkInfo.target && fs.existsSync(linkInfo.target)) {
                iconFetchPath = linkInfo.target;
            }
        } catch (e) {
            console.error("Error al resolver link:", e);
        }
    }

    // EXTRAER ICONO REAL DEL ARCHIVO (Usa 'large' para mejor calidad)
    let iconData = null;
    try {
        const icon = await app.getFileIcon(iconFetchPath, { size: 'large' });
        iconData = icon.toDataURL(); // Convertir a base64
    } catch (e) {
        console.error("Error al extraer icono:", e);
        // Fallback: intentar con el path original si falló el target
        try {
            const icon = await app.getFileIcon(fullPath, { size: 'large' });
            iconData = icon.toDataURL();
        } catch (e2) { }
    }

    return {
        success: true,
        path: fullPath,
        suggestedName: fileName,
        iconData: iconData
    };
});

ipcMain.handle('launch-external-app', async (event, appPath) => {
    if (!appPath) return { success: false, error: 'Empty path' };
    try {
        const error = await shell.openPath(appPath);
        if (error) {
            return { success: false, error };
        }
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

ipcMain.handle('relaunch-elevated', async () => {
    if (process.platform === 'win32') {
        const electronBinary = process.execPath;
        if (!app.isPackaged) {
            const scriptPath = process.argv[1] || '.';
            spawn('powershell.exe', ['Start-Process', `"${electronBinary}"`, `-ArgumentList "${scriptPath}"`, '-Verb', 'RunAs'], { detached: true, stdio: 'ignore' });
        } else {
            spawn('powershell.exe', ['Start-Process', `"${electronBinary}"`, '-Verb', 'RunAs'], { detached: true, stdio: 'ignore' });
        }
        app.quit();
    } else {
        app.relaunch();
        app.quit();
    }
});

ipcMain.handle('get-winget-updates', async () => {
    return new Promise((resolve) => {
        exec('chcp 65001 > nul && winget upgrade --source winget --accept-source-agreements', { encoding: 'utf8', maxBuffer: 1024 * 1024 * 5 }, (err, stdout) => {
            if (err && (!stdout || !stdout.includes('Name'))) {
                resolve({ success: false, error: err.message });
                return;
            }
            const updates = [];
            const lines = stdout.split('\n');
            let startParsing = false;
            let indices = {};

            for (let line of lines) {
                line = line.replace(/\r/g, '');
                if (line.includes('---')) {
                    startParsing = true;
                    continue;
                }

                if (!startParsing && line.includes('Name') && line.includes('Id') && line.includes('Version')) {
                    indices.name = line.indexOf('Name');
                    indices.id = line.indexOf('Id');
                    indices.version = line.indexOf('Version');
                    indices.available = line.indexOf('Available');
                    indices.source = line.indexOf('Source');
                    continue;
                }

                if (startParsing && line.trim()) {
                    // Try to parse winget columns
                    if (indices.name !== undefined) {
                        try {
                            const name = line.substring(indices.name, indices.id).trim();
                            const id = line.substring(indices.id, indices.version).trim();
                            const version = line.substring(indices.version, indices.available).trim();
                            const available = line.substring(indices.available, indices.source || line.length).trim();

                            if (name && id && available) {
                                updates.push({ name, id, version, available });
                            }
                        } catch (e) { }
                    } else {
                        // Fallback parsing if headers not exactly matched
                        const parts = line.split(/\s{2,}/);
                        if (parts.length >= 4) {
                            updates.push({ name: parts[0], id: parts[1], version: parts[2], available: parts[3] });
                        }
                    }
                }
            }
            resolve({ success: true, updates });
        });
    });
});

let activeUpdates = new Map();

ipcMain.handle('update-winget-app', async (event, appId) => {
    return new Promise((resolve) => {
        if (activeUpdates.has(appId)) return resolve({ success: false, error: 'Already updating' });
        activeUpdates.set(appId, true);

        const child = spawn('winget', ['upgrade', '--id', appId, '--exact', '--accept-source-agreements', '--accept-package-agreements'], {
            windowsHide: true
        });

        child.stdout.on('data', Buffer => {
            const data = Buffer.toString('utf8');
            const match = data.match(/(\d+)%/);
            let status = 'processing';
            if (data.includes('Downloading')) status = 'downloading';
            else if (data.includes('Extracting')) status = 'extracting';
            else if (data.includes('Installing')) status = 'installing';
            else if (data.includes('Verifying')) status = 'verifying';
            else if (data.includes('installer')) status = 'waiting';

            if (match || status !== 'processing') {
                if (mainWindow) {
                    mainWindow.webContents.send('winget-progress', {
                        id: appId,
                        progress: match ? parseInt(match[1]) : undefined,
                        status: status
                    });
                }
            }
        });

        child.on('close', (code) => {
            activeUpdates.delete(appId);
            if (mainWindow) mainWindow.webContents.send('winget-progress', { id: appId, status: 'completed', progress: 100 });
            resolve({ success: code === 0 || code === -1978335189, code });
        });

        child.on('error', (err) => {
            activeUpdates.delete(appId);
            resolve({ success: false, error: err.message });
        });
    });
});

ipcMain.handle('get-system-events', async () => {
    return new Promise((resolve) => {
        if (process.platform !== 'win32') {
            resolve({ success: false, error: 'Only supported on Windows' });
            return;
        }

        // Use -EncodedCommand to avoid all shell escaping issues with special characters
        const psScript = `
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8;
try {
    $events = Get-WinEvent -FilterHashtable @{LogName='System'; Level=1,2,3} -MaxEvents 300 -ErrorAction Stop
    $result = $events | ForEach-Object {
        [PSCustomObject]@{
            TimeCreated = $_.TimeCreated.ToString('yyyy-MM-dd HH:mm:ss')
            Id = $_.Id
            Message = $_.Message
            ProviderName = $_.ProviderName
            Level = $_.Level
            LevelName = $_.LevelDisplayName
        }
    }
    $result | ConvertTo-Json -Compress
} catch {
    if ($_.Exception.Message -match 'No events were found') {
        Write-Output '[]'
    } else {
        Write-Error $_.Exception.Message
    }
}`;
        // Encode the script as Base64 UTF-16LE (required by PowerShell -EncodedCommand)
        const encoded = Buffer.from(psScript, 'utf16le').toString('base64');

        exec(`powershell.exe -NoProfile -EncodedCommand ${encoded}`, { maxBuffer: 1024 * 1024 * 5 }, (err, stdout, stderr) => {
            if (err) {
                logToFile(`[SystemEvents] exec error: ${err.message}`);
                // Even on error, PowerShell may have written valid JSON to stdout
                if (!stdout || !stdout.trim()) {
                    resolve({ success: false, error: err.message });
                    return;
                }
            }

            const trimmed = (stdout || '').trim();
            if (!trimmed) {
                logToFile(`[SystemEvents] Empty stdout. stderr: ${stderr || 'none'}`);
                resolve({ success: true, events: [] });
                return;
            }

            try {
                let events = JSON.parse(trimmed);
                if (!Array.isArray(events)) {
                    events = events ? [events] : [];
                }
                const formattedEvents = events.map(e => ({
                    date: e.TimeCreated || 'Unknown',
                    id: e.Id,
                    source: e.ProviderName,
                    message: e.Message || '',
                    level: e.Level,
                    levelName: e.LevelName || (e.Level === 1 ? 'Critical' : e.Level === 2 ? 'Error' : 'Warning')
                }));
                logToFile(`[SystemEvents] Successfully fetched ${formattedEvents.length} events`);
                resolve({ success: true, events: formattedEvents });
            } catch (e) {
                logToFile(`[SystemEvents] JSON parse error: ${e.message}. Raw output (first 500 chars): ${trimmed.substring(0, 500)}`);
                resolve({ success: false, error: `Parse error: ${e.message}` });
            }
        });
    });
});

ipcMain.handle('open-event-viewer', async () => {
    return new Promise((resolve) => {
        exec('eventvwr.msc', (error) => {
            resolve({ success: !error });
        });
    });
});

// --- NETWORK OPS ---

ipcMain.handle('get-windows-interfaces', async () => {
    return new Promise((resolve) => {
        if (process.platform !== 'win32') {
            resolve([]);
            return;
        }
        const osInterfaces = os.networkInterfaces();
        exec('netsh interface show interface', (err, stdout) => {
            if (err) {
                resolve([]);
                return;
            }
            const lines = stdout.trim().split('\n');
            const interfaces = [];
            for (const line of lines) {
                const lower = line.toLowerCase();
                if (!line.trim() || line.includes('---') ||
                    lower.includes('admin state') ||
                    lower.includes('estado admin') ||
                    lower.includes('nombre de interfaz') ||
                    lower.includes('interface name')
                ) continue;

                const parts = line.trim().split(/\s{2,}/);
                if (parts.length >= 3) {
                    const adminState = parts[0];
                    const connectionState = parts[1];
                    const name = parts[parts.length - 1];

                    const osInfoList = osInterfaces[name];
                    const ipv4 = osInfoList?.find((info) => info.family === 'IPv4' && !info.internal);

                    interfaces.push({
                        name: name,
                        adminState: adminState,
                        connectionState: connectionState,
                        ip: ipv4 ? ipv4.address : '0.0.0.0',
                        mac: ipv4 ? ipv4.mac.toUpperCase() : '??:??:??:??:??:??',
                        netmask: ipv4 ? ipv4.netmask : '0.0.0.0'
                    });
                }
            }
            resolve(interfaces);
        });
    });
});

ipcMain.handle('change-ip-config', async (event, { ifaceName, profile }) => {
    return new Promise((resolve, reject) => {
        if (process.platform !== 'win32') return reject(new Error('Only Windows supported.'));
        if (!isSafeString(ifaceName)) return reject(new Error('Invalid Interface Name'));

        const commands = [];
        if (profile.type === 'DHCP') {
            commands.push(`netsh interface ip set address "${ifaceName}" dhcp`);
            commands.push(`netsh interface ip set dns "${ifaceName}" dhcp`);
        } else {
            const { ipAddress, subnetMask, gateway, dnsPrimary, dnsSecondary } = profile.config;
            if (!isValidIp(ipAddress)) return reject(new Error('Invalid IP Address'));
            if (!isValidIp(subnetMask)) return reject(new Error('Invalid Subnet Mask'));
            if (gateway && !isValidIp(gateway)) return reject(new Error('Invalid Gateway'));
            if (dnsPrimary && !isValidIp(dnsPrimary)) return reject(new Error('Invalid Primary DNS'));
            if (dnsSecondary && !isValidIp(dnsSecondary)) return reject(new Error('Invalid Secondary DNS'));

            const gatewayCmd = gateway ? gateway : 'none';
            commands.push(`netsh interface ip set address "${ifaceName}" static ${ipAddress} ${subnetMask} ${gatewayCmd}`);
            if (dnsPrimary) commands.push(`netsh interface ip set dns "${ifaceName}" static ${dnsPrimary}`);
            if (dnsSecondary) commands.push(`netsh interface ip add dns "${ifaceName}" ${dnsSecondary} index=2`);
        }

        let wasAlreadyActive = false;
        const executeNext = (idx) => {
            if (idx >= commands.length) {
                resolve({ success: true, alreadyActive: wasAlreadyActive });
                return;
            }
            exec(commands[idx], (error, stdout, stderr) => {
                const combinedOutput = (stdout + stderr + (error ? error.message : "")).toLowerCase();

                if (error) {
                    if (combinedOutput.includes('run as administrator') || combinedOutput.includes('access is denied')) {
                        return reject(new Error('Admin privileges required.'));
                    }

                    // Check if DHCP is already active (common "error" that we want to treat as success)
                    const isAlreadyDhcp = combinedOutput.includes('dhcp') && (
                        combinedOutput.includes('already enabled') ||
                        combinedOutput.includes('ya está habilitado') ||
                        combinedOutput.includes('already active') ||
                        combinedOutput.includes('ya se encuentra habilitado')
                    );

                    if (isAlreadyDhcp) {
                        wasAlreadyActive = true;
                        executeNext(idx + 1);
                    } else {
                        reject(new Error(`Failed: ${stderr || error.message}`));
                    }
                    return;
                }
                executeNext(idx + 1);
            });
        };
        executeNext(0);
    });
});

ipcMain.handle('toggle-interface', async (event, { ifaceName, action, enable }) => {
    return new Promise((resolve, reject) => {
        if (process.platform !== 'win32') return reject(new Error('Windows only'));
        if (!isSafeString(ifaceName)) return reject(new Error('Invalid Interface Name'));

        // Handle both action string ('enable'/'disable') and enable boolean
        const finalEnable = enable !== undefined ? enable : (action === 'enable');
        const cmd = `netsh interface set interface "${ifaceName}" admin=${finalEnable ? 'ENABLED' : 'DISABLED'}`;

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                const errStr = (stderr || error.message).toLowerCase();
                if (errStr.includes('admin') || errStr.includes('denied')) {
                    reject(new Error('Admin rights required'));
                } else {
                    reject(new Error(`Failed: ${errStr}`));
                }
            } else {
                resolve({ success: true });
            }
        });
    });
});

ipcMain.handle('toggle-firewall', async (event, { action }) => {
    return new Promise((resolve, reject) => {
        if (process.platform !== 'win32') return reject(new Error('Windows only'));
        const state = action === 'enable' ? 'on' : 'off';
        exec(`netsh advfirewall set allprofiles state ${state}`, (error, stdout, stderr) => {
            if (error) {
                const msg = (stderr || error.message).toLowerCase();
                if (msg.includes('admin') || msg.includes('access is denied')) {
                    reject(new Error('ADMIN_REQUIRED'));
                } else {
                    reject(new Error(msg));
                }
            } else {
                resolve({ success: true });
            }
        });
    });
});

// --- SYSTEM HEALTH ---

ipcMain.handle('get-system-stats', async () => {
    const stats = {
        cpu: { model: 'Unknown', cores: 0 },
        mem: { total: os.totalmem(), free: os.freemem(), type: 'DDR', speed: 0, slotsTotal: 0, slotsUsed: 0 },
        storage: [],
        os: {
            platform: os.platform(),
            distro: 'Windows',
            release: os.release(),
            arch: os.arch(),
            hostname: os.hostname(),
            computerName: os.hostname(),
            firewallStatus: 'Active',
            firewallProvider: 'Unknown'
        }
    };

    if (process.platform === 'win32') {
        try {
            const getHostnames = () => new Promise(resolve => {
                exec('wmic computersystem get DNSHostName, Name', (err, stdout) => {
                    if (!err && stdout) {
                        const lines = stdout.trim().split('\n').map(l => l.trim()).filter(l => l && !l.includes('DNSHostName'));
                        if (lines.length > 0) {
                            const parts = lines[0].split(/\s+/);
                            if (parts.length >= 2) {
                                stats.os.hostname = parts[0];
                                stats.os.computerName = parts[1];
                            }
                        }
                    }
                    resolve();
                });
            });

            const release = os.release();
            const build = parseInt(release.split('.')[2]);
            if (build >= 22000) stats.os.distro = 'Windows 11';
            else if (build >= 10240) stats.os.distro = 'Windows 10';
            else if (release.startsWith('6.3')) stats.os.distro = 'Windows 8.1';
            else if (release.startsWith('6.1')) stats.os.distro = 'Windows 7';
            else stats.os.distro = `Windows (Build ${build})`;

            const getRamDetails = () => new Promise(resolve => {
                exec('wmic memorychip get Speed, Capacity, Manufacturer, MemoryType, SMBIOSMemoryType', (err, stdout) => {
                    if (!err && stdout) {
                        const lines = stdout.trim().split('\n').slice(1).filter(l => l.trim());
                        stats.mem.slotsUsed = lines.length;
                        if (lines.length > 0) {
                            const speedMatch = lines[0].match(/(\d{3,})/);
                            if (speedMatch) stats.mem.speed = parseInt(speedMatch[0]);
                            if (stats.mem.speed > 4800) stats.mem.type = 'DDR5';
                            else if (stats.mem.speed > 2666) stats.mem.type = 'DDR4';
                            else if (stats.mem.speed > 1600) stats.mem.type = 'DDR3';
                        }
                    }
                    resolve();
                });
            });

            const getRamSlots = () => new Promise(resolve => {
                exec('wmic memphysical get MemoryDevices', (err, stdout) => {
                    if (!err && stdout) {
                        const match = stdout.match(/\d+/);
                        if (match) stats.mem.slotsTotal = parseInt(match[0]);
                    }
                    resolve();
                });
            });

            const getCpuDetails = () => new Promise(resolve => {
                stats.cpu.model = os.cpus()[0].model;
                stats.cpu.cores = os.cpus().length;
                resolve();
            });

            const getSecurityInfo = () => new Promise(resolve => {
                exec('wmic /namespace:\\\\root\\securitycenter2 path FirewallProduct get displayName', (err, stdout) => {
                    if (!err && stdout) {
                        const lines = stdout.trim().split('\n').slice(1).filter(l => l.trim());
                        if (lines.length > 0) {
                            stats.os.firewallProvider = lines[0].trim();
                            stats.os.firewallStatus = 'Active';
                        } else {
                            stats.os.firewallProvider = 'Windows Default';
                        }
                    } else {
                        stats.os.firewallProvider = 'System / Unknown';
                    }
                    resolve();
                });
            });

            const getStorage = () => new Promise(resolve => {
                exec('powershell "Get-PhysicalDisk | Select-Object FriendlyName, MediaType, Size | ConvertTo-Json"', (err, stdout) => {
                    let physicals = [];
                    try { if (!err && stdout) physicals = JSON.parse(stdout); } catch (e) { }
                    if (!Array.isArray(physicals)) physicals = [physicals];
                    exec('wmic logicaldisk where "DriveType=3" get Caption,FreeSpace,Size,VolumeName', (err2, stdout2) => {
                        if (!err2 && stdout2) {
                            const lines = stdout2.trim().split('\n').slice(1).filter(l => l.trim());
                            stats.storage = lines.map(line => {
                                const parts = line.trim().split(/\s{2,}/);
                                const drive = parts[0];
                                const free = parseInt(parts[1] || '0');
                                const total = parseInt(parts[2] || '0');
                                const label = parts.length > 3 ? parts[3] : '';
                                const phys = physicals.length > 0 ? physicals[0] : { MediaType: 'Unknown', FriendlyName: 'Generic Disk' };

                                // Heuristic for Windows System Files if it's C: drive
                                let windowsSize = 0;
                                if (drive.toLowerCase() === 'c:') {
                                    windowsSize = 25 * 1024 * 1024 * 1024; // 25GB estimate
                                    // Make sure it doesn't exceed used space
                                    const used = total - free;
                                    if (windowsSize > used) windowsSize = used * 0.4;
                                }

                                return {
                                    drive,
                                    free,
                                    total,
                                    label,
                                    status: 'OK',
                                    type: phys.MediaType || 'HDD/SSD',
                                    model: phys.FriendlyName,
                                    windowsSize
                                };
                            });
                        }
                        resolve();
                    });
                });
            });

            await Promise.all([
                getHostnames(),
                getRamDetails(),
                getRamSlots(),
                getCpuDetails(),
                getSecurityInfo(),
                getStorage()
            ]);

        } catch (e) {
            console.error("Stats Error:", e);
        }
    }
    return stats;
});

ipcMain.handle('reboot-to-bios', async () => {
    return new Promise((resolve, reject) => {
        if (process.platform !== 'win32') return reject(new Error('Windows only'));
        exec('shutdown /r /fw /t 0', (error, stdout, stderr) => {
            if (error) {
                const msg = (stderr || error.message || '').toLowerCase();
                if (msg.includes('firmware') && (msg.includes('not supported') || msg.includes('no admite') || msg.includes('pas en charge'))) {
                    reject(new Error('UEFI_NOT_SUPPORTED'));
                } else if (msg.includes('access is denied') || msg.includes('acceso denegado') || msg.includes('privilege not held')) {
                    reject(new Error('ADMIN_REQUIRED'));
                } else {
                    reject(new Error(msg));
                }
            } else {
                resolve({ success: true });
            }
        });
    });
});

ipcMain.handle('get-installed-programs', async () => {
    return new Promise((resolve) => {
        if (process.platform !== 'win32') {
            resolve([]);
            return;
        }

        // Using PowerShell for more reliable and detailed program list
        const command = `powershell -Command "Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Where-Object { $_.DisplayName -ne $null } | Select-Object DisplayName, DisplayVersion, Publisher, InstallDate | ConvertTo-Json"`;

        exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            if (error) {
                console.error('Error fetching programs:', error);
                resolve([]);
                return;
            }

            try {
                const programs = JSON.parse(stdout);
                const result = (Array.isArray(programs) ? programs : [programs])
                    .filter(p => p && p.DisplayName)
                    .map(p => ({
                        name: p.DisplayName,
                        version: p.DisplayVersion || 'N/A',
                        vendor: p.Publisher || 'Unknown',
                        installDate: p.InstallDate || 'Unknown'
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name));
                resolve(result);
            } catch (e) {
                console.error('Error parsing programs JSON:', e);
                resolve([]);
            }
        });
    });
});

ipcMain.handle('export-programs', async (event, { programs, format }) => {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Installed Programs',
        defaultPath: path.join(app.getPath('downloads'), `installed_programs.${format}`),
        filters: [
            { name: format.toUpperCase(), extensions: [format] }
        ]
    });

    if (!filePath) return { success: false };

    try {
        let content = '';
        if (format === 'csv') {
            content = 'Name,Version,Vendor,Install Date\n';
            content += programs.map(p => `"${p.name}","${p.version}","${p.vendor}","${p.installDate}"`).join('\n');
        } else {
            content = JSON.stringify(programs, null, 2);
        }

        fs.writeFileSync(filePath, content, 'utf8');
        return { success: true, path: filePath };
    } catch (e) {
        return { success: false, error: e.message };
    }
});


// --- UTILS ---

ipcMain.handle('fetch-oui-database', async () => {
    try {
        const response = await fetch('https://standards-oui.ieee.org/oui.txt');
        if (!response.ok) throw new Error('Failed to fetch');
        const text = await response.text();
        const lines = text.split('\n');
        const newDb = {};
        for (const line of lines) {
            if (line.includes('(hex)')) {
                const parts = line.split('(hex)');
                if (parts.length >= 2) {
                    const macPrefix = parts[0].trim().replace(/-/g, '').replace(/:/g, '');
                    const vendor = parts[1].trim();
                    if (macPrefix.length === 6) newDb[macPrefix] = vendor;
                }
            }
        }
        return { success: true, data: newDb };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

ipcMain.handle('ping-target', async (event, { ip }) => {
    return new Promise((resolve) => {
        if (!isValidIp(ip)) return resolve({ success: false, stdout: 'Invalid IP' });
        const cmd = process.platform === 'win32' ? `ping -n 1 -w 2000 ${ip}` : `ping -c 1 -W 2 ${ip}`;
        exec(cmd, { encoding: 'utf-8' }, (error, stdout, stderr) => {
            const output = (stdout || '').toLowerCase();
            let success = false;
            if (process.platform === 'win32') {
                if (output.includes('ttl=') && !output.includes('unreachable') && !output.includes('timed out')) success = true;
            } else {
                if (output.includes('bytes from')) success = true;
            }
            resolve({ success, stdout: stdout || '' });
        });
    });
});

ipcMain.handle('run-traceroute', async (event, { target }) => {
    return new Promise((resolve) => {
        // Simple domain/IP validation
        const safeTarget = target.replace(/[^a-zA-Z0-9.-]/g, '');
        if (!safeTarget) return resolve({ success: false });

        const child = spawn('tracert', ['-d', '-w', '1000', '-h', '30', safeTarget], { windowsHide: true });

        child.stdout.on('data', Buffer => {
            if (mainWindow) mainWindow.webContents.send('traceroute-data', Buffer.toString('utf8'));
        });

        child.on('close', (code) => {
            resolve({ success: code === 0 });
        });

        child.on('error', (err) => {
            resolve({ success: false, error: err.message });
        });
    });
});

let scanStoppedFlag = false;
ipcMain.on('stop-scan-range', () => {
    scanStoppedFlag = true;
});

ipcMain.handle('scan-range', async (event, { startIp, endIp }) => {
    if (!isValidIp(startIp) || !isValidIp(endIp)) return [];
    const ipToInt = (ip) => ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
    const intToIp = (int) => [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join('.');
    const start = ipToInt(startIp);
    const end = ipToInt(endIp);
    if (end < start || (end - start) > 2048) return [];

    const total = end - start + 1;
    let scanned = 0;
    const foundIpsSet = new Set();
    const batchSize = 25;
    const pingCmd = process.platform === 'win32' ? 'ping -n 1 -w 200' : 'ping -c 1 -W 1';

    scanStoppedFlag = false;

    for (let i = start; i <= end; i += batchSize) {
        if (scanStoppedFlag) break;
        const promises = [];
        for (let j = i; j < i + batchSize && j <= end; j++) {
            const ip = intToIp(j);
            promises.push(new Promise(res => {
                exec(`${pingCmd} ${ip}`, (err, stdout) => {
                    scanned++;
                    if (!err && (stdout.toLowerCase().includes('ttl=') || stdout.toLowerCase().includes('bytes from'))) foundIpsSet.add(ip);
                    if (mainWindow && scanned % 5 === 0) {
                        mainWindow.webContents.send('scan-range-progress', { current: scanned, total });
                    }
                    res();
                });
            }));
        }
        await Promise.all(promises);
    }
    if (mainWindow) mainWindow.webContents.send('scan-range-progress', { current: total, total });

    return new Promise((resolve) => {
        exec('arp -a', (err, stdout) => {
            const arpTable = stdout || "";
            const result = Array.from(foundIpsSet).map(ip => {
                const escapedIp = ip.replace(/\./g, '\\.');
                const regex = new RegExp(`${escapedIp}\\s+([0-9a-fA-F:-]{12,17})`, 'i');
                const match = arpTable.match(regex);
                return {
                    ip: ip,
                    mac: match ? match[1].toUpperCase().replace(/-/g, ':') : 'Unknown',
                    status: 'online'
                };
            });
            resolve(result);
        });
    });
});

ipcMain.handle('scan-mdns', async () => {
    return new Promise((resolve) => {
        if (process.platform !== 'win32') return resolve([]);

        // Try to find common services via mDNS using PowerShell Resolve-DnsName
        // _http._tcp.local is common for router/switch web UIs
        const services = ['_http._tcp.local', '_workstation._tcp.local', '_device-info._tcp.local'];
        const results = [];
        let completed = 0;

        services.forEach(service => {
            exec(`powershell "Resolve-DnsName -Name ${service} -Type PTR -ErrorAction SilentlyContinue | Select-Object NameHost, IPAddress | ConvertTo-Json"`, (err, stdout) => {
                try {
                    if (stdout) {
                        const data = JSON.parse(stdout);
                        const items = Array.isArray(data) ? data : [data];
                        items.forEach(item => {
                            if (item.NameHost) {
                                results.push({
                                    hostname: item.NameHost.replace('.local', ''),
                                    ip: item.IPAddress || null,
                                    service: service
                                });
                            }
                        });
                    }
                } catch (e) { }

                completed++;
                if (completed === services.length) {
                    // Filter duplicates and resolve
                    const unique = results.reduce((acc, current) => {
                        const x = acc.find(item => item.hostname === current.hostname);
                        if (!x) return acc.concat([current]);
                        return acc;
                    }, []);
                    resolve(unique);
                }
            });
        });
    });
});

ipcMain.handle('open-external-cmd', async (event, { targetIp }) => {
    if (!isValidIp(targetIp)) return { success: false };
    if (process.platform === 'win32') exec(`start cmd.exe /k ping ${targetIp} -t`);
    return { success: true };
});

ipcMain.handle('execute-network-command', async (event, { command, params }) => {
    return new Promise((resolve, reject) => {
        let cmd = '';
        if (command === 'flush-dns') cmd = 'ipconfig /flushdns';
        else if (command === 'renew-ip') cmd = 'ipconfig /renew';
        else if (command === 'reset-winsock') cmd = 'netsh winsock reset';
        else if (command === 'arp-a') cmd = 'arp -a';
        else if (command === 'route-print') cmd = 'route print';
        else if (command === 'ifconfig') cmd = 'ipconfig /all';
        else if (command === 'open-firewall-classic') cmd = 'control firewall.cpl';
        else if (command === 'netplwiz') {
            exec('netplwiz');
            return resolve({ success: true, output: 'Opening User Accounts (netplwiz)...' });
        }
        else if (command === 'shell-startup') {
            exec('start shell:startup');
            return resolve({ success: true, output: 'Opening Startup folder...' });
        }
        else return reject(new Error('Command not allowed'));

        // Fix encoding on Spanish Windows (UTF-8)
        const fullCmd = process.platform === 'win32'
            ? `powershell -NoProfile -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; ${cmd}"`
            : cmd;

        exec(fullCmd, { encoding: 'utf8' }, (err, stdout) => {
            if (err) reject(err);
            else resolve({ success: true, output: stdout });
        });
    });
});

ipcMain.handle('set-computer-name', async (event, { newName }) => {
    return new Promise((resolve, reject) => {
        if (process.platform !== 'win32') return reject(new Error('Windows only'));
        if (!isSafeString(newName)) return reject(new Error('Invalid Computer Name'));

        // Use spawn to avoid shell interpolation issues
        const child = spawn('powershell.exe', ['-NoProfile', '-Command', `Rename-Computer -NewName "${newName}" -Force`], {
            windowsHide: true
        });

        let stderr = '';
        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve({ success: true, message: 'Computer renamed successfully. Restart required.' });
            } else {
                const errStr = stderr.toLowerCase();
                if (errStr.includes('admin') || errStr.includes('denied')) {
                    reject(new Error('Admin privileges required'));
                } else {
                    reject(new Error(`Failed: ${errStr || 'Unknown error code ' + code}`));
                }
            }
        });

        child.on('error', (err) => {
            reject(new Error(`Spawn error: ${err.message}`));
        });
    });
});

ipcMain.handle('check-port', async (event, { host, port }) => {
    return new Promise((resolve) => {
        if (!isValidIp(host)) return resolve(false);
        if (typeof port !== 'number' || port < 1 || port > 65535) return resolve(false);
        const socket = new net.Socket();
        let status = 'closed';
        socket.setTimeout(2000);
        socket.on('connect', () => { status = 'open'; socket.destroy(); });
        socket.on('timeout', () => { status = 'closed'; socket.destroy(); });
        socket.on('error', (e) => { status = 'closed'; socket.destroy(); });
        socket.on('close', () => { resolve(status === 'open'); });
        socket.connect(port, host);
    });
});

ipcMain.handle('find-and-set-ip', async (event, { ifaceName, targetIp }) => {
    if (process.platform !== 'win32') return { success: false, message: 'Windows only' };
    if (!isSafeString(ifaceName) || !isValidIp(targetIp)) return { success: false, message: 'Invalid Input' };
    const parts = targetIp.split('.');
    if (parts.length !== 4) return { success: false, message: 'Invalid IP format' };
    const prefix = `${parts[0]}.${parts[1]}.${parts[2]}`;
    const gateway = `${prefix}.1`;
    let candidateIp = '';
    const checkIp = (ip) => {
        return new Promise(resolve => {
            exec(`ping -n 1 -w 200 ${ip}`, (err, stdout) => {
                const isTaken = stdout.toLowerCase().includes('ttl=');
                resolve(isTaken);
            });
        });
    };
    for (let i = 0; i < 5; i++) {
        const octet = Math.floor(Math.random() * (250 - 200 + 1)) + 200;
        const testIp = `${prefix}.${octet}`;
        if (testIp === targetIp || testIp === gateway) continue;
        const taken = await checkIp(testIp);
        if (!taken) {
            candidateIp = testIp;
            break;
        }
    }
    if (!candidateIp) return { success: false, message: 'Could not find a free IP in subnet.' };
    const cmd = `netsh interface ip set address "${ifaceName}" static ${candidateIp} 255.255.255.0 ${gateway}`;
    return new Promise((resolve) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                const errStr = (stderr || error.message).toLowerCase();
                if (errStr.includes('admin') || errStr.includes('denied')) {
                    resolve({ success: false, message: 'Admin privileges required' });
                } else {
                    resolve({ success: false, message: `Failed: ${errStr}` });
                }
            } else {
                resolve({ success: true, assignedIp: candidateIp });
            }
        });
    });
});

ipcMain.handle('show-notification', (event, { title, body }) => {
    if (Notification.isSupported()) {
        const themedIcon = getThemedIcon(currentAppTheme);
        const notification = new Notification({
            title,
            body,
            icon: themedIcon
        });
        notification.show();
    }
});

ipcMain.handle('check-disk-errors', async (event, driveLetter) => {
    return new Promise((resolve) => {
        if (process.platform !== 'win32') {
            return resolve({ success: false, output: 'Supported only on Windows.' });
        }
        if (!driveLetter) driveLetter = 'C';
        if (!isValidDriveLetter(driveLetter)) {
            return resolve({ success: false, output: 'Invalid drive letter. Must be a single letter (A-Z).' });
        }

        // Read-only scan that doesn't require a reboot
        const child = spawn('powershell.exe', ['-NoProfile', '-Command', `Repair-Volume -DriveLetter ${driveLetter} -Scan`], {
            windowsHide: true
        });

        let output = '';
        let errorOutput = '';

        child.stdout.on('data', (data) => { output += data.toString(); });
        child.stderr.on('data', (data) => { errorOutput += data.toString(); });

        child.on('close', (code) => {
            if (code === 0) {
                resolve({ success: true, output: output || 'No errors found.' });
            } else {
                resolve({ success: false, output: errorOutput || `Error code: ${code}` });
            }
        });

        child.on('error', (err) => {
            resolve({ success: false, output: `Process error: ${err.message}` });
        });
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
