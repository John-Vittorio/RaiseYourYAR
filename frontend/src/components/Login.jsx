import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../images/logo.svg';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Redirect immediately if user is already logged in
  useEffect(() => {
    if (currentUser) {
      // Navigate based on user role - immediate redirect without waiting for login to complete
      navigate(currentUser.role === 'admin' ? '/' : '/yar');
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Remove error message as soon as user starts typing
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
    setIsSubmitting(true);
    
    try {
      // Optimistic UI update - we'll set a loading state but continue with UI interaction
      await login(formData.email, formData.password);
      // Login successful - navigation will be handled by useEffect
    } catch (error) {
      setError(error.message || 'Failed to login. Please try again.');
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
        
        <h1 className="auth-title">Login to Your Account</h1>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
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
              placeholder="Enter your password"
              required
              disabled={isSubmitting}
              autoComplete="current-password"
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
                Logging in...
              </>
            ) : 'Login'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
          </p>
          <p>
            <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;