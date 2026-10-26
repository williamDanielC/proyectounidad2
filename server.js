import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import methodOverride from 'method-override';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override supporting form body and query string
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

// In-Memory Data Store (Replicating Eloquent Models & Relational Integrity)
let edificios = [
  { id: 1, nombre: 'Edificio C', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 2, nombre: 'Edificio B', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
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

// --- WEB ROUTES: INICIO ---

app.get('/', (req, res) => {
  res.render('otra');
});

// --- WEB ROUTES: EDIFICIOS ---

// Listado de edificios
app.get('/edificios', (req, res) => {
  res.render('edificio/listado', { edificios, aulas });
});

// Formulario de agregar edificio
app.get('/edificios/create', (req, res) => {
  res.render('edificio/agregar');
});

// Guardar nuevo edificio
app.post('/edificios', (req, res) => {
  const { nombre } = req.body;
  const nuevo = {
    id: nextEdificioId++,
    nombre: nombre ? nombre.trim() : 'Sin Nombre',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  edificios.push(nuevo);
  res.redirect(303, '/edificios');
});

// Ver detalle de un edificio con sus aulas asociadas
app.get('/edificios/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const edificio = edificios.find((e) => e.id === id);
  if (!edificio) {
    return res.status(404).send('Edificio no encontrado');
  }
  const aulasDelEdificio = aulas.filter((a) => a.edificio_id === id);
  res.render('edificio/detalle', { edificio, aulas: aulasDelEdificio });
});

// Formulario de edición de edificio
app.get('/edificios/:id/edit', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const edificio = edificios.find((e) => e.id === id);
  if (!edificio) {
    return res.status(404).send('Edificio no encontrado');
  }
  res.render('edificio/editar', { edificio });
});

// Actualizar edificio
const handleUpdateEdificio = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const edificio = edificios.find((e) => e.id === id);
  if (!edificio) {
    return res.status(404).send('Edificio no encontrado');
  }
  if (req.body.nombre) {
    edificio.nombre = req.body.nombre.trim();
  }
  edificio.updated_at = new Date().toISOString();
  res.redirect(303, '/edificios');
};
app.put('/edificios/:id', handleUpdateEdificio);

// Borrar edificio (desvincula aulas a null)
const handleDeleteEdificio = (req, res) => {
  const id = parseInt(req.params.id, 10);
  // Set null on associated aulas
  aulas.forEach((a) => {
    if (a.edificio_id === id) {
      a.edificio_id = null;
      a.updated_at = new Date().toISOString();
    }
  });
  edificios = edificios.filter((e) => e.id !== id);
  res.redirect(303, '/edificios');
};
app.delete('/edificios/:id', handleDeleteEdificio);
app.post('/edificios/:id', (req, res) => {
  if (req.body && req.body._method && req.body._method.toLowerCase() === 'delete') {
    return handleDeleteEdificio(req, res);
  }
  return handleUpdateEdificio(req, res);
});

// --- WEB ROUTES: AULAS ---

// Aulas: Formulario de agregar
app.get('/preagregar', (req, res) => {
  const selectedEdificioId = req.query.edificio_id ? parseInt(req.query.edificio_id, 10) : null;
  res.render('aula/agregar', { edificios, selectedEdificioId });
});

// Aulas: Listar todas
app.all(['/listar', '/listar/'], (req, res) => {
  res.render('aula/listado', { aulas, edificios });
});

// Aulas: Guardar nueva aula
app.post(['/agregar', '/agregar/'], (req, res) => {
  const { nombre, capacidad, edificio_id } = req.body;
  const wifiVal = req.body.wifi;
  const wifi = (wifiVal === 'ON' || wifiVal === 'on' || wifiVal === true || wifiVal === 'true');
  const edifId = edificio_id ? parseInt(edificio_id, 10) : null;
  
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

// Aulas: Formulario de edición
app.get('/seleccionar/:x', (req, res) => {
  const id = parseInt(req.params.x, 10);
  const aula = aulas.find((a) => a.id === id);
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

// Aulas: Mostrar individual
app.get('/unoporuno/:x', (req, res) => {
  const id = parseInt(req.params.x, 10);
  const aula = aulas.find((a) => a.id === id);
  if (aula) {
    const edif = edificios.find((e) => e.id === aula.edificio_id);
    res.send(`Aula #${aula.id} - Nombre: ${aula.nombre} - Capacidad: ${aula.capacidad} - Edificio: ${edif ? edif.nombre : 'Sin Asignar'}`);
  } else {
    res.send(`mostrare la aula ${req.params.x}`);
  }
});

// Aulas: Actualizar
const handleUpdateAula = (req, res) => {
  const id = parseInt(req.params.x, 10);
  const aula = aulas.find((a) => a.id === id);
  if (!aula) {
    return res.status(404).send('Aula no encontrada');
  }
  aula.nombre = req.body.nombre ?? aula.nombre;
  aula.capacidad = req.body.capacidad ? parseInt(req.body.capacidad, 10) : aula.capacidad;
  const wifiVal = req.body.wifi;
  aula.wifi = (wifiVal === 'ON' || wifiVal === 'on' || wifiVal === true || wifiVal === 'true');
  aula.edificio_id = req.body.edificio_id ? parseInt(req.body.edificio_id, 10) : null;
  aula.updated_at = new Date().toISOString();
  res.redirect(303, '/listar');
};
app.put('/actualiza/:x', handleUpdateAula);
app.post('/actualiza/:x', handleUpdateAula);

// Aulas: Borrar
const handleDeleteAula = (req, res) => {
  const id = parseInt(req.params.x, 10);
  aulas = aulas.filter((a) => a.id !== id);
  res.redirect(303, '/listar');
};
app.delete('/borrar/:x', handleDeleteAula);
app.post('/borrar/:x', handleDeleteAula);

// --- WEB ROUTES: MESAS ---

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
  const mesa = mesas.find((m) => m.id === id);
  if (!mesa) {
    return res.status(404).send('Mesa no encontrada');
  }
  res.send(`Mesa #${mesa.id} - Creada: ${mesa.created_at} - Inventario: ${mesa.inventario}`);
});

app.get('/mesas/:id/edit', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const mesa = mesas.find((m) => m.id === id);
  if (!mesa) {
    return res.status(404).send('Mesa no encontrada');
  }
  res.render('mesa/editar', { mesa });
});

const handleUpdateMesa = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const mesa = mesas.find((m) => m.id === id);
  if (!mesa) {
    return res.status(404).send('Mesa no encontrada');
  }
  mesa.inventario = req.body.inventario ?? mesa.inventario;
  mesa.updated_at = new Date().toISOString();
  res.redirect(303, '/mesas');
};
app.put('/mesas/:id', handleUpdateMesa);
app.post('/mesas/:id', (req, res) => {
  if (req.body && req.body._method && req.body._method.toLowerCase() === 'delete') {
    return handleDeleteMesa(req, res);
  }
  return handleUpdateMesa(req, res);
});

const handleDeleteMesa = (req, res) => {
  const id = parseInt(req.params.id, 10);
  mesas = mesas.filter((m) => m.id !== id);
  res.redirect(303, '/mesas');
};
app.delete('/mesas/:id', handleDeleteMesa);

// ==========================================
// --- REST API ROUTES (Postman Ready) ---
// ==========================================

// 1. Listar todos los edificios (GET /api/edificios)
app.get('/api/edificios', (req, res) => {
  const result = edificios.map((e) => {
    const aulasDelEdificio = aulas.filter((a) => a.edificio_id === e.id);
    return {
      ...e,
      total_aulas: aulasDelEdificio.length,
      aulas: aulasDelEdificio
    };
  });
  res.json(result);
});

// 2. Crear edificio (POST /api/edificios)
app.post('/api/edificios', (req, res) => {
  const { nombre } = req.body;
  if (!nombre || !nombre.trim()) {
    return res.status(422).json({ error: 'El campo nombre es obligatorio' });
  }
  const nuevo = {
    id: nextEdificioId++,
    nombre: nombre.trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  edificios.push(nuevo);
  res.status(201).json(nuevo);
});

// 3. Obtener un edificio específico (GET /api/edificios/:id)
app.get('/api/edificios/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const edificio = edificios.find((e) => e.id === id);
  if (!edificio) {
    return res.status(404).json({ error: 'Edificio no encontrado' });
  }
  const aulasDelEdificio = aulas.filter((a) => a.edificio_id === id);
  res.json({
    ...edificio,
    total_aulas: aulasDelEdificio.length,
    aulas: aulasDelEdificio
  });
});

// 4. Actualizar edificio (PUT /api/edificios/:id)
app.put('/api/edificios/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const edificio = edificios.find((e) => e.id === id);
  if (!edificio) {
    return res.status(404).json({ error: 'Edificio no encontrado' });
  }
  if (!req.body.nombre || !req.body.nombre.trim()) {
    return res.status(422).json({ error: 'El campo nombre es obligatorio' });
  }
  edificio.nombre = req.body.nombre.trim();
  edificio.updated_at = new Date().toISOString();
  res.json(edificio);
});

// 5. Eliminar edificio (DELETE /api/edificios/:id)
app.delete('/api/edificios/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const edificio = edificios.find((e) => e.id === id);
  if (!edificio) {
    return res.status(404).json({ error: 'Edificio no encontrado' });
  }
  // Desvincular aulas asociadas (set null)
  let aulasDesvinculadas = 0;
  aulas.forEach((a) => {
    if (a.edificio_id === id) {
      a.edificio_id = null;
      a.updated_at = new Date().toISOString();
      aulasDesvinculadas++;
    }
  });
  edificios = edificios.filter((e) => e.id !== id);
  res.json({
    mensaje: `Edificio con ID ${id} eliminado exitosamente`,
    aulas_desvinculadas: aulasDesvinculadas,
    edificio_eliminado: edificio
  });
});

// 6. Listar aulas de un edificio específico (GET /api/edificios/:id/aulas)
app.get('/api/edificios/:id/aulas', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const edificio = edificios.find((e) => e.id === id);
  if (!edificio) {
    return res.status(404).json({ error: 'Edificio no encontrado' });
  }
  const aulasDelEdificio = aulas.filter((a) => a.edificio_id === id);
  res.json(aulasDelEdificio);
});

// 7. API REST Aulas (GET /api/aulas)
app.get('/api/aulas', (req, res) => {
  const result = aulas.map((a) => {
    const edif = edificios.find((e) => e.id === a.edificio_id);
    return {
      ...a,
      edificio: edif ? { id: edif.id, nombre: edif.nombre } : null
    };
  });
  res.json(result);
});

app.get('/api/aulas/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const aula = aulas.find((a) => a.id === id);
  if (!aula) {
    return res.status(404).json({ error: 'Aula no encontrada' });
  }
  const edif = edificios.find((e) => e.id === aula.edificio_id);
  res.json({
    ...aula,
    edificio: edif ? { id: edif.id, nombre: edif.nombre } : null
  });
});

// Validar datos de un aula (usado por POST y PUT)
const validarAula = (body, parcial = false) => {
  const errores = {};
  const { nombre, capacidad, edificio_id } = body;

  if (!parcial || nombre !== undefined) {
    if (!nombre || !String(nombre).trim()) {
      errores.nombre = 'El campo nombre es obligatorio';
    }
  }
  if (!parcial || capacidad !== undefined) {
    const cap = Number(capacidad);
    if (!Number.isInteger(cap) || cap <= 0) {
      errores.capacidad = 'La capacidad debe ser un número entero mayor a 0';
    }
  }
  if (edificio_id !== undefined && edificio_id !== null && edificio_id !== '') {
    const edifId = parseInt(edificio_id, 10);
    if (!edificios.some((e) => e.id === edifId)) {
      errores.edificio_id = `No existe un edificio con ID ${edificio_id}`;
    }
  }
  return errores;
};

// Crear aula (POST /api/aulas)
app.post('/api/aulas', (req, res) => {
  const errores = validarAula(req.body);
  if (Object.keys(errores).length > 0) {
    return res.status(422).json({ errores });
  }
  const { nombre, capacidad, wifi, edificio_id } = req.body;
  const nueva = {
    id: nextAulaId++,
    nombre: String(nombre).trim(),
    capacidad: Number(capacidad),
    wifi: wifi === true || wifi === 'true' || wifi === 1 || wifi === '1',
    edificio_id: edificio_id ? parseInt(edificio_id, 10) : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  aulas.push(nueva);
  res.status(201).json(nueva);
});

// Actualizar aula (PUT /api/aulas/:id)
app.put('/api/aulas/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const aula = aulas.find((a) => a.id === id);
  if (!aula) {
    return res.status(404).json({ error: 'Aula no encontrada' });
  }
  const errores = validarAula(req.body, true);
  if (Object.keys(errores).length > 0) {
    return res.status(422).json({ errores });
  }
  const { nombre, capacidad, wifi, edificio_id } = req.body;
  if (nombre !== undefined) aula.nombre = String(nombre).trim();
  if (capacidad !== undefined) aula.capacidad = Number(capacidad);
  if (wifi !== undefined) aula.wifi = wifi === true || wifi === 'true' || wifi === 1 || wifi === '1';
  if (edificio_id !== undefined) aula.edificio_id = edificio_id ? parseInt(edificio_id, 10) : null;
  aula.updated_at = new Date().toISOString();
  res.json(aula);
});

// Eliminar aula (DELETE /api/aulas/:id)
app.delete('/api/aulas/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const aula = aulas.find((a) => a.id === id);
  if (!aula) {
    return res.status(404).json({ error: 'Aula no encontrada' });
  }
  aulas = aulas.filter((a) => a.id !== id);
  res.json({ mensaje: `Aula con ID ${id} eliminada exitosamente`, aula_eliminada: aula });
});

// Sillas API
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
  const silla = sillas.find((s) => s.id === id);
  if (!silla) {
    return res.status(404).json({ error: 'Silla no encontrada' });
  }
  res.json(silla);
});

app.put('/api/sillas/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const silla = sillas.find((s) => s.id === id);
  if (!silla) {
    return res.status(404).json({ error: 'Silla no encontrada' });
  }
  silla.inventario = req.body.inventario ?? silla.inventario;
  silla.color = req.body.color ?? silla.color;
  silla.updated_at = new Date().toISOString();
  res.json(silla);
});

app.delete('/api/sillas/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = sillas.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Silla no encontrada' });
  }
  const deleted = sillas.splice(index, 1)[0];
  res.json(deleted);
});

app.get('/api/user', (req, res) => {
  res.json({ id: 1, name: 'Usuario Demo', email: 'user@example.com' });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});