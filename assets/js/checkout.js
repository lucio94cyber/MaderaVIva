const CART_KEY = "maderaVivaCarrito";
const ORDER_KEY = "maderaVivaPedidos";

let carrito =
JSON.parse(localStorage.getItem(CART_KEY)) || [];


const itemsContainer =
document.getElementById(
"checkout-items"
);

const totalElement =
document.getElementById(
"checkout-total"
);


function dinero(valor){

return new Intl.NumberFormat(
"es-AR"
).format(valor);

}



function renderResumen(){

if(!itemsContainer) return;


itemsContainer.innerHTML = "";

let total = 0;


if(!carrito.length){

itemsContainer.innerHTML = `
<div class="summary-empty">

<p>
Tu pedido está vacío.
</p>

<a href="./tienda.html">
Volver a la colección →
</a>

</div>
`;

return;

}


carrito.forEach(producto => {

const subtotal =
producto.precio *
producto.cantidad;


total += subtotal;


const item =
document.createElement(
"div"
);


item.className =
"summary-item";


item.innerHTML = `

<div>

<strong>
${producto.nombre}
</strong>

<span>
${producto.cantidad} ×
$${dinero(producto.precio)}
</span>

</div>

<strong>
$${dinero(subtotal)}
</strong>

`;


itemsContainer.appendChild(
item
);

});


totalElement.textContent =
"$" + dinero(total);

}



function obtenerDatos(){

const entrega =
document.querySelector(
'input[name="entrega"]:checked'
)?.value;


const pago =
document.querySelector(
'input[name="pago"]:checked'
)?.value;


return {

nombre:
document.getElementById(
"nombre"
).value.trim(),

apellido:
document.getElementById(
"apellido"
).value.trim(),

email:
document.getElementById(
"email"
).value.trim(),

telefono:
document.getElementById(
"telefono"
).value.trim(),

entrega,

direccion:
document.getElementById(
"direccion"
)?.value.trim() || "",

localidad:
document.getElementById(
"localidad"
)?.value.trim() || "",

codigo:
document.getElementById(
"codigo"
)?.value.trim() || "",

pago

};

}



function generarNumeroPedido(){

const fecha =
new Date();


const yy =
String(
fecha.getFullYear()
).slice(-2);


const mm =
String(
fecha.getMonth()+1
).padStart(2,"0");


const dd =
String(
fecha.getDate()
).padStart(2,"0");


const random =
Math.floor(
1000 +
Math.random() * 9000
);


return `MV-${yy}${mm}${dd}-${random}`;

}



function guardarPedido(){

const datos =
obtenerDatos();


if(!carrito.length){

mostrarError(
"Tu pedido está vacío."
);

return;

}


if(
!datos.nombre ||
!datos.apellido ||
!datos.email ||
!datos.telefono
){

mostrarError(
"Completá todos tus datos."
);

return;

}


if(
datos.entrega === "envio" &&
(
!datos.direccion ||
!datos.localidad ||
!datos.codigo
)
){

mostrarError(
"Completá los datos de entrega."
);

return;

}


if(
!document.getElementById(
"terminos"
).checked
){

mostrarError(
"Tenés que confirmar los datos."
);

return;

}


const numero =
generarNumeroPedido();


const total =
carrito.reduce(
(
acumulado,
producto
) =>
acumulado +
producto.precio *
producto.cantidad,
0
);


const pedido = {

numero,

fecha:
new Date().toISOString(),

estado:
"recibido",

cliente:datos,

productos:
carrito,

total

};


const pedidos =
JSON.parse(
localStorage.getItem(
ORDER_KEY
)
) || [];


pedidos.push(pedido);


localStorage.setItem(
ORDER_KEY,
JSON.stringify(pedidos)
);


localStorage.setItem(
"maderaVivaUltimoPedido",
numero
);


/*
IMPORTANTE:

No hacemos una llamada directa a Mercado Pago
desde el navegador.

El token privado NO debe publicarse en GitHub.

Cuando se conecte el backend real,
este punto será reemplazado por la creación
segura de la preferencia de pago.
*/


if(
datos.pago === "mercadopago"
){

localStorage.setItem(
"maderaVivaPagoPendiente",
"mercadopago"
);

}


/* =====================================================
   NUEVO:
   Vaciar carrito después de generar correctamente
   el pedido.
   ===================================================== */

localStorage.removeItem(CART_KEY);


window.location.href =
"./pedido.html?numero=" +
encodeURIComponent(numero);

}



function mostrarError(mensaje){

const error =
document.getElementById(
"checkout-error"
);

error.textContent =
mensaje;

error.classList.add(
"mostrar"
);

}



document
.querySelectorAll(
'input[name="entrega"]'
)
.forEach(input => {

input.addEventListener(
"change",
() => {

const container =
document.getElementById(
"direccion-container"
);

if(
input.value === "retiro" &&
input.checked
){

container.style.display =
"none";

}else{

container.style.display =
"grid";

}

});

});



document
.getElementById(
"confirmar-pedido"
)
?.addEventListener(
"click",
guardarPedido
);


renderResumen();
