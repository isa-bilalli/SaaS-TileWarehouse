import { printToPDF, savePDF } from '../services/electronApi';
import { createRoot } from 'react-dom/client';
import { createElement } from 'react';

/**
 * Generates a complete HTML document with the invoice for PDF printing
 * Uses a temporary container to render the React component
 */
async function generateInvoiceHTML(invoiceData, InvoicePrintViewComponent, currentPuntori) {
  return new Promise((resolve, reject) => {
    try {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '210mm'; // A4 width
      document.body.appendChild(container);
      
      // Render the component with currentPuntori prop to avoid useAuth() error
      const root = createRoot(container);
      root.render(createElement(InvoicePrintViewComponent, { 
        invoiceData,
        currentPuntori 
      }));
      
      // Wait for render to complete (Tailwind needs time to process)
      setTimeout(() => {
        try {
          const htmlContent = container.innerHTML;          
          if(!htmlContent || htmlContent.trim().length === 0){
            root.unmount();
            document.body.removeChild(container);
            reject(new Error('Failed to generate HTML content'));
            return;
          }
          
          // Create complete HTML document
          const fullHTML = `
<!DOCTYPE html>
<html lang="sq">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fatura - ${invoiceData.faturaID || 'N/A'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 1cm;
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    body {
      margin: 0;
      padding: 20px;
      font-family: Arial, sans-serif;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>
          `;
          
          // Cleanup
          root.unmount();
          document.body.removeChild(container);
          resolve(fullHTML);
        } catch(error) {
          root.unmount();
          if(document.body.contains(container)){
            document.body.removeChild(container);
          }
          reject(error);
        }
      }, 1000); // Increased timeout for Tailwind to process
    } catch(error) {
      reject(error);
    }
  });
}

/**
 * Generates and saves PDF of the invoice
 */
export async function generateInvoicePDF(invoiceData, InvoicePrintViewComponent, filename = null, currentPuntori = null) {
  try {
    
    // Generate HTML content
    const htmlContent = await generateInvoiceHTML(invoiceData, InvoicePrintViewComponent, currentPuntori);    
    // Generate PDF buffer
    const pdfBuffer = await printToPDF(htmlContent, {
      marginsType: 1, // No margins (we handle margins in CSS)
      pageSize: 'A4',
      printBackground: true,
      landscape: false,
    });    
    // Save PDF with dialog
    const defaultFilename = filename || `Fatura-${invoiceData.faturaID || Date.now()}.pdf`;
    const result = await savePDF(pdfBuffer, defaultFilename);    
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Opens print dialog for the invoice (browser print)
 */
export function printInvoiceBrowser() {
  window.print();
}

