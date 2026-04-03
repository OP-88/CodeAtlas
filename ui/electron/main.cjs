const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let engineProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../public/codeatlas_icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Start the Python Engine
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // In dev, we assume the python engine is already running via start.sh
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    
    // In production (Snap), we spawn the Python engine
    const pythonExecutable = process.env.VIRTUAL_ENV ? 'python' : 'python3';
    engineProcess = spawn(pythonExecutable, [
      path.join(__dirname, '../../engine/main.py')
    ]);
  }
}

function setupPtyTerminal(mainWindow) {
  let ptyProcess = null;

  try {
    const pty = require('node-pty');
    const shell = process.env.SHELL || (process.platform === 'win32' ? 'powershell.exe' : 'bash');

    ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: 120,
      rows: 30,
      cwd: process.env.HOME || process.cwd(),
      env: process.env,
    });

    // Stream pty output → renderer
    ptyProcess.onData((data) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('terminal:data', data);
      }
    });

    // Receive keystrokes from renderer → pty
    ipcMain.on('terminal:write', (event, data) => ptyProcess.write(data));

    // Resize pty when terminal window resizes
    ipcMain.on('terminal:resize', (event, { cols, rows }) => ptyProcess.resize(cols, rows));

    console.log('[CodeAtlas] node-pty spawned:', shell);
  } catch (err) {
    console.warn('[CodeAtlas] node-pty unavailable, terminal will use fallback spawn mode:', err.message);
  }

  return ptyProcess;
}

app.whenReady().then(() => {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac
      ? [{
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        }]
      : []),
    {
      label: 'Edit',
      submenu: [
        { role: 'undo',      accelerator: 'CmdOrCtrl+Z' },
        { role: 'redo',      accelerator: 'CmdOrCtrl+Shift+Z' },
        { type: 'separator' },
        { role: 'cut',       accelerator: 'CmdOrCtrl+X' },
        { role: 'copy',      accelerator: 'CmdOrCtrl+C' },
        { role: 'paste',     accelerator: 'CmdOrCtrl+V' },
        { type: 'separator' },
        { role: 'selectAll', accelerator: 'CmdOrCtrl+A' }
      ]
    },
    {
      label: 'View',
      submenu: [
        // DevTools only available in development
        ...(process.env.NODE_ENV === 'development'
          ? [{ role: 'toggleDevTools', accelerator: 'CmdOrCtrl+Shift+I' }]
          : []),
        { type: 'separator' },
        { role: 'togglefullscreen', accelerator: 'F11' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  createWindow();
  setupPtyTerminal(mainWindow);

  // Grant unfettered async clipboard API access to the Monaco Editor
  mainWindow.webContents.session.setPermissionCheckHandler(() => true);
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => callback(true));

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => {
  if (engineProcess) {
    engineProcess.kill();
  }
});
