import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Protected route for authenticated users
export const ProtectedRoute = () => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    // You could render a loading spinner here
    return <div className="loading">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Protected route for admin users
export const AdminRoute = () => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// Protected route for faculty (includes admins too)
export const FacultyRoute = () => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Both faculty and admin roles can access these routes
  if (currentUser.role === 'faculty' || currentUser.role === 'admin') {
    return <Outlet />;
  }

  // If for some reason there's an unrecognized role, redirect to login
  return <Navigate to="/login" replace />;
};