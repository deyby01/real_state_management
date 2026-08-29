/* ==========================================================================
   SCRIPT DE VALIDACIÓN: PÁGINA DE CONTACTO (GUP - GESTIÓN URBANA DE PROPIEDADES)
   ========================================================================== */

// Esperar a que todo el documento HTML esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------------------
    // 1. CAPTURA DE ELEMENTOS DEL DOM POR SU ID
    // ----------------------------------------------------------------------
    const formContacto = document.getElementById('formContacto');
    const inputNombre = document.getElementById('nombre');
    const inputEmail = document.getElementById('email');
    const inputTelefono = document.getElementById('telefono');
    const selectAsunto = document.getElementById('asunto');
    const inputMensaje = document.getElementById('mensaje');
    const mensajeEstado = document.getElementById('mensajeEstado');

    // ----------------------------------------------------------------------
    // 2. FUNCIÓN AUXILIAR: VALIDAR FORMATO DE CORREO ELECTRÓNICO
    // ----------------------------------------------------------------------
    function esEmailValido(email) {
        // Comprueba si el texto contiene '@' y un punto '.' después del símbolo '@'
        return email.includes('@') && email.indexOf('.', email.indexOf('@')) !== -1;
    }

    // ----------------------------------------------------------------------
    // 3. MANEJO DEL EVENTO DE ENVÍO DEL FORMULARIO (SUBMIT)
    // ----------------------------------------------------------------------
    formContacto.addEventListener('submit', (event) => {
        // Previene la recarga automática de la página que hace el navegador por defecto
        event.preventDefault();

        // Obtener los valores ingresados eliminando espacios en blanco al inicio y al final
        const nombreVal = inputNombre.value.trim();
        const emailVal = inputEmail.value.trim();
        const asuntoVal = selectAsunto.value;
        const mensajeVal = inputMensaje.value.trim();

        // Limpiar cualquier mensaje de estado anterior
        mensajeEstado.className = 'mensaje-estado';
        mensajeEstado.textContent = '';

        // ------------------------------------------------------------------
        // 4. VALIDACIONES DE CAMPOS
        // ------------------------------------------------------------------
        
        // Validación 1: Verificar que el campo Nombre tenga al menos 3 caracteres
        if (nombreVal.length < 3) {
            mostrarMensaje('Por favor, ingresa tu nombre completo (mínimo 3 caracteres).', 'error');
            inputNombre.focus();
            return;
        }

        // Validación 2: Verificar el formato del correo electrónico
        if (!esEmailValido(emailVal)) {
            mostrarMensaje('Por favor, ingresa un correo electrónico válido (ejemplo: usuario@correo.com).', 'error');
            inputEmail.focus();
            return;
        }

        // Validación 3: Verificar que se haya seleccionado un motivo/asunto
        if (asuntoVal === '') {
            mostrarMensaje('Por favor, selecciona un motivo de consulta.', 'error');
            selectAsunto.focus();
            return;
        }

        // Validación 4: Verificar que el mensaje tenga al menos 10 caracteres
        if (mensajeVal.length < 10) {
            mostrarMensaje('Por favor, escribe un mensaje más detallado (mínimo 10 caracteres).', 'error');
            inputMensaje.focus();
            return;
        }

        // ------------------------------------------------------------------
        // 5. ENVÍO EXITOSO
        // ------------------------------------------------------------------
        // Si pasó todas las validaciones, mostramos el mensaje de éxito
        mostrarMensaje('¡Gracias por contactarnos, ' + nombreVal + '! Tu mensaje ha sido enviado correctamente. Un ejecutivo de GUP se comunicará contigo a la brevedad.', 'exito');

        // Limpiar todos los campos del formulario
        formContacto.reset();
    });

    // ----------------------------------------------------------------------
    // 6. FUNCIÓN PARA MOSTRAR MENSAJES DE ESTADO (ÉXITO O ERROR)
    // ----------------------------------------------------------------------
    function mostrarMensaje(texto, tipo) {
        mensajeEstado.textContent = texto;
        // Asigna la clase 'exito' o 'error' definida en contacto.css
        mensajeEstado.className = 'mensaje-estado ' + tipo;
    }
});
