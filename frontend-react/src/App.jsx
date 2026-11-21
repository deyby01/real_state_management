import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PropertiesPage from "./pages/PropertiesPage";
import DetallePropiedadPage from "./pages/DetallePropiedadPage";
import AboutUs from "./pages/AboutUs";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RutaProtegida from "./components/RutaProtegida";
import PanelLayout from "./layouts/PanelLayout";
import PanelInicio from "./pages/panel/PanelInicio";
import EnConstruccion from "./pages/panel/EnConstruccion";
import PropiedadesPanel from "./pages/panel/PropiedadesPanel";
import MisPropiedades from "./pages/panel/MisPropiedades";
import SolicitudesPanel from "./pages/panel/SolicitudesPanel";
import MisSolicitudes from "./pages/panel/MisSolicitudes";
import BitacoraPanel from "./pages/panel/BitacoraPanel";
import MiPerfil from "./pages/panel/MiPerfil";
import ClientesPanel from "./pages/panel/ClientesPanel";
import PropietariosPanel from "./pages/panel/PropietariosPanel";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/propiedades" element={<PropertiesPage />} />
        <Route path="/propiedades/:id" element={<DetallePropiedadPage />} />
        <Route path="/nosotros" element={<AboutUs />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        {/* Panel: any logged-in user; each group below adds its role check.
            Add your page's <Route> inside your role's group (see menuPanel.js). */}
        <Route element={<RutaProtegida />}>
          <Route path="/panel" element={<PanelLayout />}>
            <Route index element={<PanelInicio />} />
            <Route path="perfil" element={<MiPerfil />} />

            <Route element={<RutaProtegida roles={["ADMIN"]} />}>
              <Route path="bitacora" element={<BitacoraPanel />} />
            </Route>

            <Route element={<RutaProtegida roles={["EJECUTIVO"]} />}>
              <Route path="propiedades" element={<PropiedadesPanel />} />
              <Route path="clientes" element={<ClientesPanel />} />
              <Route path="propietarios" element={<PropietariosPanel />} />
              <Route path="solicitudes" element={<SolicitudesPanel />} />
            </Route>

            <Route element={<RutaProtegida roles={["PROPIETARIO"]} />}>
              <Route path="mis-propiedades" element={<MisPropiedades />} />
            </Route>

            <Route element={<RutaProtegida roles={["CLIENTE"]} />}>
              <Route path="mis-solicitudes" element={<MisSolicitudes />} />
            </Route>

            <Route path="*" element={<EnConstruccion />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
