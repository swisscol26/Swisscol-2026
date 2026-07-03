/*======================================
        MODAL PRODUCTO
======================================*/

const modalProducto = document.getElementById("modalProducto");
const cerrarModalProductoBtn = document.getElementById("cerrarModal");

const modalImagen = document.getElementById("modalImagen");
const modalNombre = document.getElementById("modalNombre");
const modalCategoria = document.getElementById("modalCategoria");
const modalDescripcion = document.getElementById("modalDescripcion");
const modalPrecio = document.getElementById("modalPrecio");
const modalEstrellas = document.getElementById("modalEstrellas");

const btnAgregarModal = document.getElementById("btnAgregarModal");

const btnComprarAhora = document.getElementById("btnComprarAhora");

const btnMas = document.getElementById("masCantidad");
const btnMenos = document.getElementById("menosCantidad");

const cantidadProducto = document.getElementById("cantidadProducto");

let productoSeleccionado = null;

let cantidad = 1;

function abrirModalProducto(idProducto){

    productoSeleccionado = productos.find(
        p => p.id == idProducto
    );

    if(!productoSeleccionado) return;

    cantidad = 1;

    cantidadProducto.textContent = cantidad;

    modalImagen.src = productoSeleccionado.imagen;

    modalNombre.textContent = productoSeleccionado.nombre;

    modalCategoria.textContent =
        productoSeleccionado.categoria;

    modalDescripcion.textContent =
        productoSeleccionado.descripcion;

    modalPrecio.textContent =
        "$" + productoSeleccionado.precio.toLocaleString();

    modalEstrellas.innerHTML =
        "⭐".repeat(productoSeleccionado.valoracion);

    modalProducto.classList.add("activo");

    document.body.style.overflow = "hidden";

}

function cerrarModalProducto(){

    modalProducto.classList.remove("activo");

    document.body.style.overflow = "auto";

}

btnMas.addEventListener("click",()=>{

    cantidad++;

    cantidadProducto.textContent = cantidad;

});

btnMenos.addEventListener("click",()=>{

    if(cantidad>1){

        cantidad--;

        cantidadProducto.textContent = cantidad;

    }

});

btnAgregarModal.addEventListener("click",()=>{

    for(let i=0;i<cantidad;i++){

        agregarAlCarrito(productoSeleccionado.id);

    }

    cerrarModalProducto();

});

btnComprarAhora.addEventListener("click",()=>{

    for(let i=0;i<cantidad;i++){

        agregarAlCarrito(productoSeleccionado.id);

    }

    cerrarModalProducto();

    panelCarrito.classList.add("mostrar-carrito");

});

cerrarModal.addEventListener("click", cerrarModalProducto);

window.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        cerrarModalProducto();

    }

});

modalProducto.addEventListener("click",(e)=>{

    if(e.target===modalProducto){

        cerrarModalProducto();

    }

});

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        cerrarModalProducto();

    }

});



