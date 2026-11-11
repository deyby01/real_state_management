import Bitacora from "../models/Bitacora.js"

/**
 * Inserts one entry in the audit log (RN-13, RNF-12).
 * Called by the controllers that create, change the state of or delete a document
 * (properties, visits, rental requests). Always call it with `await`, AFTER the
 * change was saved, so a failed save never leaves a fake entry.
 * Errors are not caught here: the calling controller handles them.
 *
 * @param {Object} entrada
 * @param {"PROPIEDAD"|"VISITA"|"SOLICITUD"} entrada.entidad - Collection of the changed document.
 * @param {ObjectId} entrada.entidadId - `_id` of the changed document.
 * @param {"CREACION"|"CAMBIO_ESTADO"|"RESERVA"|"LIBERACION_RESERVA"|"ELIMINACION"} entrada.accion
 * @param {string} [entrada.estadoAnterior] - Empty on CREACION.
 * @param {string} [entrada.estadoNuevo]
 * @param {ObjectId} entrada.usuarioId - Who made the change (req.usuario._id).
 * @param {string} [entrada.observacion] - Optional reason or note.
 * @returns {Promise<Document>} The saved entry (`fecha` is set automatically).
 */
export const registrarBitacora = async ({ entidad, entidadId, accion, estadoAnterior, estadoNuevo, usuarioId, observacion }) => {
    const bitacora = new Bitacora({
        entidad,
        entidadId,
        accion,
        estadoAnterior,
        estadoNuevo,
        usuarioId,
        observacion
    })
    return await bitacora.save()
}