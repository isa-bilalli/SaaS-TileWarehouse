import { registerPuntoriHandler, getAllPuntorHandler } from './PuntoriHandler.js';
import { addInvoiceHandler, searchInvoicesHandler, getProductsInvoiceHandler, getDashboardDataHandler, getInvoicesWithDebtByIDHandler } from './faturaHandler.js';
import { addClientHandler, searchClientHandler } from './klientiHandler.js';
import { addPllakeHandler, editTileHandler, getTileDataHandler, isTileHandler } from './pllakeHandler.js';
import { addProductHandler, deleteProductHandler, editProductHandler, getTodayProductHandler, searchProductHandler } from './produktHandler.js';
import { printToPDFHandler, savePDFHandler } from './printHandler.js';
import { addPaymentHandler, getPaymentsTodayHandler } from './pagesaHandler.js';
/**
 * Register all IPC handlers
 * This centralizes handler registration - just add new handlers here
 */
export function registerAllHandlers() {
  registerPuntoriHandler();
  getAllPuntorHandler();
  addPllakeHandler();
  addProductHandler();
  getTodayProductHandler();
  searchProductHandler();
  deleteProductHandler();
  isTileHandler();
  editProductHandler();
  getTileDataHandler();
  editTileHandler();
  addClientHandler();
  searchClientHandler();
  addInvoiceHandler();
  searchInvoicesHandler();
  printToPDFHandler();
  savePDFHandler();
  getProductsInvoiceHandler();
  getDashboardDataHandler();
  getInvoicesWithDebtByIDHandler();
  addPaymentHandler();
  getPaymentsTodayHandler();
}

