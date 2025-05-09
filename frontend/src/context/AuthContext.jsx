import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on page reload
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsedUserInfo = JSON.parse(userInfo);
        setCurrentUser(parsedUserInfo);
        // Set axios default headers with token
        if (parsedUserInfo.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUserInfo.token}`;
        }
      } catch (error) {
        console.error('Error parsing user info:', error);
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      // Show what's happening in the console
      console.log('Logging in with:', { email });
      
      // Add loading indicator for debugging
      setLoading(true);
      
      const { data } = await axios.post('https://raiseyouryar-3.onrender.com/api/auth/login', {
        email,
        password
      });
      
      console.log('Login response:', data);
      
      // Save to localStorage
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      // Set auth header for future requests
      if (data.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }
      
      setCurrentUser(data);
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      console.error('Login error:', error.response || error);
      throw new Error(error.response?.data?.message || 'Invalid login credentials or server error');
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      // Show what's happening in the console
      console.log('Signing up with:', { ...userData, password: '[HIDDEN]' });
      
      // Add loading indicator for debugging
      setLoading(true);
      
      const { data } = await axios.post('https://raiseyouryar-3.onrender.com/api/auth/register', userData);
      
      console.log('Signup response:', data);
      
      // Save to localStorage - only if the API returns user data
      // Some APIs don't return user data on signup and require a separate login
      if (data.token) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        
        // Set auth header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        setCurrentUser(data);
      }
      
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      console.error('Signup error:', error.response || error);
      throw new Error(error.response?.data?.message || 'Registration failed: ' + (error.message || 'Unknown error'));
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('userInfo');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;