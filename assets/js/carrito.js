// Carrito se conecta con LocalStorage y guardar el carrito cada vez que cambie 
//Trae productos JSON a JS + mostrar los productos en HTML + activar botones
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarritoLocal(){
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

const productosData =[]

async function CargarProductos() {

    try{
        const respuesta = await fetch("../../data/productos.json");
        const productos = await respuesta.json();

        productosData.push(...productos);//guardo los productos
        mostrarProductos(productos);//recién se crean los botones en HTML
        ActivarBotones();//ahora sí existen, ahora funcionan
        MensajeCarrito();//mensaje de producto agregado
    }
    catch(error){
        console.error("Error:", error)
    }
}

CargarProductos();
EstructuraCarrito();

function mostrarProductos(productos){

    let contenedor = document.getElementById("contenedor-productos");

    productos.forEach(producto => {
        let carta = document.createElement("div");
        carta.classList.add("productos-carta");

        carta.innerHTML =`
        <h3>${producto.nombre}</h3>
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <p>$${producto.precio}</p>
        <button class="boton-agregar"data-id="${producto.id}">Agregar</button>
        `;
        contenedor.appendChild(carta)
    })
}

function ActivarBotones (){
    document.querySelectorAll(".boton-agregar").forEach( boton => {
        boton.addEventListener('click',() => {
            const id = Number(boton.dataset.id);//tranforma el id a numero, ya que me lo trae automaticamente en texto
            AgregarAlCarrito (id);
        })
    })
}

//buscar producto
function AgregarAlCarrito (id){
    
    let Existe = carrito.find(producto => producto.id === id);

    // 1. Buscar si ya existe en el carrito
    if(Existe){
        Existe.cantidad += 1;
        guardarCarritoLocal();
        EstructuraCarrito();
        return;
    }
    // 2. Buscar el producto original en productosData
    let ProductoOriginal = productosData.find(producto => producto.id === id)


    // 3. Clonar y agregar 1 unidad
    let NuevoProducto ={
        ...ProductoOriginal,
        cantidad:1
    }
    carrito.push(NuevoProducto);
    guardarCarritoLocal();
    EstructuraCarrito();
    CantidadIconoCarrito ();
    TotalCarrito();
}

//Abrir Cerrar carrito oculto + Vaciar Carrito

let IconoCarrito = document.getElementById("carrito-icono")
let ListaCarrito = document.getElementById("carrito-lista")
let BotonVaciarCarrito = document.getElementById("carrito-vaciar")

IconoCarrito.addEventListener("click",AbrirCarrito);
document.getElementById("carrito-cerrar").addEventListener("click",CerrarCarrito);
BotonVaciarCarrito.addEventListener("click", VaciarCarrito);

function AbrirCarrito(){

    ListaCarrito.classList.add("mostrar")
}

function CerrarCarrito(){

    ListaCarrito.classList.remove("mostrar")
}

function VaciarCarrito(){

    carrito = [];
    guardarCarritoLocal();
    EstructuraCarrito();
}

// Estructura del carrito

function EstructuraCarrito(){
    let contenedor = document.getElementById("carrito-items")
    contenedor.innerHTML = "";
    carrito.forEach(productos => {
        let items = document.createElement("div")
        items.classList.add("items-productos");
        items.innerHTML =`
        <img src="${productos.imagen}" class="carrito-img">
            <div class="carrito-detalle">
                <p>${productos.nombre}</p>
                <span>$${productos.precio * productos.cantidad}</span>
            </div>
            <button class="carrito-restar" >-</button>
            <span class="carrito-cantidad">${productos.cantidad}</span>
            <button class="carrito-sumar" >+</button>`
        ;
        contenedor.appendChild(items);

        // FUNCION DE LOS BOTONES

        // Sumar productos
        items.querySelector(".carrito-sumar").addEventListener("click", function(){
            productos.cantidad += 1;
            EstructuraCarrito()
        })
        //Restar productos
        items.querySelector(".carrito-restar").addEventListener("click", function(){
            productos.cantidad -= 1;
            if (productos.cantidad === 0) {
                carrito = carrito.filter(p => p.id !== productos.id);}
                EstructuraCarrito()
        })
    })
    guardarCarritoLocal();
    CantidadIconoCarrito ();
    TotalCarrito();
}

// Sumar total de los productos

function TotalCarrito(){
    
    let total = carrito.reduce((acumulado,producto)=> acumulado + producto.precio * producto.cantidad,0)
    
    document.getElementById("carrito-total").textContent = `$${total}`;
    return total;
}

TotalCarrito();

// Actualizar numero de carrito en el icono

function CantidadIconoCarrito (){

    let CantidadTotal = carrito.reduce((acumulado,producto)=> acumulado + producto.cantidad,0)

    document.getElementById("carrito-numero").textContent= `${CantidadTotal}`;
    return CantidadTotal;

}

CantidadIconoCarrito ()

// Aviso de que se agrego un producto al carrito

let MensajeTiempo = null;

function MensajeCarrito(){

    let mensaje = document.getElementById("mensaje-carrito")
    document.querySelectorAll(".boton-agregar").forEach( boton => 
    boton.addEventListener('click',() => {
    let id = Number(boton.dataset.id);
    let BuscarProducto= productosData.find(producto => producto.id === id)

    mensaje.textContent=(`${BuscarProducto.nombre} agregado al carrito`)
    mensaje.classList.add("mostrar")

    clearTimeout(MensajeTiempo);//cancela el temporizador anterior
    MensajeTiempo = setTimeout(() => {
        mensaje.classList.remove("mostrar");
        }, 1000);

    }))

}
MensajeCarrito()


// Finalizar Compra y redirigirlo a Mercado Pago

document.getElementById("carrito-whatsapp")
.addEventListener("click", FinalizarCompra)

async function FinalizarCompra(){

const boton = document.getElementById("carrito-whatsapp");

    if(carrito.length === 0){
        alert("El carrito está vacío");
        return; // detiene la función si no hay productos
    }

boton.classList.add("boton-procesando");
boton.textContent = "Procesando ⏳";
boton.disabled = true;

    const items = carrito.map(producto => ({ //transforma los productos del carrito al formato que pide la API de Mercado Pago
    title: producto.nombre, // nombre del producto
    quantity: producto.cantidad, // cantidad
    unit_price: producto.precio, // precio por unidad
    currency_id: "ARS", // moneda argentina
    picture_url: producto.imagen, // imagen del producto
    description: producto.nombre // descripción que aparece en el checkout
    }));

    try{

        const response = await fetch(
        "https://api.mercadopago.com/checkout/preferences",
        {
            method: "POST",
            headers:{
                "Content-Type":"application/json", // indica que enviamos datos en formato JSON
                "Authorization":"Bearer TEST-2842962534545081-030915-73ad8a1b71d53428829e63064f5a23aa-179836166"
            },
            body: JSON.stringify({ // convierte el objeto JS a JSON para enviarlo
                items: items // envía la lista de productos que armamos arriba
            })
        });

        const data = await response.json(); // convierte la respuesta de la API en un objeto JS

        window.location.href = data.init_point; // redirige al usuario al checkout de Mercado Pago para pagar

    }catch(error){
        console.error("Error al crear pago", error)
    }
}