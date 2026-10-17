/*======================================
        MODAL PRODUCTO
======================================*/

const modalProducto = document.getElementById("modalProducto");
const cerrarModalProductoBtn = document.getElementById("cerrarModal");

const modalImagen = document.getElementById("modalImagen");
const modalNombre = document.getElementById("modalNombre");
const modalReferencia = document.createElement("p");
modalReferencia.hidden = true;
modalReferencia.style.fontSize = "13px";
modalReferencia.style.color = "#666";
modalReferencia.style.margin = "8px 0 12px";

modalNombre.insertAdjacentElement("afterend", modalReferencia);
const modalCategoria = document.getElementById("modalCategoria");
const modalDescripcion = document.getElementById("modalDescripcion");

const seccionCaracteristicas = document.createElement("section");
seccionCaracteristicas.className = "caracteristicas-producto";
seccionCaracteristicas.hidden = true;

const tituloCaracteristicas = document.createElement("h3");
tituloCaracteristicas.textContent = "Características técnicas";

const textoCaracteristicas = document.createElement("p");
textoCaracteristicas.style.whiteSpace = "pre-wrap";
textoCaracteristicas.style.overflowWrap = "anywhere";

seccionCaracteristicas.append(
    tituloCaracteristicas,
    textoCaracteristicas
);

modalDescripcion.insertAdjacentElement(
    "afterend",
    seccionCaracteristicas
);

const modalPrecio = document.getElementById("modalPrecio");
const modalEstrellas = document.getElementById("modalEstrellas");

const btnAgregarModal = document.getElementById("btnAgregarModal");

const btnComprarAhora = document.getElementById("btnComprarAhora");

const btnMas = document.getElementById("masCantidad");
const btnMenos = document.getElementById("menosCantidad");

const cantidadProducto = document.getElementById("cantidadProducto");

let productoSeleccionado = null;

let cantidad = 1;
let solicitudModal = 0;

async function abrirModalProducto(idProducto) {
    cerrarModalProducto();

    const solicitudActual = ++solicitudModal;

    try {
        await actualizarProductoDesdeAPI(idProducto);

        // Evita abrir una selección anterior si el usuario
        // cambió de producto o cerró mientras cargaba.
        if (solicitudActual !== solicitudModal) return;

        mostrarModalProducto(idProducto);
    } catch (error) {
        if (solicitudActual !== solicitudModal) return;

        console.error("Error al actualizar el producto:", error);

        alert(
            "No pudimos comprobar el precio y las existencias. " +
            "Intenta abrir el producto nuevamente."
        );
    }
}

function mostrarModalProducto(idProducto){

    productoSeleccionado = productos.find(
        p => p.id == idProducto
    );

    if(!productoSeleccionado) return;

    const productoEnCarrito = carrito.find(
    item => item.id == productoSeleccionado.id
);

    const cantidadEnCarrito = productoEnCarrito
    ? productoEnCarrito.cantidad
    : 0;

    const disponibles = Math.max(
    0,
    productoSeleccionado.stock - cantidadEnCarrito
);

    cantidad = disponibles > 0 ? 1 : 0;

    cantidadProducto.textContent = cantidad;

    btnAgregarModal.disabled = disponibles === 0;
    btnComprarAhora.disabled = disponibles === 0;

    modalImagen.src = productoSeleccionado.imagen;

    modalNombre.textContent = productoSeleccionado.nombre;

    const referencia = productoSeleccionado.referencia?.trim() || "";

    modalReferencia.textContent = referencia
        ? `Referencia: ${referencia}`
        : "";

    modalReferencia.hidden = referencia === "";

    modalCategoria.textContent =
        productoSeleccionado.categoria;

    modalDescripcion.textContent =
        productoSeleccionado.descripcion;

        const caracteristicas =
    productoSeleccionado.caracteristicas || "";

    textoCaracteristicas.textContent = caracteristicas;
    seccionCaracteristicas.hidden = caracteristicas.trim() === "";

    modalPrecio.textContent =
        "$" + productoSeleccionado.precio.toLocaleString();

    modalEstrellas.innerHTML =
        "⭐".repeat(productoSeleccionado.valoracion);

    modalProducto.classList.add("activo");

    document.body.style.overflow = "hidden";

}

function cerrarModalProducto() {
    solicitudModal++;

    modalProducto.classList.remove("activo");
    document.body.style.overflow = "auto";
}

btnMas.addEventListener("click", () => {
    if (!productoSeleccionado) return;

    const existe = carrito.find(
        item => item.id == productoSeleccionado.id
    );

    const cantidadEnCarrito = existe ? existe.cantidad : 0;

    const disponibles = Math.max(
        0,
        productoSeleccionado.stock - cantidadEnCarrito
    );

    if (cantidad >= disponibles) {
        return;
    }

    cantidad++;
    cantidadProducto.textContent = cantidad;
});

btnMenos.addEventListener("click",()=>{

    if(cantidad>1){

        cantidad--;

        cantidadProducto.textContent = cantidad;

    }

});

btnAgregarModal.addEventListener("click", async () => {
    if (!productoSeleccionado || agregandoAlCarrito) return;

    const solicitudActual = solicitudModal;
    const productoId = productoSeleccionado.id;
    const cantidadSolicitada = cantidad;

    btnAgregarModal.disabled = true;
    btnComprarAhora.disabled = true;

    const agregado = await agregarAlCarrito(
        productoId,
        cantidadSolicitada
    );

    if (solicitudActual !== solicitudModal) return;

    if (agregado) {
        cerrarModalProducto();
    } else {
        mostrarModalProducto(productoId);
    }
});

btnComprarAhora.addEventListener("click", async () => {
    if (!productoSeleccionado || agregandoAlCarrito) return;

    const solicitudActual = solicitudModal;
    const productoId = productoSeleccionado.id;
    const cantidadSolicitada = cantidad;

    btnAgregarModal.disabled = true;
    btnComprarAhora.disabled = true;

    const agregado = await agregarAlCarrito(
        productoId,
        cantidadSolicitada
    );

    if (solicitudActual !== solicitudModal) return;

    if (agregado) {
        cerrarModalProducto();
        panelCarrito.classList.add("mostrar-carrito");
    } else {
        mostrarModalProducto(productoId);
    }
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
