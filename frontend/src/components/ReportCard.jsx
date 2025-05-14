import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReportCard = ({ report, onClick, onDelete }) => {
  const navigate = useNavigate();
  const isDraft = report.status === 'draft';
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Get appropriate status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'draft':
        return '#f39c12'; // amber
      case 'submitted':
        return '#3498db'; // blue
      case 'approved':
        return '#2ecc71'; // green
      case 'reviewed':
        return '#9b59b6'; // purple
      default:
        return '#7f8c8d'; // gray
    }
  };
  
  // Handle click to view the report
  const handleViewReport = () => {
    // If an onClick prop is provided, use it
    if (onClick) {
      onClick(report._id);
    } else {
      // Otherwise use the default navigation
      navigate(`/report/${report._id}`);
    }
  };
  
  // Handle delete button click
  const handleDelete = (e) => {
    // Stop the click event from bubbling up to the parent
    e.stopPropagation();
    
    // Call the onDelete function with the report id
    if (onDelete) {
      onDelete(report._id);
    }
  };
  
  return (
    <div 
      className="report-card-container" 
      onClick={handleViewReport}
      data-status={report.status}
    >
      <div className="report-card-header">
        <h3 className="report-card-title">YAR: {report.academicYear}</h3>
        <div 
          className={`report-card-status ${report.status}`}
          style={{ backgroundColor: getStatusColor(report.status) }}
        >
          {report.status.toUpperCase()}
        </div>
      </div>
      
      <div className="report-card-details">
        {isDraft && report.updatedAt && (
          <p><strong>Last Edited:</strong> {formatDate(report.updatedAt)}</p>
        )}
        {report.submittedDate && (
          <p><strong>Submitted:</strong> {formatDate(report.submittedDate)}</p>
        )}
        {report.approvedDate && (
          <p><strong>Approved:</strong> {formatDate(report.approvedDate)}</p>
        )}
      </div>
      
      <div className="report-card-footer">
        {isDraft && (
          <>
            <button 
              className="report-card-delete-btn"
              onClick={handleDelete}
            >
              Delete
            </button>
            <button className="report-card-view-btn resume">
              {/* Add pencil icon for resume */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              Resume Editing
            </button>
          </>
        )}
        {!isDraft && (
          <button className="report-card-view-btn">
            View Report
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportCard;