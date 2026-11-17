import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SocialButton from "../components/Login/SocialButton";
import InputField from "../components/Login/InputField";
import backgroundImage from "../assets/login-bg.avif"; // Asegúrate de usar tu imagen de fondo

/**
 * Login page. Sends the credentials through useAuth().login and, on success,
 * goes back to the page RutaProtegida sent the user from (state.desde), or to
 * the panel. Errors show the API message ("Credenciales inválidas").
 */
function LoginPage() {
    const { usuario, login } = useAuth();
    const navegar = useNavigate();
    const ubicacion = useLocation();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);

    // Where to go after logging in: the protected page that sent us here, or the panel
    const destino = ubicacion.state?.desde?.pathname ?? "/panel";

    // One handler for every field: the input's name says which key to update
    const cambiarCampo = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const enviar = async (e) => {
        e.preventDefault();
        setError("");
        setEnviando(true);
        try {
            await login(form.email, form.password);
            navegar(destino, { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setEnviando(false);
        }
    };

    // Already logged in (e.g. typed /login by hand): nothing to do here
    if (usuario) return <Navigate to={destino} replace />;

    return (
        <main className="relative min-h-screen flex items-center justify-center px-4">
            {/* Imagen de fondo con desenfoque y opacidad */}
            <div 
                className="absolute inset-0 bg-cover bg-center blur-sm opacity-50 z-0"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            ></div>

            {/* Tarjeta blanca semitransparente flotante */}
            <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-md px-8 py-10 rounded-2xl shadow-xl">
                {/* Título principal */}
                <h1 className="text-4xl font-semibold text-gray-900">Iniciar sesión</h1>
                <p className="text-sm text-gray-600 mt-1">Accede a tu panel de gestión inmobiliaria</p>
                
                <div className="w-12 h-1 bg-green-600 mt-2 mb-6 rounded-full"></div>

                {/* Botones sociales */}
                <div className="mt-8">
                    <SocialButton 
                        icon={
                            <i className="fa-brands fa-google text-lg"></i>
                        } 
                        text="Continuar con Google" 
                    />
                    
                    <SocialButton 
                        icon={
                            <i className="fa-brands fa-apple text-lg"></i>
                        } 
                        text="Continuar con Apple" 
                    />
                </div>

                {/* Divisor "o" con líneas */}
                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="px-4 text-sm text-gray-500 uppercase">o</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* Campos del formulario */}
                <form onSubmit={enviar}>
                    {error && (
                        <p role="alert" className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-danger text-sm">
                            {error}
                        </p>
                    )}
                    <InputField 
                        label="Correo electrónico" 
                        type="email" 
                        name="email"
                        value={form.email}
                        onChange={cambiarCampo}
                        autoComplete="email"
                        required
                        placeholder="correo@ejemplo.com" 
                    />
                    <InputField 
                        label="Contraseña" 
                        type="password" 
                        name="password"
                        value={form.password}
                        onChange={cambiarCampo}
                        autoComplete="current-password"
                        required
                        placeholder="Introduce tu contraseña" 
                    />

                    {/* Recuperar contraseña y Recuérdame */}
                    <div className="flex items-center justify-between my-4 text-sm">
                        <a href="#" className="text-gray-600 hover:underline">
                            ¿Olvidaste tu contraseña?
                        </a>
                        <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                            <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500" 
                            />
                            Recuérdame
                        </label>
                    </div>

                    {/* Botón principal de Iniciar Sesión */}
                    <button 
                        type="submit"
                        disabled={enviando}
                        className="w-full py-3 px-4 bg-gray-900 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-60 disabled:cursor-wait"
                    >
                        {enviando ? "Ingresando..." : "Iniciar sesión"}
                    </button>
                </form>

                {/* Texto inferior para ir al Registro */}
                <p className="mt-6 text-sm text-center text-gray-600">
                    ¿No tienes una cuenta?{" "}
                    <Link to="/registro" className="text-green-600 font-medium underline">
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </main>
    );
}

export default LoginPage;