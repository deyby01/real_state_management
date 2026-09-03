/* ==========================================================================
   SCRIPT DE VALIDACIÓN Y SLIDESHOW: PÁGINA DE CONTACTO (GUP)
   ========================================================================== */

// Esperar a que todo el documento HTML esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------------------
    // 1. LÓGICA DEL SLIDESHOW (CARRUSEL DE FOTOS DE FONDO CON PUNTOS)
    // ----------------------------------------------------------------------
    const slides = document.querySelectorAll('.slide');
    const slideshowDots = document.getElementById('slideshowDots');
    let indiceSlideActual = 0;
    let temporizadorSlideshow = null;

    // Crear los puntos (dots) de forma dinámica según el número de fotos
    if (slideshowDots && slides.length > 0) {
        slides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('activa');

            // Al hacer clic en un punto, saltar a esa foto específica
            dot.addEventListener('click', () => {
                irAFoto(index);
                reiniciarTemporizador();
            });

            slideshowDots.appendChild(dot);
        });
    }

    // Función para cambiar a una foto específica por su índice
    function irAFoto(nuevoIndice) {
        if (slides.length === 0) return;

        // Desactivar la foto y el punto actuales
        slides[indiceSlideActual].classList.remove('activa');
        const dots = document.querySelectorAll('.dot');
        if (dots[indiceSlideActual]) dots[indiceSlideActual].classList.remove('activa');

        // Actualizar el índice al nuevo seleccionado
        indiceSlideActual = nuevoIndice;

        // Activar la nueva foto y el nuevo punto
        slides[indiceSlideActual].classList.add('activa');
        if (dots[indiceSlideActual]) dots[indiceSlideActual].classList.add('activa');
    }

    // Función para avanzar a la siguiente foto automáticamente
    function cambiarSiguienteFoto() {
        const siguienteIndice = (indiceSlideActual + 1) % slides.length;
        irAFoto(siguienteIndice);
    }

    // Iniciar el temporizador para cambiar de foto cada 4.5 segundos
    function iniciarTemporizador() {
        if (slides.length > 0) {
            temporizadorSlideshow = setInterval(cambiarSiguienteFoto, 4500);
        }
    }

    // Reiniciar el temporizador al hacer clic en un punto para evitar saltos bruscos
    function reiniciarTemporizador() {
        clearInterval(temporizadorSlideshow);
        iniciarTemporizador();
    }

    iniciarTemporizador();

    // ----------------------------------------------------------------------
    // 2. CAPTURA DE ELEMENTOS DEL FORMULARIO DE CONTACTO
    // ----------------------------------------------------------------------
    const formContacto = document.getElementById('formContacto');
    const inputNombre = document.getElementById('nombre');
    const inputEmail = document.getElementById('email');
    const inputTelefono = document.getElementById('telefono');
    const selectAsunto = document.getElementById('asunto');
    const inputMensaje = document.getElementById('mensaje');
    const contadorCaracteres = document.getElementById('contadorCaracteres');
    const mensajeEstado = document.getElementById('mensajeEstado');

    // ----------------------------------------------------------------------
    // 2.5 CONTADOR DE CARACTERES EN TIEMPO REAL
    // ----------------------------------------------------------------------
    if (inputMensaje && contadorCaracteres) {
        inputMensaje.addEventListener('input', () => {
            const longitudActual = inputMensaje.value.length;
            const maximo = 500;

            contadorCaracteres.textContent = `${longitudActual} / ${maximo} caracteres`;

            // Alerta visual de colores al acercarse o alcanzar el límite
            if (longitudActual >= 490) {
                contadorCaracteres.className = 'contador-caracteres limite-alcanzado';
            } else if (longitudActual >= 400) {
                contadorCaracteres.className = 'contador-caracteres limite-cercano';
            } else {
                contadorCaracteres.className = 'contador-caracteres';
            }
        });
    }

    // ----------------------------------------------------------------------
    // 3. FUNCIÓN AUXILIAR: VALIDAR FORMATO DE CORREO ELECTRÓNICO
    // ----------------------------------------------------------------------
    function esEmailValido(email) {
        return email.includes('@') && email.indexOf('.', email.indexOf('@')) !== -1;
    }

    // ----------------------------------------------------------------------
    // 4. MANEJO DEL EVENTO DE ENVÍO DEL FORMULARIO (SUBMIT)
    // ----------------------------------------------------------------------
    formContacto.addEventListener('submit', (event) => {
        // Prevenir la recarga automática de la página
        event.preventDefault();

        // Obtener los valores ingresados eliminando espacios extras
        const nombreVal = inputNombre.value.trim();
        const emailVal = inputEmail.value.trim();
        const asuntoVal = selectAsunto.value;
        const mensajeVal = inputMensaje.value.trim();

        // Limpiar cualquier mensaje de estado anterior
        mensajeEstado.className = 'mensaje-estado';
        mensajeEstado.textContent = '';

        // Validaciones
        if (nombreVal.length < 3) {
            mostrarMensaje('Por favor, ingresa tu nombre completo (mínimo 3 caracteres).', 'error');
            inputNombre.focus();
            return;
        }

        if (!esEmailValido(emailVal)) {
            mostrarMensaje('Por favor, ingresa un correo electrónico válido (ejemplo: usuario@correo.com).', 'error');
            inputEmail.focus();
            return;
        }

        if (asuntoVal === '') {
            mostrarMensaje('Por favor, selecciona un motivo de consulta.', 'error');
            selectAsunto.focus();
            return;
        }

        if (mensajeVal.length < 10) {
            mostrarMensaje('Por favor, escribe un mensaje más detallado (mínimo 10 caracteres).', 'error');
            inputMensaje.focus();
            return;
        }

        // Si todas las validaciones pasan con éxito
        mostrarMensaje('¡Gracias por contactarnos, ' + nombreVal + '! Tu mensaje ha sido enviado correctamente. Un ejecutivo de GUP se comunicará contigo a la brevedad.', 'exito');

        // Limpiar el formulario y reiniciar el contador
        formContacto.reset();
        if (contadorCaracteres) {
            contadorCaracteres.textContent = '0 / 500 caracteres';
            contadorCaracteres.className = 'contador-caracteres';
        }
    });

    // ----------------------------------------------------------------------
    // 5. FUNCIÓN PARA MOSTRAR MENSAJES DE ESTADO
    // ----------------------------------------------------------------------
    function mostrarMensaje(texto, tipo) {
        mensajeEstado.textContent = texto;
        mensajeEstado.className = 'mensaje-estado ' + tipo;
    }

    // ----------------------------------------------------------------------
    // 6. LÓGICA DEL ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ)
    // ----------------------------------------------------------------------
    const faqPreguntas = document.querySelectorAll('.faq-pregunta');

    faqPreguntas.forEach(boton => {
        boton.addEventListener('click', () => {
            // Elemento padre .faq-item que contiene la pregunta y respuesta
            const itemActual = boton.parentElement;

            // Opcional: Cerrar los demás acordeones para mantener solo uno abierto
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== itemActual) {
                    item.classList.remove('activa');
                }
            });

            // Alternar la clase 'activa' en la pregunta seleccionada
            itemActual.classList.toggle('activa');
        });
    });
});
