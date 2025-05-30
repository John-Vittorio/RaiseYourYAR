import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navigation from './Navigation';
import axios from 'axios';
import PDFGenerator from './PDFGenerator';

const AdminFacultyReportView = () => {
  const { facultyId, reportId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [reportData, setReportData] = useState(null);
  const [facultyInfo, setFacultyInfo] = useState(null);
  const [teachingData, setTeachingData] = useState(null);
  const [researchData, setResearchData] = useState(null);
  const [serviceData, setServiceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status update states
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusComments, setStatusComments] = useState('');
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/yar');
      return;
    }
    
    if (facultyId && reportId) {
      fetchReportData();
    }
  }, [facultyId, reportId, currentUser, navigate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');

      const config = {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      };

      const response = await axios.get(
        `https://raiseyouryar-j59c.onrender.com/api/admin/faculty/${facultyId}/report/${reportId}`,
        config
      );

      // const response = await axios.get(
      //   `http://localhost:5001/api/admin/faculty/${facultyId}/report/${reportId}`,
      //   config
      // );

      const { faculty, report, teachingData, researchData, serviceData } = response.data;

      setFacultyInfo(faculty);
      setReportData(report);
      setTeachingData(teachingData);
      setResearchData(researchData);
      setServiceData(serviceData || []);

    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setStatusUpdateLoading(true);

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        }
      };

      await axios.put(
        `https://raiseyouryar-j59c.onrender.com/api/admin/report/${reportId}/status`,
        {
          status: newStatus,
          comments: statusComments
        },
        config
      );

      // await axios.put(
      //   `http://localhost:5001/api/admin/report/${reportId}/status`,
      //   {
      //     status: newStatus,
      //     comments: statusComments
      //   },
      //   config
      // );

      // Refresh the report data
      await fetchReportData();
      
      // Reset form
      setStatusComments('');
      setShowStatusUpdate(false);

    } catch (error) {
      console.error('Error updating report status:', error);
      setError('Failed to update report status');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

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

  const renderThesisCommitteeContent = (service) => {
    return (
      <div className="review-item-details">
        {service.committeeName && (
          <p><strong>Committee Name:</strong> {service.committeeName}</p>
        )}
        {service.degreeType && (
          <p><strong>Degree Type:</strong> {service.degreeType}</p>
        )}
        {service.students && service.students.length > 0 && (
          <p><strong>Students:</strong> {service.students.join(', ')}</p>
        )}
        {service.notes && (
          <p className="wrap-text"><strong>Notes:</strong> {service.notes}</p>
        )}
      </div>
    );
  };

  const renderStandardServiceContent = (service) => {
    return (
      <div className="review-item-details">
        {service.role && <p><strong>Role:</strong> {service.role}</p>}
        {service.department && <p><strong>Dept:</strong> {service.department}</p>}
        {service.description && <p className="wrap-text"><strong>Description:</strong> {service.description}</p>}
        {service.notes && <p className="wrap-text"><strong>Notes:</strong> {service.notes}</p>}
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="loading">Loading report data...</div>
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
      <div className="admin-report-main-wrapper">
        <div className="admin-report-view-container">
          <div className="admin-report-header">
            <div className="header-left">
              <button
                onClick={() => navigate('/admin/faculty')}
                className="back-button"
              >
                ← Back to Faculty Directory
              </button>
              <div className="faculty-report-title">
                <h1>{facultyInfo?.name}'s YAR Report</h1>
                <p className="report-subtitle">{reportData?.academicYear}</p>
              </div>
            </div>
            
            <div className="header-right">
              <div 
                className="report-status-badge"
                style={{ backgroundColor: getStatusColor(reportData?.status) }}
              >
                {reportData?.status?.toUpperCase()}
              </div>
              {reportData && (
                <PDFGenerator
                  reportData={reportData}
                  elementToConvert="adminReportContentForPDF"
                />
              )}
            </div>
          </div>

          {/* Admin Status Update Section */}
          <div className="admin-actions-section">
            <div className="status-update-container">
              <h3>Report Status Management</h3>
              <div className="status-info">
                <p><strong>Current Status:</strong> {reportData?.status}</p>
                {reportData?.submittedDate && (
                  <p><strong>Submitted:</strong> {formatDate(reportData.submittedDate)}</p>
                )}
                {reportData?.reviewedDate && (
                  <p><strong>Reviewed:</strong> {formatDate(reportData.reviewedDate)}</p>
                )}
                {reportData?.approvedDate && (
                  <p><strong>Approved:</strong> {formatDate(reportData.approvedDate)}</p>
                )}
              </div>
              
              <div className="status-actions">
                {!showStatusUpdate ? (
                  <button
                    onClick={() => setShowStatusUpdate(true)}
                    className="yar-button-primary"
                  >
                    Update Status
                  </button>
                ) : (
                  <div className="status-update-form">
                    <div className="status-buttons">
                      <button
                        onClick={() => handleStatusUpdate('reviewed')}
                        disabled={statusUpdateLoading}
                        className="status-btn reviewed"
                      >
                        Mark as Reviewed
                      </button>
                      <button
                        onClick={() => handleStatusUpdate('approved')}
                        disabled={statusUpdateLoading}
                        className="status-btn approved"
                      >
                        Approve Report
                      </button>
                    </div>
                    
                    <textarea
                      value={statusComments}
                      onChange={(e) => setStatusComments(e.target.value)}
                      placeholder="Add comments (optional)..."
                      className="status-comments"
                      rows="3"
                    />
                    
                    <div className="form-actions">
                      <button
                        onClick={() => {
                          setShowStatusUpdate(false);
                          setStatusComments('');
                        }}
                        className="yar-button-secondary"
                        disabled={statusUpdateLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div id="adminReportContentForPDF" className="admin-report-content">
            <div className="pdf-optimized yar-title-pdf">
              {reportData?.academicYear} Yearly Activity Report - {facultyInfo?.name}
              <span className={`report-status-pdf ${reportData?.status}`}>
                {reportData?.status?.toUpperCase()}
              </span>
            </div>

            <div className="course-card report-card">
              <div className="faculty-name-section">
                <span>{facultyInfo?.name}</span>
                <div className="faculty-details">
                  <p><strong>Email:</strong> {facultyInfo?.email}</p>
                  <p><strong>NetID:</strong> {facultyInfo?.netID}</p>
                </div>
              </div>

              <div className="pdf-content-wrapper">
                <h2 className="review-section-title">Report Summary</h2>
                {reportData && (
                  <div className="report-meta">
                    <p><strong>Academic Year:</strong> {reportData.academicYear}</p>
                    <p><strong>Status:</strong> {reportData.status}</p>
                    <p><strong>Generated:</strong> {formatDate(new Date())}</p>
                    {reportData.submittedDate && (
                      <p><strong>Submitted:</strong> {formatDate(reportData.submittedDate)}</p>
                    )}
                  </div>
                )}

                {/* Teaching Section */}
                <div className="review-section teaching-section">
                  <h3 className="review-section-title">Teaching</h3>
                  {teachingData && teachingData.courses && teachingData.courses.length > 0 ? (
                    <div className="review-section-content">
                      {teachingData.expectationNotes && (
                        <div className="section-notes">
                          <h4>Teaching / Research / Service Distribution:</h4>
                          <p className="wrap-text">{teachingData.expectationNotes}</p>
                        </div>
                      )}
                      
                      {teachingData.courses.map((course, index) => (
                        <div key={index} className="review-item">
                          <h4>{course.name}</h4>
                          <div className="review-item-details">
                            <p><strong>Quarter:</strong> {course.quarter} {course.year}</p>
                            <p><strong>Credits:</strong> {course.credits}</p>
                            <p><strong>Enrollment:</strong> {course.enrollment}</p>
                            <p><strong>Student Credit Hours:</strong> {course.studentCreditHours}</p>
                            {course.evaluationScore && (
                              <p><strong>Evaluation Score:</strong> {course.evaluationScore}</p>
                            )}
                            {course.adjustedEvaluationScore && (
                              <p><strong>Adjusted Evaluation:</strong> {course.adjustedEvaluationScore}</p>
                            )}
                            <p><strong>Community Engaged:</strong> {course.commEngaged ? 'Yes' : 'No'}</p>
                            <p><strong>Updated:</strong> {course.updatedCourse ? 'Yes' : 'No'}</p>
                            {course.notes && <p className="wrap-text"><strong>Notes:</strong> {course.notes}</p>}
                          </div>
                        </div>
                      ))}

                      {teachingData.sectionNotes && (
                        <div className="section-notes">
                          <h4>Teaching Section Notes:</h4>
                          <p className="wrap-text">{teachingData.sectionNotes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="review-section-content">
                      <p className="no-data-message">No teaching data available</p>
                    </div>
                  )}
                </div>

                {/* Research Section */}
                <div className="review-section research-section">
                  <h3 className="review-section-title">Research</h3>
                  {researchData ? (
                    <div className="review-section-content">
                      {researchData.publications && researchData.publications.length > 0 && (
                        <>
                          {researchData.publications.map((pub, index) => (
                            <div key={index} className="review-item">
                              <h4>{pub.title}</h4>
                              <div className="review-item-details">
                                <p><strong>Type:</strong> {pub.publicationType}</p>
                                <p><strong>Journal / Publisher:</strong> {pub.journalName}</p>
                                <p><strong>Status:</strong> {pub.publicationStatus}</p>
                                {pub.coAuthors && pub.coAuthors.length > 0 && (
                                  <p><strong>Co-Authors:</strong> {pub.coAuthors.map(author =>
                                    `${author.name}${author.affiliation ? ` (${author.affiliation})` : ''}`
                                  ).join(', ')}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {researchData.grants && researchData.grants.length > 0 && (
                        <>
                          {researchData.grants.map((grant, index) => (
                            <div key={index} className="review-item">
                              <h4>{grant.title} ({grant.type})</h4>
                              <div className="review-item-details">
                                {grant.client && <p><strong>Client:</strong> {grant.client}</p>}
                                {grant.role && <p><strong>Role:</strong> {grant.role}</p>}
                                {grant.totalAmount && <p><strong>Total:</strong> ${grant.totalAmount}</p>}
                                {grant.yourShare && <p><strong>Your Share:</strong> ${grant.yourShare}</p>}
                                {grant.startDate && grant.endDate && (
                                  <p>
                                    <strong>Period:</strong> {new Date(grant.startDate).toLocaleDateString()} to {new Date(grant.endDate).toLocaleDateString()}
                                  </p>
                                )}
                                {grant.coPIs && grant.coPIs.length > 0 && (
                                  <p><strong>Co-PIs:</strong> {grant.coPIs.map(pi => pi.name).join(', ')}</p>
                                )}
                                {grant.notes && <p className="wrap-text"><strong>Notes:</strong> {grant.notes}</p>}
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {researchData.conferences && researchData.conferences.length > 0 && (
                        <>
                          {researchData.conferences.map((conf, index) => (
                            <div key={index} className="review-item">
                              <h4>{conf.name}</h4>
                              <div className="review-item-details">
                                {conf.startDate && conf.endDate && (
                                  <p>
                                    <strong>Period:</strong> {new Date(conf.startDate).toLocaleDateString()} to {new Date(conf.endDate).toLocaleDateString()}
                                  </p>
                                )}
                                {conf.notes && <p className="wrap-text"><strong>Notes:</strong> {conf.notes}</p>}
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {(!researchData.publications || researchData.publications.length === 0) &&
                        (!researchData.grants || researchData.grants.length === 0) &&
                        (!researchData.conferences || researchData.conferences.length === 0) && (
                          <p className="no-data-message">No research details available</p>
                        )}
                    </div>
                  ) : (
                    <p className="no-data-message">No research data available</p>
                  )}
                </div>

                {/* Service Section */}
                <div className="review-section service-section">
                  <h3 className="review-section-title">Service</h3>
                  {serviceData && serviceData.length > 0 ? (
                    <div className="review-section-content">
                      {serviceData.map((service, index) => (
                        <div key={index} className="review-item">
                          <h4>{service.type}</h4>
                          {service.type === 'Thesis / Dissertation Committee' 
                            ? renderThesisCommitteeContent(service) 
                            : renderStandardServiceContent(service)
                          }
                        </div>
                      ))}

                      {reportData?.serviceNotes && (
                        <div className="section-notes">
                          <h4>Service Section Notes:</h4>
                          <p className="wrap-text">{reportData.serviceNotes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="review-section-content">
                      <p className="no-data-message">No service data available</p>
                    </div>
                  )}
                </div>

                {/* General Notes Section */}
                <div className="review-section notes-section">
                  <h3 className="review-section-title">General Notes</h3>
                  {reportData && reportData.notes ? (
                    <div className="review-section-content">
                      <div className="section-notes general-notes-content">
                        <p className="wrap-text">{reportData.notes}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="no-data-message">No general notes provided</p>
                  )}
                </div>

                {/* Admin Comments Section */}
                {reportData?.adminComments && reportData.adminComments.length > 0 && (
                  <div className="review-section admin-comments-section">
                    <h3 className="review-section-title">Administrative Comments</h3>
                    <div className="review-section-content">
                      {reportData.adminComments.map((comment, index) => (
                        <div key={index} className="admin-comment">
                          <div className="comment-header">
                            <strong>{comment.adminName}</strong>
                            <span className="comment-date">{formatDate(comment.date)}</span>
                            <span className={`comment-status ${comment.status}`}>
                              {comment.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="comment-text">{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-report-view-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 20px;
          width: 100%;
          box-sizing: border-box;
          min-height: 100vh;
          overflow-y: auto;
        }

        /* Ensure the main container has proper scrolling */
        .admin-report-content {
          max-height: none;
          overflow: visible;
        }

        /* Fix for the report card to not be constrained */
        .report-card {
          min-height: auto;
          max-height: none;
          overflow: visible;
        }

        .admin-report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #4B2E83;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 15px;
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
        }

        .back-button:hover {
          background-color: #e9ecef;
          transform: translateX(-2px);
        }

        .faculty-report-title h1 {
          color: #4B2E83;
          margin: 0;
          font-size: 28px;
          font-family: "Encode Sans", sans-serif;
        }

        .report-subtitle {
          color: #666;
          margin: 5px 0 0 0;
          font-size: 16px;
        }

        .report-status-badge {
          padding: 8px 16px;
          border-radius: 6px;
          color: white;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 12px;
        }

        .admin-actions-section {
          background-color: #f8f9fa;
          border-radius: 10px;
          padding: 25px;
          margin-bottom: 30px;
          border-left: 4px solid #4B2E83;
        }

        .status-update-container h3 {
          color: #4B2E83;
          margin: 0 0 15px 0;
          font-size: 18px;
        }

        .status-info {
          margin-bottom: 20px;
        }

        .status-info p {
          margin: 5px 0;
          color: #555;
        }

        .status-update-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .status-buttons {
          display: flex;
          gap: 15px;
        }

        .status-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .status-btn.reviewed {
          background-color: #9b59b6;
          color: white;
        }

        .status-btn.reviewed:hover {
          background-color: #8e44ad;
        }

        .status-btn.approved {
          background-color: #2ecc71;
          color: white;
        }

        .status-btn.approved:hover {
          background-color: #27ae60;
        }

        .status-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .status-comments {
          width: 100%;
          padding: 10px;
          border: 1px solid #d0d0d0;
          border-radius: 6px;
          font-family: "Encode Sans", sans-serif;
          resize: vertical;
        }

        .form-actions {
          display: flex;
          gap: 10px;
        }

        .faculty-details {
          margin-top: 10px;
          font-size: 14px;
          color: #666;
        }

        .faculty-details p {
          margin: 2px 0;
        }

        .admin-comments-section {
          border-top: 2px solid #e0e0e0;
          margin-top: 30px;
          padding-top: 20px;
        }

        .admin-comment {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 6px;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .comment-date {
          color: #666;
          font-size: 12px;
        }

        .comment-status {
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: bold;
          color: white;
        }

        .comment-status.reviewed {
          background-color: #9b59b6;
        }

        .comment-status.approved {
          background-color: #2ecc71;
        }

        .comment-text {
          margin: 0;
          line-height: 1.5;
          color: #333;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .admin-report-header {
            flex-direction: column;
            gap: 20px;
          }

          .header-right {
            align-self: stretch;
            justify-content: space-between;
          }

          .status-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
};

export default AdminFacultyReportView;