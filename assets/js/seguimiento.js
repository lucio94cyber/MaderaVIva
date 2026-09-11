const ORDER_KEY =
"maderaVivaPedidos";


const input =
document.getElementById(
"numero-pedido"
);

const buscar =
document.getElementById(
"buscar-pedido"
);


const resultado =
document.getElementById(
"resultado-pedido"
);


const error =
document.getElementById(
"tracking-error"
);



function dinero(valor){

return new Intl.NumberFormat(
"es-AR"
).format(valor);

}



function buscarPedido(){

const numero =
input.value
.trim()
.toUpperCase();


if(!numero){

mostrarError(
"Ingresá un número de pedido."
);

return;

}


const pedidos =
JSON.parse(
localStorage.getItem(
ORDER_KEY
)
) || [];


const pedido =
pedidos.find(
p =>
p.numero.toUpperCase() ===
numero
);


if(!pedido){

mostrarError(
"No encontramos ese pedido en este dispositivo."
);

resultado.classList.remove(
"mostrar"
);

return;

}


error.textContent = "";

mostrarPedido(
pedido
);

}



function mostrarPedido(
pedido
){

resultado.classList.add(
"mostrar"
);


document.getElementById(
"resultado-numero"
).textContent =
pedido.numero;


const estados = {

recibido:
"Pedido recibido",

preparacion:
"En preparación",

despachado:
"Despachado",

entregado:
"Entregado"

};


document.getElementById(
"resultado-estado"
).textContent =
estados[pedido.estado] ||
"Pedido recibido";


document.getElementById(
"cliente-pedido"
).textContent =
pedido.cliente.nombre +
" " +
pedido.cliente.apellido;


document.getElementById(
"total-pedido"
).textContent =
"$" +
dinero(pedido.total);


document.getElementById(
"entrega-pedido"
).textContent =
pedido.cliente.entrega ===
"retiro"
? "Retiro"
: "Envío a domicilio";


const ordenEstados = [
"recibido",
"preparacion",
"despachado",
"entregado"
];


const posicion =
ordenEstados.indexOf(
pedido.estado
);


document
.querySelectorAll(
".tracking-step"
)
.forEach(
(step,index) => {

step.classList.toggle(
"active",
index <= posicion
);

});


}



function mostrarError(
mensaje
){

error.textContent =
mensaje;

}



buscar?.addEventListener(
"click",
buscarPedido
);


input?.addEventListener(
"keydown",
event => {

if(
event.key === "Enter"
){

buscarPedido();

}

});


const ultimo =
localStorage.getItem(
"maderaVivaUltimoPedido"
);


if(ultimo){

input.value =
ultimo;

buscarPedido();

}
