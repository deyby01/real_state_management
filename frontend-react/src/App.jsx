import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ContactPage from "./pages/ContactPage";
import AboutUs from "./pages/AboutUs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/nosotros" element={<AboutUs />} />
        <Route path="/contacto" element={<ContactPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
