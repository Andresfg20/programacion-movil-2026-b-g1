const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

let productos = [
  { id: 1, nombre: "Laptop Pro", precio: 1200 },
  { id: 2, nombre: "Smartphone X", precio: 800 }
];

// Endpoint GET /productos
app.get("/productos", (req, res) => {
  res.json(productos);
});

// Endpoint POST /productos
app.post("/productos", (req, res) => {
  const { nombre, precio } = req.body;

  if (!nombre || !precio) {
    return res.status(400).json({ error: "Nombre y precio son obligatorios" });
  }

  const nuevoProducto = {
    id: productos.length + 1,
    nombre,
    precio: parseFloat(precio)
  };

  productos.push(nuevoProducto);
  res.status(201).json(nuevoProducto);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor API ejecutándose en http://localhost:${PORT}`);
});