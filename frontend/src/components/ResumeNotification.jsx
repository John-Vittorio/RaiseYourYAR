import React, { useState, useEffect } from 'react';

const ResumeNotification = ({ reportId }) => {
  const [visible, setVisible] = useState(true);

  // Auto-hide notification after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 6000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="resume-notification">
      <div className="resume-notification-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      </div>
      <div className="resume-notification-content">
        <h4>Resuming Draft Report</h4>
        <p>You're continuing your previously saved work. All your data has been loaded.</p>
      </div>
      <button 
        className="resume-notification-close" 
        onClick={() => setVisible(false)}
        aria-label="Close notification"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      <style jsx>{`
        .resume-notification {
          background-color: #fff3cd;
          border-left: 4px solid #f39c12;
          margin-bottom: 20px;
          padding: 15px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          position: relative;
          max-width: 1000px;
          margin-left: auto;
          margin-right: auto;
          animation: slideDown 0.5s ease-in-out;
          z-index: 10;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .resume-notification-icon {
          margin-right: 15px;
          padding: 8px;
          border-radius: 50%;
          background-color: rgba(243, 156, 18, 0.2);
          color: #f39c12;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .resume-notification-content {
          flex: 1;
        }
        
        .resume-notification-content h4 {
          margin: 0 0 5px 0;
          color: #8a5a00;
          font-size: 16px;
        }
        
        .resume-notification-content p {
          margin: 0;
          color: #644405;
          font-size: 14px;
        }
        
        .resume-notification-close {
          background: none;
          border: none;
          color: #8a5a00;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s ease;
        }
        
        .resume-notification-close:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default ResumeNotification;