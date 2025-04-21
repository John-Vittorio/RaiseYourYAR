import Navigation from "./components/Navigation"
import Visualization from "./components/Visualization"
import YARMain from "./components/YARMain"
import PrivacyStatement from './components/PrivacyStatement'
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <Navigation />
      <Routes>
        <Route path="/" element={<Visualization />} />
        <Route path="/yar" element={<YARMain />} />
        <Route path="/privacy" element={<PrivacyStatement />} />
      </Routes>
    </div>
  );
}

export default App;
