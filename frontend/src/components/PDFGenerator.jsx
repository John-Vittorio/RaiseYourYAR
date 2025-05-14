import React from 'react';
import html2pdf from 'html2pdf.js';

const PDFGenerator = ({ reportData, elementToConvert }) => {
  const downloadPDF = () => {
    const element = document.getElementById(elementToConvert);
    
    if (!element) {
      console.error(`Element with ID ${elementToConvert} not found`);
      return;
    }
    
    // Create a clone of the element to avoid modifying the visible DOM
    const clonedElement = element.cloneNode(true);
    
    // Add PDF-specific styling to the clone
    const pdfStyle = document.createElement('style');
    pdfStyle.textContent = `
      * {
        font-family: Arial, sans-serif;
        box-sizing: border-box;
      }
      
      .report-card {
        padding: 20px;
        margin: 0;
        box-shadow: none;
        border: none;
      }
      
      .faculty-name-section {
        font-size: 24px;
        color: #4B2E83;
        font-weight: 600;
        margin-bottom: 30px;
        padding-bottom: 15px;
        border-bottom: 2px solid #4B2E83;
      }
      
      .review-section {
        margin-top: 20px;
        padding-top: 15px;
        page-break-inside: avoid;
      }
      
      .review-section-title {
        color: #4B2E83;
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 10px;
      }
      
      /* Grid layout for review items */
      .review-section-content {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 15px;
      }
      
      .review-item {
        background-color: #f9f9ff;
        border-left: 3px solid #4B2E83;
        padding: 10px;
        margin-bottom: 12px;
        page-break-inside: avoid;
      }
      
      .review-item-details p {
        margin: 3px 0;
        line-height: 1.4;
        white-space: normal;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
      
      h4 {
        margin-top: 5px;
        margin-bottom: 8px;
        color: #4B2E83;
      }
      
      .section-notes {
        background-color: #f5f8ff;
        border-left: 3px solid #4B2E83;
        padding: 8px 12px;
        margin-top: 10px;
        grid-column: 1 / -1;
        white-space: normal;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
      
      .general-notes-content p {
        white-space: normal;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
      
      /* Handle page breaks appropriately */
      .review-section {
        page-break-after: auto;
      }
      
      h2, h3 {
        page-break-after: avoid;
      }
      
      .report-meta {
        page-break-inside: avoid;
      }
      
      /* Make sure the grid layout works properly in PDF */
      @media print {
        .review-section-content {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        
        .section-notes {
          grid-column: 1 / -1;
        }
        
        .no-data-message {
          grid-column: 1 / -1;
        }
      }
    `;
    
    clonedElement.prepend(pdfStyle);
    
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5], // [top, right, bottom, left] in inches
      filename: `YAR_Report_${reportData.academicYear}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        allowTaint: false
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait',
        compressPDF: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      enableLinks: true
    };
    
    // Create a temporary container for the clone
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);
    
    // Generate PDF from the cloned content
    html2pdf()
      .set(opt)
      .from(clonedElement)
      .save()
      .then(() => {
        // Clean up
        document.body.removeChild(tempContainer);
      })
      .catch(err => {
        console.error('Error generating PDF:', err);
        document.body.removeChild(tempContainer);
      });
  };

  return (
    <button 
      onClick={downloadPDF}
      className="download-pdf-button"
      aria-label="Download as PDF"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="12" y1="18" x2="12" y2="12"></line>
        <line x1="9" y1="15" x2="15" y2="15"></line>
      </svg>
      Download as PDF
    </button>
  );
};

export default PDFGenerator;