import Bitacora from "../models/Bitacora.js"

// Records an entry in the log. Used by controllers that modify states
// (properties, visits, requests). It does not catch errors; these are handled by the calling controller.
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