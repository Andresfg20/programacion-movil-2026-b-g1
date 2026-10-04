const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// In-memory database
const tasks = [
  {
    id: '1',
    title: 'Learn Ionic React',
    description: 'Build a small app that consumes a REST API.',
    completed: false,
  },
];

const REQUIRED_FIELDS = ['title', 'description'];

// GET /api/tasks -> all tasks
app.get('/api/tasks', (req, res) => {
  res.status(200).json(tasks);
});

// GET /api/tasks/:id -> one task (used by the detail screen)
app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  return res.status(200).json(task);
});

// POST /api/tasks -> create a task
app.post('/api/tasks', (req, res) => {
  const body = req.body || {};

  for (const field of REQUIRED_FIELDS) {
    const value = body[field];
    if (typeof value !== 'string' || value.trim() === '') {
      return res.status(400).json({ error: `El campo '${field}' es requerido` });
    }
  }

  const newTask = {
    id: Date.now().toString(),
    title: body.title.trim(),
    description: body.description.trim(),
    completed: false,
  };

  tasks.push(newTask);
  return res.status(201).json(newTask);
});

// Malformed JSON body
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  return next(err);
});

// Unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en http://localhost:${PORT}`);
});
