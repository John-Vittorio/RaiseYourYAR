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

      // const { data } = await axios.get(
      //   'http://localhost:5001/api/reports',
      //   config
      // );
      
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
    
    // Only allow deletion of draft reports
    if (reportToBeDeleted && reportToBeDeleted.status === 'draft') {
      setReportToDelete(reportId);
      setDeleteError('');
      setDeleteSuccess('');
      setShowDeleteConfirm(true);
    } else {
      console.error('Cannot delete non-draft reports');
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

      // const response = await axios.delete(
      //   `http://localhost:5001/api/reports/delete/${reportToDelete}`,
      //   config
      // );
      
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
            <h3>Delete Draft Report</h3>
            {deleteSuccess ? (
              <div className="delete-success-message">{deleteSuccess}</div>
            ) : (
              <>
                <p>Are you sure you want to delete this draft report? This action cannot be undone.</p>
                {deleteError && <div className="delete-error-message">{deleteError}</div>}
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
        <div className="privacy-form-version">
          <h2 className="privacy-heading">Privacy Statement</h2>
          <div className="privacy-content">
            <p className="opening-paragraph">
              Our Yearly Activity Report (YAR) tool, RaiseYourYAR, is designed to
              support department leadership in making strategic, data-informed
              decisions related to faculty activities such as tenure, promotion,
              and resource allocation. To accomplish this, YAR uses class
              enrollment data and associated metrics—such as enrollment credit
              hours—presented in aggregate form through visualizations and
              dashboards. We are committed to ensuring transparency, security, and
              ethical handling of all data. YAR adheres to all University of
              Washington data governance policies and complies fully with FERPA
              (Family Educational Rights and Privacy Act) and any relevant faculty
              confidentiality regulations.
            </p>
            <h3 className="section-header">Key Privacy Practices</h3>
            <ul className="privacy-list">
              <li>
                <strong>Data Sources:</strong> Data is securely pulled from
                institutional sources including the UW Registrar and
                ORCID-integrated faculty profiles. All access is read-only and
                authorized through university-approved APIs or exports.
              </li>
              <li>
                <strong>Aggregate Metrics Only:</strong> We do not display
                individual student information or personally identifiable data.
                Enrollment and teaching metrics are anonymized and shown in
                summary formats.
              </li>
              <li>
                <strong>Data Use Limitation:</strong> The data is used exclusively
                to visualize instructional contributions and departmental trends
                for academic planning—not for performance evaluation outside
                established university review procedures.
              </li>
              <li>
                <strong>Role Based Access Control:</strong> Access to dashboards
                and reports is restricted to authorized faculty leadership (e.g.,
                department chairs, associate deans) and the faculty member to whom
                the data pertains, where applicable.
              </li>
            </ul>
            <p className="ending-paragraph">
              We are committed to open communication. Faculty are welcome to
              review how their data is presented and can reach out with questions
              or concerns at any point during the process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YARArchive;