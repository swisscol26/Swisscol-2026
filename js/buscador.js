/*=====================================
BUSCADOR Y FILTROS SWISSCOL
=====================================*/

const btnBuscar = document.getElementById("btnBuscar");
const panelBusqueda = document.getElementById("panelBusqueda");
const inputBuscar = document.getElementById("inputBuscar");
const filtroCategoria = document.getElementById("filtroCategoria");
const precioMinimo = document.getElementById("precioMinimo");
const precioMaximo = document.getElementById("precioMaximo");
const filtroDisponibilidad =
    document.getElementById("filtroDisponibilidad");
const limpiarFiltros = document.getElementById("limpiarFiltros");
const mensajeFiltros = document.getElementById("mensajeFiltros");

function normalizarTexto(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function aplicarFiltros() {
    const texto = normalizarTexto(inputBuscar.value);
    const categoria = filtroCategoria.value;
    const disponibilidad = filtroDisponibilidad.value;

    const minimo = precioMinimo.value === ""
        ? 0
        : Number(precioMinimo.value);

    const maximo = precioMaximo.value === ""
        ? Infinity
        : Number(precioMaximo.value);

    if (
        !precioMinimo.validity.valid ||
        !precioMaximo.validity.valid ||
        minimo > maximo
    ) {
        mensajeFiltros.textContent =
            "Revisa los precios: deben ser positivos o cero, " +
            "y el mínimo no puede superar al máximo.";
        return;
    }

    const resultado = productos.filter(producto => {
        const contenido = normalizarTexto([
            producto.nombre,
            producto.referencia,
            producto.descripcion,
            producto.categoria,
            producto.tipoCategoria
        ].join(" "));

        const coincideTexto = contenido.includes(texto);

        const coincideCategoria =
            categoria === "" ||
            String(producto.categoriaId) === categoria;

        const precio = Number(producto.precio);
        const coincidePrecio =
            precio >= minimo && precio <= maximo;

        const stock = Number(producto.stock);
        const coincideDisponibilidad =
            disponibilidad === "" ||
            (disponibilidad === "disponibles" && stock > 0) ||
            (disponibilidad === "agotados" && stock === 0);

        return coincideTexto &&
            coincideCategoria &&
            coincidePrecio &&
            coincideDisponibilidad;
    });

    pintarProductos(resultado);

    mensajeFiltros.textContent =
        `${resultado.length} producto(s) encontrado(s).`;
}

btnBuscar.addEventListener("click", event => {
    event.stopPropagation();
    panelBusqueda.classList.toggle("mostrar");

    if (panelBusqueda.classList.contains("mostrar")) {
        inputBuscar.focus();
    }
});

panelBusqueda.addEventListener("click", event => {
    event.stopPropagation();
});

document.addEventListener("click", () => {
    panelBusqueda.classList.remove("mostrar");
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        panelBusqueda.classList.remove("mostrar");
    }
});

[inputBuscar, precioMinimo, precioMaximo].forEach(campo => {
    campo.addEventListener("input", aplicarFiltros);
});

[filtroCategoria, filtroDisponibilidad].forEach(campo => {
    campo.addEventListener("change", aplicarFiltros);
});

limpiarFiltros.addEventListener("click", () => {
    inputBuscar.value = "";
    filtroCategoria.value = "";
    precioMinimo.value = "";
    precioMaximo.value = "";
    filtroDisponibilidad.value = "";

    aplicarFiltros();
    inputBuscar.focus();
});

async function cargarCategoriasDelFiltro() {
    try {
        const respuesta = await fetch(
            `${window.SWISSCOL_API_BASE}/categorias`
        );

        if (!respuesta.ok) {
            throw new Error("No fue posible consultar las categorías.");
        }

        const categorias = await respuesta.json();

        categorias.forEach(categoria => {
            const opcion = document.createElement("option");
            opcion.value = categoria.categoriaId;
            opcion.textContent = categoria.nombre;
            filtroCategoria.appendChild(opcion);
        });

        document.querySelectorAll(
        "#colecciones [data-categoria-id]"
    ).forEach(enlace => {
        enlace.addEventListener("click", () => {
            inputBuscar.value = "";
            precioMinimo.value = "";
            precioMaximo.value = "";
            filtroDisponibilidad.value = "";

            filtroCategoria.value = enlace.dataset.categoriaId;

            aplicarFiltros();
            panelBusqueda.classList.remove("mostrar");
        });
    });
    } catch (error) {
        console.error("Error al cargar el filtro de categorías:", error);
        filtroCategoria.disabled = true;
        mensajeFiltros.textContent =
            "No fue posible cargar las categorías. Recarga la página.";
    }
}

document.addEventListener("productosCargados", aplicarFiltros);

document.getElementById("btnExplorarCatalogo")
    .addEventListener("click", () => {
        limpiarFiltros.click();
        panelBusqueda.classList.remove("mostrar");

        document.getElementById("productos").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    function prepararGuiaProductos() {
    const guia = document.getElementById("guiaProductos");
    const formularioGuia =
        document.getElementById("formGuiaProductos");
    const categoriaGuia =
        document.getElementById("guiaCategoria");
    const presupuestoGuia =
        document.getElementById("guiaPresupuesto");
    const presupuestoMinimoGuia =
    document.getElementById("guiaPresupuestoMinimo");
    const disponiblesGuia =
        document.getElementById("guiaDisponibles");
    const mensajeGuia =
        document.getElementById("mensajeGuia");
    const botonResultados =
        document.getElementById("verResultadosGuia");

    let categoriasCargadas = false;

    document.getElementById("btnAyudameElegir")
        .addEventListener("click", async () => {
            panelBusqueda.classList.remove("mostrar");
            guia.showModal();
            mensajeGuia.textContent = "";

            if (categoriasCargadas) return;

            botonResultados.disabled = true;
            categoriaGuia.disabled = true;
            mensajeGuia.textContent = "Cargando categorías...";

            try {
                const respuesta = await fetch(
                    `${window.SWISSCOL_API_BASE}/categorias`
                );

                if (!respuesta.ok) {
                    throw new Error("No se pudieron cargar las categorías.");
                }

                const categorias = await respuesta.json();

                categoriaGuia.replaceChildren(
                    new Option("Todas las categorías", "")
                );

                categorias.forEach(categoria => {
                    categoriaGuia.add(
                        new Option(
                            categoria.nombre,
                            String(categoria.categoriaId)
                        )
                    );

                    // Mantiene sincronizado el filtro del catálogo.
                    const existe = Array.from(
                        filtroCategoria.options
                    ).some(opcion =>
                        opcion.value === String(categoria.categoriaId)
                    );

                    if (!existe) {
                        filtroCategoria.add(
                            new Option(
                                categoria.nombre,
                                String(categoria.categoriaId)
                            )
                        );
                    }
                });

                categoriasCargadas = true;
                categoriaGuia.disabled = false;
                filtroCategoria.disabled = false;
                botonResultados.disabled = false;
                mensajeGuia.textContent = "";
            } catch (error) {
                console.error("Error al preparar la guía:", error);
                mensajeGuia.textContent =
                    "No fue posible cargar la guía. Ciérrala y vuelve a intentarlo.";
            }
        });

    document.getElementById("cerrarGuia")
        .addEventListener("click", () => guia.close());

    formularioGuia.addEventListener("submit", evento => {
        evento.preventDefault();

        if (!categoriasCargadas) return;

        const minimo = presupuestoMinimoGuia.value === ""
            ? 0
            : Number(presupuestoMinimoGuia.value);

        const maximo = presupuestoGuia.value === ""
            ? Infinity
            : Number(presupuestoGuia.value);

        if (minimo > maximo) {
            mensajeGuia.textContent =
                "El presupuesto mínimo no puede superar al máximo.";
            presupuestoMinimoGuia.focus();
            return;
        }

        mensajeGuia.textContent = "";
        if (productos.length === 0) {
            mensajeGuia.textContent =
                "No hay productos cargados. Cierra la guía y revisa el catálogo.";
            return;
        }

        inputBuscar.value = "";
        precioMinimo.value = presupuestoMinimoGuia.value;
        precioMaximo.value = presupuestoGuia.value;
        filtroCategoria.value = categoriaGuia.value;
        filtroDisponibilidad.value =
            disponiblesGuia.checked ? "disponibles" : "";

        aplicarFiltros();
        guia.close();

        document.getElementById("productos").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        prepararGuiaProductos,
        { once: true }
    );
} else {
    prepararGuiaProductos();
}

cargarCategoriasDelFiltro();