import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReportCard = ({ report, onClick, onDelete }) => {
  const navigate = useNavigate();
  
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
    <div className="report-card-container" onClick={handleViewReport}>
      <div className="report-card-header">
        <h3 className="report-card-title">YAR: {report.academicYear}</h3>
        <div 
          className="report-card-status"
          style={{ backgroundColor: getStatusColor(report.status) }}
        >
          {report.status.toUpperCase()}
        </div>
      </div>
      
      <div className="report-card-details">
        {report.status === 'draft' && report.updatedAt && (
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
        {report.status === 'draft' && (
          <button 
            className="report-card-delete-btn"
            onClick={handleDelete}
          >
            Delete
          </button>
        )}
        <button className="report-card-view-btn">
          View Report
        </button>
      </div>
    </div>
  );
};

export default ReportCard;