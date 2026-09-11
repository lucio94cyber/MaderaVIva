const STORAGE_KEY = "maderaVivaCarrito";

let carrito =
JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

let productosData = [];


const isNestedPage =
window.location.pathname.includes("/assets/pages/");


const ROOT =
isNestedPage ? "../../" : "./";


function guardarCarrito(){

localStorage.setItem(
STORAGE_KEY,
JSON.stringify(carrito)
);

}


function dinero(valor){

return new Intl.NumberFormat(
"es-AR"
).format(valor);

}


function mostrarMensaje(texto){

const mensaje =
document.getElementById(
"mensaje-carrito"
);

if(!mensaje) return;

mensaje.textContent = texto;

mensaje.classList.add("mostrar");

setTimeout(() => {

mensaje.classList.remove("mostrar");

},2200);

}



async function cargarProductos(){

const contenedor =
document.getElementById(
"contenedor-productos"
);

if(!contenedor) return;


try{

const respuesta =
await fetch(
ROOT + "data/productos.json"
);

if(!respuesta.ok){

throw new Error(
"No se pudo cargar el catálogo"
);

}


productosData =
await respuesta.json();


mostrarProductos();


}catch(error){

console.error(error);

contenedor.innerHTML = `
<div class="catalog-error">

<h3>
No pudimos cargar la colección.
</h3>

<p>
Actualizá la página e intentá nuevamente.
</p>

</div>
`;

}

}



function mostrarProductos(){

const contenedor =
document.getElementById(
"contenedor-productos"
);

if(!contenedor) return;


contenedor.innerHTML = "";


productosData.forEach(
(producto,index) => {


const tarjeta =
document.createElement("article");


tarjeta.className =
"catalog-product";


const imagen =
ROOT +
"assets/productos/" +
producto.imagen;


tarjeta.innerHTML = `

<div class="catalog-product-image">

<span class="product-number">
${String(index+1).padStart(2,"0")}
</span>

<img
src="${imagen}"
alt="${producto.nombre}"
loading="lazy">

<button
class="product-quick-add"
data-id="${producto.id}">

Agregar +

</button>

</div>


<div class="catalog-product-info">

<div>

<small>
MADERA VIVA
</small>

<h2>
${producto.nombre}
</h2>

<p>
${producto.medida}
</p>

</div>


<div class="product-price">

<strong>
$${dinero(producto.precio)}
</strong>

<button
class="add-button"
data-id="${producto.id}">

Agregar al pedido
<span>→</span>

</button>

</div>

</div>

`;


contenedor.appendChild(tarjeta);

});


document
.querySelectorAll("[data-id]")
.forEach(button => {

button.addEventListener(
"click",
() => {

agregarAlCarrito(
Number(button.dataset.id)
);

});

});

}



function agregarAlCarrito(id){

const producto =
productosData.find(
p => p.id === id
);


if(!producto) return;


const existente =
carrito.find(
p => p.id === id
);


if(existente){

existente.cantidad += 1;

}else{

carrito.push({

...producto,

cantidad:1

});

}


guardarCarrito();

renderCarrito();

mostrarMensaje(
producto.nombre +
" agregado a tu pedido"
);


abrirCarrito();

}



function renderCarrito(){

const contenedor =
document.getElementById(
"carrito-items"
);

const totalElement =
document.getElementById(
"carrito-total"
);

const numero =
document.getElementById(
"carrito-numero"
);

const empty =
document.getElementById(
"cart-empty"
);


if(!contenedor) return;


contenedor.innerHTML = "";


let total = 0;

let cantidadTotal = 0;


carrito.forEach(
(producto,index) => {


const subtotal =
producto.precio *
producto.cantidad;


total += subtotal;

cantidadTotal +=
producto.cantidad;


const item =
document.createElement(
"div"
);


item.className =
"cart-product";


item.innerHTML = `

<img
src="${ROOT}assets/productos/${producto.imagen}"
alt="${producto.nombre}">


<div class="cart-product-data">

<div>

<strong>
${producto.nombre}
</strong>

<span>
${producto.medida}
</span>

</div>


<div class="cart-product-bottom">

<strong>
$${dinero(subtotal)}
</strong>


<div class="quantity">

<button
data-action="minus"
data-index="${index}">
−
</button>

<span>
${producto.cantidad}
</span>

<button
data-action="plus"
data-index="${index}">
+
</button>

</div>

</div>

</div>

`;


contenedor.appendChild(item);

});


if(totalElement){

totalElement.textContent =
"$" + dinero(total);

}


if(numero){

numero.textContent =
cantidadTotal;

}


if(empty){

empty.style.display =
carrito.length
? "none"
: "block";

}


document
.querySelectorAll(
"[data-action]"
)
.forEach(button => {

button.addEventListener(
"click",
() => {

const index =
Number(
button.dataset.index
);

if(
button.dataset.action === "plus"
){

carrito[index].cantidad += 1;

}


if(
button.dataset.action === "minus"
){

carrito[index].cantidad -= 1;


if(
carrito[index].cantidad <= 0
){

carrito.splice(index,1);

}

}


guardarCarrito();

renderCarrito();

});

});

}



function vaciarCarrito(){

if(!carrito.length){

mostrarMensaje(
"El pedido ya está vacío"
);

return;

}


carrito = [];

guardarCarrito();

renderCarrito();

mostrarMensaje(
"Pedido vaciado"
);

}



function abrirCarrito(){

const drawer =
document.getElementById(
"carrito-lista"
);

if(!drawer) return;

drawer.classList.add(
"mostrar"
);

document.body.classList.add(
"cart-open"
);

}



function cerrarCarrito(){

const drawer =
document.getElementById(
"carrito-lista"
);

if(!drawer) return;

drawer.classList.remove(
"mostrar"
);

document.body.classList.remove(
"cart-open"
);

}



function continuarCheckout(){

if(!carrito.length){

mostrarMensaje(
"Agregá al menos un producto"
);

return;

}


window.location.href =
ROOT +
"assets/pages/checkout.html";

}



document.addEventListener(
"DOMContentLoaded",
() => {


cargarProductos();

renderCarrito();


const cart =
document.getElementById(
"header-cart"
);

cart?.addEventListener(
"click",
abrirCarrito
);


document
.getElementById(
"carrito-cerrar"
)
?.addEventListener(
"click",
cerrarCarrito
);


document
.getElementById(
"cart-overlay"
)
?.addEventListener(
"click",
cerrarCarrito
);


document
.getElementById(
"carrito-vaciar"
)
?.addEventListener(
"click",
vaciarCarrito
);


document
.getElementById(
"carrito-checkout"
)
?.addEventListener(
"click",
continuarCheckout
);


document
.addEventListener(
"keydown",
event => {

if(
event.key === "Escape"
){

cerrarCarrito();

}

});


const menu =
document.getElementById(
"menu-button"
);

const nav =
document.getElementById(
"mobile-nav"
);


menu?.addEventListener(
"click",
() => {

nav?.classList.toggle("mostrar");

menu.classList.toggle("activo");

});


nav
?.querySelectorAll("a")
.forEach(link => {

link.addEventListener(
"click",
() => {

nav.classList.remove(
"mostrar"
);

menu.classList.remove(
"activo"
);

});

});


});
