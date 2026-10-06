<<<<<<< HEAD
import LandingPage from './pages/LandingPage';
=======
import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
>>>>>>> 65d68e7cf669ca5c107562060980b989b9af59d8

function App() {
  // Estado para controlar qué vista se muestra ('login' o 'register')
  const [currentView, setCurrentView] = useState('login');

  return (
    <>
<<<<<<< HEAD
        <LandingPage />
=======
      <Header />
      
      {/* Renderizado condicional: Muestra Login o Register según el estado */}
      {currentView === 'login' ? (
        <LoginPage onSwitchToRegister={() => setCurrentView('register')} />
      ) : (
        <RegisterPage onSwitchToLogin={() => setCurrentView('login')} />
      )}

      <Footer />
>>>>>>> 65d68e7cf669ca5c107562060980b989b9af59d8
    </>
  );
}

export default App;