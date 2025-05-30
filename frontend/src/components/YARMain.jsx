import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import YARArchive from './YARArchive';
import TeachingForm from './TeachingForm';
import ResearchForm from './ResearchForm';
import ServiceForm from './ServiceForm';
import GeneralNotesForm from './GeneralNotesForm';
import ReportReview from './ReportReview';

// Form sections in sequence
const FORM_SECTIONS = ['main', 'teaching', 'research', 'service', 'generalNotes', 'review'];

const YARMain = () => {
  // State to track the current view and active report
  const [currentView, setCurrentView] = useState('main'); // main, teaching, research, service, generalNotes, review
  const [activeReport, setActiveReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false); // Track successful submission

  const { currentUser } = useContext(AuthContext);

  // Debug logging for view changes
  useEffect(() => {
    console.log("Current view changed to:", currentView);
  }, [currentView]);

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

      const { data } = await axios.post(
        'https://raiseyouryar-j59c.onrender.com/api/reports',
        { academicYear: getCurrentAcademicYear() },
        config
      );

      // const { data } = await axios.post(
      //   'http://localhost:5001/api/reports',
      //   { academicYear: getCurrentAcademicYear() },
      //   config
      // );

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

  // New function to load existing report for editing
  const loadExistingReport = async (reportId) => {
    try {
      setLoading(true);
      setError('');

      const config = {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      };

      const { data } = await axios.get(
        `https://raiseyouryar-j59c.onrender.com/api/reports/${reportId}`,
        config
      );

      // const { data } = await axios.get(
      //   `http://localhost:5001/api/reports/${reportId}`,
      //   config
      // );

      setActiveReport(data);
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load report');
      console.error('Error loading report:', error);
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
      console.log("Moving to teaching view after creating new report");
      setCurrentView('teaching');
    }
  };

  // handle editing an existing draft
  const handleEditDraft = async (reportId) => {
    const report = await loadExistingReport(reportId);
    if (report) {
      console.log("Moving to teaching view after loading draft report");
      setCurrentView('teaching');
    }
  };

  // Move to the next section in sequence
  const handleNext = (currentSectionName) => {
    console.log("handleNext called with current section:", currentSectionName);

    // Find the index of the current section
    const currentIndex = FORM_SECTIONS.indexOf(currentSectionName);

    if (currentIndex !== -1 && currentIndex < FORM_SECTIONS.length - 1) {
      const nextSection = FORM_SECTIONS[currentIndex + 1];
      console.log(`Moving from ${currentSectionName} to ${nextSection}`);

      // Force a state update with setTimeout to ensure React registers the change
      setTimeout(() => {
        setCurrentView(nextSection);
      }, 10);
    } else {
      console.error(`Invalid navigation from ${currentSectionName}`);
    }
  };

  // Move to the previous section in sequence
  const handlePrevious = (currentSectionName) => {
    // Find the index of the current section
    const currentIndex = FORM_SECTIONS.indexOf(currentSectionName);

    if (currentIndex > 1) { // Don't go back before teaching
      const prevSection = FORM_SECTIONS[currentIndex - 1];
      console.log(`Moving from ${currentSectionName} to ${prevSection}`);
      setCurrentView(prevSection);
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

  // Render the appropriate component based on the current view
  const renderView = () => {
    console.log("Rendering view:", currentView);

    if (loading) {
      return <div className="loading">Loading...</div>;
    }

    if (error) {
      return <div className="error-message">{error}</div>;
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

    const handleBackToMain = () => {
      console.log("Returning to main view and clearing active report");
      setActiveReport(null);
      setCurrentView('main');
    };

    // Render the appropriate component based on currentView
    switch (currentView) {
      case 'main':
        return <YARArchive
          onStart={handleStartYAR}
          onEditDraft={handleEditDraft}
        />;
      case 'teaching':
        return (
          <TeachingForm
            onNext={() => handleNext('teaching')}
            onPrevious={handleBackToMain}
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
      case 'generalNotes':
        return (
          <GeneralNotesForm
            onNext={() => handleNext('generalNotes')}
            onPrevious={() => handlePrevious('generalNotes')}
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
        console.error("Invalid view state:", currentView);
        return <div>Invalid view state: {currentView}</div>;
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