import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on page reload
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    
    if (userInfo) {
      setCurrentUser(userInfo);
    }
    
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const { data } = await axios.post('https://raiseyouryar-3.onrender.com/api/auth/login', {
        email,
        password
      });
      
      // Save to localStorage
      localStorage.setItem('userInfo', JSON.stringify(data));
      setCurrentUser(data);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid login');
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      // const { data } = await axios.post('https://raiseyouryar-3.onrender.com/api/auth/register', userData);

      const { data } = await axios.post('https://raiseyouryar-3.onrender.com/api/auth/register', userData);
      
      // Save to localStorage
      localStorage.setItem('userInfo', JSON.stringify(data));
      setCurrentUser(data);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('userInfo');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};