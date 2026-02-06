import { registerPuntoriHandler, getAllPuntorHandler } from './PuntoriHandler.js';
import { addPllakeHandler } from './PllakeHandler.js';
import { addProduktHandler, getTodayProduktHandler } from './produktHandler.js';
/**
 * Register all IPC handlers
 * This centralizes handler registration - just add new handlers here
 */
export function registerAllHandlers() {
  registerPuntoriHandler();
  getAllPuntorHandler();
  addPllakeHandler();
  addProduktHandler();
  getTodayProduktHandler();
}

