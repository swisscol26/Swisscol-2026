/*======================================
        HISTORIAL DE PEDIDOS
======================================*/

const btnFinalizarCompra = document.getElementById("btnFinalizarCompra");
const panelHistorial = document.getElementById("panelHistorial");
const cerrarHistorial = document.getElementById("cerrarHistorial");
const listaPedidos = document.getElementById("listaPedidos");
const btnHistorial = document.getElementById("btnHistorial");
const dialogEnvio = document.getElementById("dialogEnvio");
const formDatosEnvio = document.getElementById("formDatosEnvio");
const cerrarEnvio = document.getElementById("cerrarEnvio");
const mensajeEnvio = document.getElementById("mensajeEnvio");
const enviarSolicitudPedido =
    document.getElementById("enviarSolicitudPedido");

let enviandoPedido = false;
let reportandoPago = false;

async function cargarDatosPago() {
    const respuesta = await fetch(
        `${window.SWISSCOL_API_BASE}/pagos/configuracion`,
        {
            method: "GET",
            credentials: "include",
            signal: AbortSignal.timeout(8000)
        }
    );

    if (!respuesta.ok) {
        throw new Error(
            "No fue posible cargar los datos para realizar el pago."
        );
    }

    const datos = await respuesta.json();

    if (!datos.numero || !datos.titular || datos.metodo !== "Nequi" ||
        datos.moneda !== "COP" || !Number.isInteger(datos.plazoHoras) || datos.plazoHoras <= 0) {
        throw new Error(
            "Los datos de pago de SwissCol no están configurados."
        );
    }

    return datos;
}

btnFinalizarCompra.addEventListener("click", async () => {
    if (enviandoPedido) return;

    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    btnFinalizarCompra.disabled = true;
    const autorizado = await exigirSesionCompra();
    btnFinalizarCompra.disabled = false;
    if (!autorizado) return;
    mensajeEnvio.textContent = "";

    if (!dialogEnvio.open) {
        dialogEnvio.showModal();
    }
});

cerrarEnvio.addEventListener("click", () => {
    if (!enviandoPedido) {
        dialogEnvio.close();
    }
});

dialogEnvio.addEventListener("cancel", event => {
    if (enviandoPedido) {
        event.preventDefault();
    }
});

formDatosEnvio.addEventListener("submit", finalizarCompra);

/*==============================
        GUARDAR PEDIDO
==============================*/

async function finalizarCompra(event) {
    event.preventDefault();

    if (enviandoPedido) return;
    if (!formDatosEnvio.reportValidity()) return;

    enviandoPedido = true;
    const autorizado = await exigirSesionCompra();
    enviandoPedido = false;
    if (!autorizado) return;

    mensajeEnvio.textContent = "";

    if (carrito.length === 0) {
        mensajeEnvio.textContent = "El carrito está vacío.";
        return;
    }

    const datos = new FormData(formDatosEnvio);

    const solicitud = {
        productos: carrito.map(producto => ({
            productoId: Number(producto.id),
            cantidad: Number(producto.cantidad)
        })),
        nombreDestinatario:
            String(datos.get("nombreDestinatario") ?? "").trim(),
        telefonoDestinatario:
            String(datos.get("telefonoDestinatario") ?? "").trim(),
        departamento:
            String(datos.get("departamento") ?? "").trim(),
        ciudad:
            String(datos.get("ciudad") ?? "").trim(),
        direccion:
            String(datos.get("direccion") ?? "").trim(),
        barrio:
            String(datos.get("barrio") ?? "").trim(),
        indicaciones:
            String(datos.get("indicaciones") ?? "").trim()
    };

    const obligatorios = [
        solicitud.nombreDestinatario,
        solicitud.telefonoDestinatario,
        solicitud.departamento,
        solicitud.ciudad,
        solicitud.direccion
    ];

    if (obligatorios.some(valor => valor === "")) {
        mensajeEnvio.textContent =
            "Completa los datos obligatorios sin dejar solo espacios.";
        return;
    }

    const telefono = solicitud.telefonoDestinatario;
    const digitos = telefono.replace(/[^0-9]/g, "");

    if (
        !/^\+?[0-9()\s-]+$/.test(telefono) ||
        digitos.length < 7 ||
        digitos.length > 15
    ) {
        mensajeEnvio.textContent =
            "Revisa el teléfono: debe contener entre 7 y 15 dígitos.";
        return;
    }

    enviandoPedido = true;
    btnFinalizarCompra.disabled = true;
    enviarSolicitudPedido.disabled = true;
    cerrarEnvio.disabled = true;
    enviarSolicitudPedido.textContent = "Enviando solicitud…";

    let pedidoGuardado = false;

    try {
        const respuesta = await fetch(
            `${window.SWISSCOL_API_BASE}/pedidos`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(solicitud)
            }
        );

        if (!respuesta.ok) {
            const error = await respuesta.json().catch(() => ({}));

            mensajeEnvio.textContent =
                respuesta.status === 401
                    ? "Inicia sesión antes de enviar tu pedido. " +
                      "Puedes cerrar esta ventana; tus datos se conservarán " +
                      "mientras no recargues la página."
                    : error.mensaje ||
                      "No fue posible registrar la solicitud.";

            return;
        }

        pedidoGuardado = true;

        const pedido = await respuesta.json();

        carrito = [];
        guardarCarrito();
        actualizarCarrito();

        formDatosEnvio.reset();
        dialogEnvio.close();

        alert(
            `Solicitud #${pedido.pedidoId} registrada correctamente.\n` +
            `Estado: ${pedido.estado}.\n` +
            `Total de productos: $${Number(pedido.total)
                .toLocaleString("es-CO")}.\n\n` +
            "El vendedor revisará la disponibilidad y el costo del envío. " +
            "Esta solicitud todavía no confirma el pago ni el despacho."
        );

    } catch (error) {
        console.error("Error al enviar el pedido:", error);

        mensajeEnvio.textContent = pedidoGuardado
            ? "El servidor guardó la solicitud, pero ocurrió un problema " +
            "al actualizar la página. Revisa Mis pedidos antes de continuar."
            : "No pudimos confirmar si la solicitud quedó guardada. " +
            "Revisa Mis pedidos antes de volver a enviarla.";

    } finally {
        enviandoPedido = false;
        btnFinalizarCompra.disabled = false;
        enviarSolicitudPedido.disabled = false;
        cerrarEnvio.disabled = false;
        enviarSolicitudPedido.textContent = "Enviar solicitud de compra";
    }
}

function formatoDinero(valor) {
    return Number(valor).toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function formatoFechaHora(fechaTexto) {
    if (!fechaTexto) {
        return "Pendiente de definir";
    }

    const fecha = new Date(/(?:Z|[+-]\d{2}:\d{2})$/.test(fechaTexto)
        ? fechaTexto : `${fechaTexto}-05:00`);

    if (Number.isNaN(fecha.getTime())) {
        return "Pendiente de definir";
    }

    return new Intl.DateTimeFormat("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Bogota"
    }).format(fecha);
}

async function reportarPago(
        pedidoId,
        referencia,
        boton,
        mensaje) {

    if (reportandoPago) return;

    const texto = referencia.value.trim();

    if (texto.length < 3 || texto.length > 100) {
        mensaje.textContent =
            "Escribe una referencia de pago entre 3 y 100 caracteres.";
        referencia.focus();
        return;
    }

    reportandoPago = true;
    boton.disabled = true;
    referencia.disabled = true;
    boton.textContent = "Enviando reporte…";
    mensaje.textContent = "";

    try {
        const respuesta = await fetch(
            `${window.SWISSCOL_API_BASE}/pedidos/reportar-pago`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    pedidoId,
                    referenciaPago: texto
                })
            }
        );

        const datos = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
            throw new Error(
                datos.mensaje ||
                "No fue posible registrar el pago."
            );
        }

        mensaje.textContent =
            "Pago reportado. Espera la verificación del vendedor.";

        document.dispatchEvent(new Event("swisscol:notificaciones"));
        await cargarPedidos();

    } catch (error) {
        mensaje.textContent = error.message;
        boton.disabled = false;
        referencia.disabled = false;
        boton.textContent = "Ya realicé el pago";
    } finally {
        reportandoPago = false;
    }
}

btnHistorial.addEventListener("click",()=>{

    cargarPedidos();

    panelHistorial.classList.add("activo");

});

cerrarHistorial.addEventListener("click",()=>{

    panelHistorial.classList.remove("activo");

});

async function cargarPedidos() {

    listaPedidos.textContent = "Cargando tus pedidos...";

    try {
        const respuesta = await fetch(
            `${window.SWISSCOL_API_BASE}/pedidos/mis-pedidos`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        if (respuesta.status === 401) {
            listaPedidos.textContent =
                "Debes iniciar sesión para consultar tus pedidos.";
            return;
        }

        if (!respuesta.ok) {
            throw new Error("No fue posible consultar los pedidos.");
        }

        const pedidos = await respuesta.json();

        // La configuración es opcional: el historial se dibuja inmediatamente.
        const datosPago = pedidos.some(pedido => pedido.estado === "PENDIENTE_PAGO")
            ? cargarDatosPago().catch(() => null)
            : Promise.resolve(null);

        listaPedidos.replaceChildren();

        if (pedidos.length === 0) {
            listaPedidos.textContent =
                "No tienes solicitudes registradas.";
            return;
        }

        pedidos.forEach(pedido => {

            const tarjeta = document.createElement("div");
            tarjeta.className = "pedido-card";

            const titulo = document.createElement("h3");
            titulo.textContent = `Pedido #${pedido.pedidoId}`;
            tarjeta.appendChild(titulo);

            const totalProductos = Number(pedido.total);
                const costoEnvio = pedido.costoEnvio == null
                    ? null
                    : Number(pedido.costoEnvio);

                const datos = [
                    `Fecha: ${pedido.fecha}`,
                    `Estado: ${pedido.estado}`,
                    `Total de productos: ${formatoDinero(totalProductos)}`,
                    costoEnvio == null
                        ? "Costo de envío: pendiente de definir"
                        : `Costo de envío: ${formatoDinero(costoEnvio)}`,
                    costoEnvio == null
                        ? "Total a pagar: pendiente de definir"
                        : `Total a pagar: ${formatoDinero(
                            totalProductos + costoEnvio
                        )}`
                ];

            datos.forEach(texto => {
                const parrafo = document.createElement("p");
                parrafo.textContent = texto;
                tarjeta.appendChild(parrafo);
            });

            tarjeta.appendChild(document.createElement("hr"));

            pedido.productos.forEach(producto => {
                const detalle = document.createElement("p");

                detalle.textContent =
                    `${producto.nombre} × ${producto.cantidad}`;

                tarjeta.appendChild(detalle);
            });

            if (pedido.estado === "PENDIENTE_PAGO") {
                const pago = document.createElement("div");
                pago.className = "pago-nequi";
                const tituloPago = document.createElement("h4");
                tituloPago.textContent = "Pago por Nequi";
                const instrucciones = document.createElement("div");
                instrucciones.className = "pago-datos";
                instrucciones.setAttribute("aria-live", "polite");
                instrucciones.textContent = "Cargando datos de pago…";
                const plazo = document.createElement("p");
                plazo.className = "pago-vencimiento";
                plazo.textContent = "Paga y reporta la referencia antes del " +
                    formatoFechaHora(pedido.venceReserva) + " (hora de Colombia).";
                pago.append(tituloPago, instrucciones, plazo);

                datosPago.then(configuracion => {
                    instrucciones.replaceChildren();
                    if (!configuracion) {
                        instrucciones.textContent =
                            "Temporalmente no se pudieron cargar los datos de pago. " +
                            "Vuelve a abrir Mis pedidos para reintentar.";
                        return;
                    }
                    const campos = [
                        ["Total a consignar", costoEnvio == null
                            ? "Pendiente de definir"
                            : formatoDinero(totalProductos + costoEnvio) + " COP", "pago-total"],
                        ["Número Nequi", configuracion.numero, "pago-numero"],
                        ["Titular", configuracion.titular, "pago-titular"]
                    ];
                    campos.forEach(([nombre, valor, clase]) => {
                        const fila = document.createElement("p");
                        fila.className = clase;
                        const etiquetaDato = document.createElement("span");
                        etiquetaDato.className = "pago-dato-etiqueta";
                        etiquetaDato.textContent = nombre;
                        const valorDato = document.createElement("strong");
                        valorDato.textContent = valor;
                        fila.append(etiquetaDato, valorDato);
                        instrucciones.appendChild(fila);
                    });
                    const duracion = document.createElement("p");
                    duracion.className = "pago-plazo";
                    duracion.textContent = configuracion.plazoHoras + " horas desde la aprobación.";
                    instrucciones.appendChild(duracion);
                });

                const referencia = document.createElement("input");
                referencia.type = "text";
                referencia.id = "referencia-pago-" + pedido.pedidoId;
                referencia.placeholder = "Escribe la referencia de Nequi";
                referencia.minLength = 3;
                referencia.maxLength = 100;
                const etiqueta = document.createElement("label");
                etiqueta.htmlFor = referencia.id;
                etiqueta.className = "pago-referencia-etiqueta";
                etiqueta.textContent = "Referencia de tu pago";
                const botonPago = document.createElement("button");
                botonPago.type = "button";
                botonPago.textContent = "Ya realicé el pago";
                botonPago.className = "btn-rojo pago-confirmar";
                const mensajePago = document.createElement("p");
                mensajePago.className = "pago-mensaje";
                mensajePago.setAttribute("aria-live", "polite");
                botonPago.addEventListener("click", () => {
                    reportarPago(pedido.pedidoId, referencia, botonPago, mensajePago);
                });
                const ayudaPago = document.createElement("p");
                ayudaPago.className = "pago-ayuda";
                ayudaPago.id = "ayuda-pago-" + pedido.pedidoId;
                ayudaPago.textContent = "Realiza la transferencia y luego reporta su referencia. El vendedor verificará tu pago.";
                referencia.setAttribute("aria-describedby", ayudaPago.id);
                pago.append(etiqueta, referencia, ayudaPago, botonPago, mensajePago);
                tarjeta.appendChild(pago);
            }

            if (pedido.estado === "PAGO_POR_VERIFICAR") {
                const reporte = document.createElement("p");
                reporte.textContent = "Pago reportado. Referencia: " + pedido.referenciaPago +
                    ". Fecha: " + formatoFechaHora(pedido.pagoReportadoEn) +
                    " (hora de Colombia). El vendedor verificará el movimiento en Nequi.";
                tarjeta.appendChild(reporte);
            }

            listaPedidos.appendChild(tarjeta);
        });

    } catch (error) {
        console.error("Error al cargar los pedidos:", error);

        listaPedidos.textContent =
            "No fue posible cargar tus pedidos. Intenta nuevamente.";
    }
}

