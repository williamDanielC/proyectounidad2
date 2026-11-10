import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import methodOverride from 'method-override';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Configuración de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override
app.use(methodOverride((req) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        const method = req.body._method;
        delete req.body._method;
        return method;
    }

    if (req.query && '_method' in req.query) {
        const method = req.query._method;
        delete req.query._method;
        return method;
    }
}));

// ==================================================
// ALMACENAMIENTO TEMPORAL DE DATOS
// ==================================================

let edificios = [
    {
        id: 1,
        nombre: 'Edificio C',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 2,
        nombre: 'Edificio B',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

let nextEdificioId = 3;

let aulas = [
    { id: 1, nombre: 'C1', capacidad: 30, wifi: true, edificio_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, nombre: 'C2', capacidad: 25, wifi: true, edificio_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, nombre: 'C3', capacidad: 35, wifi: true, edificio_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 4, nombre: 'C4', capacidad: 40, wifi: true, edificio_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 5, nombre: 'C5', capacidad: 30, wifi: false, edificio_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 6, nombre: 'Laboratorio B1', capacidad: 20, wifi: true, edificio_id: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

let nextAulaId = 7;

let mesas = [
    { id: 1, inventario: 'MESA-001', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, inventario: 'MESA-002', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, inventario: 'MESA-003', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

let nextMesaId = 4;

let sillas = [
    { id: 1, inventario: 'SILLA-001', color: 'Azul', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, inventario: 'SILLA-002', color: 'Negro', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

let nextSillaId = 3;

// ==================================================
// FUNCIONES AUXILIARES PARA EDIFICIOS
// ==================================================

function limpiarNombre(nombre) {
    return typeof nombre === 'string' ? nombre.trim() : '';
}

function existeEdificio(nombre, excluirId = null) {
    const nombreNormalizado = limpiarNombre(nombre).toLowerCase();

    return edificios.some(edificio =>
        edificio.id !== excluirId &&
        edificio.nombre.toLowerCase() === nombreNormalizado
    );
}

// ==================================================
// RUTAS WEB: INICIO
// ==================================================

app.get('/', (req, res) => {
    res.render('otra');
});

// ==================================================
// RUTAS WEB: EDIFICIOS
// ==================================================

app.get('/edificios', (req, res) => {
    res.render('edificio/listado', { edificios, aulas });
});

app.get('/edificios/create', (req, res) => {
    res.render('edificio/agregar');
});

// Registrar edificio desde formulario
app.post('/edificios', (req, res) => {
    const nombre = limpiarNombre(req.body.nombre);

    if (!nombre) {
        return res.status(422).send('El nombre del edificio es obligatorio.');
    }

    if (existeEdificio(nombre)) {
        return res.status(422).send('Ya existe un edificio con ese nombre.');
    }

    const nuevo = {
        id: nextEdificioId++,
        nombre,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    edificios.push(nuevo);

    res.redirect(303, '/edificios');
});

// Mostrar edificio
app.get('/edificios/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const edificio = edificios.find(e => e.id === id);

    if (!edificio) {
        return res.status(404).send('Edificio no encontrado');
    }

    const aulasDelEdificio = aulas.filter(a => a.edificio_id === id);

    res.render('edificio/detalle', {
        edificio,
        aulas: aulasDelEdificio
    });
});

// Formulario de edición
app.get('/edificios/:id/edit', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const edificio = edificios.find(e => e.id === id);

    if (!edificio) {
        return res.status(404).send('Edificio no encontrado');
    }

    res.render('edificio/editar', { edificio });
});

// Actualizar edificio desde formulario
const handleUpdateEdificio = (req, res) => {
    const id = parseInt(req.params.id, 10);
    const edificio = edificios.find(e => e.id === id);

    if (!edificio) {
        return res.status(404).send('Edificio no encontrado');
    }

    const nombre = limpiarNombre(req.body.nombre);

    if (!nombre) {
        return res.status(422).send('El nombre del edificio es obligatorio.');
    }

    if (existeEdificio(nombre, id)) {
        return res.status(422).send('Ya existe otro edificio con ese nombre.');
    }

    edificio.nombre = nombre;
    edificio.updated_at = new Date().toISOString();

    res.redirect(303, '/edificios');
};

app.put('/edificios/:id', handleUpdateEdificio);

// Eliminar edificio
const handleDeleteEdificio = (req, res) => {
    const id = parseInt(req.params.id, 10);
    const edificio = edificios.find(e => e.id === id);

    if (!edificio) {
        return res.status(404).send('Edificio no encontrado');
    }

    aulas.forEach(aula => {
        if (aula.edificio_id === id) {
            aula.edificio_id = null;
            aula.updated_at = new Date().toISOString();
        }
    });

    edificios = edificios.filter(e => e.id !== id);

    res.redirect(303, '/edificios');
};

app.delete('/edificios/:id', handleDeleteEdificio);

app.post('/edificios/:id', (req, res) => {
    if (req.body && req.body._method &&
        req.body._method.toLowerCase() === 'delete') {
        return handleDeleteEdificio(req, res);
    }

    return handleUpdateEdificio(req, res);
});

// ==================================================
// RUTAS WEB: AULAS
// ==================================================

app.get('/preagregar', (req, res) => {
    const selectedEdificioId = req.query.edificio_id
        ? parseInt(req.query.edificio_id, 10)
        : null;

    res.render('aula/agregar', {
        edificios,
        selectedEdificioId
    });
});

app.all(['/listar', '/listar/'], (req, res) => {
    res.render('aula/listado', { aulas, edificios });
});

// Registrar aula
app.post(['/agregar', '/agregar/'], (req, res) => {
    const { nombre, capacidad, edificio_id } = req.body;
    const wifiVal = req.body.wifi;

    const wifi = (
        wifiVal === 'ON' ||
        wifiVal === 'on' ||
        wifiVal === true ||
        wifiVal === 'true'
    );

    const edifId = edificio_id
        ? parseInt(edificio_id, 10)
        : null;

    const nueva = {
        id: nextAulaId++,
        nombre: nombre || '',
        capacidad: capacidad ? parseInt(capacidad, 10) : 0,
        wifi,
        edificio_id: edifId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    aulas.push(nueva);

    res.redirect(303, '/listar');
});

// Formulario de edición de aula
app.get('/seleccionar/:x', (req, res) => {
    const id = parseInt(req.params.x, 10);
    const aula = aulas.find(a => a.id === id);

    if (!aula) {
        return res.status(404).send('Aula no encontrada');
    }

    res.render('aula/modificar', { aula, edificios });
});

app.get('/seleccionar', (req, res) => {
    if (aulas.length > 0) {
        res.redirect(`/seleccionar/${aulas[0].id}`);
    } else {
        res.redirect('/preagregar');
    }
});

// Mostrar aula individual
app.get('/unoporuno/:x', (req, res) => {
    const id = parseInt(req.params.x, 10);
    const aula = aulas.find(a => a.id === id);

    if (aula) {
        const edif = edificios.find(e => e.id === aula.edificio_id);

        res.send(
            `Aula #${aula.id} - Nombre: ${aula.nombre} - ` +
            `Capacidad: ${aula.capacidad} - Edificio: ` +
            `${edif ? edif.nombre : 'Sin Asignar'}`
        );
    } else {
        res.send(`mostrare la aula ${req.params.x}`);
    }
});

// Actualizar aula
const handleUpdateAula = (req, res) => {
    const id = parseInt(req.params.x, 10);
    const aula = aulas.find(a => a.id === id);

    if (!aula) {
        return res.status(404).send('Aula no encontrada');
    }

    aula.nombre = req.body.nombre ?? aula.nombre;

    aula.capacidad = req.body.capacidad
        ? parseInt(req.body.capacidad, 10)
        : aula.capacidad;

    const wifiVal = req.body.wifi;

    aula.wifi = (
        wifiVal === 'ON' ||
        wifiVal === 'on' ||
        wifiVal === true ||
        wifiVal === 'true'
    );

    aula.edificio_id = req.body.edificio_id
        ? parseInt(req.body.edificio_id, 10)
        : null;

    aula.updated_at = new Date().toISOString();

    res.redirect(303, '/listar');
};

app.put('/actualiza/:x', handleUpdateAula);
app.post('/actualiza/:x', handleUpdateAula);

// Eliminar aula
const handleDeleteAula = (req, res) => {
    const id = parseInt(req.params.x, 10);

    aulas = aulas.filter(a => a.id !== id);

    res.redirect(303, '/listar');
};

app.delete('/borrar/:x', handleDeleteAula);
app.post('/borrar/:x', handleDeleteAula);

// ==================================================
// RUTAS WEB: MESAS
// ==================================================

app.get('/mesas', (req, res) => {
    res.render('mesa/listado', { mesas });
});

app.get('/mesas/create', (req, res) => {
    res.render('mesa/agregar');
});

app.post('/mesas', (req, res) => {
    const { inventario } = req.body;

    const nueva = {
        id: nextMesaId++,
        inventario: inventario || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    mesas.push(nueva);

    res.redirect(303, '/mesas');
});

app.get('/mesas/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const mesa = mesas.find(m => m.id === id);

    if (!mesa) {
        return res.status(404).send('Mesa no encontrada');
    }

    res.send(
        `Mesa #${mesa.id} - Creada: ${mesa.created_at} - ` +
        `Inventario: ${mesa.inventario}`
    );
});

app.get('/mesas/:id/edit', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const mesa = mesas.find(m => m.id === id);

    if (!mesa) {
        return res.status(404).send('Mesa no encontrada');
    }

    res.render('mesa/editar', { mesa });
});

// Actualizar mesa
const handleUpdateMesa = (req, res) => {
    const id = parseInt(req.params.id, 10);
    const mesa = mesas.find(m => m.id === id);

    if (!mesa) {
        return res.status(404).send('Mesa no encontrada');
    }

    mesa.inventario = req.body.inventario ?? mesa.inventario;
    mesa.updated_at = new Date().toISOString();

    res.redirect(303, '/mesas');
};

app.put('/mesas/:id', handleUpdateMesa);

app.post('/mesas/:id', (req, res) => {
    if (req.body && req.body._method &&
        req.body._method.toLowerCase() === 'delete') {
        return handleDeleteMesa(req, res);
    }

    return handleUpdateMesa(req, res);
});

// Eliminar mesa
const handleDeleteMesa = (req, res) => {
    const id = parseInt(req.params.id, 10);

    mesas = mesas.filter(m => m.id !== id);

    res.redirect(303, '/mesas');
};

app.delete('/mesas/:id', handleDeleteMesa);

// ==================================================
// API REST: EDIFICIOS
// ==================================================

// Listar edificios
app.get('/api/edificios', (req, res) => {
    const result = edificios.map(e => {
        const aulasDelEdificio = aulas.filter(
            a => a.edificio_id === e.id
        );

        return {
            ...e,
            total_aulas: aulasDelEdificio.length,
            aulas: aulasDelEdificio
        };
    });

    res.json(result);
});

// Registrar edificio
app.post('/api/edificios', (req, res) => {
    const nombre = limpiarNombre(req.body.nombre);

    if (!nombre) {
        return res.status(422).json({
            error: 'El campo nombre es obligatorio'
        });
    }

    if (existeEdificio(nombre)) {
        return res.status(422).json({
            error: 'Ya existe un edificio con ese nombre'
        });
    }

    const nuevo = {
        id: nextEdificioId++,
        nombre,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    edificios.push(nuevo);

    res.status(201).json({
        mensaje: 'Edificio registrado exitosamente',
        data: nuevo
    });
});

// Obtener edificio específico
app.get('/api/edificios/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const edificio = edificios.find(e => e.id === id);

    if (!edificio) {
        return res.status(404).json({
            error: 'Edificio no encontrado'
        });
    }

    const aulasDelEdificio = aulas.filter(
        a => a.edificio_id === id
    );

    res.json({
        ...edificio,
        total_aulas: aulasDelEdificio.length,
        aulas: aulasDelEdificio
    });
});

// Actualizar edificio
app.put('/api/edificios/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const edificio = edificios.find(e => e.id === id);

    if (!edificio) {
        return res.status(404).json({
            error: 'Edificio no encontrado'
        });
    }

    const nombre = limpiarNombre(req.body.nombre);

    if (!nombre) {
        return res.status(422).json({
            error: 'El campo nombre es obligatorio'
        });
    }

    if (existeEdificio(nombre, id)) {
        return res.status(422).json({
            error: 'Ya existe otro edificio con ese nombre'
        });
    }

    edificio.nombre = nombre;
    edificio.updated_at = new Date().toISOString();

    res.json({
        mensaje: 'Edificio actualizado exitosamente',
        data: edificio
    });
});

// Eliminar edificio
app.delete('/api/edificios/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const edificio = edificios.find(e => e.id === id);

    if (!edificio) {
        return res.status(404).json({
            error: 'Edificio no encontrado'
        });
    }

    let aulasDesvinculadas = 0;

    aulas.forEach(a => {
        if (a.edificio_id === id) {
            a.edificio_id = null;
            a.updated_at = new Date().toISOString();
            aulasDesvinculadas++;
        }
    });

    edificios = edificios.filter(e => e.id !== id);

    res.json({
        mensaje: `Edificio con ID ${id} eliminado exitosamente`,
        aulas_desvinculadas: aulasDesvinculadas,
        edificio_eliminado: edificio
    });
});

// Listar aulas de un edificio
app.get('/api/edificios/:id/aulas', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const edificio = edificios.find(e => e.id === id);

    if (!edificio) {
        return res.status(404).json({
            error: 'Edificio no encontrado'
        });
    }

    const aulasDelEdificio = aulas.filter(
        a => a.edificio_id === id
    );

    res.json(aulasDelEdificio);
});

// ==================================================
// API REST: AULAS
// ==================================================

app.get('/api/aulas', (req, res) => {
    const result = aulas.map(a => {
        const edif = edificios.find(e => e.id === a.edificio_id);

        return {
            ...a,
            edificio: edif
                ? { id: edif.id, nombre: edif.nombre }
                : null
        };
    });

    res.json(result);
});

app.get('/api/aulas/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const aula = aulas.find(a => a.id === id);

    if (!aula) {
        return res.status(404).json({
            error: 'Aula no encontrada'
        });
    }

    const edif = edificios.find(e => e.id === aula.edificio_id);

    res.json({
        ...aula,
        edificio: edif
            ? { id: edif.id, nombre: edif.nombre }
            : null
    });
});

// ==================================================
// API REST: SILLAS
// ==================================================

app.get('/api/sillas', (req, res) => {
    res.json(sillas);
});

app.post('/api/sillas', (req, res) => {
    const { inventario, color } = req.body;

    const nueva = {
        id: nextSillaId++,
        inventario: inventario || '',
        color: color || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    sillas.push(nueva);

    res.json(nueva);
});

app.get('/api/sillas/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const silla = sillas.find(s => s.id === id);

    if (!silla) {
        return res.status(404).json({
            error: 'Silla no encontrada'
        });
    }

    res.json(silla);
});

app.put('/api/sillas/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const silla = sillas.find(s => s.id === id);

    if (!silla) {
        return res.status(404).json({
            error: 'Silla no encontrada'
        });
    }

    silla.inventario = req.body.inventario ?? silla.inventario;
    silla.color = req.body.color ?? silla.color;
    silla.updated_at = new Date().toISOString();

    res.json(silla);
});

app.delete('/api/sillas/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = sillas.findIndex(s => s.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: 'Silla no encontrada'
        });
    }

    const deleted = sillas.splice(index, 1)[0];

    res.json(deleted);
});

// Usuario de demostración
app.get('/api/user', (req, res) => {
    res.json({
        id: 1,
        name: 'Usuario Demo',
        email: 'user@example.com'
    });
});

// ==================================================
// INICIAR SERVIDOR
// ==================================================

app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
