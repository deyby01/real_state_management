import { useState } from "react"
import Modal from "../panel/Modal"
import {
    cancelarVisita,
    confirmarVisita,
    rechazarVisita,
    registrarResultadoVisita,
} from "../../services/visita.service"
import { ACCIONES_POR_ESTADO } from "./estadosVisita"

const ETIQUETAS = {
    confirmar: "Confirmar",
    rechazar: "Rechazar",
    cancelar: "Cancelar",
    resultado: "Resultado",
    reprogramar: "Reprogramar",
}

/**
 * Row actions for one visit: PATCH transitions allowed for the current estado.
 * Reprogramar opens the parent modal via onReprogramar (PUT, not a state change).
 */
export default function AccionesVisita({ visita, onExito, onError, onReprogramar }) {
    const [enviando, setEnviando] = useState(false)
    const [modalResultado, setModalResultado] = useState(false)
    const [resultado, setResultado] = useState("")

    const acciones = ACCIONES_POR_ESTADO[visita.estado] ?? []
    if (acciones.length === 0) {
        return <span className="text-smoke-500 text-xs">Sin acciones</span>
    }

    const boton =
        "px-2 py-1 rounded-lg text-xs font-medium border border-smoke-300 hover:bg-canvas disabled:opacity-50 disabled:cursor-not-allowed"

    const ejecutar = async (promesa, mensajeExito) => {
        if (enviando) return
        setEnviando(true)
        try {
            await promesa
            onExito(mensajeExito)
        } catch (error) {
            onError(error.message)
        } finally {
            setEnviando(false)
        }
    }

    const confirmar = () => {
        if (!window.confirm("¿Confirmar esta visita?")) return
        ejecutar(confirmarVisita(visita._id), "Visita confirmada")
    }

    const rechazar = () => {
        if (!window.confirm("¿Rechazar esta solicitud de visita?")) return
        ejecutar(rechazarVisita(visita._id), "Visita rechazada")
    }

    const cancelar = () => {
        if (!window.confirm("¿Cancelar esta visita?")) return
        ejecutar(cancelarVisita(visita._id), "Visita cancelada")
    }

    const abrirResultado = () => {
        setResultado("")
        setModalResultado(true)
    }

    const guardarResultado = async (event) => {
        event.preventDefault()
        const texto = resultado.trim()
        if (!texto) {
            onError("Escribe el resultado de la visita")
            return
        }
        setModalResultado(false)
        await ejecutar(registrarResultadoVisita(visita._id, texto), "Resultado registrado")
    }

    const reprogramar = () => onReprogramar?.(visita)

    const handlers = {
        confirmar,
        rechazar,
        cancelar,
        resultado: abrirResultado,
        reprogramar,
    }

    return (
        <>
            <div className="flex flex-wrap justify-end gap-1">
                {acciones.map((clave) => (
                    <button
                        key={clave}
                        type="button"
                        disabled={enviando}
                        onClick={handlers[clave]}
                        className={boton}
                    >
                        {ETIQUETAS[clave]}
                    </button>
                ))}
            </div>

            {modalResultado && (
                <Modal titulo="Registrar resultado" onCerrar={() => setModalResultado(false)}>
                    <form onSubmit={guardarResultado} className="space-y-4">
                        <p className="text-sm text-smoke-700">
                            {visita.propiedadId?.titulo} · {visita.clienteId?.nombre}
                        </p>
                        <label className="block text-sm">
                            <span className="font-medium">Resultado</span>
                            <textarea
                                value={resultado}
                                onChange={(e) => setResultado(e.target.value)}
                                rows={4}
                                required
                                className="mt-1 w-full px-3 py-2 border border-smoke-300 rounded-lg"
                                placeholder="Qué observó el ejecutivo en la visita"
                            />
                        </label>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setModalResultado(false)} className={boton}>
                                Volver
                            </button>
                            <button
                                type="submit"
                                disabled={enviando}
                                className={`${boton} bg-emerald-700 text-white border-emerald-700`}
                            >
                                Marcar como realizada
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    )
}