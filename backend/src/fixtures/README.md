# Fixtures (test data)

Test data to fill your **local** database, so everyone on the team tests the API against the same data without creating it by hand in Postman.

## How to run it

With the project running (`make up`):

```bash
make seed
```

Without make: `docker compose exec backend npm run seed`. Without Docker: `npm run seed` inside `backend/`.

> ⚠️ **The seed empties the collections before loading the data.** Everything you created by hand in those collections is deleted. Run it whenever you want to go back to a clean, known state.

## Test users

All of them use the password **`Password123`**.

| Role | Email | Name |
|---|---|---|
| `ADMIN` | `admin@gup.cl` | Admin GUP |
| `EJECUTIVO` | `ejecutivo1@gup.cl` | Carla Rojas |
| `EJECUTIVO` | `ejecutivo2@gup.cl` | Matías Soto |
| `PROPIETARIO` | `propietario@gup.cl` | Jorge Muñoz |
| `CLIENTE` | `cliente@gup.cl` | Ana Pérez |

These are fake accounts for local development only. Never add real passwords here.

The owner user `propietario@gup.cl` is linked to the owner record Jorge Muñoz (`12345678-5`) through `usuarios.propietarioId`, so it can test "my properties". The client user does not have a `clienteId` yet: it will be linked when the client-linking rule is agreed.

## What it loads

| Collection | Amount | File |
|---|---|---|
| `tiposPropiedad` | 4 | [`data/tiposPropiedad.js`](data/tiposPropiedad.js) |
| `usuarios` | 5 | [`data/usuarios.js`](data/usuarios.js) |
| `clientes` | 3 | [`data/clientes.js`](data/clientes.js) |
| `bitacora` | 0 (only emptied) | — Entries are created by real state changes, never by the fixtures |
| `propietarios` | 3 (2 active, 1 inactive) | [`data/propietarios.js`](data/propietarios.js); business records, not linked to login accounts yet |
| `propiedades` | 11 (5 `PUBLICADA` and active, one in each other state, 1 soft-deleted) | [`data/propiedades.js`](data/propiedades.js); 6 belong to Jorge Muñoz and 5 to María Torres, split between both executives. They refer to their type, owner and executive by name, RUT and email; `seed.js` translates those into `_id` values |

## Adding data

1. Create or edit a file in `data/` that exports an array of objects with the fields of the model (see [`docs/DATA_MODEL.md`](../../../docs/DATA_MODEL.md)).
2. In [`seed.js`](seed.js), import it, empty the collection with `deleteMany({})` and insert the data with `insertMany(...)`.
3. Collections that reference others (for example `propiedades` → `propietarios`) must be inserted **after** the ones they point to, because they need their `_id`.
