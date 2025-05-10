import React, { useState, useContext } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Clear error when user starts typing
    if (error) setError('');
    
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Already submitting? Prevent double submission
    if (isSubmitting) return;
    
    // Clear previous errors
    setError('');
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setIsSubmitting(true);
    
    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...userData } = formData;
      
      await signup(userData);
      
      // Immediately redirect to login after successful signup
      navigate('/login');
    } catch (error) {
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
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
              disabled={isSubmitting}
              autoComplete="username"
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
              disabled={isSubmitting}
              autoComplete="name"
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
              disabled={isSubmitting}
              autoComplete="email"
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
              disabled={isSubmitting}
              autoComplete="new-password"
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
              disabled={isSubmitting}
              autoComplete="new-password"
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-icon"></span>
                Creating Account...
              </>
            ) : 'Sign Up'}
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