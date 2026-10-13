const API_URL = "http://localhost:3000/tareas";

// Función GET para listar tareas con manejo de errores
async function obtenerTareas() {
  try {
    const respuesta = await fetch(API_URL);
    
    if (!respuesta.ok) {
      throw new Error(`Error HTTP! Estado: ${respuesta.status}`);
    }

    const tareas = await respuesta.json();
    console.log("Tareas obtenidas:", tareas);
    return tareas;
  } catch (error) {
    console.error("Error al obtener las tareas:", error.message);
  }
}

// Función POST para crear una tarea con manejo de errores
async function crearTarea(titulo) {
  try {
    const respuesta = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ titulo })
    });

    if (!respuesta.ok) {
      throw new Error(`Error al crear la tarea. Estado: ${respuesta.status}`);
    }

    const nuevaTarea = await respuesta.json();
    console.log("Tarea creada con éxito:", nuevaTarea);
    return nuevaTarea;
  } catch (error) {
    console.error("Error al enviar la tarea al servidor:", error.message);
  }
}

// Ejemplo de prueba de consumo
(async () => {
  console.log("--- Obteniendo tareas iniciales ---");
  await obtenerTareas();

  console.log("\n--- Creando nueva tarea ---");
  await crearTarea("Consumir API desde Ionic React");

  console.log("\n--- Lista de tareas actualizada ---");
  await obtenerTareas();
})();