import { registerPingHandler } from './pingHandler.js';

/**
 * Register all IPC handlers
 * This centralizes handler registration - just add new handlers here
 */
export function registerAllHandlers() {
  registerPingHandler();
  // Add more handlers here as you create them:
  // registerProductHandler();
  // registerInvoiceHandler();
  // registerPaymentHandler();
  // etc.
}

