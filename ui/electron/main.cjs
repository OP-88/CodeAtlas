const { app, BrowserWindow } = require('electron');
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

app.whenReady().then(() => {
  createWindow();

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
