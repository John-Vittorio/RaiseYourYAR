import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../css/report-review-styles.css';
import PDFGenerator from './PDFGenerator';

const ReportReview = ({ reportId, onSubmit, onPrevious, readOnly = false }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // State for report data
  const [report, setReport] = useState(null);
  const [teaching, setTeaching] = useState(null);
  const [teachingSectionNotes, setTeachingSectionNotes] = useState('');
  const [research, setResearch] = useState(null);
  const [services, setServices] = useState([]);
  const [serviceSectionNotes, setServiceSectionNotes] = useState('');

  const { currentUser } = useContext(AuthContext);

  // Fetch all data on component mount
  useEffect(() => {
    if (reportId) {
      fetchAllData();
    }
  }, [reportId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');

      // Configure headers for API requests
      const config = {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      };

      // Fetch report details
      const reportResponse = await axios.get(
        `https://raiseyouryar-3.onrender.com/api/reports/${reportId}`,
        config
      );

      // Get service section notes from the report
      if (reportResponse.data && reportResponse.data.serviceNotes) {
        setServiceSectionNotes(reportResponse.data.serviceNotes);
      }

      // Get teaching notes from the report if available
      if (reportResponse.data && reportResponse.data.teachingNotes) {
        setTeachingSectionNotes(reportResponse.data.teachingNotes);
      }

      // Fetch teaching data
      let teachingData = null;
      try {
        const teachingResponse = await axios.get(
          `https://raiseyouryar-3.onrender.com/api/teaching/${reportId}`,
          config
        );

        teachingData = teachingResponse.data;

        // Get section notes from teaching data if it exists there
        if (teachingData && teachingData.sectionNotes && !teachingSectionNotes) {
          setTeachingSectionNotes(teachingData.sectionNotes);
        }
      } catch (teachingError) {
        console.log('No teaching data or error fetching teaching data:', teachingError);
      }

      // Fetch research data
      let researchData = null;
      try {
        const researchResponse = await axios.get(
          `https://raiseyouryar-3.onrender.com/api/research/${reportId}`,
          config
        );

        researchData = researchResponse.data;
      } catch (researchError) {
        console.log('No research data or error fetching research data:', researchError);
      }

      // Fetch service data
      let serviceData = [];
      try {
        const serviceResponse = await axios.get(
          `https://raiseyouryar-3.onrender.com/api/service/${reportId}`,
          config
        );

        serviceData = serviceResponse.data;
      } catch (serviceError) {
        console.log('No service data or error fetching service data:', serviceError);
      }

      // Update state with fetched data
      setReport(reportResponse.data);
      setTeaching(teachingData);
      setResearch(researchData);
      setServices(Array.isArray(serviceData) ? serviceData : []);

    } catch (error) {
      console.error('Error fetching report data:', error);
      setError(error.response?.data?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    try {
      setLoading(true);
      setError('');

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        }
      };

      // Update report status to submitted
      await axios.put(
        `https://raiseyouryar-3.onrender.com/api/reports/${reportId}`,
        { status: 'submitted' },
        config
      );

      setSuccessMessage('Report submitted successfully!');

      // Call onSubmit prop after successful submission
      if (onSubmit) {
        setTimeout(() => {
          onSubmit();
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit report');
      console.error('Error submitting report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading your report data...</div>;
  }

  return (
    <div className="teaching-container report-review-container">
      <div className="teaching-form-content">
        <div className="teaching-header report-review-header">
          <h1 className="yar-title">Yearly Activity Report</h1>
          {!readOnly && (
            <div className="teaching-breadcrumb">
              <span className="inactive">Start</span>
              <span className="separator">›</span>
              <span className="inactive">Teaching</span>
              <span className="separator">›</span>
              <span className="inactive">Research</span>
              <span className="separator">›</span>
              <span className="inactive">Service</span>
              <span className="separator">›</span>
              <span className="active">Review</span>
            </div>
          )}
          {report && (
            <div className="pdf-download-container">
              <PDFGenerator
                reportData={report}
                elementToConvert="reportContentForPDF"
              />
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div id="reportContentForPDF">
          <div className="course-card report-card">
            {currentUser && (
              <div className="faculty-name-section">
                <span>{currentUser.name}</span>
              </div>
            )}
            
            <h2 className="review-section-title">Report Summary</h2>
            {report && (
              <div className="report-meta">
                <p><strong>Academic Year:</strong> {report.academicYear}</p>
                <p><strong>Status:</strong> {report.status}</p>
                {report.notes && <p><strong>Notes:</strong> {report.notes}</p>}
              </div>
            )}

            <div className="review-section">
              <h3 className="review-section-title">Teaching</h3>
              {teaching && teaching.courses && teaching.courses.length > 0 ? (
                <div className="review-section-content">
                  {teaching.courses.map((course, index) => (
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
                          <p><strong>Adjusted Evaluation Score:</strong> {course.adjustedEvaluationScore}</p>
                        )}
                        <p><strong>Community Engaged:</strong> {course.commEngaged ? 'Yes' : 'No'}</p>
                        <p><strong>Updated Course:</strong> {course.updatedCourse ? 'Yes' : 'No'}</p>
                        {course.notes && <p><strong>Notes:</strong> {course.notes}</p>}
                      </div>
                    </div>
                  ))}
                  
                  {/* Display Teaching Section Notes if present */}
                  {teachingSectionNotes && (
                    <div className="section-notes">
                      <h4>Teaching Section Notes:</h4>
                      <p>{teachingSectionNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="no-data-message">No teaching data available</p>
              )}
            </div>

            <div className="review-section">
              <h3 className="review-section-title">Research</h3>
              {research ? (
                <div className="review-section-content">
                  {research.publications && research.publications.length > 0 && (
                    <div className="research-publications">
                      <h4>Publications</h4>
                      {research.publications.map((pub, index) => (
                        <div key={index} className="review-item">
                          <h5>{pub.title}</h5>
                          <div className="review-item-details">
                            <p><strong>Type:</strong> {pub.publicationType}</p>
                            <p><strong>Journal/Conference/Publisher:</strong> {pub.journalName}</p>
                            <p><strong>Publication Status:</strong> {pub.publicationStatus}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {research.grants && research.grants.length > 0 && (
                    <div className="research-grants">
                      <h4>Grants & Research Activities</h4>
                      {research.grants.map((grant, index) => (
                        <div key={index} className="review-item">
                          <h5>{grant.title} ({grant.type})</h5>
                          <div className="review-item-details">
                            {grant.client && <p><strong>Client/Sponsor:</strong> {grant.client}</p>}
                            {grant.role && <p><strong>Role:</strong> {grant.role}</p>}
                            {grant.totalAmount && <p><strong>Total Amount:</strong> ${grant.totalAmount}</p>}
                            {grant.yourShare && <p><strong>Your Share:</strong> ${grant.yourShare}</p>}
                            {grant.startDate && grant.endDate && (
                              <p>
                                <strong>Period:</strong> {new Date(grant.startDate).toLocaleDateString()} to {new Date(grant.endDate).toLocaleDateString()}
                              </p>
                            )}
                            {grant.coPIs && grant.coPIs.length > 0 && (
                              <div>
                                <p><strong>Co-PIs:</strong></p>
                                <ul>
                                  {grant.coPIs.map((coPI, i) => (
                                    <li key={i}>{coPI.name} {coPI.affiliation ? `(${coPI.affiliation})` : ''}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {grant.notes && <p><strong>Notes:</strong> {grant.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {research.conferences && research.conferences.length > 0 && (
                    <div className="research-conferences">
                      <h4>Conferences</h4>
                      {research.conferences.map((conf, index) => (
                        <div key={index} className="review-item">
                          <h5>{conf.name}</h5>
                          <div className="review-item-details">
                            {conf.startDate && conf.endDate && (
                              <p>
                                <strong>Period:</strong> {new Date(conf.startDate).toLocaleDateString()} to {new Date(conf.endDate).toLocaleDateString()}
                              </p>
                            )}
                            {conf.notes && <p><strong>Notes:</strong> {conf.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(!research.publications || research.publications.length === 0) &&
                    (!research.grants || research.grants.length === 0) &&
                    (!research.conferences || research.conferences.length === 0) && (
                      <p className="no-data-message">No research details available</p>
                    )}
                </div>
              ) : (
                <p className="no-data-message">No research data available</p>
              )}
            </div>

            <div className="review-section">
              <h3 className="review-section-title">Service</h3>
              {services && services.length > 0 ? (
                <div className="review-section-content">
                  {services.map((service, index) => (
                    <div key={index} className="review-item">
                      <h4>{service.type}</h4>
                      <div className="review-item-details">
                        {service.role && <p><strong>Role:</strong> {service.role}</p>}
                        {service.department && <p><strong>Department:</strong> {service.department}</p>}
                        {service.description && <p><strong>Description:</strong> {service.description}</p>}
                        {service.notes && <p><strong>Notes:</strong> {service.notes}</p>}
                      </div>
                    </div>
                  ))}
                  
                  {/* Display Service Section Notes if present */}
                  {serviceSectionNotes && (
                    <div className="section-notes">
                      <h4>Service Section Notes:</h4>
                      <p>{serviceSectionNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="no-data-message">No service data available</p>
              )}
            </div>
          </div>
        </div>

        {!readOnly && (
          <div className="navigation-buttons">
            <button
              onClick={onPrevious}
              className="yar-button-secondary"
              disabled={loading}
            >
              Previous
            </button>
            <button
              onClick={handleSubmitReport}
              className="yar-button-next submit-report-button"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportReview;