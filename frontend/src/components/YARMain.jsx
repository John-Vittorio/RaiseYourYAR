import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import YARArchive from './YARArchive';
import TeachingForm from './TeachingForm';
import ResearchForm from './ResearchForm';
import ServiceForm from './ServiceForm';

const YARMain = () => {
  // State to track the current view and active report
  const [currentView, setCurrentView] = useState('main'); // main, teaching, research, service
  const [activeReport, setActiveReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
      
      const { data } = await axios.post(
        'https://raiseyouryar-3.onrender.com/api/reports',
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
        // Submit the report as complete
        handleSubmitReport();
        setCurrentView('main'); // Go back to main view after completing
        break;
      default:
        setCurrentView('main');
    }
  };

  // Submit the completed report
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
      
      await axios.put(
        `https://raiseyouryar-3.onrender.com/api/reports/${activeReport._id}`,
        { status: 'submitted' , facultyId: currentUser._id },
        config
      );

      // await axios.put(
      //   `http://localhost:5001/api/reports/${activeReport._id}`,
      //   { status: 'submitted' , facultyId: currentUser._id },
      //   config
      // );
      
      // Reset active report
      setActiveReport(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit report');
      console.error('Error submitting report:', error);
    } finally {
      setLoading(false);
    }
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
      default:
        return <div>Invalid view state</div>;
    }
  };

  return <>{renderView()}</>;
};

export default YARMain;