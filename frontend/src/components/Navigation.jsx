import logo from '../images/logo.svg';
import secondLogo from '../images/second-logo.svg';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  // Set activeItem based on current route
  const getCurrentView = () => {
    if (location.pathname.startsWith('/yar')) return 'yar';
    return 'dashboard'; // default to dashboard
  };

  const [activeItem, setActiveItem] = useState(getCurrentView());

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
              {/* SVG */}
              Dashboard
            </li>
            <li 
              onClick={() => handleNavClick('yar', '/yar')}
              className={activeItem === 'yar' ? 'active' : ''}
            >
              {/* SVG */}
              YAR
            </li>
            <li>
              {/* SVG */}
              Faculty
            </li>
            <hr />
            <li 
              onClick={() => handleNavClick('privacy', '/privacy')}
              className={activeItem === 'privacy' ? 'active' : ''}
            >
              {/* SVG */}
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
