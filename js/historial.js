/*======================================
        HISTORIAL DE PEDIDOS
======================================*/

const btnFinalizarCompra = document.getElementById("btnFinalizarCompra");
const panelHistorial = document.getElementById("panelHistorial");
const cerrarHistorial = document.getElementById("cerrarHistorial");
const listaPedidos = document.getElementById("listaPedidos");
const btnHistorial = document.getElementById("btnHistorial");

/*==============================
        GUARDAR PEDIDO
==============================*/

btnFinalizarCompra.addEventListener("click", finalizarCompra);

function finalizarCompra(){

    if(carrito.length === 0){

        alert("El carrito está vacío.");
        return;

    }

    let pedidos = JSON.parse(localStorage.getItem("pedidosSwisscol")) || [];

    const pedido = {

        id: "SW-" + Math.floor(Math.random()*9000+1000),

        fecha: new Date().toLocaleDateString("es-CO"),

        estado: "Recibido",

        total: carrito.reduce((acc,p)=>acc+(p.precio*p.cantidad),0),

        productos: [...carrito]

    };

    pedidos.push(pedido);

    localStorage.setItem(

        "pedidosSwisscol",

        JSON.stringify(pedidos)

    );

    carrito = [];

    localStorage.removeItem("carritoSwisscol");

    actualizarCarrito();

    cargarPedidos();

    alert("Pedido realizado correctamente.");

}

btnHistorial.addEventListener("click",()=>{

    cargarPedidos();

    panelHistorial.classList.add("activo");

});

cerrarHistorial.addEventListener("click",()=>{

    panelHistorial.classList.remove("activo");

});

function cargarPedidos(){

    const pedidos = JSON.parse(

        localStorage.getItem("pedidosSwisscol")

    ) || [];

    listaPedidos.innerHTML = "";

    if(pedidos.length===0){

        listaPedidos.innerHTML = `

            <p>No tienes pedidos registrados.</p>

        `;

        return;

    }

    pedidos.reverse().forEach(pedido=>{

        listaPedidos.innerHTML += `

            <div class="pedido-card">

                <h3>

                    Pedido #${pedido.id}

                </h3>

                <p>

                    Fecha:
                    ${pedido.fecha}

                </p>

                <p>

                    Estado:
                    ${pedido.estado}

                </p>

                <p>

                    Total:
                    $${pedido.total.toLocaleString()}

                </p>

                <hr>

                ${pedido.productos.map(producto=>`

                    <p>

                        ${producto.nombre}

                        x${producto.cantidad}

                    </p>

                `).join("")}

            </div>

        `;

    });

}

