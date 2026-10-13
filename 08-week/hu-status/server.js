const express = require("express");
const app = express();

// Middleware para leer formato JSON en el cuerpo de la petición
app.use(express.json());

// Base de datos en memoria
let tareas = [
  { id: 1, titulo: "Instalar Express", completada: true },
  { id: 2, titulo: "Crear endpoints GET y POST", completada: false }
];

// Endpoint GET /tareas - Obtener todas las tareas
app.get("/tareas", (req, res) => {
  res.json(tareas);
});

// Endpoint POST /tareas - Crear una nueva tarea
app.post("/tareas", (req, res) => {
  const { titulo } = req.body;
  
  if (!titulo) {
    return res.status(400).json({ error: "El título de la tarea es obligatorio" });
  }

  const nuevaTarea = {
    id: tareas.length + 1,
    titulo,
    completada: false
  };

  tareas.push(nuevaTarea);
  res.status(201).json(nuevaTarea);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor API REST ejecutándose en http://localhost:${PORT}`);
});