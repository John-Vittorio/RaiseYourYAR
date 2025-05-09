import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../images/logo.svg';

const Signup = () => {
  const [formData, setFormData] = useState({
    netID: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'faculty' // Default role
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  const { signup, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Redirect if user is already logged in or signup was successful
  useEffect(() => {
    if (currentUser && !loading && submitAttempted) {
      navigate('/login');
    }
  }, [currentUser, loading, navigate, submitAttempted]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    setSubmitAttempted(true);
    
    try {
      console.log('Signup attempt with:', { ...formData, password: '[HIDDEN]' });
      
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = formData;
      
      const result = await signup(userData);
      console.log('Signup successful:', result);
      
      // Explicitly navigate to login after successful signup
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-inner">
        <div className="auth-logo-container">
          <img src={logo} alt="Company Logo" className="auth-logo" />
        </div>
        
        <h1 className="auth-title">Create an Account</h1>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label htmlFor="netID" className="auth-form-label">NetID</label>
            <input
              type="text"
              id="netID"
              name="netID"
              value={formData.netID}
              onChange={handleChange}
              className="auth-form-input"
              placeholder="Enter your NetID"
              required
            />
          </div>
          
          <div className="auth-form-group">
            <label htmlFor="name" className="auth-form-label">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="auth-form-input"
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div className="auth-form-group">
            <label htmlFor="email" className="auth-form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="auth-form-input"
              placeholder="your.email@uw.edu"
              required
            />
          </div>
          
          <div className="auth-form-group">
            <label htmlFor="password" className="auth-form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="auth-form-input"
              placeholder="Create a password"
              required
            />
          </div>
          
          <div className="auth-form-group">
            <label htmlFor="confirmPassword" className="auth-form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="auth-form-input"
              placeholder="Confirm your password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Already have an account? <Link to="/login" className="auth-link">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;