import SocialButton from "../components/SocialButton";
import InputField from "../components/InputField";
import backgroundImage from "../assets/login-bg.avif"; // Asegúrate de usar tu imagen de fondo

function LoginPage({ onSwitchToRegister }) {
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
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.15 21.32 7.23 24 12 24z"/>
                                <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.6H1.18C.43 8.11 0 9.8 0 12s.43 3.89 1.18 5.4l4.09-3.16z"/>
                                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.15 2.68 1.18 6.6l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
                            </svg>
                        } 
                        text="Continuar con Google" 
                    />
                    
                    <SocialButton 
                        icon={
                            <svg className="w-5 h-5 fill-current text-gray-900" viewBox="0 0 24 24">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.82 5.09c.64-.78 1.07-1.86.95-2.94-.94.04-2.08.63-2.74 1.41-.58.68-1.09 1.78-.95 2.84 1.05.08 2.12-.53 2.74-1.31z"/>
                            </svg>
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
                <form onSubmit={(e) => e.preventDefault()}>
                    <InputField 
                        label="Correo electrónico" 
                        type="email" 
                        placeholder="correo@ejemplo.com" 
                    />
                    <InputField 
                        label="Contraseña" 
                        type="password" 
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
                        className="w-full py-3 px-4 bg-gray-900 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-sm"
                    >
                        Iniciar sesión
                    </button>
                </form>

                {/* Texto inferior para ir al Registro */}
                <p className="mt-6 text-sm text-center text-gray-600">
                    ¿No tienes una cuenta?{" "}
                    <button 
                        type="button"
                        onClick={onSwitchToRegister}
                        className="text-green-600 font-medium underline cursor-pointer bg-transparent border-none p-0"
                    >
                        Regístrate aquí
                    </button>
                </p>
            </div>
        </main>
    );
}

export default LoginPage;