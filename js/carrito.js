/*========================================
            CARRITO SWISSCOL
=========================================*/

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const itemsCarrito = document.getElementById("itemsCarrito");

const contadorCarrito = document.getElementById("contador-carrito");

const totalCarrito = document.getElementById("totalCarrito");

actualizarCarrito();
let agregandoAlCarrito = false;

async function agregarAlCarrito(idProducto, cantidadAgregar = 1) {
    if (agregandoAlCarrito) return false;

    if (!Number.isInteger(cantidadAgregar) || cantidadAgregar <= 0) {
        alert("La cantidad debe ser un número entero mayor que cero.");
        return false;
    }

    agregandoAlCarrito = true;

    try {
        const producto =
            await actualizarProductoDesdeAPI(idProducto);

        const existe = carrito.find(
            item => item.id == idProducto
        );

        const cantidadActual = existe ? existe.cantidad : 0;

        const disponibles = Math.max(
            0,
            producto.stock - cantidadActual
        );

        if (cantidadAgregar > disponibles) {
            alert(
                `Las existencias actuales permiten agregar ` +
                `${disponibles} unidades más de ${producto.nombre}.`
            );
            return false;
        }

        if (existe) {
            existe.cantidad += cantidadAgregar;
        } else {
            carrito.push({
                ...producto,
                cantidad: cantidadAgregar
            });
        }

        guardarCarrito();
        actualizarCarrito();
        mostrarNotificacion(producto.nombre);

        return true;
    } catch (error) {
        console.error("No se pudo agregar al carrito:", error);

        alert(
            "No pudimos comprobar las existencias. " +
            "Intenta nuevamente."
        );

        return false;
    } finally {
        agregandoAlCarrito = false;
    }
}


function eliminarProducto(id){

    carrito = carrito.filter(

        producto => producto.id != id

    );

    guardarCarrito();

    actualizarCarrito();

}

function guardarCarrito() {
    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );
}

function actualizarCarrito() {
    itemsCarrito.innerHTML = "";

    let total = 0;
    let cantidadTotal = 0;

    carrito.forEach(producto => {
        total += producto.precio * producto.cantidad;
        cantidadTotal += producto.cantidad;

        const item = document.createElement("div");
        item.className = "item-carrito";

        const imagen = document.createElement("img");
        imagen.src = producto.imagen;
        imagen.alt = producto.nombre;

        const informacion = document.createElement("div");

        const nombre = document.createElement("h4");
        nombre.textContent = producto.nombre;

        const precio = document.createElement("p");
        precio.textContent =
            "$" + producto.precio.toLocaleString("es-CO");

        const cantidad = document.createElement("span");
        cantidad.textContent = "Cantidad: " + producto.cantidad;

        const botonEliminar = document.createElement("button");
        botonEliminar.textContent = "✖";
        botonEliminar.setAttribute("aria-label", "Eliminar producto");

        botonEliminar.addEventListener("click", () => {
            eliminarProducto(producto.id);
        });

        informacion.append(nombre, precio, cantidad);
        item.append(imagen, informacion, botonEliminar);
        itemsCarrito.appendChild(item);
    });

    if (carrito.length === 0) {
        itemsCarrito.textContent = "Tu carrito está vacío.";
    }

    contadorCarrito.textContent = cantidadTotal;
    totalCarrito.textContent =
        "$" + total.toLocaleString("es-CO");
}

function sincronizarCarrito() {
    const carritoActualizado = [];

    carrito.forEach(item => {
        const productoActual = productos.find(
            producto => producto.id == item.id
        );

        if (!productoActual || productoActual.stock <= 0) {
            return;
        }

        const cantidadAjustada = Math.min(
            item.cantidad,
            productoActual.stock
        );

        carritoActualizado.push({
            ...productoActual,
            cantidad: cantidadAjustada
        });
    });

    carrito = carritoActualizado;

    guardarCarrito();
    actualizarCarrito();
}