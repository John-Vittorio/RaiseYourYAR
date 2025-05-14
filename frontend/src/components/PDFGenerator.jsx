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
        padding: 15px;
        margin: 0;
        box-shadow: none;
        border: none;
      }
      
      .faculty-name-section {
        font-size: 22px;
        color: #4B2E83;
        font-weight: 600;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid #4B2E83;
      }
      
      .review-section {
        margin-top: 15px;
        padding-top: 10px;
        page-break-inside: avoid;
      }
      
      .review-section-title {
        color: #4B2E83;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      
      /* Set grid layout for 3 items per row */
      .review-section-content {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      
      /* More compact review items */
      .review-item {
        background-color: #f9f9ff;
        border-left: 3px solid #4B2E83;
        padding: 6px 8px;
        margin-bottom: 6px;
        page-break-inside: avoid;
        min-height: auto;
        max-height: none;
        overflow: visible;
      }
      
      /* Tighter spacing within review items */
      .review-item-details p {
        margin: 1px 0;
        line-height: 1.2;
        white-space: normal;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
      
      h4 {
        margin-top: 2px;
        margin-bottom: 3px;
        color: #4B2E83;
        font-size: 13px;
      }
      
      h5 {
        margin-top: 1px;
        margin-bottom: 3px;
        font-size: 12px;
      }
      
      .section-notes {
        background-color: #f5f8ff;
        border-left: 3px solid #4B2E83;
        padding: 6px 8px;
        margin-top: 6px;
        grid-column: 1 / -1;
        white-space: normal;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
      
      .section-notes h4 {
        margin-bottom: 4px;
      }
      
      .general-notes-content p {
        white-space: normal;
        word-wrap: break-word;
        overflow-wrap: break-word;
        line-height: 1.2;
      }
      
      /* Report meta information */
      .report-meta {
        background-color: #f9f9ff;
        padding: 8px 10px;
        margin-bottom: 15px;
        border-left: 4px solid #4B2E83;
        page-break-inside: avoid;
      }
      
      .report-meta p {
        margin: 2px 0;
        line-height: 1.2;
      }
      
      /* Careful page break handling */
      .review-section {
        page-break-before: auto;
        page-break-after: auto;
      }
      
      h2, h3 {
        page-break-after: avoid;
      }
      
      .report-meta {
        page-break-inside: avoid;
      }
      
      /* No data message styling */
      .no-data-message {
        grid-column: 1 / -1;
        text-align: center;
        font-style: italic;
        color: #777;
      }
      
      /* More compact layout for PDF */
      @media print {
        body {
          font-size: 10pt;
          line-height: 1.2;
        }
        
        .review-section-content {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        
        .section-notes {
          grid-column: 1 / -1;
        }
        
        .no-data-message {
          grid-column: 1 / -1;
        }
        
        /* Compact review items */
        .review-item {
          height: auto;
          min-height: auto;
          display: flex;
          flex-direction: column;
          padding: 6px 8px;
        }
        
        /* Reduce vertical spacing */
        .review-item h4, .review-item h5 {
          margin-top: 0;
          margin-bottom: 3px;
        }
        
        /* Make section titles stand out but take less space */
        .review-section-title {
          font-size: 14pt;
          margin-bottom: 6px;
          margin-top: 12px;
        }
        
        /* Keep sections on the same page as much as possible */
        .review-section-content {
          page-break-inside: auto;
        }
        
        /* Ensure review items stay together */
        .review-item {
          page-break-inside: avoid;
        }
        
        /* More compact faculty name section */
        .faculty-name-section {
          margin-bottom: 15px;
          padding-bottom: 8px;
        }
      }
    `;

    clonedElement.prepend(pdfStyle);

    const opt = {
      margin: [0.4, 0.4, 0.4, 0.4], // [top, right, bottom, left] in inches - reduced margins
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
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'],
        // Avoid breaking inside review sections unless absolutely necessary
        avoid: '.review-item, .section-notes, .report-meta'
      },
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