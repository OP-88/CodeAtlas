const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const PROJECTS_DIR = path.join(app.getPath('home'), '.codeatlas', 'projects');

// Ensure projects directory exists
try { fs.mkdirSync(PROJECTS_DIR, { recursive: true }); } catch {}   

let currentProjectPath = null;  // track what file is loaded
let currentWorkspaceState = null; // latest state pushed from renderer

let mainWindow;
let engineProcess;

// Set name explicitly for Linux dock
app.setName('CodeAtlas');
try { app.setDesktopName('CodeAtlas'); } catch {}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../public/codeatlas_icon.png'),
    autoHideMenuBar: true, // Let us control visibility
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Hide on startup (Welcome Screen mode)
  mainWindow.setMenuBarVisibility(false);

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

// ─── Project File I/O Helpers ─────────────────────────────────────────────

function saveProjectToPath(filePath, workspace) {
  fs.writeFileSync(filePath, JSON.stringify(workspace, null, 2), 'utf-8');
  currentProjectPath = filePath;
  currentWorkspaceState = workspace;
  if (mainWindow) mainWindow.setTitle(`CodeAtlas — ${workspace.project?.name || 'Project'}`);
}

ipcMain.on('menu:set-visibility', (event, visible) => {
  if (mainWindow) mainWindow.setMenuBarVisibility(visible);
});

// Renderer pushes current state before any save operation
ipcMain.handle('project:push-state', (event, state) => {
  currentWorkspaceState = state;
});

// Ctrl+S — save in-place or trigger Save As
ipcMain.handle('project:save', async () => {
  if (!currentWorkspaceState) return { ok: false };
  if (currentProjectPath) {
    saveProjectToPath(currentProjectPath, currentWorkspaceState);
    mainWindow.webContents.send('menu:save-result', { filePath: currentProjectPath });
    return { ok: true };
  }
  // No file yet — trigger Save As
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Project',
    defaultPath: path.join(PROJECTS_DIR, `${currentWorkspaceState.project?.name || 'project'}.catlas`),
    filters: [{ name: 'CodeAtlas Project', extensions: ['catlas'] }],
  });
  if (!filePath) return { ok: false };
  saveProjectToPath(filePath, currentWorkspaceState);
  mainWindow.webContents.send('menu:save-result', { filePath });
  return { ok: true, filePath };
});

// Open project dialog
ipcMain.handle('project:open-dialog', async () => {
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Project',
    defaultPath: PROJECTS_DIR,
    filters: [{ name: 'CodeAtlas Project', extensions: ['catlas'] }],
    properties: ['openFile'],
  });
  if (!filePaths?.length) return null;
  return loadProjectFile(filePaths[0]);
});

// Open project by path (recent projects)
ipcMain.handle('project:open-path', (event, filePath) => {
  return loadProjectFile(filePath);
});

function loadProjectFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const workspace = JSON.parse(raw);
    currentProjectPath = filePath;
    currentWorkspaceState = workspace;
    if (mainWindow) mainWindow.setTitle(`CodeAtlas — ${workspace.project?.name || 'Project'}`);
    return { workspace, filePath };
  } catch (err) {
    console.error('[CodeAtlas] Failed to open project:', err.message);
    dialog.showErrorBox('Open Failed', `Could not read project file:\n${filePath}\n\n${err.message}`);
    return null;
  }
}

// ─── PTY Terminal Setup ────────────────────────────────────────────────────

function setupPtyTerminal(win) {
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

    ptyProcess.onData((data) => {
      if (win && !win.isDestroyed()) win.webContents.send('terminal:data', data);
    });

    ipcMain.on('terminal:write', (_event, data) => ptyProcess.write(data));
    ipcMain.on('terminal:resize', (_event, { cols, rows }) => ptyProcess.resize(cols, rows));

    console.log('[CodeAtlas] node-pty spawned:', shell);
  } catch (err) {
    console.warn('[CodeAtlas] node-pty unavailable:', err.message);
  }

  return ptyProcess;
}

app.whenReady().then(() => {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ label: app.name, submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'quit' }] }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu:new-project')
        },
        {
          label: 'Open Project...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await ipcMain.emit('project:open-dialog');
            if (result) mainWindow.webContents.send('menu:open-result', result);
          }
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.invoke?.('project:save') || ipcMain.emit('project:save')
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: async () => {
            if (!currentWorkspaceState) return;
            const { filePath } = await dialog.showSaveDialog(mainWindow, {
              title: 'Save Project As',
              defaultPath: path.join(PROJECTS_DIR, `${currentWorkspaceState.project?.name || 'project'}.catlas`),
              filters: [{ name: 'CodeAtlas Project', extensions: ['catlas'] }],
            });
            if (!filePath) return;
            saveProjectToPath(filePath, currentWorkspaceState);
            mainWindow.webContents.send('menu:save-result', { filePath });
          }
        },
        { type: 'separator' },
        {
          label: 'Close Project',
          accelerator: 'CmdOrCtrl+W',
          click: () => mainWindow.webContents.send('menu:close-project')
        },
        { type: 'separator' },
        { role: 'quit', label: 'Exit', accelerator: 'CmdOrCtrl+Q' }
      ]
    },
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
