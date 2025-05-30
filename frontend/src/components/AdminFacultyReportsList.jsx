import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navigation from './Navigation';
import axios from 'axios';

const AdminFacultyReportsList = () => {
  const { facultyId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [facultyInfo, setFacultyInfo] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/yar');
      return;
    }

    if (facultyId) {
      fetchFacultyReports();
    }
  }, [facultyId, currentUser, navigate]);

  const fetchFacultyReports = async () => {
    try {
      setLoading(true);
      setError('');

      const config = {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      };

      const response = await axios.get(
        `https://raiseyouryar-j59c.onrender.com/api/admin/faculty/${facultyId}/reports`,
        config
      );

      // const response = await axios.get(
      //   `http://localhost:5001/api/admin/faculty/${facultyId}/reports`,
      //   config
      // );

      setFacultyInfo(response.data.faculty);
      setReports(response.data.reports);
    } catch (error) {
      console.error('Error fetching faculty reports:', error);
      setError('Failed to load faculty reports');
    } finally {
      setLoading(false);
    }
  };

  const handleReportClick = (reportId) => {
    navigate(`/admin/faculty/${facultyId}/report/${reportId}`);
  };

  // Custom report card component for admin view
  const AdminReportCard = ({ report, onClick }) => {
    const getStatusColor = (status) => {
      switch(status) {
        case 'draft': return '#f39c12';
        case 'submitted': return '#3498db';
        case 'reviewed': return '#9b59b6';
        case 'approved': return '#2ecc71';
        default: return '#7f8c8d';
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString();
    };

    return (
      <div className="admin-report-card" onClick={() => onClick(report._id)}>
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
          <p><strong>Created:</strong> {formatDate(report.createdAt)}</p>
          {report.submittedDate && (
            <p><strong>Submitted:</strong> {formatDate(report.submittedDate)}</p>
          )}
          {report.reviewedDate && (
            <p><strong>Reviewed:</strong> {formatDate(report.reviewedDate)}</p>
          )}
          {report.approvedDate && (
            <p><strong>Approved:</strong> {formatDate(report.approvedDate)}</p>
          )}
          <p><strong>Last Updated:</strong> {formatDate(report.updatedAt)}</p>
        </div>

        <div className="report-card-footer">
          <button className="admin-view-report-btn">
            View Full Report
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="loading">Loading faculty reports...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="error-message">
          {error}
          <button onClick={() => navigate('/admin/faculty')} className="yar-button-secondary">
            Back to Faculty Directory
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="admin-faculty-reports-container">
        <div className="admin-reports-header">
          <div className="header-left">
            <button
              onClick={() => navigate('/admin/faculty')}
              className="back-button"
            >
              ← Back to Faculty Directory
            </button>
            
            {facultyInfo && (
              <div className="faculty-info-header">
                <h1>{facultyInfo.name}'s Reports</h1>
                <div className="faculty-details">
                  <p><strong>Email:</strong> {facultyInfo.email}</p>
                  <p><strong>NetID:</strong> {facultyInfo.netID}</p>
                </div>
              </div>
            )}
          </div>

          <div className="reports-summary">
            <div className="summary-card">
              <div className="summary-number">{reports.length}</div>
              <div className="summary-label">Total Reports</div>
            </div>
            <div className="summary-card">
              <div className="summary-number">
                {reports.filter(r => r.status === 'submitted').length}
              </div>
              <div className="summary-label">Submitted</div>
            </div>
            <div className="summary-card">
              <div className="summary-number">
                {reports.filter(r => r.status === 'approved').length}
              </div>
              <div className="summary-label">Approved</div>
            </div>
          </div>
        </div>

        <div className="reports-section">
          {reports.length > 0 ? (
            <div className="admin-reports-grid">
              {reports.map(report => (
                <AdminReportCard
                  key={report._id}
                  report={report}
                  onClick={handleReportClick}
                />
              ))}
            </div>
          ) : (
            <div className="no-reports-message">
              <p>This faculty member hasn't created any reports yet.</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .admin-faculty-reports-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 20px;
          width: 100%;
          box-sizing: border-box;
        }

        .admin-reports-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #4B2E83;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .back-button {
          background-color: #f8f9fa;
          border: 1px solid #d0d0d0;
          padding: 8px 16px;
          border-radius: 6px;
          color: #4B2E83;
          text-decoration: none;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          align-self: flex-start;
        }

        .back-button:hover {
          background-color: #e9ecef;
          transform: translateX(-2px);
        }

        .faculty-info-header h1 {
          color: #4B2E83;
          margin: 0 0 10px 0;
          font-size: 28px;
          font-family: "Encode Sans", sans-serif;
        }

        .faculty-details {
          color: #666;
          font-size: 14px;
        }

        .faculty-details p {
          margin: 2px 0;
        }

        .reports-summary {
          display: flex;
          gap: 20px;
        }

        .summary-card {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          min-width: 80px;
          border-left: 4px solid #4B2E83;
        }

        .summary-number {
          font-size: 28px;
          font-weight: bold;
          color: #4B2E83;
          margin-bottom: 5px;
        }

        .summary-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .reports-section {
          width: 100%;
        }

        .admin-reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 25px;
        }

        .admin-report-card {
          background-color: white;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .admin-report-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(75, 46, 131, 0.15);
        }

        .admin-report-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #4B2E83, #32006E);
        }

        .report-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 10px;
        }

        .report-card-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
          font-family: "Encode Sans", sans-serif;
        }

        .report-card-status {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 4px;
          color: white;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .report-card-details {
          margin-bottom: 20px;
          font-size: 14px;
          color: #555;
        }

        .report-card-details p {
          margin: 6px 0;
          line-height: 1.5;
        }

        .report-card-footer {
          display: flex;
          justify-content: center;
        }

        .admin-view-report-btn {
          background-color: #4B2E83;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s ease;
          font-family: "Encode Sans", sans-serif;
          width: 100%;
        }

        .admin-view-report-btn:hover {
          background-color: #32006E;
        }

        .no-reports-message {
          text-align: center;
          padding: 60px 20px;
          background-color: #f9f9f9;
          border-radius: 12px;
          border: 2px dashed #d0d0d0;
        }

        .no-reports-message p {
          color: #666;
          font-size: 18px;
          margin: 0;
          font-family: "Encode Sans", sans-serif;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .admin-reports-header {
            flex-direction: column;
            gap: 20px;
          }

          .reports-summary {
            align-self: stretch;
            justify-content: space-around;
          }

          .summary-card {
            flex: 1;
            min-width: 60px;
          }

          .admin-reports-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default AdminFacultyReportsList;