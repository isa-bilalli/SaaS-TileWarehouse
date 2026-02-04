import { ipcMain } from 'electron';

/**
 * Register ping IPC handler
 * Handles the 'ping' IPC call and returns a pong response
 */
export function registerPingHandler() {
  ipcMain.handle('ping', async () => {
    return 'pong from electron';
  });
  
}