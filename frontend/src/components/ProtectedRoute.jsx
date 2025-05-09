import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Loading component with subtle animation for better UX
const LoadingScreen = () => (
  <div className="loading">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

// Protected route for authenticated users - optimized
export const ProtectedRoute = () => {
  const { currentUser, loading } = useContext(AuthContext);

  // Show minimal loading indicator only if genuinely still loading
  if (loading) {
    return <LoadingScreen />;
  }

  // Quick redirect if not logged in
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

// Protected route for admin users - optimized
export const AdminRoute = () => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingScreen />;
  }

  // No user = redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Not admin = redirect to home
  if (currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Admin = show protected content
  return <Outlet />;
};

// Protected route for faculty (includes admins too) - optimized
export const FacultyRoute = () => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingScreen />;
  }

  // No user = redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check role - simplified condition
  const hasAccess = ['faculty', 'admin'].includes(currentUser.role);
  
  // Either show content or redirect
  return hasAccess ? <Outlet /> : <Navigate to="/login" replace />;
};