package kotlin

class Producto(
    val nombre: String,
    val precio: Double,
    val descripcion: String? = null
) {
    init {
        require(precio >= 0) { "El precio debe ser mayor o igual a 0" }
    }

    fun obtenerInformacion(): String {
        val desc = descripcion ?: "Sin descripción"
        return "Producto: $nombre | Precio: $$precio | Descripción: $desc"
    }
}

fun main() {
    // Ejemplo 1: Producto válido con descripción
    val producto1 = Producto("Laptop Gamer", 1200.50, "Laptop de alto rendimiento")
    println(producto1.obtenerInformacion())

    // Ejemplo 2: Producto válido con descripción nula
    val producto2 = Producto("Mouse Óptico", 25.0, null)
    println(producto2.obtenerInformacion())

    // Ejemplo 3: Captura de excepción para precio inválido
    try {
        val productoInvalido = Producto("Teclado Error", -15.0)
        println(productoInvalido.obtenerInformacion())
    } catch (e: IllegalArgumentException) {
        println("Error de validación: ${e.message}")
    }
}