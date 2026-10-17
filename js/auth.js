/*======================================
        AUTENTICACIÓN SWISSCOL
======================================*/

const API_AUTH_URL =
    `${window.SWISSCOL_API_BASE}/auth`;

    // Elimina credenciales guardadas por la versión anterior.
localStorage.removeItem("usuarioSwisscol");

const btnUsuarioAuth =
    document.getElementById("btnUsuario");

const panelAuth =
    document.getElementById("panelAuth");

const cerrarAuth =
    document.getElementById("cerrarAuth");

const formLogin =
    document.getElementById("formLogin");

const formRegistro =
    document.getElementById("formRegistro");

const perfilUsuario =
    document.getElementById("perfilUsuario");

const mostrarRegistro =
    document.getElementById("mostrarRegistro");

const mostrarLogin =
    document.getElementById("mostrarLogin");

const nombreUsuario =
    document.getElementById("nombreUsuario");

const correoUsuario =
    document.getElementById("correoUsuario");

const btnCerrarSesion =
    document.getElementById("btnCerrarSesion");

const contenidoUsuario =
    document.getElementById("contenidoUsuario");


/*======================================
        APERTURA DEL PANEL
======================================*/

// El mismo panel se aloja en un diálogo para visitantes y en el lateral para usuarios.
const posicionPanelAuth = document.createComment("Posición del panel de cuenta");
panelAuth.before(posicionPanelAuth);
const dialogAuth = document.createElement("dialog");
dialogAuth.id = "dialogAuth";
dialogAuth.setAttribute("aria-labelledby", "authTitulo");
document.body.appendChild(dialogAuth);
const tituloAuth = document.getElementById("authTitulo");
cerrarAuth.setAttribute("aria-label", "Cerrar cuenta");
cerrarAuth.type = "button";
btnUsuarioAuth.setAttribute("aria-controls", "panelAuth");
btnUsuarioAuth.setAttribute("aria-expanded", "false");

// Nombres accesibles y autocompletado sin cambiar los campos del servidor.
[
    ["loginCorreo", "Correo electrónico", "username"],
    ["loginPassword", "Contraseña", "current-password"],
    ["registroNombre", "Nombre completo", "name"],
    ["registroCorreo", "Correo electrónico", "email"],
    ["registroPassword", "Contraseña", "new-password"],
    ["registroConfirmar", "Confirmar contraseña", "new-password"]
].forEach(([id, etiqueta, completar]) => {
    const campo = document.getElementById(id);
    campo.setAttribute("aria-label", etiqueta);
    campo.autocomplete = completar;
});

function configurarPresentacionAuth(conSesion) {
    const abierto = panelAuth.classList.contains("activo");
    if (conSesion) {
        if (dialogAuth.open) dialogAuth.close();
        document.body.classList.remove("auth-modal-abierto");
        posicionPanelAuth.after(panelAuth);
        tituloAuth.textContent = "Mi cuenta";
        if (abierto) cerrarAuth.focus();
    } else {
        dialogAuth.appendChild(panelAuth);
        if (abierto && !dialogAuth.open) {
            dialogAuth.showModal();
            document.body.classList.add("auth-modal-abierto");
        }
    }
    panelAuth.inert = !abierto;
}

function abrirPanelAuth() {
    panelAuth.classList.add("activo");
    panelAuth.inert = false;
    btnUsuarioAuth.setAttribute("aria-expanded", "true");
    configurarPresentacionAuth(perfilUsuario.classList.contains("activo"));
    if (dialogAuth.open) {
        const formulario = formRegistro.style.display === "block" ? formRegistro : formLogin;
        formulario.querySelector("input").focus();
    }
}

function cerrarPanelAuth() {
    panelAuth.classList.remove("activo");
    panelAuth.inert = true;
    if (dialogAuth.open) dialogAuth.close();
    document.body.classList.remove("auth-modal-abierto");
    btnUsuarioAuth.setAttribute("aria-expanded", "false");
    btnUsuarioAuth.focus();
}

btnUsuarioAuth.addEventListener("click", abrirPanelAuth);
cerrarAuth.addEventListener("click", cerrarPanelAuth);
dialogAuth.addEventListener("cancel", (event) => {
    event.preventDefault();
    cerrarPanelAuth();
});
dialogAuth.addEventListener("click", (event) => {
    if (event.target === dialogAuth) cerrarPanelAuth();
});
document.addEventListener("click", (event) => {
    if (panelAuth.classList.contains("activo") &&
        !panelAuth.contains(event.target) && !btnUsuarioAuth.contains(event.target)) {
        cerrarPanelAuth();
    }
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panelAuth.classList.contains("activo") && !dialogAuth.open) {
        cerrarPanelAuth();
    }
});
panelAuth.addEventListener("click", event => event.stopPropagation());
configurarPresentacionAuth(false);


/*======================================
        CAMBIO DE FORMULARIOS
======================================*/

mostrarRegistro.addEventListener("click", (e) => {

    e.preventDefault();

    formLogin.classList.remove("activo");
    formLogin.style.display = "none";

    formRegistro.classList.add("activo");
    formRegistro.style.display = "block";
    tituloAuth.textContent = "Crear cuenta";
    document.getElementById("registroNombre").focus();
});

mostrarLogin.addEventListener("click", (e) => {

    e.preventDefault();

    mostrarFormularioLogin();
});

function mostrarFormularioLogin() {
    perfilUsuario.classList.remove("activo");
    tituloAuth.textContent = "Iniciar sesión";
    configurarPresentacionAuth(false);

    formRegistro.classList.remove("activo");
    formRegistro.style.display = "none";

    formLogin.classList.add("activo");
    formLogin.style.display = "block";
    if (dialogAuth.open) document.getElementById("loginCorreo").focus();
}


/*======================================
        REGISTRO CON LA API
======================================*/

formRegistro.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const solicitud = {

            nombre: document
                .getElementById("registroNombre")
                .value
                .trim(),

            correo: document
                .getElementById("registroCorreo")
                .value
                .trim(),

            password: document
                .getElementById("registroPassword")
                .value,

            confirmarPassword: document
                .getElementById("registroConfirmar")
                .value
        };

        try {

            const respuesta = await fetch(
                `${API_AUTH_URL}/registro`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify(solicitud)
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {

                alert(
                    datos.mensaje
                    || "No fue posible crear la cuenta."
                );

                return;
            }

            alert(datos.mensaje);

            formRegistro.reset();
            mostrarFormularioLogin();

        } catch (error) {

            console.error(
                "Error al registrar:",
                error
            );

            alert(
                "No fue posible conectar con el servidor."
            );
        }
    }
);


/*======================================
        LOGIN CON LA API
======================================*/

formLogin.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const solicitud = {

            correo: document
                .getElementById("loginCorreo")
                .value
                .trim(),

            password: document
                .getElementById("loginPassword")
                .value
        };

        try {

            const respuesta = await fetch(
                `${API_AUTH_URL}/login`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify(solicitud)
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {

                alert(
                    datos.mensaje
                    || "No fue posible iniciar sesión."
                );

                return;
            }

            const usuario = {

                usuarioId: datos.usuarioId,
                nombre: datos.nombre,
                correo: datos.correo,
                rol: datos.rol
            };

            iniciarSesion(usuario);
            formLogin.reset();

        } catch (error) {

            console.error(
                "Error al iniciar sesión:",
                error
            );

            alert(
                "No fue posible conectar con el servidor."
            );
        }
    }
);


/*======================================
        ESTADO DE LA SESIÓN
======================================*/

function iniciarSesion(usuario) {

    localStorage.setItem(
        "sesionSwisscol",
        JSON.stringify(usuario)
    );

    mostrarSesion(usuario);
}

function mostrarSesion(usuario) {

    formLogin.style.display = "none";
    formRegistro.style.display = "none";

    perfilUsuario.classList.add("activo");

    nombreUsuario.textContent =
        usuario.nombre;

    correoUsuario.textContent =
        usuario.correo;

    actualizarHeaderUsuario(usuario);
    configurarPresentacionAuth(true);
    document.dispatchEvent(new CustomEvent("swisscol:sesion", {
        detail: { activa: true }
    }));
}

function actualizarHeaderUsuario(usuario) {

    const primerNombre =
        usuario.nombre.split(" ")[0];

    btnUsuarioAuth.classList.add(
        "usuario-activo"
    );

    contenidoUsuario.replaceChildren();

    const icono =
        document.createElement("span");

    icono.textContent = "👤";

    const texto =
        document.createElement("span");

    texto.textContent = primerNombre;

    contenidoUsuario.append(
        icono,
        texto
    );
}

btnCerrarSesion.addEventListener(
    "click",
    async () => {

        btnCerrarSesion.disabled = true;

        try {
            const respuesta = await fetch(
                `${API_AUTH_URL}/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );

            if (!respuesta.ok) {
                alert("No fue posible cerrar la sesión. Intenta nuevamente.");
                return;
            }

            localStorage.removeItem("sesionSwisscol");
            document.dispatchEvent(new CustomEvent("swisscol:sesion", {
                detail: { activa: false }
            }));

            perfilUsuario.classList.remove("activo");
            btnUsuarioAuth.classList.remove("usuario-activo");

            contenidoUsuario.textContent = "👤";

            cerrarPanelAuth();
            mostrarFormularioLogin();

        } catch (error) {
            console.error("Error al cerrar sesión:", error);

            alert(
                "No fue posible conectar con el servidor para cerrar sesión."
            );
        } finally {
            btnCerrarSesion.disabled = false;
        }
    }
);

async function verificarSesion() {

    try {
        const respuesta = await fetch(
            `${API_AUTH_URL}/sesion`,
            {
                method: "POST",
                credentials: "include"
            }
        );

        if (respuesta.status === 401) {
            localStorage.removeItem("sesionSwisscol");
            mostrarFormularioLogin();
            return;
        }

        if (!respuesta.ok) {
            throw new Error("No se pudo verificar la sesión.");
        }

        const datos = await respuesta.json();

        const perfil = JSON.parse(
            localStorage.getItem("sesionSwisscol")
        );

        if (
            perfil
            && perfil.usuarioId === datos.usuarioId
        ) {
            mostrarSesion(perfil);
        } else {
            localStorage.removeItem("sesionSwisscol");
            mostrarFormularioLogin();
        }

    } catch (error) {
        console.error("Error al verificar la sesión:", error);

        mostrarFormularioLogin();
    }
}

verificarSesion();