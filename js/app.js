/*=====================================
        ELEMENTOS DEL DOM
=====================================*/

const header = document.querySelector(".header");

const btnTop = document.getElementById("btnTop");

const btnUsuario = document.getElementById("btnUsuario");

const btnCarrito = document.getElementById("btnCarrito");

const panelCarrito = document.getElementById("carrito");

const cerrarCarrito = document.getElementById("cerrarCarrito");

/*=====================================
            HEADER
=====================================*/

window.addEventListener("scroll", () => {

    if (window.scrollY > 80) {

        header.classList.add("header-scroll");

    } else {

        header.classList.remove("header-scroll");

    }

});

/*=====================================
        BOTÓN ARRIBA
=====================================*/

window.addEventListener("scroll",()=>{

    if(window.scrollY>450){

        btnTop.classList.add("mostrar");

    }else{

        btnTop.classList.remove("mostrar");

    }

});

btnTop.addEventListener("click",()=>{

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

});

/*=====================================
            CARRITO
=====================================*/

btnCarrito.addEventListener("click",()=>{

    panelCarrito.classList.add("mostrar-carrito");

});

cerrarCarrito.addEventListener("click",()=>{

    panelCarrito.classList.remove("mostrar-carrito");

});

/*=====================================
        NOTIFICACIONES
=====================================*/

function mostrarNotificacion(nombre){

    const notificacion=document.createElement("div");

    notificacion.className="toast";

    notificacion.innerHTML=`
        <span>✔</span>
        <p><strong>${nombre}</strong><br>Agregado al carrito</p>
    `;

    document.body.appendChild(notificacion);

    setTimeout(()=>{

        notificacion.classList.add("mostrar");

    },100);

    setTimeout(()=>{

        notificacion.classList.remove("mostrar");

        setTimeout(()=>{

            notificacion.remove();

        },300);

    },3000);

}

btnCarrito.addEventListener("click", () => {
    console.log("CLICK CARRITO");
    console.log(panelCarrito);
    panelCarrito.classList.add("mostrar-carrito");
});