# Entidad Edificio y Relación con Aulas (Proyecto Horario / Agenda)

Implementación de la entidad `Edificio` y su relación uno a muchos (1:N) con `Aulas`, proveyendo endpoints REST JSON (compatibles con pruebas en Postman), vistas web interactivas para gestionar edificios y asignarlos a aulas, y los archivos de migración y modelos Eloquent listos para Laravel.

## User Review & Critical Decisions

> [!IMPORTANT]
> Decisiones confirmadas a través de la fase de clarificación interactiva:
> - **Entorno y Archivos**: Se implementará el API REST en el servidor Node.js activo y simultáneamente se generarán los archivos de modelos y migraciones de Laravel para sincronizar con el repositorio original.
> - **Vistas Web**: Se incluirán vistas web completas en EJS para administrar Edificios (`/edificios`) y asociar cada Aula a un Edificio mediante un selector desplegable.
> - **Eliminación en Cascada vs Desvinculación**: Al eliminar un Edificio, las aulas asociadas se desvincularán estableciendo su `edificio_id` a `null` (comportamiento seguro y no destructivo).

---

## 1. Overview & Core Concept

- **Modelo de Relación (1:N)**: Un edificio contiene múltiples aulas. Cada aula pertenece a un edificio (o puede no tener edificio asignado temporalmente).
- **Caso Real del Campus**:
  - **Edificio**: `id: 1`, `nombre: "Edificio C"`
  - **Aulas**:
    - Aula 1: `nombre: "C1"`, `edificio_id: 1`
    - Aula 2: `nombre: "C2"`, `edificio_id: 1`
    - Aula 3: `nombre: "C3"`, `edificio_id: 1`
    - Aula 4: `nombre: "C4"`, `edificio_id: 1`
    - Aula 5: `nombre: "C5"`, `edificio_id: 1`
- **Exposición Dual**:
  1. **Endpoints REST JSON** para consumo por Postman, frontend cliente o aplicaciones móviles.
  2. **Interfaz Web amigable** conectada al flujo existente de Aulas y Mesas.
  3. **Código fuente Laravel** para exportar al repositorio GitHub (`app/Models/Edificio.php`, migraciones `create_edificios_table`, etc.).

---

## 2. User Experience & Visual Design

### A. Endpoints REST (Postman Ready)
- `GET /api/edificios`: Lista todos los edificios con el conteo de aulas o arreglo de aulas pertenecientes.
- `POST /api/edificios`: Crea un nuevo edificio con `{ "nombre": "Edificio C" }`.
- `GET /api/edificios/:id`: Obtiene el edificio específico y sus aulas asignadas.
- `PUT /api/edificios/:id`: Actualiza el nombre del edificio con `{ "nombre": "Edificio C Modificado" }`.
- `DELETE /api/edificios/:id`: Elimina el edificio y actualiza las aulas vinculadas asignándoles `edificio_id = null`.
- `GET /api/edificios/:id/aulas`: Lista específicamente las aulas que pertenecen al edificio dado.

### B. Vistas Web Integradas (EJS)
- `/edificios`: Listado con tabla HTML limpia que muestra `ID`, `Nombre`, `Cantidad de Aulas`, y botones de acción (`EDITAR`, `VER AULAS`, `BORRAR`).
- `/edificios/create`: Formulario para registrar un nuevo edificio.
- `/edificios/:id/edit`: Formulario para modificar el nombre del edificio.
- `/edificios/:id`: Vista de detalle con el listado de aulas que pertenecen a ese edificio y enlace para agregar aulas directamente.
- Modificación en `/preagregar` y `/seleccionar/:x`: Agregar campo desplegable `<select name="edificio_id">` con la lista de edificios disponibles.
- Modificación en `/listar`: Agregar columna "Edificio" para visibilidad inmediata.
- Enlace en la página de inicio (`/`): Acceso rápido a Edificios y a la guía de prueba con Postman.

---

## 3. Key Product Decisions & Trade-Offs

- **Compatibilidad Postman & Navegador**: Los controladores REST responden en formato JSON con los códigos de estado HTTP estándar (`200 OK`, `201 Created`, `404 Not Found`).
- **Integridad Referencial en Memoria**:
  - Al eliminar un edificio, se ejecuta `aulas.forEach(a => { if (a.edificio_id === id) a.edificio_id = null; })` replicando `onDelete('set null')`.
- **Archivos Laravel Exportables**:
  - Se mantendrán archivos espejo en `laravel_files/` o estructura estándar (`app/Models/Edificio.php`, migraciones) listos para que el usuario pueda copiarlos o sincronizarlos con su repositorio original de GitHub cuando lo desee.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   Cliente / Postman                    │
└───────────────┬────────────────────────┬───────────────┘
                │ HTTP (HTML/EJS)        │ HTTP JSON (REST)
                ▼                        ▼
┌────────────────────────────────────────────────────────┐
│               Servidor Express (server.js)              │
│                                                        │
│  ┌──────────────────────┐    ┌──────────────────────┐  │
│  │   Vistas Web (EJS)   │    │    API REST JSON     │  │
│  │   /edificios         │    │    /api/edificios    │  │
│  │   /listar (con edif) │    │    /api/edificios/:id│  │
│  │   /preagregar        │    │    /api/aulas        │  │
│  └──────────┬───────────┘    └──────────┬───────────┘  │
│             │                           │              │
│             └─────────────┬─────────────┘              │
│                           ▼                            │
│           ┌───────────────────────────────┐            │
│           │      Almacén de Datos         │            │
│           │   edificios: [{ id, nombre }] │            │
│           │   aulas: [{ ..., edificio_id}]│            │
│           └───────────────────────────────┘            │
└────────────────────────────────────────────────────────┘
```

### Modelos de Datos

**Entidad Edificio**:
- `id` (entero autonumérico)
- `nombre` (string)
- `created_at` (timestamp ISO)
- `updated_at` (timestamp ISO)

**Entidad Aula (actualizada con llave foránea)**:
- `id` (entero autonumérico)
- `nombre` (string)
- `capacidad` (entero)
- `wifi` (booleano)
- `edificio_id` (entero, nullable, relación foránea a `edificios.id`)
- `created_at` (timestamp ISO)
- `updated_at` (timestamp ISO)

### Datos de Ejemplo Sembrados Inicialmente:
- **Edificio 1**: "Edificio C"
  - Aula 1: "C1" (`edificio_id: 1`, `capacidad: 30`, `wifi: true`)
  - Aula 2: "C2" (`edificio_id: 1`, `capacidad: 25`, `wifi: true`)
  - Aula 3: "C3" (`edificio_id: 1`, `capacidad: 35`, `wifi: true`)
  - Aula 4: "C4" (`edificio_id: 1`, `capacidad: 40`, `wifi: true`)
  - Aula 5: "C5" (`edificio_id: 1`, `capacidad: 30`, `wifi: false`)
- **Edificio 2**: "Edificio B"
  - Aula 6: "Laboratorio B1" (`edificio_id: 2`, `capacidad: 20`, `wifi: true`)
