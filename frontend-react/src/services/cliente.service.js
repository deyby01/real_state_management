import { apiFetch } from "./api"

export const listarClientes = () => apiFetch("/clientes")

export const obtenerCliente = (id) => apiFetch(`/clientes/${id}`)

export const crearCliente = (datos) => apiFetch("/clientes", { method: "POST", body: datos })

export const actualizarCliente = (id, datos) => apiFetch(`/clientes/${id}`, { method: "PUT", body: datos })

export const eliminarCliente = (id) => apiFetch(`/clientes/${id}`, { method: "DELETE" })

/**
 * GET /api/clientes: active clients (CU5). The backend returns only `activo: true`
 * records and accepts no filters.
 *
 * @returns {Promise<Object[]>} rut, nombre, email, telefono, ciudad, comuna, estado, activo.
 */