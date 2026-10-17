document.addEventListener("DOMContentLoaded", () => {
    const dialogo = document.getElementById("dialogNotificaciones");
    const lista = document.getElementById("listaNotificaciones");
    const estado = document.getElementById("estadoNotificaciones");
    const actualizar = document.getElementById("actualizarNotificaciones");
    const campana = document.getElementById("btnNotificaciones");
    const badge = document.getElementById("contador-notificaciones");
    const api = window.SWISSCOL_API_BASE + "/notificaciones";
    let solicitudActual = 0;
    let versionSesion = 0;
    let consultaActiva = null;

    function pintarContador(cantidad) {
        badge.textContent = String(cantidad);
        badge.hidden = cantidad === 0;
        campana.classList.toggle("con-pendientes", cantidad > 0);
        campana.setAttribute("aria-label", cantidad > 0
            ? "Ver notificaciones: " + cantidad + " sin leer"
            : "Ver notificaciones: ninguna sin leer");
    }

    async function comprobarRespuesta(respuesta) {
        if (respuesta.ok) return;
        if (respuesta.status === 401) {
            pintarContador(0);
            throw new Error("Inicia sesión desde el botón de usuario para ver tus notificaciones.");
        }
        const datos = await respuesta.json().catch(() => ({}));
        throw new Error(datos.mensaje || "No fue posible completar la solicitud.");
    }

    function pintarNotificaciones(notificaciones) {
        lista.replaceChildren();
        const tipos = {
            PROMOCION: "Promoción", NOVEDAD: "Novedad", REPOSICION: "Reposición",
            ENVIO: "Envío", PAGO: "Pago", PEDIDO: "Pedido", VENCIDO: "Reserva vencida"
        };
        notificaciones.forEach(notificacion => {
            const tarjeta = document.createElement("article");
            tarjeta.className = notificacion.leida ? "notificacion leida" : "notificacion";
            const titulo = document.createElement("h3");
            titulo.textContent = tipos[notificacion.tipo] || "Notificación";
            const fecha = document.createElement("p");
            fecha.className = "notificacion-fecha";
            fecha.textContent = notificacion.fecha + " · " + (notificacion.leida ? "Leída" : "Sin leer");
            const mensaje = document.createElement("p");
            mensaje.textContent = notificacion.mensaje;
            tarjeta.append(titulo, fecha, mensaje);
            if (!notificacion.leida) {
                const boton = document.createElement("button");
                boton.type = "button";
                boton.className = "btn-outline";
                boton.textContent = "Marcar como leída";
                boton.addEventListener("click", async () => {
                    const sesion = versionSesion;
                    boton.disabled = true;
                    estado.textContent = "";
                    try {
                        const respuesta = await fetch(api + "/leida", {
                            method: "POST", credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ notificacionId: notificacion.notificacionId }),
                            signal: AbortSignal.timeout(10000)
                        });
                        if (sesion !== versionSesion) return;
                        await comprobarRespuesta(respuesta);
                        if (sesion !== versionSesion) return;
                        // Actualiza el badge aunque el diálogo se haya cerrado mientras guardaba.
                        await cargarNotificaciones();
                    } catch (error) {
                        if (sesion !== versionSesion) return;
                        if (dialogo.open) estado.textContent = error.message;
                        boton.disabled = false;
                    }
                });
                tarjeta.appendChild(boton);
            }
            lista.appendChild(tarjeta);
        });
    }

    async function cargarNotificaciones(silencioso = false) {
        const numero = ++solicitudActual;
        consultaActiva?.abort();
        consultaActiva = new AbortController();
        const controlador = consultaActiva;
        const timeout = setTimeout(() => controlador.abort(), 10000);
        if (dialogo.open && !silencioso) {
            estado.textContent = "Cargando notificaciones...";
            actualizar.disabled = true;
        }
        try {
            const respuesta = await fetch(api, {
                credentials: "include", cache: "no-store", signal: consultaActiva.signal
            });
            if (numero !== solicitudActual) return;
            await comprobarRespuesta(respuesta);
            const notificaciones = await respuesta.json();
            if (numero !== solicitudActual) return;
            if (!Array.isArray(notificaciones)) throw new Error("Respuesta de notificaciones inesperada.");
            const sinLeer = notificaciones.filter(item => !item.leida).length;
            pintarContador(sinLeer);
            if (dialogo.open && !silencioso) {
                pintarNotificaciones(notificaciones);
                estado.textContent = notificaciones.length === 0
                    ? "Todavía no tienes notificaciones."
                    : sinLeer + " notificación(es) sin leer.";
            }
        } catch (error) {
            if (numero !== solicitudActual) return;
            if (dialogo.open && !silencioso) {
                estado.textContent = error.name === "AbortError"
                    ? "La consulta tardó demasiado. Intenta actualizar." : error.message;
            }
        } finally {
            clearTimeout(timeout);
            if (numero === solicitudActual) {
                consultaActiva = null;
                actualizar.disabled = false;
            }
        }
    }

    campana.addEventListener("click", () => {
        if (!dialogo.open) dialogo.showModal();
        cargarNotificaciones();
    });
    document.getElementById("cerrarNotificaciones").addEventListener("click", () => dialogo.close());
    actualizar.addEventListener("click", () => cargarNotificaciones());
    dialogo.addEventListener("close", () => {
        lista.replaceChildren();
        estado.textContent = "";
    });
    document.addEventListener("swisscol:sesion", event => {
        versionSesion++;
        solicitudActual++;
        consultaActiva?.abort();
        pintarContador(0);
        lista.replaceChildren();
        if (event.detail.activa) cargarNotificaciones();
        else if (dialogo.open) dialogo.close();
    });
    document.addEventListener("swisscol:notificaciones", () => cargarNotificaciones());
    window.addEventListener("storage", event => {
        if (event.key === "sesionSwisscol") {
            versionSesion++;
            lista.replaceChildren();
            pintarContador(0);
            cargarNotificaciones();
        }
    });
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) cargarNotificaciones(!dialogo.open);
    });
    setInterval(() => {
        if (!document.hidden && !consultaActiva) cargarNotificaciones(true);
    }, 30000);
    cargarNotificaciones(true);
});
