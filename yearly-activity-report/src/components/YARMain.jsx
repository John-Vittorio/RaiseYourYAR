import React, { useState } from 'react';
import YARArchive from './YARArchive';
import YARForm from './YARForm';
import TeachingForm from './TeachingForm';

const YARMain = () => {
  // State to track the current view
  const [currentView, setCurrentView] = useState('main'); // main, form, teaching
  const [userData, setUserData] = useState({ netId: '', fullName: '' });

  // handle starting a new YAR
  const handleStartYAR = () => {
    setCurrentView('form');
  };

  // handle form submission
  const handleFormSubmit = (data) => {
    setUserData(data);
    setCurrentView('teaching');
  };

  // navigate to the next section
  const handleNext = (currentSection) => {
    if (currentSection === 'teaching') {
      setCurrentView('main'); // FOR NOW - RESEARCH ONCE IMPLEMENTED
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'main':
        return (
          <div className="visual-container" style={{ padding: '20px' }}>
            <YARArchive onStart={handleStartYAR} />
          </div>
        );
      case 'form':
        return <YARForm onSubmit={handleFormSubmit} />;
      case 'teaching':
        return <TeachingForm onNext={() => handleNext('teaching')} userData={userData} />;
      default:
        return <div>Invalid view state</div>;
    }
  };

  return <div>{renderView()}</div>;
};

export default YARMain;