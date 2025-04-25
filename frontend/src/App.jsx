// App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, FacultyRoute } from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Visualization from './components/Visualization';
import YARMain from './components/YARMain';
import PrivacyStatement from './components/PrivacyStatement';
import Login from './components/Login';
import Signup from './components/Signup';
import './css/style.css';
import './css/auth-styles.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
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
    </AuthProvider>
  );
}

export default App;