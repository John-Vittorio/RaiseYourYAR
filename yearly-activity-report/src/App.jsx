import { useState } from 'react'
import Navigation from "./components/Navigation"
import Visualization from "./components/Visualization"
import YARMain from "./components/YARMain" // Import the YAR component

function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'yar'

  // Handler for navigation changes
  const handleNavigation = (view) => {
    setCurrentView(view);
  };

  return (
    <div className="App">
      <Navigation onNavigate={handleNavigation} />
      {currentView === 'dashboard' ? (
        <Visualization />
      ) : (
        <YARMain />
      )}
    </div>
  );
}

export default App