import { ipcMain, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function printToPDFHandler() {
  ipcMain.handle('printToPDF', async (event, htmlContent, options = {}) => {
    return new Promise(async (resolve, reject) => {
      let printWindow = null;
      let timeoutId = null;
      
      try {
        // Create a hidden window
        printWindow = new BrowserWindow({
          show: false,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
          },
        });

        // Set timeout to prevent infinite waiting (30 seconds)
        timeoutId = setTimeout(() => {
          if (printWindow && !printWindow.isDestroyed()) {
            printWindow.close();
          }
          reject(new Error('PDF generation timeout: Page took too long to load'));
        }, 30000);

        // Wait for DOM to be ready
        printWindow.webContents.once('dom-ready', async () => {
          try {
            // Wait a bit for external styles (Tailwind CDN) to load
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Generate PDF
            const pdfBuffer = await printWindow.webContents.printToPDF({
              marginsType: 0, // 0 = default, 1 = none, 2 = minimum, 3 = custom
              pageSize: 'A4',
              printBackground: true,
              printSelectionOnly: false,
              landscape: false,
              ...options,
            });
            
            // Clear timeout
            if (timeoutId) clearTimeout(timeoutId);
            
            // Close the window
            if (printWindow && !printWindow.isDestroyed()) {
              printWindow.close();
            }

            resolve(pdfBuffer);
          } catch (error) {
            if (timeoutId) clearTimeout(timeoutId);
            if (printWindow && !printWindow.isDestroyed()) {
              printWindow.close();
            }
            reject(error);
          }
        });

        // Also listen for did-finish-load as backup
        printWindow.webContents.once('did-finish-load', () => {
        });

        // Handle errors
        printWindow.webContents.once('did-fail-load', (event, errorCode, errorDescription) => {
          if (timeoutId) clearTimeout(timeoutId);
          if (printWindow && !printWindow.isDestroyed()) {
            printWindow.close();
          }
          reject(new Error(`Failed to load: ${errorDescription}`));
        });

        // Load the HTML content
        const dataURL = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
        await printWindow.loadURL(dataURL);        
      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        if (printWindow && !printWindow.isDestroyed()) {
          printWindow.close();
        }
        reject(error);
      }
    });
  });
}

export function savePDFHandler() {
  ipcMain.handle('savePDF', async (event, pdfBuffer, filename) => {
    try {
      const { dialog, app } = await import('electron');
      const mainWindow = BrowserWindow.getFocusedWindow();
      
      // Create invoices folder in user's Documents or app data directory
      const userDataPath = app.getPath('documents');
      const invoicesFolder = path.join(userDataPath, 'ArtaCommerce', 'Invoices');
      
      // Ensure the folder exists
      try {
        await fs.mkdir(invoicesFolder, { recursive: true });
      } catch (err) {
        // Folder might already exist, that's okay
      }
      
      // Default path in the invoices folder
      const defaultPath = path.join(invoicesFolder, filename || `invoice-${Date.now()}.pdf`);
      
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Invoice PDF',
        defaultPath: defaultPath,
        filters: [
          { name: 'PDF Files', extensions: ['pdf'] }
        ]
      });

      if (!result.canceled && result.filePath) {
        await fs.writeFile(result.filePath, pdfBuffer);
        return { success: true, filePath: result.filePath };
      }
      
      return { success: false, canceled: true };
    } catch (error) {
      throw error;
    }
  });
}

