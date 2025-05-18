import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../context/AuthContext';
import axios from "axios";
import image from "../images/drive.png";
import ReportCard from "./ReportCard";

const YARArchive = ({ onStart, onEditDraft }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      const config = {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      };
      
      const { data } = await axios.get(
        'https://raiseyouryar-3.onrender.com/api/reports',
        config
      );
      
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation to a specific report
  const viewReport = (reportId) => {
    navigate(`/report/${reportId}`);
  };

  // Handle clicking on a report - edited for draft handling
  const handleReportClick = (reportId, status) => {
    if (status === 'draft') {
      // For draft reports, pass to parent for editing
      if (onEditDraft) {
        onEditDraft(reportId);
      }
    } else {
      // For submitted/approved reports, just view
      viewReport(reportId);
    }
  };

  // Handle deleting a report
  const handleDeleteClick = (reportId) => {
    // Find the report in our local state
    const reportToBeDeleted = reports.find(report => report._id === reportId);
    
    // Allow deletion of draft AND submitted reports
    if (reportToBeDeleted && (reportToBeDeleted.status === 'draft' || reportToBeDeleted.status === 'submitted')) {
      setReportToDelete(reportId);
      setDeleteError('');
      setDeleteSuccess('');
      setShowDeleteConfirm(true);
    } else if (reportToBeDeleted && reportToBeDeleted.status === 'approved') {
      // Display error for approved reports which still can't be deleted
      setDeleteError('Approved reports cannot be deleted.');
      setShowDeleteConfirm(true);
      setTimeout(() => {
        setShowDeleteConfirm(false);
        setDeleteError('');
      }, 2000);
    } else {
      console.error('Cannot delete this report');
    }
  };

  // Delete the report from MongoDB
  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      setDeleteError('');
      
      const config = {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      };
      
      // Use our direct MongoDB delete endpoint
      console.log('Sending delete request for report:', reportToDelete);
      const response = await axios.delete(
        `https://raiseyouryar-3.onrender.com/api/reports/delete/${reportToDelete}`,
        config
      );
      
      console.log('Delete response:', response.data);
      
      // Update local state to remove the deleted report
      const updatedReports = reports.filter(report => report._id !== reportToDelete);
      setReports(updatedReports);
      
      // Show success message
      setDeleteSuccess('Report deleted successfully!');
      
      // Hide modal after a delay
      setTimeout(() => {
        setShowDeleteConfirm(false);
        setReportToDelete(null);
        setDeleteSuccess('');
      }, 1500);
      
    } catch (error) {
      console.error('Error deleting report:', error);
      setDeleteError(error.response?.data?.message || 'Failed to delete report');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setReportToDelete(null);
    setDeleteError('');
    setDeleteSuccess('');
  };

  return (
    <div className="yar-container">
      {/* Top section - Start button */}
      <div className="yar-buttons-container">
        <div className="yar-start-button" onClick={onStart}>
          <h2>Access Yearly Activity Report</h2>
          <div className="arrow">›</div>
        </div>
        <div className="yar-archive-button">
          <h2>View YAR Archive</h2>
          <img src={image} alt="Archive icon" />
        </div>
      </div>

      {/* Display reports if available */}
      <div className="reports-section">
        {loading ? (
          <div className="loading">Loading your reports...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : reports.length > 0 ? (
          <div className="reports-grid">
            {reports.map(report => (
              <ReportCard 
                key={report._id} 
                report={report} 
                onClick={(reportId) => handleReportClick(reportId, report.status)}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <div className="no-reports-message">
            <p>You haven't submitted any reports yet. Click "Access Yearly Activity Report" to create your first report.</p>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Delete Report</h3>
            {deleteSuccess ? (
              <div className="delete-success-message">{deleteSuccess}</div>
            ) : deleteError ? (
              <>
                <div className="delete-error-message">{deleteError}</div>
                <div className="delete-modal-buttons">
                  <button 
                    className="cancel-delete-btn"
                    onClick={cancelDelete}
                    disabled={deleteLoading}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>Are you sure you want to delete this report? This action cannot be undone.</p>
                <div className="delete-modal-buttons">
                  <button 
                    className="cancel-delete-btn"
                    onClick={cancelDelete}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="confirm-delete-btn"
                    onClick={confirmDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Privacy Statement in its own section */}
      <div className="privacy-statement-section">
        {/* Privacy statement content (unchanged) */}
      </div>
    </div>
  );
};

export default YARArchive;