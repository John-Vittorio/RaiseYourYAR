import React from 'react';
import html2pdf from 'html2pdf.js';

const PDFGenerator = ({ reportData, elementToConvert }) => {
  const downloadPDF = () => {
    const element = document.getElementById(elementToConvert);
    
    if (!element) {
      console.error(`Element with ID ${elementToConvert} not found`);
      return;
    }
    
    const opt = {
      margin: 1,
      filename: `YAR_Report_${reportData.academicYear}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait'}
    };
    
    html2pdf().set(opt).from(element).save();
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