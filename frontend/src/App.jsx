import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, FacultyRoute } from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Visualization from './components/Visualization';
import YARMain from './components/YARMain';
import PrivacyStatement from './components/PrivacyStatement';
import ReportViewPage from './components/ReportViewPage';
import Login from './components/Login';
import Signup from './components/Signup';
import './css/style.css';
import './css/auth-styles.css';
import './css/report-cards.css';

// Import YAR components for preloading
import { 
  TeachingForm, 
  ResearchForm, 
  ServiceForm, 
  GeneralNotesForm,
  ReportReview,
  YARNavigationHelper
} from './components/YAR';

// This component preloads all YAR components to prevent navigation issues
const YARPreload = () => {
  useEffect(() => {
    // Initialize navigation fixes
    YARNavigationHelper.fixNavigationIssues();
    
    // Add global navigation debug handler
    window.addEventListener('click', (e) => {
      // Look for navigation buttons
      if (e.target.closest('.yar-button-next') || e.target.closest('.yar-button-secondary')) {
        console.log('Navigation button clicked:', e.target.textContent.trim());
      }
    });
    
    return () => {
      // Clean up event listener
      window.removeEventListener('click', () => {});
    };
  }, []);
  
  return null; // This component doesn't render anything
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        {/* Preload YAR components */}
        <YARPreload />
        
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes that require authentication */}
          <Route element={<ProtectedRoute />}>
            {/* Admin-only routes */}
            <Route element={<AdminRoute />}>
              <Route path="/" element={
                <>
                  <Navigation />
                  <Visualization />
                </>
              } />
              <Route path="/faculty" element={
                <>
                  <Navigation />
                  <div className="content-area">Faculty Content</div>
                </>
              } />
            </Route>

            {/* Routes for both admin and faculty */}
            <Route element={<FacultyRoute />}>
              <Route path="/yar" element={
                <>
                  <Navigation />
                  <YARMain />
                </>
              } />
              <Route path="/privacy" element={
                <>
                  <Navigation />
                  <PrivacyStatement />
                </>
              } />
              
              {/* Route to view individual reports */}
              <Route path="/report/:reportId" element={<ReportViewPage />} />
              
              {/* Default route for faculty users */}
              <Route index element={
                <>
                  <Navigation />
                  <YARMain />
                </>
              } />
            </Route>
          </Route>
          
          {/* Catch-all redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
      
      <style jsx global>{`
        /* Critical CSS fixes for YAR navigation */
        .yar-button-next {
          z-index: 10;
          position: relative;
        }
        
        .teaching-breadcrumb,
        .resume-notification {
          pointer-events: none !important;
        }
        
        .resume-notification button {
          pointer-events: all !important;
        }
        
        /* Fix for content visibility */
        .teaching-container {
          z-index: 1;
          position: relative;
        }
      `}</style>
    </AuthProvider>
  );
}

export default App;