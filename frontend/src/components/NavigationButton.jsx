import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// This component is a replacement for the standard navigation buttons
// with built-in fixes to ensure proper navigation between YAR sections
const NavigationButton = ({ 
  onClick, 
  children, 
  disabled = false, 
  isNext = false, 
  targetSection = null,
  className = '',
  directPath = null, // Added direct path parameter for explicit navigation
  ...props 
}) => {
  const [clicked, setClicked] = useState(false);
  const [delayComplete, setDelayComplete] = useState(false);
  const navigate = useNavigate(); // Add navigate hook to allow direct navigation
  
  // Standard button class based on type
  const buttonClass = isNext ? 'yar-button-next' : 'yar-button-secondary';
  
  // Combine provided className with standard button class
  const combinedClassName = `${buttonClass} ${className}`.trim();

  // Handle click with built-in safeguards
  const handleClick = (e) => {
    if (disabled || clicked) return;
    
    // Set clicked state to prevent multiple clicks
    setClicked(true);
    
    // Add debug information
    if (targetSection) {
      console.log(`NavigationButton: Navigating to ${targetSection}`);
    }
    
    // Force the UI to update before proceeding
    setTimeout(() => {
      // Mark delay as complete
      setDelayComplete(true);
      
      // If directPath is provided, navigate directly to that path
      if (directPath) {
        console.log(`NavigationButton: Direct navigation to path: ${directPath}`);
        navigate(directPath);
      } 
      // Otherwise call the provided onClick handler
      else if (onClick) {
        onClick(e);
      }
      
      // Reset clicked state after navigation has occurred
      setTimeout(() => {
        setClicked(false);
        setDelayComplete(false);
      }, 500);
    }, 50);
  };
  
  // Add visual indicator that navigation is happening
  useEffect(() => {
    return () => {
      // Cleanup any timers if component unmounts
      setClicked(false);
      setDelayComplete(false);
    };
  }, []);
  
  // Determine button text based on state
  const buttonText = clicked ? 
    (isNext ? 'Previous' : 'Next') : 
    children;
  
  return (
    <button
      className={combinedClassName}
      onClick={handleClick}
      disabled={disabled || clicked}
      data-section-target={targetSection}
      {...props}
    >
      {buttonText}
      
      <style jsx>{`
        .${buttonClass} {
          position: relative;
          overflow: hidden;
        }
        
        .${buttonClass}:after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
          transition: all 0.3s ease;
        }
        
        .${buttonClass}:hover:not(:disabled):after {
          left: 100%;
        }
        
        .${buttonClass}:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .${buttonClass}:focus {
          outline: 2px solid rgba(75, 46, 131, 0.5);
          outline-offset: 2px;
        }
      `}</style>
    </button>
  );
};

export default NavigationButton;