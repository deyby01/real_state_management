import { useEffect } from "react"

/**
 * Dialog over the page, shared by every panel screen (forms, confirmations).
 * Closes with the X button, the Escape key or a click outside the white box.
 *
 * @param {Object} props
 * @param {string} props.titulo
 * @param {Function} props.onCerrar
 * @param {React.ReactNode} props.children
 */
export default function Modal({ titulo, onCerrar, children }) {
    useEffect(() => {
        const alPresionar = (e) => e.key === "Escape" && onCerrar()
        window.addEventListener("keydown", alPresionar)
        return () => window.removeEventListener("keydown", alPresionar)
    }, [onCerrar])

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto" onClick={onCerrar}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label={titulo}
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8"
                // A click inside the box must not reach the backdrop and close it
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-smoke-300">
                    <h2 className="text-xl font-semibold">{titulo}</h2>
                    <button type="button" onClick={onCerrar} aria-label="Cerrar" className="text-smoke-700 hover:text-ink text-xl cursor-pointer">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    )
}
