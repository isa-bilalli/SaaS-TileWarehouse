import { registerPuntoriHandler, getAllPuntorHandler } from './PuntoriHandler.js';
import { addPllakeHandler, editTileHandler, getTileDataHandler, isTileHandler } from './pllakeHandler.js';
import { addProductHandler, deleteProductHandler, editProductHandler, getTodayProductHandler, searchProductHandler } from './produktHandler.js';
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
}

