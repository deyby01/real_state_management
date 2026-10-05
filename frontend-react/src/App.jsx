import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  // Estado para controlar qué vista se muestra ('login' o 'register')
  const [currentView, setCurrentView] = useState('login');

  return (
    <>
      <Header />
      
      {/* Renderizado condicional: Muestra Login o Register según el estado */}
      {currentView === 'login' ? (
        <LoginPage onSwitchToRegister={() => setCurrentView('register')} />
      ) : (
        <RegisterPage onSwitchToLogin={() => setCurrentView('login')} />
      )}

      <Footer />
    </>
  );
}

export default App;