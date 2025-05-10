import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Create a pre-configured axios instance with timeout
const api = axios.create({
  baseURL: 'https://raiseyouryar-3.onrender.com/api',
  timeout: 15000, // 15 second timeout to prevent hanging requests
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Memoized function to setup auth headers
  const setupAuthHeaders = useCallback((token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Keep for backward compatibility
    }
  }, []);

  // Check if user is logged in on page load - with optimized error handling
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsedUserInfo = JSON.parse(userInfo);
        setCurrentUser(parsedUserInfo);
        setupAuthHeaders(parsedUserInfo.token);
        
        // Validate token silently in background (optional)
        api.get('/auth/validate-token')
          .catch(() => {
            // If token is invalid, we'll keep the user logged in anyway
            // and let the proper API call fail later with proper error handling
          });
      } catch (error) {
        console.error('Error parsing user info:', error);
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, [setupAuthHeaders]);

  // Login function - optimized
  const login = async (email, password) => {
    try {
      // Start loading immediately to give visual feedback
      const response = await api.post('/auth/login', { email, password });
      const userData = response.data;
      
      // Process login data and store
      localStorage.setItem('userInfo', JSON.stringify(userData));
      setupAuthHeaders(userData.token);
      setCurrentUser(userData);
      
      return userData;
    } catch (error) {
      console.error('Login error:', error.response || error);
      throw new Error(error.response?.data?.message || 'Invalid login credentials');
    }
  };

  // Signup function - modified to not automatically login
  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      // Return the response data but don't set current user or store in localStorage
      return response.data;
    } catch (error) {
      console.error('Signup error:', error.response || error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  // Logout function - optimized
  const logout = () => {
    localStorage.removeItem('userInfo');
    delete api.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['Authorization']; // Keep for backward compatibility
    setCurrentUser(null);
  };

  // Context value is memoized to prevent unnecessary re-renders
  const contextValue = {
    currentUser,
    login,
    signup,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;