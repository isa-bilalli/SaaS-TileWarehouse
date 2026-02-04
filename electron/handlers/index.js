import { registerPingHandler } from './pingHandler.js';
import { registerPuntoriHandler, getAllPuntorHandler } from './PuntoriHandler.js';
/**
 * Register all IPC handlers
 * This centralizes handler registration - just add new handlers here
 */
export function registerAllHandlers() {
  registerPingHandler();
  registerPuntoriHandler();
  getAllPuntorHandler()
  
}

