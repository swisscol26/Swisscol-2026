/*======================================
        AUTENTICACIÓN SWISSCOL
======================================*/

const btnUsuarioAuth = document.getElementById("btnUsuario");

const panelAuth = document.getElementById("panelAuth");

const cerrarAuth = document.getElementById("cerrarAuth");

const formLogin = document.getElementById("formLogin");

const formRegistro = document.getElementById("formRegistro");

const perfilUsuario = document.getElementById("perfilUsuario");

const mostrarRegistro = document.getElementById("mostrarRegistro");

const mostrarLogin = document.getElementById("mostrarLogin");

const nombreUsuario = document.getElementById("nombreUsuario");

const correoUsuario = document.getElementById("correoUsuario");

const btnCerrarSesion = document.getElementById("btnCerrarSesion");

const contenidoUsuario = document.getElementById("contenidoUsuario");

btnUsuarioAuth.addEventListener("click", () => {

    panelAuth.classList.add("activo");

});

cerrarAuth.addEventListener("click", () => {

    panelAuth.classList.remove("activo");

});

document.addEventListener("click",(e)=>{

    if(
        !panelAuth.contains(e.target)
        &&
        !btnUsuarioAuth.contains(e.target)
    ){

        panelAuth.classList.remove("activo");

    }

});

panelAuth.addEventListener("click",(e)=>{

    e.stopPropagation();

});

mostrarRegistro.addEventListener("click",(e)=>{

    e.preventDefault();

    formLogin.classList.remove("activo");

    formRegistro.classList.add("activo");

});

mostrarLogin.addEventListener("click",(e)=>{

    e.preventDefault();

    formRegistro.classList.remove("activo");

    formLogin.classList.add("activo");

});

formRegistro.addEventListener("submit",(e)=>{

    e.preventDefault();

    const usuario={

        nombre:document.getElementById("registroNombre").value,

        correo:document.getElementById("registroCorreo").value,

        password:document.getElementById("registroPassword").value

    };

    localStorage.setItem("usuarioSwisscol",JSON.stringify(usuario));

    alert("Cuenta creada correctamente");

    formRegistro.reset();

    formRegistro.classList.remove("activo");

    formLogin.classList.add("activo");

});

formLogin.addEventListener("submit",(e)=>{

    e.preventDefault();

    const usuario=JSON.parse(localStorage.getItem("usuarioSwisscol"));

    if(!usuario){

        alert("No existe ninguna cuenta.");

        return;

    }

    const correo=document.getElementById("loginCorreo").value;

    const password=document.getElementById("loginPassword").value;

    if(

        correo===usuario.correo

        &&

        password===usuario.password

    ){

        iniciarSesion(usuario);

    }else{

        alert("Correo o contraseña incorrectos");

    }

});

function iniciarSesion(usuario){

    formLogin.style.display="none";

    formRegistro.style.display="none";

    perfilUsuario.classList.add("activo");

    nombreUsuario.textContent=usuario.nombre;

    correoUsuario.textContent=usuario.correo;

    const sesion = {

        nombre: usuario.nombre,
    
        correo: usuario.correo
    
    };
    
    localStorage.setItem(
    
        "sesionSwisscol",
    
        JSON.stringify(sesion)
    
    );

    actualizarHeaderUsuario(usuario);

    actualizarEstadoUsuario();

}

function actualizarHeaderUsuario(usuario){
    const primerNombre = usuario.nombre.split(" ")[0];

    btnUsuarioAuth.classList.add("usuario-activo");

    contenidoUsuario.innerHTML = `
        <span>👤</span>
        <span>${primerNombre}</span>
    `;
}

btnCerrarSesion.addEventListener("click",()=>{

    localStorage.removeItem("sesionSwisscol");

    perfilUsuario.classList.remove("activo");

    formLogin.style.display="block";

    panelAuth.classList.remove("activo");

    btnUsuarioAuth.classList.remove("usuario-activo");
    
    contenidoUsuario.innerHTML = "👤";

    actualizarEstadoUsuario();

});

function actualizarEstadoUsuario(){

    const sesion = JSON.parse(

        localStorage.getItem("sesionSwisscol")

    );

    if(sesion){

        btnUsuarioAuth.classList.add("usuario-activo");

        actualizarHeaderUsuario(sesion);
  
    }else{

        btnUsuarioAuth.classList.remove("usuario-activo");

        contenidoUsuario.innerHTML = "👤";

    }

}

function verificarSesion(){
    const sesion = JSON.parse(localStorage.getItem("sesionSwisscol"));

    if(sesion){
        actualizarHeaderUsuario(sesion);
    }
}

verificarSesion();


