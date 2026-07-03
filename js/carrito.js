/*========================================
            CARRITO SWISSCOL
=========================================*/

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const itemsCarrito = document.getElementById("itemsCarrito");

const contadorCarrito = document.getElementById("contador-carrito");

const totalCarrito = document.getElementById("totalCarrito");

actualizarCarrito();

function agregarAlCarrito(idProducto){

    const producto = productos.find(p => p.id == idProducto);

    const existe = carrito.find(item => item.id == idProducto);

    if(existe){

        existe.cantidad++;

    }else{

        carrito.push({

            ...producto,

            cantidad:1

        });

    }

    guardarCarrito();

    actualizarCarrito();

    mostrarNotificacion(producto.nombre);

}

function guardarCarrito(){

    localStorage.setItem(

        "carrito",

        JSON.stringify(carrito)

    );

}

function actualizarCarrito(){

    itemsCarrito.innerHTML="";

    let total=0;

    let cantidadTotal=0;

    carrito.forEach(producto=>{

        total += producto.precio * producto.cantidad;

        cantidadTotal += producto.cantidad;

        itemsCarrito.innerHTML += `

        <div class="item-carrito">

            <img src="${producto.imagen}">

            <div>

                <h4>${producto.nombre}</h4>

                <p>$${producto.precio.toLocaleString()}</p>

                <span>Cantidad: ${producto.cantidad}</span>

            </div>

            <button
                onclick="eliminarProducto(${producto.id})">

                ✖

            </button>

        </div>

        `;

    });

    contadorCarrito.textContent=cantidadTotal;

    totalCarrito.textContent="$"+total.toLocaleString();

}

function eliminarProducto(id){

    carrito = carrito.filter(

        producto => producto.id != id

    );

    guardarCarrito();

    actualizarCarrito();

}

