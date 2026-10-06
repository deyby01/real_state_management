import InputField from "../components/InputField";
import backgroundImage from "../assets/login-bg.avif"; // Asegúrate de usar tu imagen de fondo

function RegisterPage({ onSwitchToLogin }) {
    return (
        <main className="relative min-h-screen flex items-center justify-center px-4 py-12">
            {/* Imagen de fondo con desenfoque y opacidad */}
            <div 
                className="absolute inset-0 bg-cover bg-center blur-sm opacity-50 z-0"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            ></div>

            {/* Tarjeta flotante del formulario de registro */}
            <div className="relative z-10 w-full max-w-2xl bg-white/90 backdrop-blur-md px-8 py-10 rounded-2xl shadow-xl">
                {/* Título principal */}
                <h1 className="text-4xl font-semibold text-gray-900">Registro de Usuario</h1>
                <p className="text-sm text-gray-600 mt-1">Crea tu cuenta en la plataforma de gestión inmobiliaria</p>
                
                <div className="w-12 h-1 bg-green-600 mt-2 mb-6 rounded-full"></div>

                {/* Formulario de Registro en 2 columnas equilibradas (8 campos en total) */}
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField 
                            label="Nombre completo" 
                            type="text" 
                            placeholder="Ej. Juan Pérez" 
                        />
                        <InputField 
                            label="Correo electrónico" 
                            type="email" 
                            placeholder="correo@ejemplo.com" 
                        />
                        <InputField 
                            label="Teléfono de contacto" 
                            type="tel" 
                            placeholder="+56 9 ..." 
                        />
                        <InputField 
                            label="RUT / Identificación" 
                            type="text" 
                            placeholder="12.345.678-9" 
                        />
                        <InputField 
                            label="Ciudad" 
                            type="text" 
                            placeholder="Ej. Santiago" 
                        />
                        <InputField 
                            label="Comuna / Dirección" 
                            type="text" 
                            placeholder="Ej. Ñuñoa" 
                        />
                        <InputField 
                            label="Contraseña" 
                            type="password" 
                            placeholder="Crea una contraseña" 
                        />
                        <InputField 
                            label="Confirmar contraseña" 
                            type="password" 
                            placeholder="Repite tu contraseña" 
                        />
                    </div>

                    {/* Botón principal de Registro */}
                    <button 
                        type="submit"
                        className="w-full mt-6 py-3 px-4 bg-gray-900 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        <span>Completar Registro</span>
                        <span>→</span>
                    </button>
                </form>

                {/* Texto inferior para ir al Login */}
                <p className="mt-6 text-sm text-center text-gray-600">
                    ¿Ya tienes una cuenta?{" "}
                    <button 
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-green-600 font-medium underline cursor-pointer bg-transparent border-none p-0"
                    >
                        Iniciar sesión
                    </button>
                </p>
            </div>
        </main>
    );
}

export default RegisterPage;