/*======================================
        AUTENTICACIÓN SWISSCOL
======================================*/

const API_AUTH_URL =
    "http://localhost:8080/api/auth";

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

btnUsuarioAuth.addEventListener("click", () => {
    panelAuth.classList.add("activo");
});

cerrarAuth.addEventListener("click", () => {
    panelAuth.classList.remove("activo");
});

document.addEventListener("click", (e) => {

    if (
        !panelAuth.contains(e.target)
        && !btnUsuarioAuth.contains(e.target)
    ) {
        panelAuth.classList.remove("activo");
    }
});

panelAuth.addEventListener("click", (e) => {
    e.stopPropagation();
});


/*======================================
        CAMBIO DE FORMULARIOS
======================================*/

mostrarRegistro.addEventListener("click", (e) => {

    e.preventDefault();

    formLogin.classList.remove("activo");
    formLogin.style.display = "none";

    formRegistro.classList.add("activo");
    formRegistro.style.display = "block";
});

mostrarLogin.addEventListener("click", (e) => {

    e.preventDefault();

    mostrarFormularioLogin();
});

function mostrarFormularioLogin() {

    formRegistro.classList.remove("activo");
    formRegistro.style.display = "none";

    formLogin.classList.add("activo");
    formLogin.style.display = "block";
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
    () => {

        localStorage.removeItem(
            "sesionSwisscol"
        );

        perfilUsuario.classList.remove(
            "activo"
        );

        btnUsuarioAuth.classList.remove(
            "usuario-activo"
        );

        contenidoUsuario.textContent = "👤";

        mostrarFormularioLogin();

        panelAuth.classList.remove("activo");
    }
);

function verificarSesion() {

    try {

        const sesion = JSON.parse(
            localStorage.getItem(
                "sesionSwisscol"
            )
        );

        if (sesion) {
            mostrarSesion(sesion);
        }

    } catch (error) {

        localStorage.removeItem(
            "sesionSwisscol"
        );

        console.error(
            "La sesión almacenada no es válida.",
            error
        );
    }
}

verificarSesion();