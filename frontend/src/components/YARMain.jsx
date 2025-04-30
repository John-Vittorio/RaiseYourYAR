import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import YARArchive from './YARArchive';
import TeachingForm from './TeachingForm';
import ResearchForm from './ResearchForm';
import ServiceForm from './ServiceForm';
import ReportReview from './ReportReview'; // Import our new component

const YARMain = () => {
  // State to track the current view and active report
  const [currentView, setCurrentView] = useState('main'); // main, teaching, research, service, review
  const [activeReport, setActiveReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false); // Track successful submission
  
  const { currentUser } = useContext(AuthContext);

  // Function to create a new report
  const createNewReport = async () => {
    try {
      setLoading(true);
      setError('');
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        }
      };
      
      // const { data } = await axios.post(
      //   'https://raiseyouryar-3.onrender.com/api/reports',
      //   { academicYear: getCurrentAcademicYear() },
      //   config
      // );

      const { data } = await axios.post(
        'http://localhost:5001/api/reports',
        { academicYear: getCurrentAcademicYear() },
        config
      );
      
      setActiveReport(data);
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create report');
      console.error('Error creating report:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine current academic year
  const getCurrentAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // If it's after September, then the academic year is current year to next year
    if (month >= 8) {
      return `${year}-${year + 1}`;
    }
    // If it's before September, then the academic year is previous year to current year
    return `${year - 1}-${year}`;
  };

  // handle starting a new YAR
  const handleStartYAR = async () => {
    const report = await createNewReport();
    if (report) {
      setCurrentView('teaching');
    }
  };

  // navigate to the next section
  const handleNext = (currentSection) => {
    switch (currentSection) {
      case 'teaching':
        setCurrentView('research');
        break;
      case 'research':
        setCurrentView('service');
        break;
      case 'service':
        // Instead of submitting, now go to review
        setCurrentView('review');
        break;
      default:
        setCurrentView('main');
    }
  };

  // Handle successful report submission
  const handleReportSubmitted = () => {
    setSubmitSuccess(true);
    setActiveReport(null);
    
    // Return to main view after a short delay to show success message
    setTimeout(() => {
      setCurrentView('main');
      setSubmitSuccess(false);
    }, 3000);
  };

  // navigate to the previous section
  const handlePrevious = (currentSection) => {
    switch (currentSection) {
      case 'research':
        setCurrentView('teaching');
        break;
      case 'service':
        setCurrentView('research');
        break;
      case 'review':
        setCurrentView('service');
        break;
      default:
        setCurrentView('main');
    }
  };

  const renderView = () => {
    if (loading) {
      return <div className="loading">Loading...</div>;
    }

    if (error) {
      return <div className="error">{error}</div>;
    }

    // Show success message after submission
    if (submitSuccess) {
      return (
        <div className="success-container">
          <div className="success-message-large">
            <h2>Report Submitted Successfully!</h2>
            <p>Your yearly activity report has been submitted for review.</p>
            <p>Redirecting to main page...</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'main':
        return <YARArchive onStart={handleStartYAR} />;
      case 'teaching':
        return (
          <TeachingForm 
            onNext={() => handleNext('teaching')} 
            reportId={activeReport?._id} 
          />
        );
      case 'research':
        return (
          <ResearchForm
            onNext={() => handleNext('research')}
            onPrevious={() => handlePrevious('research')}
            reportId={activeReport?._id}
          />
        );
      case 'service':
        return (
          <ServiceForm
            onNext={() => handleNext('service')}
            onPrevious={() => handlePrevious('service')}
            reportId={activeReport?._id}
          />
        );
      case 'review':
        return (
          <ReportReview
            reportId={activeReport?._id}
            onSubmit={handleReportSubmitted}
            onPrevious={() => handlePrevious('review')}
          />
        );
      default:
        return <div>Invalid view state</div>;
    }
  };

  return (
    <>
      {renderView()}
      
      <style jsx>{`
        .success-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 50vh;
          padding: 30px;
        }
        
        .success-message-large {
          background-color: rgba(76, 175, 80, 0.1);
          border-left: 4px solid #4CAF50;
          color: #2e7d32;
          padding: 30px;
          border-radius: 8px;
          text-align: center;
          max-width: 600px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .success-message-large h2 {
          margin-top: 0;
          color: #2e7d32;
        }
      `}</style>
    </>
  );
};

export default YARMain;