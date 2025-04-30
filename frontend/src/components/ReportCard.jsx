import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReportCard = ({ report }) => {
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
    navigate(`/report/${report._id}`);
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
        {report.submittedDate && (
          <p><strong>Submitted:</strong> {formatDate(report.submittedDate)}</p>
        )}
        {report.approvedDate && (
          <p><strong>Approved:</strong> {formatDate(report.approvedDate)}</p>
        )}
      </div>
      
      <div className="report-card-footer">
        <button className="report-card-view-btn">
          View Report
        </button>
      </div>
    </div>
  );
};

export default ReportCard;