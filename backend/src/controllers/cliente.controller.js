import Cliente from "../models/Cliente.js"

/**
 * Normalizes a Chilean RUT before it is stored.
 *
 * Removes dots and spaces and uppercases the check digit (`k` → `K`), but keeps the
 * hyphen: `12.345.678-k` → `12345678-K`. The hyphen is part of the agreed format in
 * docs/DATA_MODEL.md and is what `propietarios` stores, so removing it would leave
 * the same client with two different identifiers. Normalization is required because
 * the unique index compares exact text (RN-11).
 *
 * @param {string} rut - RUT as received in the request body.
 * @returns {string} Normalized RUT, or the received value when it is empty.
 */
const normalizarRut = (rut) => {
    if (!rut) return rut
    return String(rut).replace(/\./g, "").replace(/\s/g, "").toUpperCase()
}

/**
 * Lists the active clients.
 *
 * Route: GET /api/clientes (EJECUTIVO only).
 * - Only `activo: true` records are returned: a deactivated client stays in the
 *   collection for its history but does not appear in the operational list.
 *
 * Responses: 200 list (an empty array when there are none) · 401/403 auth ·
 * 500 server error.
 */
export const getClientes = async (req, res) => {
    try {
        // find() always returns an array, even when it is empty
        const clientes = await Cliente.find({ activo: true })
        res.status(200).json(clientes)
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener clientes", error: error.message })
    }
}

/**
 * Returns one client by its id.
 *
 * Route: GET /api/clientes/:id (EJECUTIVO only).
 * - Unlike the list, an inactive client is still returned when its id is known,
 *   so a deactivated record can still be inspected without being editable.
 *
 * Responses: 200 client · 400 invalid id · 404 not found · 401/403 auth ·
 * 500 server error.
 */
export const getClienteById = async (req, res) => {
    try {
        // findById() returns one document or null
        const cliente = await Cliente.findById(req.params.id)

        if (!cliente) {
            return res.status(404).json({ mensaje: "Cliente no encontrado" })
        }

        res.status(200).json(cliente)
    } catch (error) {
        // "abc" cannot be converted to an ObjectId: Mongoose throws a CastError
        if (error.name === "CastError") {
            return res.status(400).json({ mensaje: "ID de cliente inválido", error: error.message })
        }
        res.status(500).json({ mensaje: "Error al obtener cliente", error: error.message })
    }
}

/**
 * Creates a client.
 *
 * Route: POST /api/clientes (EJECUTIVO only).
 * - Only whitelisted fields are read from the body (prevents mass assignment):
 *   `estado`, `activo`, `_id` and `createdAt` can never be injected by the client.
 * - `estado` is not a form field: a new client is always INTERESADO by the schema
 *   default. It becomes ARRENDATARIO only when the rental request flow processes a
 *   signed contract, the same rule that keeps `rol` out of the user body (rule 17).
 * - The RUT is normalized before saving and the schema lowercases the email.
 * - A duplicated RUT or email is rejected by the unique indexes (RN-11); the
 *   response names the field that collided because there are two of them.
 */
export const postCliente = async (req, res) => {
    try {
        // Whitelist: only these fields are taken from the body
        const { rut, nombre, email, telefono, ciudad, comuna } = req.body

        const nuevoCliente = await Cliente.create({
            rut: normalizarRut(rut),
            nombre,
            email,
            telefono,
            ciudad,
            comuna,
        })
        res.status(201).json(nuevoCliente)
    } catch (error) {
        // 1) Unique index: MongoDB reports code 11000 and the field that collided
        if (error.code === 11000) {
            const campo = Object.keys(error.keyValue)[0]
            return res.status(409).json({
                mensaje: `Ya existe un cliente con ese ${campo}`,
                error: error.message,
            })
        }
        // 2) Missing required field or value outside the enum
        if (error.name === "ValidationError") {
            const campos = Object.keys(error.errors).join(", ")
            return res.status(400).json({
                mensaje: `Datos inválidos: ${campos}`,
                error: error.message,
            })
        }
        // 3) Anything else: unexpected server error
        res.status(500).json({ mensaje: "Error al crear cliente", error: error.message })
    }
}

/**
 * Updates a client with the fields received in the body.
 *
 * Route: PUT /api/clientes/:id (EJECUTIVO only).
 * - Same whitelist as create, but `activo` is deliberately excluded: the only way
 *   to deactivate a client is DELETE, so the intent is explicit and a form can
 *   never deactivate a client by accident.
 * - `estado` is excluded as well: ARRENDATARIO is a business fact written by the
 *   rental request flow, never by an edit form, so the value is silently ignored.
 * - `rut` is normalized only when it comes in the body, so a partial update does
 *   not erase it; a mistyped RUT can be corrected.
 * - `runValidators: true` is required: Mongoose skips schema validation on updates
 *   by default, so a `required` field sent empty would be stored as an empty string.
 * - `returnDocument: "after"` returns the updated document; by default Mongoose
 *   returns the previous one, so the client would see stale data.
 */
export const putCliente = async (req, res) => {
    try {
        const { rut, nombre, email, telefono, ciudad, comuna } = req.body

        const datos = { nombre, email, telefono, ciudad, comuna }

        // Only touch rut when it comes in the body, so a partial update keeps the stored one
        if (rut !== undefined) {
            datos.rut = normalizarRut(rut)
        }

        const cliente = await Cliente.findByIdAndUpdate(req.params.id, datos, {
            returnDocument: "after",
            runValidators: true
        })

        if (!cliente) {
            return res.status(404).json({ mensaje: "Cliente no encontrado" })
        }

        res.status(200).json(cliente)
    } catch (error) {
        // Duplicated rut or email when the client already exists (RN-11)
        if (error.code === 11000) {
            const campo = Object.keys(error.keyValue)[0]
            return res.status(409).json({
                mensaje: `Ya existe un cliente con ese ${campo}`,
                error: error.message,
            })
        }

        if (error.name === "ValidationError") {
            const campos = Object.keys(error.errors).join(", ")
            return res.status(400).json({
                mensaje: `Datos inválidos: ${campos}`,
                error: error.message,
            })
        }

        if (error.name === "CastError") {
            return res.status(400).json({ mensaje: "ID de cliente inválido", error: error.message })
        }
        res.status(500).json({ mensaje: "Error al actualizar cliente", error: error.message })
    }
}

/**
 * Deactivates a client (soft delete): sets `activo: false`, never removes it.
 *
 * Route: DELETE /api/clientes/:id (EJECUTIVO only).
 * - The document is kept because visits and rental requests reference it: a
 *   physical delete would leave orphan records (RNF-10 / RN-17, rule 11).
 * - Idempotent: repeating the request answers 200 with the same result.
 * - No `runValidators` (only a boolean changes) and no 11000 handling (no unique
 *   field is touched).
 *
 * Responses: 200 deactivated · 400 invalid id · 404 not found · 401/403 auth ·
 * 500 server error.
 */
export const deleteCliente = async (req, res) => {
    try {
        const cliente = await Cliente.findByIdAndUpdate(
            req.params.id,
            { activo: false },
            { returnDocument: "after" }
        )

        if (!cliente) {
            return res.status(404).json({ mensaje: "Cliente no encontrado" })
        }

        res.status(200).json(cliente)
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ mensaje: "ID de cliente inválido" })
        }

        res.status(500).json({ mensaje: "Error al eliminar cliente", error: error.message })
    }
}
