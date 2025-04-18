import React, { useState } from 'react';
import YARArchive from './YARArchive';
import YARForm from './YARForm';
import TeachingForm from './TeachingForm';
import ResearchForm from './ResearchForm';
import ServiceForm from './ServiceForm';

const YARMain = () => {
  // State to track the current view
  const [currentView, setCurrentView] = useState('main'); // main, form, teaching, research, service
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
    switch(currentSection) {
      case 'teaching':
        setCurrentView('research');
        break;
      case 'research':
        setCurrentView('service');
        break;
      case 'service':
        setCurrentView('main'); // Go back to main view FOR NOW after completing
        break;
      default:
        setCurrentView('main');
    }
  };

  // navigate to the previous section
  const handlePrevious = (currentSection) => {
    switch(currentSection) {
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
    switch (currentView) {
      case 'main':
        return <YARArchive onStart={handleStartYAR} />;
      case 'form':
        return <YARForm onSubmit={handleFormSubmit} />;
      case 'teaching':
        return <TeachingForm onNext={() => handleNext('teaching')} userData={userData} />;
      case 'research':
        return <ResearchForm 
                 onNext={() => handleNext('research')} 
                 onPrevious={() => handlePrevious('research')} 
               />;
      case 'service':
        return <ServiceForm 
                 onNext={() => handleNext('service')} 
                 onPrevious={() => handlePrevious('service')} 
               />;
      default:
        return <div>Invalid view state</div>;
    }
  };

  return <>{renderView()}</>;
};

export default YARMain;