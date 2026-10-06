import LandingPage from './pages/LandingPage';
import PropertiesPage from './pages/PropertiesPage';

function App() {
  return window.location.pathname === '/properties'
    ? <PropertiesPage />
    : <LandingPage />
}

export default App
