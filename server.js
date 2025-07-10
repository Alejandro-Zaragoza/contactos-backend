const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para CORS y parseo de body
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Conexión a la base de datos SQLite
const db = new sqlite3.Database(path.join(__dirname, 'database', 'contactos.db'));

// Crear tabla contactos si no existe
db.run(`CREATE TABLE IF NOT EXISTS contactos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT,
  domicilio TEXT,
  correo TEXT,
  telefono TEXT
)`);

// Rutas API

// Obtener todos los contactos
app.get('/api/contactos', (req, res) => {
  db.all('SELECT * FROM contactos', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Obtener un contacto por id
app.get('/api/contactos/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM contactos WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Crear nuevo contacto
app.post('/api/contactos', (req, res) => {
  const { nombre, domicilio, correo, telefono } = req.body;
  const stmt = db.prepare('INSERT INTO contactos (nombre, domicilio, correo, telefono) VALUES (?, ?, ?, ?)');
  stmt.run([nombre, domicilio, correo, telefono], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Contacto guardado', id: this.lastID });
  });
});

// Actualizar contacto por id
app.post('/api/contactos/:id', (req, res) => {
  const { nombre, domicilio, correo, telefono } = req.body;
  const id = req.params.id;
  const stmt = db.prepare('UPDATE contactos SET nombre=?, domicilio=?, correo=?, telefono=? WHERE id=?');
  stmt.run([nombre, domicilio, correo, telefono, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Contacto actualizado' });
  });
});

// Eliminar contacto por id
app.delete('/api/contactos/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM contactos WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Contacto eliminado' });
  });
});

// Buscar contactos por nombre (query string)
app.get('/api/search', (req, res) => {
  const nombre = req.query.nombre || '';
  db.all('SELECT * FROM contactos WHERE nombre LIKE ?', [`%${nombre}%`], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor API corriendo en http://localhost:${PORT}`);
});
