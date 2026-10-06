import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Arreglo con las fotografías para el Slideshow de la cabecera
const fotosHero = [
    "/hero-background.jpg",
    "/casa1.jpg",
    "/casa2.jpg",
    "/departamento1.jpg"
];

// Arreglo con las Preguntas Frecuentes (FAQ)
const preguntasFrecuentes = [
    {
        pregunta: "¿Cuáles son los requisitos generales para arrendar una propiedad?",
        respuesta: "Los requisitos principales son: Cédula de identidad vigente, últimas 3 liquidaciones de sueldo (o acreditación de ingresos equivalentes al triple del valor del arriendo), certificado de cotizaciones previsionales y certificado comercial/DICOM al día."
    },
    {
        pregunta: "¿Cómo puedo publicar mi propiedad con Gestión Urbana Propiedades?",
        respuesta: "Puedes enviar un mensaje mediante nuestro formulario de contacto seleccionando la opción 'Quiero Publicar mi Propiedad'. Un ejecutivo comercial se comunicará contigo para realizar la tasación, tomar fotografías profesionales y coordinar la firma de la orden de arriendo."
    },
    {
        pregunta: "¿Qué servicios incluye la administración de arriendos?",
        respuesta: "Incluye la recaudación del canon mensual de arriendo, pago de gastos comunes y contribuciones, coordinación de mantenciones preventivas y reparaciones, supervisión de visitas y asesoría legal continua durante la vigencia del contrato."
    },
    {
        pregunta: "¿Cuánto tiempo demora la evaluación de una solicitud de arriendo?",
        respuesta: "Una vez presentados todos los antecedentes requeridos por el postulante, nuestro equipo realiza la evaluación comercial e informa el resultado en un plazo promedio de 24 a 48 horas hábiles."
    }
];

function ContactPage() {
    // ----------------------------------------------------------------------
    // ESTADOS (useState) PARA LA INTERACTIVIDAD DE LA PÁGINA
    // ----------------------------------------------------------------------
    
    // 1. Estado del Slideshow de fotos
    const [fotoActiva, setFotoActiva] = useState(0);

    // 2. Estado del Formulario de contacto
    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        telefono: "",
        asunto: "",
        mensaje: ""
    });

    // 3. Estado para el mensaje de respuesta del formulario (Éxito o Error)
    const [mensajeEstado, setMensajeEstado] = useState({ texto: "", tipo: "" });

    // 4. Estado para el Acordeón de Preguntas Frecuentes (índice abierto o null)
    const [faqAbierto, setFaqAbierto] = useState(null);

    // ----------------------------------------------------------------------
    // EFECTO (useEffect) PARA EL TEMPORIZADOR DEL SLIDESHOW (4.5 SEGUNDOS)
    // ----------------------------------------------------------------------
    useEffect(() => {
        const temporizador = setInterval(() => {
            setFotoActiva((prev) => (prev + 1) % fotosHero.length);
        }, 4500);

        return () => clearInterval(temporizador);
    }, []);

    // Manejar cambios en las casillas del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Validar y procesar el envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();

        // Limpiar avisos anteriores
        setMensajeEstado({ texto: "", tipo: "" });

        // Validaciones
        if (formData.nombre.trim().length < 3) {
            setMensajeEstado({ texto: "Por favor, ingresa tu nombre completo (mínimo 3 caracteres).", tipo: "error" });
            return;
        }

        if (!formData.email.includes("@") || !formData.email.includes(".")) {
            setMensajeEstado({ texto: "Por favor, ingresa un correo electrónico válido.", tipo: "error" });
            return;
        }

        if (formData.asunto === "") {
            setMensajeEstado({ texto: "Por favor, selecciona un motivo de consulta.", tipo: "error" });
            return;
        }

        if (formData.mensaje.trim().length < 10) {
            setMensajeEstado({ texto: "Por favor, escribe un mensaje más detallado (mínimo 10 caracteres).", tipo: "error" });
            return;
        }

        // Si pasa todas las validaciones
        setMensajeEstado({
            texto: `¡Gracias por contactarnos, ${formData.nombre}! Tu mensaje ha sido enviado correctamente. Un ejecutivo de GUP se comunicará contigo a la brevedad.`,
            tipo: "exito"
        });

        // Limpiar los campos
        setFormData({
            nombre: "",
            email: "",
            telefono: "",
            asunto: "",
            mensaje: ""
        });
    };

    // Alternar preguntas en el acordeón FAQ
    const toggleFaq = (index) => {
        setFaqAbierto(faqAbierto === index ? null : index);
    };

    return (
        <div className="min-h-screen text-ink bg-canvas flex flex-col font-medium">
            {/* Header Global */}
            <Header />

            <main className="flex-grow">
                {/* ==========================================
                   SECCIÓN HERO CON SLIDESHOW Y OVERLAY
                   ========================================== */}
                <section className="relative min-h-[380px] md:min-h-[420px] flex items-center justify-center text-center text-white px-5 py-16 overflow-hidden">
                    {/* Slideshow de imágenes de fondo */}
                    <div className="absolute inset-0 z-0">
                        {fotosHero.map((foto, index) => (
                            <div
                                key={foto}
                                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                                    index === fotoActiva ? "opacity-100" : "opacity-0"
                                }`}
                                style={{ backgroundImage: `url('${foto}')` }}
                            />
                        ))}
                    </div>

                    {/* Overlay oscuro para garantizar la legibilidad del texto */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/75 to-[#1F1F1F]/90" />

                    {/* Contenido del Texto del Hero */}
                    <div className="relative z-20 max-w-[850px] mx-auto">
                        <span className="text-xs font-bold tracking-[3px] text-smoke-300 block mb-3 uppercase">
                            Atención al Cliente y Consultas
                        </span>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-wider mb-4 drop-shadow-md">
                            CONTÁCTANOS
                        </h1>
                        <p className="text-base md:text-lg text-smoke-100 max-w-[700px] mx-auto drop-shadow-sm font-normal">
                            Estamos aquí para resolver tus dudas sobre arriendos, publicaciones y administración de propiedades.
                        </p>
                    </div>

                    {/* Puntos (Dots) interactivos del Slideshow */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                        {fotosHero.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                aria-label={`Ir a foto ${index + 1}`}
                                onClick={() => setFotoActiva(index)}
                                className={`w-3 h-3 rounded-full border-2 border-white transition-all cursor-pointer ${
                                    index === fotoActiva
                                        ? "bg-white scale-125 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                                        : "bg-white/40 hover:bg-white/70"
                                }`}
                            />
                        ))}
                    </div>
                </section>

                {/* ==========================================
                   CONTENIDO PRINCIPAL: 2 COLUMNAS
                   ========================================== */}
                <section className="max-w-[1200px] mx-auto px-5 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                        {/* COLUMNA 1: Información de atención + Mapa */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-ink mb-2">Información de Atención</h2>
                                <p className="text-smoke-700 text-sm">
                                    Puedes comunicarte con nuestro equipo a través de los siguientes canales directos o visitarnos en nuestra oficina central.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Tarjeta: Dirección */}
                                <div className="bg-white border border-smoke-300 rounded-lg p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                                    <span className="text-2xl leading-none">📍</span>
                                    <div>
                                        <h3 className="font-bold text-ink text-base">Oficina Central</h3>
                                        <p className="text-smoke-700 text-sm">Antonio Varas 810<br />Providencia, Santiago, Chile</p>
                                    </div>
                                </div>

                                {/* Tarjeta: Teléfonos */}
                                <div className="bg-white border border-smoke-300 rounded-lg p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                                    <span className="text-2xl leading-none">📞</span>
                                    <div>
                                        <h3 className="font-bold text-ink text-base">Teléfonos de Contacto</h3>
                                        <p className="text-smoke-700 text-sm">Central: +56 2 2345 6789</p>
                                        <p className="text-smoke-700 text-sm">WhatsApp Comercial: +56 9 8765 4321</p>
                                    </div>
                                </div>

                                {/* Tarjeta: Correo */}
                                <div className="bg-white border border-smoke-300 rounded-lg p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                                    <span className="text-2xl leading-none">✉️</span>
                                    <div>
                                        <h3 className="font-bold text-ink text-base">Correo Electrónico</h3>
                                        <p className="text-smoke-700 text-sm">contacto@gup-propiedades.cl</p>
                                        <p className="text-smoke-700 text-sm">soporte@gup-propiedades.cl</p>
                                    </div>
                                </div>

                                {/* Tarjeta: Horario */}
                                <div className="bg-white border border-smoke-300 rounded-lg p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                                    <span className="text-2xl leading-none">⏰</span>
                                    <div>
                                        <h3 className="font-bold text-ink text-base">Horario de Atención</h3>
                                        <p className="text-smoke-700 text-sm">Lunes a Viernes: 09:00 - 18:30 hrs</p>
                                        <p className="text-smoke-700 text-sm">Sábados: 10:00 - 14:00 hrs</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tarjeta: Mapa de Ubicación Google Maps */}
                            <div className="bg-white border border-smoke-300 rounded-lg p-5 shadow-sm">
                                <h3 className="font-bold text-ink text-base mb-3 flex items-center gap-2">
                                    🗺️ Ubicación de nuestra Oficina
                                </h3>
                                <div className="w-full h-[230px] rounded-md overflow-hidden border border-smoke-300">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.4772093553254!2d-70.61794772352822!3d-33.43003447339798!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9692ca82a6f44d8b%3A0x6b7e7bc8bc9e96e5!2sAntonio%20Varas%20810%2C%20Providencia%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses!2scl!4v1700000000000!5m2!1ses!2scl"
                                        className="w-full h-full border-0"
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Mapa de ubicación Antonio Varas 810"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA 2: Formulario de contacto */}
                        <div className="bg-white border border-smoke-300 rounded-lg p-6 md:p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-ink mb-1">Envíanos un Mensaje</h2>
                            <p className="text-smoke-700 text-sm mb-6">
                                Completa los campos requeridos y un ejecutivo se pondrá en contacto contigo a la brevedad.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Campo: Nombre */}
                                <div>
                                    <label htmlFor="nombre" className="block text-xs font-semibold text-ink uppercase mb-1">
                                        Nombre Completo <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        placeholder="Ej. Ignacio Latrach"
                                        className="w-full px-4 py-2.5 text-sm bg-smoke-100/50 border border-smoke-300 rounded-md text-ink focus:outline-none focus:border-smoke-900 focus:bg-white focus:ring-2 focus:ring-smoke-900/10 transition-all"
                                        required
                                    />
                                </div>

                                {/* Campo: Correo */}
                                <div>
                                    <label htmlFor="email" className="block text-xs font-semibold text-ink uppercase mb-1">
                                        Correo Electrónico <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="ejemplo@correo.com"
                                        className="w-full px-4 py-2.5 text-sm bg-smoke-100/50 border border-smoke-300 rounded-md text-ink focus:outline-none focus:border-smoke-900 focus:bg-white focus:ring-2 focus:ring-smoke-900/10 transition-all"
                                        required
                                    />
                                </div>

                                {/* Campo: Teléfono */}
                                <div>
                                    <label htmlFor="telefono" className="block text-xs font-semibold text-ink uppercase mb-1">
                                        Teléfono de Contacto
                                    </label>
                                    <input
                                        type="tel"
                                        id="telefono"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        placeholder="+56 9 1234 5678"
                                        className="w-full px-4 py-2.5 text-sm bg-smoke-100/50 border border-smoke-300 rounded-md text-ink focus:outline-none focus:border-smoke-900 focus:bg-white focus:ring-2 focus:ring-smoke-900/10 transition-all"
                                    />
                                </div>

                                {/* Campo: Motivo */}
                                <div>
                                    <label htmlFor="asunto" className="block text-xs font-semibold text-ink uppercase mb-1">
                                        Motivo de la Consulta <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        id="asunto"
                                        name="asunto"
                                        value={formData.asunto}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm bg-smoke-100/50 border border-smoke-300 rounded-md text-ink focus:outline-none focus:border-smoke-900 focus:bg-white focus:ring-2 focus:ring-smoke-900/10 transition-all"
                                        required
                                    >
                                        <option value="">-- Selecciona una opción --</option>
                                        <option value="arriendo">Consulta sobre Arriendo de Propiedad</option>
                                        <option value="publicar">Quiero Publicar mi Propiedad</option>
                                        <option value="administracion">Servicio de Administración Inmobiliaria</option>
                                        <option value="visita">Coordinación de Visita</option>
                                        <option value="otro">Otro Motivo</option>
                                    </select>
                                </div>

                                {/* Campo: Mensaje + Contador de Caracteres */}
                                <div>
                                    <label htmlFor="mensaje" className="block text-xs font-semibold text-ink uppercase mb-1">
                                        Mensaje <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        id="mensaje"
                                        name="mensaje"
                                        rows={4}
                                        maxLength={500}
                                        value={formData.mensaje}
                                        onChange={handleChange}
                                        placeholder="Escribe aquí tu consulta o requerimiento en detalle..."
                                        className="w-full px-4 py-2.5 text-sm bg-smoke-100/50 border border-smoke-300 rounded-md text-ink focus:outline-none focus:border-smoke-900 focus:bg-white focus:ring-2 focus:ring-smoke-900/10 transition-all"
                                        required
                                    />
                                    {/* Contador dinámico con alertas de colores */}
                                    <div className="text-right text-xs mt-1">
                                        <span
                                            className={
                                                formData.mensaje.length >= 490
                                                    ? "text-danger font-bold"
                                                    : formData.mensaje.length >= 400
                                                    ? "text-amber-600 font-semibold"
                                                    : "text-smoke-500"
                                            }
                                        >
                                            {formData.mensaje.length} / 500 caracteres
                                        </span>
                                    </div>
                                </div>

                                {/* Mensaje de Estado (Éxito o Error) */}
                                {mensajeEstado.texto && (
                                    <div
                                        className={`p-3.5 rounded-md text-sm font-medium ${
                                            mensajeEstado.tipo === "exito"
                                                ? "bg-green-50 text-green-800 border border-green-200"
                                                : "bg-red-50 text-danger border border-red-200"
                                        }`}
                                    >
                                        {mensajeEstado.texto}
                                    </div>
                                )}

                                {/* Botón Enviar */}
                                <button
                                    type="submit"
                                    className="w-full bg-smoke-900 text-smoke-100 py-3 px-6 rounded-md font-bold hover:bg-smoke-700 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
                                >
                                    Enviar Mensaje
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ==========================================
                       SECCIÓN DE PREGUNTAS FRECUENTES (FAQ)
                       ========================================== */}
                    <div className="mt-16 pt-10 border-t border-smoke-300/60">
                        <div className="text-center max-w-[650px] mx-auto mb-10">
                            <h2 className="text-2xl md:text-3xl font-extrabold text-ink mb-2">
                                Preguntas Frecuentes
                            </h2>
                            <p className="text-smoke-700 text-sm">
                                Encuentra respuestas rápidas a las consultas más habituales sobre nuestros servicios de arriendo y administración.
                            </p>
                        </div>

                        <div className="space-y-3 max-w-[1000px] mx-auto">
                            {preguntasFrecuentes.map((item, index) => {
                                const estaAbierto = faqAbierto === index;
                                return (
                                    <div
                                        key={index}
                                        className="bg-white border border-smoke-300 rounded-lg overflow-hidden transition-all shadow-sm"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggleFaq(index)}
                                            className="w-full p-4 md:p-5 flex justify-between items-center text-left font-bold text-ink hover:bg-smoke-100/40 transition-colors cursor-pointer"
                                        >
                                            <span>{item.pregunta}</span>
                                            <span
                                                className={`text-xl font-bold text-smoke-500 transition-transform duration-300 ${
                                                    estaAbierto ? "rotate-45 text-ink" : ""
                                                }`}
                                            >
                                                +
                                            </span>
                                        </button>
                                        {estaAbierto && (
                                            <div className="px-5 pb-5 pt-1 text-sm text-smoke-700 border-t border-smoke-300/40 bg-smoke-100/30">
                                                <p>{item.respuesta}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </main>

            {/* Botón Flotante de WhatsApp Comercial */}
            <a
                href="https://wa.me/56987654321?text=Hola%20GUP,%20me%20gustar%C3%ADa%20recibir%20informaci%C3%B3n%20sobre%20sus%20servicios%20y%20propiedades"
                target="_blank"
                rel="noopener noreferrer"
                title="Contactar por WhatsApp Comercial"
                className="fixed bottom-6 right-6 z-50 bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold py-3 px-5 rounded-full shadow-lg flex items-center gap-2 hover:-translate-y-1 hover:shadow-xl transition-all"
            >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Footer Global */}
            <Footer />
        </div>
    );
}

export default ContactPage;
