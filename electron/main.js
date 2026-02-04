import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerAllHandlers } from './handlers/index.js';
import { initializeDatabase, closeDatabase } from './db/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

registerAllHandlers();
  
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    // DEV → always vite server
    win.loadURL('http://localhost:5173');
  } else {
    // PROD → real files
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Initialize database when app is ready
app.whenReady().then(async () => {
  try {
    await initializeDatabase();
    createWindow();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Still create window even if DB fails, but log the error
    createWindow();
  }
});

// Close database connections when app quits
app.on('before-quit', async () => {
  await closeDatabase();
});
