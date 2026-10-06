import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PropertiesPage from "./pages/PropertiesPage";
import AboutUs from "./pages/AboutUs";
import ContactPage from "./pages/ContactPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/propiedades" element={<PropertiesPage />} />
        <Route path="/nosotros" element={<AboutUs />} />
        <Route path="/contacto" element={<ContactPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
