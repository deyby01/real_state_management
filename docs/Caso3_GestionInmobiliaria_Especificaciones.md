# Especificación: Sistema Web de Gestión Inmobiliaria para Arriendo y Administración de Propiedades

> **Fuente:** `Caso3_GestionInmobiliaria.docx` (Caso 3).
> **Propósito de este archivo:** especificación estructurada para consumo por agentes de desarrollo.
> **Convenciones:**
> - Las secciones marcadas con 📄 reproducen fielmente el documento original.
> - Las secciones marcadas con 🔶 son **propuestas derivadas** (inferidas del texto) y deben validarse; no son requisitos explícitos.
> - Palabras clave: **DEBE** = obligatorio, **DEBERÍA** = recomendado, **PUEDE** = opcional.

---

## 1. Resumen ejecutivo 📄

| Campo | Valor |
|---|---|
| Cliente | Gestión Urbana Propiedades |
| Rubro | Administración, publicación y arriendo de bienes raíces |
| Cartera actual | ~350 propiedades de distintos propietarios |
| Tipos de inmueble iniciales | Departamento, Casa, Oficina, Local comercial (extensible) |
| Producto | Plataforma web centralizada con acceso diferenciado por perfil |
| Valor del sistema | Centralizar información de propiedades, facilitar comercialización, mantener trazabilidad sobre interesados y solicitudes, y entregar información actualizada del estado de cada inmueble |

### 1.1 Stack tecnológico obligatorio

| Capa | Tecnología |
|---|---|
| Frontend | React, HTML, CSS (responsive) |
| Backend | Node.js + Express |
| Base de datos | MongoDB (NoSQL) |

---

## 2. Contexto y problema 📄

### 2.1 Situación actual
La información se gestiona con hojas de cálculo, correos, carpetas de documentos y mensajería instantánea. El equipo incluye administradores, ejecutivos inmobiliarios, agentes/corredores y personal administrativo, e interactúa con propietarios, clientes interesados y arrendatarios.

### 2.2 Problemas a resolver

| # | Problema | Requisito/regla que lo aborda |
|---|---|---|
| P1 | Información de propiedades, propietarios y clientes dispersa en hojas y documentos por ejecutivo | RF1–RF3, RF6 |
| P2 | Propiedades publicadas como disponibles aunque estén reservadas o arrendadas | RF4, RN-01 a RN-04 |
| P3 | No hay fuente central que indique qué ejecutivo tiene asignada una propiedad | RF3 (asignación de ejecutivo, ver 🔶 §6.3) |
| P4 | Solicitudes de visita llegan por correo, teléfono o mensajería | RF7, RF8 |
| P5 | Riesgo de agendar dos visitas simultáneas al mismo ejecutivo | RF8, RN-10 |
| P6 | Resultados de visitas no siempre se registran | RF8 |
| P7 | Solicitudes de arriendo sin flujo centralizado | RF9, RF10 |
| P8 | Riesgo de procesar más de una aprobación de arriendo para la misma propiedad | RF11, RN-14 |
| P9 | Relación propietario–propiedad–interesado–visita–solicitud distribuida en registros distintos | Modelo de datos (§8) |
| P10 | Dificultad para obtener información consolidada (disponibles, arrendadas, visitas, solicitudes, contratos por vencer, pagos atrasados, requerimientos pendientes) | RF12 |

---

## 3. Actores y perfiles 📄

| Actor | Capacidades principales |
|---|---|
| **Administrador** | Gestionar usuarios y parámetros generales; consultar reportes (CU10). |
| **Ejecutivo Inmobiliario** | Administrar propietarios, propiedades, publicaciones, clientes interesados, visitas y solicitudes de arriendo; evaluar y reservar; consultar reportes. |
| **Propietario** | Consultar **solo** la situación de los inmuebles propios bajo administración. |
| **Cliente / Arrendatario** | Consultar propiedades disponibles, solicitar visitas, presentar solicitudes de arriendo. Al pasar a arrendatario, consultar información de su arriendo (según funcionalidades que implemente el equipo). |

### 3.1 Matriz actor × caso de uso 📄

| Caso de uso | Admin | Ejecutivo | Propietario | Cliente/Arrendatario |
|---|:-:|:-:|:-:|:-:|
| CU1 Autenticar usuarios | ✔ | ✔ | ✔ | ✔ |
| CU2 Administrar propietarios | | ✔ | | |
| CU3 Administrar propiedades | | ✔ | | |
| CU4 Publicar y consultar propiedades | | ✔ | | ✔ |
| CU5 Administrar clientes interesados | | ✔ | | |
| CU6 Solicitar visita | | | | ✔ |
| CU7 Gestionar visitas | | ✔ | | |
| CU8 Solicitar arriendo | | | | ✔ |
| CU9 Evaluar solicitud y reservar propiedad | | ✔ | | |
| CU10 Generar reportes de gestión | ✔ | ✔ | | |

> El Propietario aparece como actor del diagrama de casos de uso (Figura 1 del documento original) pero el documento no le asigna un CU específico más allá de la consulta de sus inmuebles (ver RNF-07).

---

## 4. Requerimientos funcionales 📄

| ID | Requerimiento | Prioridad |
|---|---|---|
| **RF1** | Registro, autenticación y administración de usuarios según perfiles: Administrador, Ejecutivo Inmobiliario, Propietario y Cliente/Arrendatario. | Alta |
| **RF2** | Registrar y administrar propietarios, asociándolos con una o varias propiedades y conservando información de contacto y estado. | Alta |
| **RF3** | Registrar y administrar propiedades: tipo, propietario, ubicación, superficie, características, valor de arriendo, gastos comunes, fotografías y estado. | Alta |
| **RF4** | Controlar los estados de una propiedad (Disponible, Publicada, Reservada, Arrendada, En mantención, Inactiva) aplicando las transiciones permitidas según el proceso inmobiliario. | Alta |
| **RF5** | Publicar propiedades disponibles y consultar el catálogo con filtros: comuna, tipo, rango de precio, dormitorios y baños. | Alta |
| **RF6** | Registrar clientes interesados evitando duplicidad mediante identificadores y datos de contacto. | Alta |
| **RF7** | El cliente solicita visitas indicando fecha, hora y observaciones; el Ejecutivo puede confirmar, modificar, rechazar o cancelar. | Alta |
| **RF8** | Gestionar visitas programadas evitando superposiciones en la agenda del Ejecutivo y registrando el resultado de cada visita. | Alta |
| **RF9** | El cliente genera una solicitud formal de arriendo para una propiedad, incorporando los antecedentes definidos para su evaluación. | Alta |
| **RF10** | El Ejecutivo evalúa solicitudes de arriendo, registra observaciones y modifica su estado manteniendo trazabilidad. | Alta |
| **RF11** | Reservar una propiedad cuando exista una solicitud aprobada, evitando múltiples aprobaciones incompatibles y permitiendo liberar la reserva si el proceso no se concreta. | Alta |
| **RF12** | Generar consultas sobre propiedades disponibles y arrendadas, visitas realizadas, solicitudes de arriendo, pagos y requerimientos pendientes. | Media |

### 4.1 Trazabilidad RF ↔ CU 📄

| CU | Nombre | RF asociados |
|---|---|---|
| CU1 | Autenticar usuarios | RF1 |
| CU2 | Administrar propietarios | RF2 |
| CU3 | Administrar propiedades | RF3, RF4 |
| CU4 | Publicar y consultar propiedades | RF5 |
| CU5 | Administrar clientes interesados | RF6 |
| CU6 | Solicitar visita | RF7 |
| CU7 | Gestionar visitas | RF7, RF8 |
| CU8 | Solicitar arriendo | RF9 |
| CU9 | Evaluar solicitud y reservar propiedad | RF10, RF11 |
| CU10 | Generar reportes (consultas) de gestión | RF12 |

**Evidencia esperada por CU:**
- CU3: manejo de información y estados de las propiedades.
- CU7: programación, prevención de conflictos y resultado de la visita.
- CU9: reglas de estados y prevención de aprobaciones incompatibles.
- Resto: evidenciable en interfaz, backend o flujo integrado.

---

## 5. Requerimientos no funcionales 📄

| ID | Categoría | Requerimiento |
|---|---|---|
| RNF-01 | Usabilidad | La aplicación DEBE ser **responsive** (computador, tableta, móvil). |
| RNF-02 | Arquitectura | DEBE separar interfaz, lógica de negocio y persistencia. |
| RNF-03 | Tecnología | DEBE usar React + HTML + CSS (frontend), Node.js + Express (backend), MongoDB (BD). |
| RNF-04 | Seguridad | Autenticación segura y control de acceso basado en roles y permisos. |
| RNF-05 | Seguridad | Contraseñas con hashing seguro; sesiones/tokens administrados de forma segura. |
| RNF-06 | Validación | Validaciones en **frontend y backend**, con mensajes claros ante datos incorrectos. |
| RNF-07 | Aislamiento de datos | Un propietario SOLO puede consultar propiedades asociadas a su cuenta; sin acceso a datos de otros propietarios. |
| RNF-08 | Privacidad | La información privada de propietarios NO se muestra públicamente en las publicaciones. |
| RNF-09 | Integridad | Reglas de estados de propiedad, superposición de visitas, evaluación de solicitudes y reservas se validan en la **lógica de negocio del backend**. |
| RNF-10 | Trazabilidad | Propiedades, propietarios, clientes y usuarios con operaciones históricas NO se eliminan físicamente si afecta la trazabilidad (usar baja lógica). |
| RNF-11 | Archivos | Imágenes de propiedades con restricciones de formato, tamaño y cantidad definidas por la aplicación. |
| RNF-12 | Auditoría | Bitácora básica de operaciones relevantes: cambios de estado de propiedades, visitas, evaluaciones y reservas. |
| RNF-13 | Rendimiento | Consultas de catálogo y filtros con tiempos de respuesta adecuados para una app web. |
| RNF-14 | UX | Mensajes claros sobre resultado de solicitudes de visita, cambios de estado, evaluaciones y disponibilidad. |

---

## 6. Dominio y reglas de negocio

### 6.1 Estados de Propiedad 📄

`Disponible` · `Publicada` · `Reservada` · `Arrendada` · `En mantención` · `Inactiva`

### 6.2 Estados de Solicitud de Arriendo 📄

`Pendiente` · `En evaluación` · `Aprobada` · `Rechazada` · `Cancelada`

### 6.3 Reglas explícitas en el documento 📄

| ID | Regla |
|---|---|
| RN-A | Una propiedad **disponible** puede publicarse en el portal para que clientes consulten y soliciten visita. |
| RN-B | Cuando una solicitud es **aprobada**, la propiedad puede pasar temporalmente a **Reservada** mientras se formaliza el arriendo. |
| RN-C | Una vez concretado el contrato, la propiedad pasa a **Arrendada**. |
| RN-D | Cada propiedad se asocia a un propietario. Un propietario puede tener una o varias propiedades. |
| RN-E | Debe ser posible incorporar tipos de propiedad adicionales posteriormente. |
| RN-F | Un cliente que pasa a arrendatario puede consultar información de su arriendo. |

### 6.4 Reglas derivadas 🔶 (validar con el cliente/docente)

| ID | Regla propuesta | Origen |
|---|---|---|
| RN-01 | Solo propiedades en estado `Disponible` pueden pasar a `Publicada`. | RN-A |
| RN-02 | Una propiedad `Reservada` o `Arrendada` NO debe aparecer en el catálogo público como disponible. | Problema P2 |
| RN-03 | El estado de la propiedad solo se modifica mediante transiciones permitidas (ver §6.5); el backend rechaza las demás. | RF4, RNF-09 |
| RN-04 | Aprobar una solicitud mueve la propiedad a `Reservada`; liberar la reserva la devuelve a `Disponible` (o `Publicada`). | RF11 |
| RN-10 | Un Ejecutivo no puede tener dos visitas con horarios superpuestos (excluyendo visitas canceladas/rechazadas). | RF8, P5 |
| RN-11 | Un cliente interesado no puede registrarse duplicado (mismo identificador, p. ej. RUT, o mismo email/teléfono). | RF6 |
| RN-12 | Toda solicitud de arriendo referencia a un cliente y a una propiedad existentes. | RF9 |
| RN-13 | Cada cambio de estado de propiedad, visita, solicitud o reserva genera un registro en bitácora (quién, cuándo, estado anterior → nuevo, observación). | RNF-12 |
| RN-14 | Solo puede existir **una** solicitud `Aprobada` activa por propiedad. Al intentar aprobar otra mientras exista una activa, el backend responde con error de conflicto. La verificación debe ser atómica (evitar condiciones de carrera). | RF11, P8 |
| RN-15 | Cada propiedad tiene un Ejecutivo responsable asignado. | P3 |
| RN-16 | Las visitas se solicitan solo sobre propiedades `Publicada`. | RF5, RF7 |
| RN-17 | Eliminación = baja lógica (campo de estado/activo), no borrado físico, cuando hay historial. | RNF-10 |

### 6.5 Máquina de estados de Propiedad 🔶 (propuesta)

| Desde \ Hacia | Disponible | Publicada | Reservada | Arrendada | En mantención | Inactiva |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Disponible** | — | ✔ | ✘ | ✘ | ✔ | ✔ |
| **Publicada** | ✔ (despublicar) | — | ✔ (solicitud aprobada) | ✘ | ✔ | ✔ |
| **Reservada** | ✔ (liberar reserva) | ✔ (liberar y republicar) | — | ✔ (contrato concretado) | ✘ | ✘ |
| **Arrendada** | ✔ (fin de contrato) | ✘ | ✘ | — | ✔ | ✔ |
| **En mantención** | ✔ | ✘ | ✘ | ✘ | — | ✔ |
| **Inactiva** | ✔ (reactivar) | ✘ | ✘ | ✘ | ✘ | — |

> Las celdas ✘ deben ser rechazadas por el backend con un mensaje claro (RNF-09, RNF-14).

### 6.6 Máquina de estados de Solicitud de Arriendo 🔶 (propuesta)

```
Pendiente ──► En evaluación ──► Aprobada ──► (reserva de propiedad)
    │               │               │
    │               └──► Rechazada  └──► Cancelada (libera reserva)
    └──► Cancelada
```

### 6.7 Estados de Visita 🔶 (propuesta)

El documento menciona confirmar, modificar, rechazar, cancelar y registrar resultado. Estados sugeridos:
`Solicitada` → `Confirmada` → `Realizada` (con resultado registrado) · alternativas: `Rechazada`, `Cancelada`.

---

## 7. Flujo principal end-to-end 📄

```
Consulta de propiedad
   → Solicitud de visita (Cliente)
      → Gestión de visita (Ejecutivo: confirmar/modificar/rechazar/cancelar, registrar resultado)
         → Solicitud de arriendo (Cliente)
            → Evaluación (Ejecutivo)
               → Reserva de propiedad (estado Reservada)
```

Este flujo DEBE poder demostrarse de punta a punta: React → Node/Express → MongoDB.

---

## 8. Modelo de datos MongoDB 🔶 (propuesta mínima)

El documento exige como mínimo: **usuarios, propietarios, clientes, propiedades, imágenes (o referencias), visitas y solicitudes de arriendo**. La bitácora se añade por RNF-12.

### 8.1 Colecciones

| Colección | Campos sugeridos |
|---|---|
| `usuarios` | `_id`, `nombre`, `email` (único), `passwordHash`, `rol` (`ADMIN`\|`EJECUTIVO`\|`PROPIETARIO`\|`CLIENTE`), `activo`, `propietarioId?`, `clienteId?`, `createdAt`, `updatedAt` |
| `propietarios` | `_id`, `nombre`, `identificador` (RUT/ID), `email`, `telefono`, `estado`, `createdAt` |
| `clientes` | `_id`, `nombre`, `identificador` (único), `email`, `telefono`, `estado` (`INTERESADO`\|`ARRENDATARIO`), `createdAt` |
| `propiedades` | `_id`, `tipo`, `propietarioId`, `ejecutivoId`, `direccion`, `comuna`, `superficie`, `dormitorios`, `banos`, `estacionamientos`, `valorArriendo`, `gastosComunes`, `caracteristicas[]`, `imagenes[]` (refs), `estado`, `activo`, `createdAt`, `updatedAt` |
| `tiposPropiedad` | `_id`, `nombre` (para extensibilidad: Departamento, Casa, Oficina, Local comercial, …) |
| `imagenes` | `_id`, `propiedadId`, `url/ruta`, `formato`, `tamano`, `orden` |
| `visitas` | `_id`, `propiedadId`, `clienteId`, `ejecutivoId`, `fechaInicio`, `fechaFin`, `observaciones`, `estado`, `resultado`, `createdAt` |
| `solicitudesArriendo` | `_id`, `propiedadId`, `clienteId`, `ejecutivoId`, `antecedentes{}`, `estado`, `observaciones[]`, `createdAt`, `updatedAt` |
| `bitacora` | `_id`, `entidad`, `entidadId`, `accion`, `estadoAnterior`, `estadoNuevo`, `usuarioId`, `observacion`, `fecha` |

### 8.2 Índices recomendados 🔶
- `usuarios.email` único; `clientes.identificador` único; `propietarios.identificador` único.
- `propiedades`: compuesto `{ estado, comuna, tipo, valorArriendo }` para filtros del catálogo (RNF-13).
- `visitas`: `{ ejecutivoId, fechaInicio, fechaFin }` para detectar solapamientos.
- `solicitudesArriendo`: `{ propiedadId, estado }`; índice único parcial sobre `propiedadId` donde `estado = "Aprobada"` para garantizar RN-14.

---

## 9. API REST 🔶 (propuesta orientativa)

El documento exige "API REST o servicios backend documentados según los CU seleccionados". Prefijo sugerido: `/api`.

| Recurso | Endpoints sugeridos | Roles |
|---|---|---|
| Auth | `POST /auth/login`, `POST /auth/register` (clientes), `GET /auth/me` | Todos |
| Usuarios | `GET/POST/PUT /usuarios`, `PATCH /usuarios/:id/estado` | Admin |
| Propietarios | `GET/POST/PUT /propietarios`, `PATCH /propietarios/:id/estado` | Ejecutivo |
| Propiedades | `GET/POST/PUT /propiedades`, `PATCH /propiedades/:id/estado`, `POST /propiedades/:id/imagenes` | Ejecutivo |
| Catálogo público | `GET /catalogo?comuna=&tipo=&precioMin=&precioMax=&dormitorios=&banos=`, `GET /catalogo/:id` | Público / Cliente |
| Mis propiedades | `GET /mis-propiedades` | Propietario |
| Clientes | `GET/POST/PUT /clientes` | Ejecutivo |
| Visitas | `POST /visitas` (cliente), `GET /visitas`, `PATCH /visitas/:id/{confirmar,rechazar,cancelar,resultado}`, `PUT /visitas/:id` | Cliente / Ejecutivo |
| Solicitudes | `POST /solicitudes`, `GET /solicitudes`, `PATCH /solicitudes/:id/{evaluar,aprobar,rechazar,cancelar}` | Cliente / Ejecutivo |
| Reservas | `POST /propiedades/:id/reserva`, `DELETE /propiedades/:id/reserva` | Ejecutivo |
| Reportes | `GET /reportes/{propiedades,visitas,solicitudes,pagos,requerimientos}` | Admin / Ejecutivo |

**Códigos de error esperados:** `400` validación, `401` no autenticado, `403` sin permiso, `404` no existe, `409` conflicto (transición de estado inválida, visita superpuesta, aprobación duplicada).

---

## 10. Reportes (RF12) 📄

Consultas requeridas:
- Propiedades disponibles y arrendadas.
- Visitas realizadas.
- Solicitudes de arriendo recibidas (por estado).
- Pagos.
- Requerimientos pendientes de las propiedades.

Información consolidada deseada por la administración (§2.2, P10): también **contratos próximos a vencer** y **pagos atrasados**.

> ⚠️ **Ambigüedad:** el documento no define modelos para contratos, pagos ni requerimientos. Para RF12 se debe decidir con el cliente/docente si se implementan como colecciones simples, datos semilla o consultas simuladas.

---

## 11. Entregables mínimos 📄

1. Repositorio con estructura `frontend/`, `backend/` y `database/` claramente organizada.
2. Prototipo funcional: navegación, autenticación, formularios, tablas/listados, catálogo con filtros, carga o visualización de imágenes y diseño responsive.
3. Implementación de los 4 perfiles: Administrador, Ejecutivo Inmobiliario, Propietario y Cliente/Arrendatario.
4. API REST o servicios backend documentados.
5. Modelo de datos MongoDB (mínimo: usuarios, propietarios, clientes, propiedades, imágenes/referencias, visitas, solicitudes de arriendo).
6. Datos iniciales (seed) con distintos propietarios, tipos de propiedad, estados, clientes, visitas y solicitudes.
7. Implementación y evidencia de reglas de negocio: estados de propiedad, prevención de visitas superpuestas, evaluación de solicitudes, reserva.
8. Evidencia de integración Fullstack con flujos end-to-end (React → Express → MongoDB).
9. Evidencia funcional del flujo principal (§7).
10. Usuarios de prueba para cada perfil y capturas de las principales funcionalidades.

### 11.1 Estructura de repositorio sugerida 🔶

```
/
├── frontend/      # React app (HTML/CSS, responsive)
├── backend/       # Node.js + Express (rutas, controladores, servicios, middlewares)
├── database/      # Esquemas, scripts de seed, documentación del modelo
└── docs/          # Diagrama de casos de uso, API, capturas
```

---

## 12. Criterios de aceptación clave 🔶 (derivados)

| # | Criterio | Verifica |
|---|---|---|
| CA-01 | Un Propietario autenticado solo ve sus propiedades; consultar una ajena devuelve 403/404. | RNF-07 |
| CA-02 | El catálogo público nunca expone datos de contacto del propietario. | RNF-08 |
| CA-03 | Crear/confirmar una visita que solape horario del mismo Ejecutivo devuelve 409. | RF8 |
| CA-04 | Una transición de estado de propiedad no permitida devuelve 409 con mensaje claro. | RF4 |
| CA-05 | Aprobar una segunda solicitud para una propiedad ya reservada es rechazado. | RF11 |
| CA-06 | Cancelar/liberar una reserva devuelve la propiedad a un estado comercializable. | RF11 |
| CA-07 | Registrar un cliente con identificador ya existente es rechazado. | RF6 |
| CA-08 | Eliminar una entidad con historial realiza baja lógica, no borrado físico. | RNF-10 |
| CA-09 | Cada cambio de estado queda en bitácora con usuario y fecha. | RNF-12 |
| CA-10 | El flujo completo consulta → visita → solicitud → evaluación → reserva funciona desde la UI. | §7 |
| CA-11 | Contraseñas almacenadas con hash (bcrypt/argon2); tokens con expiración. | RNF-05 |
| CA-12 | Imágenes que excedan formato/tamaño/cantidad permitidos son rechazadas. | RNF-11 |

---

## 13. Puntos abiertos (requieren decisión)

1. **Valores concretos** de restricciones de imágenes (formatos, tamaño máximo, cantidad por propiedad).
2. **Antecedentes** exigidos en la solicitud de arriendo (RF9: "antecedentes definidos"): el documento no los lista.
3. **Contratos, pagos y requerimientos:** alcance real dentro del prototipo (ver §10).
4. **Duración de visitas** para calcular solapamientos (el documento solo menciona fecha y hora).
5. **Registro de Propietarios y Clientes:** quién crea las cuentas de usuario (¿autorregistro del cliente? ¿alta por Ejecutivo/Admin?).
6. **Asignación de Ejecutivo** a propiedad (P3): ¿manual, automática o por comuna?
7. **Transiciones exactas** de estado (§6.5–6.7): confirmar propuesta.
8. **Alcance del perfil Arrendatario** ("según las funcionalidades implementadas por el equipo").
9. **Parámetros generales** que administra el Administrador (RF1/Solución).

---

## 14. Figura de referencia

El documento original incluye la **Figura 1: Diagrama referencial de casos de uso** (imagen). Actores: Administrador, Ejecutivo Inmobiliario, Propietario, Cliente/Arrendatario. Casos de uso mínimos dentro del límite del sistema: Autenticar usuarios, Administrar propietarios, Administrar propiedades, Publicar y consultar propiedades, Administrar clientes interesados, Solicitar visita, Gestionar visitas, Solicitar arriendo, Evaluar solicitud y reservar propiedad. (Ver matriz en §3.1.)
