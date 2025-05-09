import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navigation from './Navigation';
import ReportReview from './ReportReview';

const ReportViewPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = React.useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Verify we have a valid report ID
    if (!reportId) {
      setError('No report ID provided');
      return;
    }
    setLoading(false);
  }, [reportId]);

  // Handle navigation back to main page
  const handleBackToMain = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="loading">Loading report...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="error-message">
          {error}
          <button 
            onClick={handleBackToMain} 
            className="yar-button-secondary"
          >
            Back to Main Page
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="report-view-container">
        <div className="report-view-header">
          <button
            onClick={handleBackToMain}
            className="yar-button-secondary back-button"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Main
          </button>
        </div>
        
        <ReportReview
          reportId={reportId}
          readOnly={true}
        />
      </div>
    </>
  );
};

export default ReportViewPage;