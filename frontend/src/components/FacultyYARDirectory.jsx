import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const FacultyYARDirectory = () => {
  const [facultyData, setFacultyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/yar'); // Redirect non-admins
      return;
    }
    fetchFacultyData();
  }, [currentUser, navigate]);

  const fetchFacultyData = async () => {
    try {
      setLoading(true);
      setError('');

      const config = {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      };

      // Fetch all faculty members
      const facultyResponse = await axios.get(
        'https://raiseyouryar-j59c.onrender.com/api/faculty',
        config
      );

      // const facultyResponse = await axios.get(
      //   'http://localhost:5001/api/faculty',
      //   config
      // );

      // For each faculty member, fetch their reports
      const facultyWithReports = await Promise.all(
        facultyResponse.data.map(async (faculty) => {
          try {
            // Get reports for this faculty member
            const reportsResponse = await axios.get(
              `https://raiseyouryar-j59c.onrender.com/api/admin/faculty/${faculty._id}/reports`,
              config
            );
            
            // const reportsResponse = await axios.get(
            //   `http://localhost:5001/api/admin/faculty/${faculty._id}/reports`,
            //   config
            // );

            return {
              ...faculty,
              reports: reportsResponse.data || [],
              latestReport: reportsResponse.data?.[0] || null
            };
          } catch (error) {
            // If no reports found for this faculty, that's okay
            return {
              ...faculty,
              reports: [],
              latestReport: null
            };
          }
        })
      );

      setFacultyData(facultyWithReports);
    } catch (error) {
      console.error('Error fetching faculty data:', error);
      setError('Failed to load faculty data');
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyClick = (facultyId, reportId) => {
    if (reportId) {
      navigate(`/admin/faculty/${facultyId}/report/${reportId}`);
    } else {
      // Navigate to faculty profile or reports list
      navigate(`/admin/faculty/${facultyId}/reports`);
    }
  };

  const filteredFaculty = facultyData.filter(faculty =>
    faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft': return '#f39c12';
      case 'submitted': return '#3498db';
      case 'approved': return '#2ecc71';
      case 'reviewed': return '#9b59b6';
      default: return '#7f8c8d';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading faculty directory...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="faculty-directory-container">
      <div className="faculty-directory-header">
        <h1 className="directory-title">Faculty YAR Directory</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search faculty by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="faculty-grid">
        {filteredFaculty.map(faculty => (
          <div 
            key={faculty._id} 
            className="faculty-card"
            onClick={() => handleFacultyClick(faculty._id, faculty.latestReport?._id)}
          >
            <div className="faculty-card-header">
              <h3 className="faculty-name">{faculty.name}</h3>
              <div className="faculty-info">
                <p className="faculty-email">{faculty.email}</p>
                <p className="faculty-netid">NetID: {faculty.netID}</p>
              </div>
            </div>

            <div className="faculty-reports-summary">
              <div className="reports-count">
                <span className="count-number">{faculty.reports.length}</span>
                <span className="count-label">Reports</span>
              </div>

              {faculty.latestReport ? (
                <div className="latest-report">
                  <div className="report-info">
                    <span className="report-year">{faculty.latestReport.academicYear}</span>
                    <div 
                      className="report-status"
                      style={{ backgroundColor: getStatusColor(faculty.latestReport.status) }}
                    >
                      {faculty.latestReport.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="report-dates">
                    {faculty.latestReport.submittedDate && (
                      <p>Submitted: {formatDate(faculty.latestReport.submittedDate)}</p>
                    )}
                    {faculty.latestReport.updatedAt && (
                      <p>Updated: {formatDate(faculty.latestReport.updatedAt)}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="no-reports">
                  <p>No reports available</p>
                </div>
              )}
            </div>

            <div className="faculty-card-footer">
              <button className="view-reports-btn">
                {faculty.reports.length > 0 ? 'View Reports' : 'No Reports'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredFaculty.length === 0 && searchTerm && (
        <div className="no-results">
          <p>No faculty members found matching "{searchTerm}"</p>
        </div>
      )}

      <style jsx>{`
        .faculty-directory-container {
          padding: 30px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .faculty-directory-header {
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .directory-title {
          color: #4B2E83;
          font-family: "Encode Sans", sans-serif;
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }

        .search-container {
          flex: 1;
          max-width: 400px;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d0d0d0;
          border-radius: 8px;
          font-size: 16px;
          font-family: "Encode Sans", sans-serif;
          box-sizing: border-box;
        }

        .search-input:focus {
          outline: none;
          border-color: #4B2E83;
          box-shadow: 0 0 0 2px rgba(75, 46, 131, 0.1);
        }

        .faculty-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .faculty-card {
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

        .faculty-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(75, 46, 131, 0.15);
        }

        .faculty-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #4B2E83, #32006E);
        }

        .faculty-card-header {
          margin-bottom: 20px;
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 15px;
        }

        .faculty-name {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 20px;
          font-weight: 600;
          font-family: "Encode Sans", sans-serif;
        }

        .faculty-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .faculty-email {
          margin: 0;
          color: #666;
          font-size: 14px;
          font-family: "Encode Sans", sans-serif;
        }

        .faculty-netid {
          margin: 0;
          color: #888;
          font-size: 13px;
          font-family: "Encode Sans", sans-serif;
        }

        .faculty-reports-summary {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          min-height: 80px;
        }

        .reports-count {
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: #f8f9fa;
          padding: 12px;
          border-radius: 8px;
          min-width: 60px;
        }

        .count-number {
          font-size: 24px;
          font-weight: bold;
          color: #4B2E83;
          font-family: "Encode Sans", sans-serif;
        }

        .count-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-family: "Encode Sans", sans-serif;
        }

        .latest-report {
          flex: 1;
          margin-left: 16px;
        }

        .report-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .report-year {
          font-weight: 600;
          color: #333;
          font-size: 16px;
          font-family: "Encode Sans", sans-serif;
        }

        .report-status {
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 4px;
          color: white;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .report-dates {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .report-dates p {
          margin: 0;
          font-size: 12px;
          color: #666;
          font-family: "Encode Sans", sans-serif;
        }

        .no-reports {
          flex: 1;
          margin-left: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
        }

        .no-reports p {
          margin: 0;
          color: #888;
          font-style: italic;
          font-size: 14px;
          font-family: "Encode Sans", sans-serif;
        }

        .faculty-card-footer {
          display: flex;
          justify-content: center;
        }

        .view-reports-btn {
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

        .view-reports-btn:hover {
          background-color: #32006E;
        }

        .view-reports-btn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .no-results {
          text-align: center;
          padding: 40px;
          background-color: #f9f9f9;
          border-radius: 10px;
          margin-top: 20px;
        }

        .no-results p {
          color: #555;
          font-size: 16px;
          margin: 0;
          font-family: "Encode Sans", sans-serif;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .faculty-directory-header {
            flex-direction: column;
            align-items: stretch;
          }

          .search-container {
            max-width: none;
          }

          .faculty-grid {
            grid-template-columns: 1fr;
          }

          .faculty-reports-summary {
            flex-direction: column;
            gap: 12px;
          }

          .latest-report,
          .no-reports {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default FacultyYARDirectory;