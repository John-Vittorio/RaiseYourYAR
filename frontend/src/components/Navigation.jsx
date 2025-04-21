import logo from '../images/logo.svg';
import secondLogo from '../images/second-logo.svg';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeItem, setActiveItem] = useState('dashboard');

  useEffect(() => {
    if (location.pathname.startsWith('/yar')) {
      setActiveItem('yar');
    } else if (location.pathname.startsWith('/privacy')) {
      setActiveItem('privacy');
    } else {
      setActiveItem('dashboard');
    }
  }, [location]);

  const handleNavClick = (view, path) => {
    setActiveItem(view);
    navigate(path);
  };

  return (
    <nav className="nav-bar">
      <div className="nav-content">
        <div>
          <img src={logo} alt="Company Logo" className="logo" />
          <ul>
            <li
              onClick={() => handleNavClick('dashboard', '/')}
              className={activeItem === 'dashboard' ? 'active' : ''}
            >
              <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="#5b5b5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              Dashboard
            </li>

            <li
              onClick={() => handleNavClick('yar', '/yar')}
              className={activeItem === 'yar' ? 'active' : ''}
            >
              <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="#5b5b5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V9l-7-7z" />
                <path d="M13 3v6h6" />
              </svg>
              YAR
            </li>

            <li>
              <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="#5b5b5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Faculty
            </li>

            <hr />

            <li
              onClick={() => handleNavClick('privacy', '/privacy')}
              className={activeItem === 'privacy' ? 'active' : ''}
            >
              <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="#5b5b5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Privacy Statement
            </li>
          </ul>
        </div>

        <div className="logo-container">
          <img src={secondLogo} alt="Second Logo" className="second-logo" />
        </div>
      </div>
    </nav>
  );
}
