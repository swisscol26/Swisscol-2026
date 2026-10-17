//======================================
// PRODUCTOS SWISSCOL
//======================================



    let productos = [];


    function pintarProductos(listaProductos){

        const contenedor = document.getElementById("contenedor-productos");

        contenedor.innerHTML = "";

        if(listaProductos.length === 0){

            contenedor.innerHTML = `

                <div class="sin-resultados">

                    <h2>No encontramos productos.</h2>

                    <p>Intenta realizar otra búsqueda.</p>

                </div>

            `;

            return;

        }

        listaProductos.forEach(producto => {

            contenedor.innerHTML += `

            <div class="producto" data-id="${producto.id}">

                <div class="producto-img">

                    <img src="${producto.imagen}" alt="${producto.nombre}">

                </div>

                <div class="producto-info">

                    <div class="estrellas">

                        ${"⭐".repeat(producto.valoracion)}

                    </div>

                    <h3>${producto.nombre}</h3>

                    <h2>$${producto.precio.toLocaleString()}</h2>

                    <button class="btn-rojo agregar-carrito"

                        data-id="${producto.id}">

                        Agregar al carrito

                    </button>
                    <button
                        class="btn-outline ver-detalle"
                        data-id="${producto.id}">

                        Ver detalles

                    </button>

                </div>

            </div>

            `;

        });

        activarBotonesCarrito();

    }


    function activarBotonesCarrito(){

        document.querySelectorAll(".agregar-carrito").forEach(boton=>{

            boton.addEventListener("click", async (e) => {
            e.stopPropagation();

            if (agregandoAlCarrito) return;

            boton.disabled = true;

            try {
                await agregarAlCarrito(boton.dataset.id);
            } finally {
                boton.disabled = false;
            }
        });

        });

        document.querySelectorAll(".producto").forEach(card=>{

            card.addEventListener("click",()=>{

                abrirModalProducto(card.dataset.id);

            });

        });

    }



    async function cargarProductosDesdeAPI() {
    try {
        const apiBase =
            `${window.SWISSCOL_API_BASE}`;

        const [respuestaProductos, respuestaCategorias] =
            await Promise.all([
                fetch(`${apiBase}/productos`),
                fetch(`${apiBase}/categorias`)
            ]);

        if (!respuestaProductos.ok) {
            throw new Error(
                `Error al consultar productos: ${respuestaProductos.status}`
            );
        }

        if (!respuestaCategorias.ok) {
            throw new Error(
                `Error al consultar categorías: ${respuestaCategorias.status}`
            );
        }

        const datos = await respuestaProductos.json();
        const categorias = await respuestaCategorias.json();

        const categoriasPorId = new Map(
            categorias.map(categoria => [
                Number(categoria.categoriaId),
                categoria
            ])
        );

        productos = datos.map(producto => {
            const categoria = categoriasPorId.get(
                Number(producto.categoryId)
            );

            return {
                id: producto.productId,
                nombre: producto.name.trim(),
                referencia: producto.reference?.trim() || "",
                descripcion: producto.description?.trim() || "",
                caracteristicas: producto.technicalDetails?.trim() || "",
                precioNormal: Number(producto.price),
                precioOferta: producto.offerPrice == null
                    ? null
                    : Number(producto.offerPrice),
                precio: Number(producto.offerPrice ?? producto.price),
                stock: obtenerStockDisponible(producto),
                categoriaId: producto.categoryId,
                categoria: categoria?.nombre || "Sin categoría",
                tipoCategoria: categoria?.tipo || "",
                valoracion: 0,
                imagen: "img/productos/" + (producto.image || "")
                    .trim()
                    .toLowerCase()
                    .replace(/\.jpg$/i, ".png")
            };
        });

        sincronizarCarrito();
        pintarProductos(productos);
        pintarOfertas();
        document.dispatchEvent(new Event("productosCargados"));

        } catch (error) {
        console.error("No se pudo cargar el catálogo:", error);

        document.getElementById("contenedor-productos").textContent =
            "No fue posible cargar el catálogo. Intenta recargar la página.";

        document.getElementById("bannerOfertas").hidden = true;

        document.getElementById("contenedor-ofertas")
            .replaceChildren();

        const avisoOfertas =
            document.getElementById("mensajeOfertas");

        avisoOfertas.hidden = false;
        avisoOfertas.textContent =
            "No fue posible cargar las ofertas. Intenta recargar la página.";
    }
}

    function pintarOfertas() {
    const contenedor = document.getElementById("contenedor-ofertas");
    const mensaje = document.getElementById("mensajeOfertas");
    const banner = document.getElementById("bannerOfertas");
    const tituloDescuento = document.getElementById("descuentoMaximo");

    contenedor.replaceChildren();

    const ofertas = productos.filter(producto =>
        Number.isFinite(producto.precioOferta) &&
        producto.precioOferta > 0 &&
        producto.precioOferta < producto.precioNormal &&
        producto.stock > 0
    );

    banner.hidden = ofertas.length === 0;
    mensaje.hidden = ofertas.length > 0;
    mensaje.textContent = ofertas.length === 0
        ? "Por ahora no hay ofertas con existencias disponibles."
        : "";

    const moneda = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 2
    });

    let mayorDescuento = 0;

    ofertas.forEach(producto => {
        // Redondeamos hacia abajo para no anunciar más descuento.
        const descuento = Math.floor(
            ((producto.precioNormal - producto.precioOferta) /
                producto.precioNormal) * 100
        );

        mayorDescuento = Math.max(mayorDescuento, descuento);

        const tarjeta = document.createElement("article");
        tarjeta.className = "oferta-card";

        const etiqueta = document.createElement("span");
        etiqueta.className = "porcentaje";
        etiqueta.textContent = descuento > 0
            ? `-${descuento}%`
            : "Oferta";

        const imagen = document.createElement("img");
        imagen.src = producto.imagen;
        imagen.alt = producto.nombre;
        imagen.loading = "lazy";

        const nombre = document.createElement("h3");
        nombre.textContent = producto.nombre;

        const precioAnterior = document.createElement("p");
        precioAnterior.className = "precio-anterior";
        precioAnterior.textContent = moneda.format(
            producto.precioNormal
        );

        const precioActual = document.createElement("p");
        precioActual.className = "precio-actual";
        precioActual.textContent = moneda.format(
            producto.precioOferta
        );

        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "btn-rojo";
        boton.textContent = "Comprar";
        boton.addEventListener("click", () => {
            abrirModalProducto(producto.id);
        });

        tarjeta.append(
            etiqueta,
            imagen,
            nombre,
            precioAnterior,
            precioActual,
            boton
        );

        contenedor.appendChild(tarjeta);
    });

    tituloDescuento.textContent = mayorDescuento > 0
        ? `${mayorDescuento}% de descuento`
        : "Precios especiales";

    banner.querySelector(".descuento").hidden =
        mayorDescuento === 0;
}

function prepararBotonOfertas() {
    document.getElementById("btnVerOfertas")
        .addEventListener("click", () => {
            document.getElementById("ofertas").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        prepararBotonOfertas,
        { once: true }
    );
} else {
    prepararBotonOfertas();

}

async function actualizarProductoDesdeAPI(idProducto) {
    const respuesta = await fetch(
        `${window.SWISSCOL_API_BASE}/productos/${idProducto}`,
        { cache: "no-store" }
    );

    if (!respuesta.ok) {
        throw new Error(
            "No fue posible comprobar las existencias del producto."
        );
    }

    const datos = await respuesta.json();

    const producto = productos.find(
        item => Number(item.id) === Number(idProducto)
    );

    if (!producto) {
        throw new Error(
            "El producto no está en el catálogo cargado."
        );
    }

    const stockActual = obtenerStockDisponible(datos);
    const precioActual = Number(datos.offerPrice ?? datos.price);

    if (
        !Number.isInteger(stockActual) ||
        stockActual < 0 ||
        !Number.isFinite(precioActual) ||
        precioActual <= 0
    ) {
        throw new Error(
            "No se pudieron verificar las existencias o el precio."
        );
    }

    producto.stock = stockActual;
    producto.precioNormal = Number(datos.price);
    producto.precioOferta = datos.offerPrice == null
        ? null
        : Number(datos.offerPrice);
    producto.precio = precioActual;

    sincronizarCarrito();

    if (typeof aplicarFiltros === "function") {
        aplicarFiltros();
    } else {
        pintarProductos(productos);
    }

    pintarOfertas();

    return producto;
    }

    function obtenerStockDisponible(datos) {
    const disponibles = datos.availableStock;

    if (
        !Number.isInteger(disponibles) ||
        disponibles < 0
    ) {
        throw new Error(
            "El servidor no devolvió existencias disponibles válidas. " +
            "Comprueba que Java esté actualizado y reiniciado."
        );
    }

    return disponibles;

}

cargarProductosDesdeAPI();
