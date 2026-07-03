/*=====================================
        BUSCADOR SWISSCOL
=====================================*/

const btnBuscar = document.getElementById("btnBuscar");
const panelBusqueda = document.getElementById("panelBusqueda");
const inputBuscar = document.getElementById("inputBuscar");

btnBuscar.addEventListener("click", (e) => {

    // Evita que el clic se propague al documento
    e.stopPropagation();

    panelBusqueda.classList.toggle("mostrar");

    if (panelBusqueda.classList.contains("mostrar")) {
        inputBuscar.focus();
    }

});

// Evita que el panel se cierre cuando el usuario hace clic dentro de él
panelBusqueda.addEventListener("click", (e) => {

    e.stopPropagation();

});

// Cierra el buscador al hacer clic en cualquier parte de la página
document.addEventListener("click", () => {

    panelBusqueda.classList.remove("mostrar");

});

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        panelBusqueda.classList.remove("mostrar");

    }

});

inputBuscar.addEventListener("keyup", () => {

    const texto = inputBuscar.value.toLowerCase();

    const resultado = productos.filter(producto =>

        producto.nombre.toLowerCase().includes(texto) ||

        producto.categoria.toLowerCase().includes(texto) ||

        producto.descripcion.toLowerCase().includes(texto)

    );

    pintarProductos(resultado);

});
