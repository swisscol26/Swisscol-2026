//======================================
// PRODUCTOS SWISSCOL
//======================================

const productos = [

    {
    id:1,
    nombre:"Victorinox Huntsman",
    categoria:"Camping",
    precio:150000,
    imagen:"img/productos/huntsman.png",
    descripcion:"La compañera perfecta para actividades al aire libre.",
    valoracion:5
    },
    
    {
    id:2,
    nombre:"Victorinox Spartan",
    categoria:"Outdoor",
    precio:485000,
    imagen:"img/productos/spartan.png",
    descripcion:"La navaja clásica suiza para cualquier ocasión.",
    valoracion:5
    },
    
    {
    id:3,
    nombre:"Victorinox Explorer",
    categoria:"Camping",
    precio:250000,
    imagen:"img/productos/explorer.png",
    descripcion:"Incluye lupa, destornilladores y múltiples herramientas.",
    valoracion:5
    },
    
    {
    id:4,
    nombre:"Victorinox Equestrian",
    categoria:"Especial",
    precio:500000,
    imagen:"img/productos/equestrian.png",
    descripcion:"Diseñada especialmente para el mundo ecuestre.",
    valoracion:4
    },
    
    {
    id:5,
    nombre:"Victorinox Climber",
    categoria:"Camping",
    precio:190000,
    imagen:"img/productos/climber.png",
    descripcion:"Ideal para excursionistas.",
    valoracion:5
    },
    
    {
    id:6,
    nombre:"Victorinox Camper",
    categoria:"Camping",
    precio:170000,
    imagen:"img/productos/camper.png",
    descripcion:"Perfecta para aventuras.",
    valoracion:5
    },
    
    {
    id:7,
    nombre:"Victorinox Ranger",
    categoria:"Outdoor",
    precio:350000,
    imagen:"img/productos/ranger.png",
    descripcion:"Una de las más completas.",
    valoracion:5
    },
    
    {
    id:8,
    nombre:"Victorinox Classic SD",
    categoria:"Llavero",
    precio:95000,
    imagen:"img/productos/classic.png",
    descripcion:"Pequeña pero muy útil.",
    valoracion:5
    },
    
    {
    id:9,
    nombre:"Victorinox Tinker",
    categoria:"Everyday",
    precio:180000,
    imagen:"img/productos/tinker.png",
    descripcion:"Ideal para el uso diario.",
    valoracion:5
    },
    
    {
    id:10,
    nombre:"Victorinox Swiss Champ",
    categoria:"Premium",
    precio:690000,
    imagen:"img/productos/champ.png",
    descripcion:"La reina de las navajas suizas.",
    valoracion:5
    },
    
    {
    id:11,
    nombre:"Victorinox Rescue Tool",
    categoria:"Rescate",
    precio:820000,
    imagen:"img/productos/rescue.png",
    descripcion:"Diseñada para emergencias.",
    valoracion:5
    },
    
    {
    id:12,
    nombre:"Victorinox Farmer X",
    categoria:"Outdoor",
    precio:310000,
    imagen:"img/productos/farmerx.png",
    descripcion:"Fabricada en aluminio Alox.",
    valoracion:5
    },
    
    {
    id:13,
    nombre:"Victorinox Pioneer",
    categoria:"Premium",
    precio:285000,
    imagen:"img/productos/pioneer.png",
    descripcion:"Minimalista y elegante.",
    valoracion:5
    },
    
    {
    id:14,
    nombre:"Victorinox Nail Clip",
    categoria:"Cuidado Personal",
    precio:140000,
    imagen:"img/productos/nailclip.png",
    descripcion:"Con cortauñas integrado.",
    valoracion:4
    },
    
    {
    id:15,
    nombre:"Victorinox Evoke",
    categoria:"Outdoor",
    precio:590000,
    imagen:"img/productos/evoke.png",
    descripcion:"Diseño moderno de gran tamaño.",
    valoracion:5
    }
    
    ];

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
    
                    <p>${producto.descripcion}</p>
    
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
    
            boton.addEventListener("click",(e)=>{
    
                e.stopPropagation();
    
                agregarAlCarrito(boton.dataset.id);
    
            });
    
        });
    
        document.querySelectorAll(".producto").forEach(card=>{
    
            card.addEventListener("click",()=>{
    
                abrirModalProducto(card.dataset.id);
    
            });
    
        });
    
    }

    pintarProductos(productos);    