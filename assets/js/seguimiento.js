const ORDER_KEY = "maderaVivaPedidos";

const input = document.getElementById("numero-pedido");
const buscar = document.getElementById("buscar-pedido");
const resultado = document.getElementById("resultado-pedido");
const error = document.getElementById("tracking-error");


function dinero(valor) {
    return new Intl.NumberFormat("es-AR").format(valor);
}


function buscarPedido() {

    const numero = input.value.trim().toUpperCase();

    if (!numero) {
        mostrarError("Ingresá un número de pedido.");
        return;
    }

    const pedidos =
        JSON.parse(localStorage.getItem(ORDER_KEY)) || [];

    const pedido = pedidos.find(
        p =>
            p.numero &&
            p.numero.toUpperCase() === numero
    );

    if (!pedido) {

        mostrarError(
            "No encontramos ese pedido en este dispositivo."
        );

        resultado.classList.remove("mostrar");

        return;
    }

    error.textContent = "";
    error.classList.remove("mostrar");

    mostrarPedido(pedido);

    // Llevar suavemente al resultado
    setTimeout(() => {

        resultado.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 150);
}


function mostrarPedido(pedido) {

    resultado.classList.add("mostrar");

    const numero =
        document.getElementById("resultado-numero");

    const estado =
        document.getElementById("resultado-estado");

    const cliente =
        document.getElementById("cliente-pedido");

    const total =
        document.getElementById("total-pedido");

    const entrega =
        document.getElementById("entrega-pedido");


    if (numero) {
        numero.textContent = pedido.numero;
    }


    const estados = {
        recibido: "Pedido recibido",
        preparacion: "En preparación",
        despachado: "Despachado",
        entregado: "Entregado"
    };


    if (estado) {

        estado.textContent =
            estados[pedido.estado] ||
            "Pedido recibido";

    }


    if (cliente) {

        cliente.textContent =
            `${pedido.cliente?.nombre || ""} ${pedido.cliente?.apellido || ""}`.trim();

    }


    if (total) {

        total.textContent =
            "$" + dinero(pedido.total || 0);

    }


    if (entrega) {

        entrega.textContent =
            pedido.cliente?.entrega === "retiro"
                ? "Retiro"
                : "Envío a domicilio";

    }


    const ordenEstados = [
        "recibido",
        "preparacion",
        "despachado",
        "entregado"
    ];


    let posicion =
        ordenEstados.indexOf(pedido.estado);


    // Si no existe estado, consideramos recibido
    if (posicion === -1) {
        posicion = 0;
    }


    document
        .querySelectorAll(".tracking-step")
        .forEach((step, index) => {

            step.classList.remove("active");
            step.classList.remove("current");

            if (index <= posicion) {
                step.classList.add("active");
            }

            if (index === posicion) {
                step.classList.add("current");
            }

        });
}


function mostrarError(mensaje) {

    if (!error) return;

    error.textContent = mensaje;
    error.classList.add("mostrar");

}


buscar?.addEventListener(
    "click",
    buscarPedido
);


input?.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            buscarPedido();
        }

    }
);


// Completar automáticamente el último pedido,
// pero NO hacer la búsqueda automáticamente.
const ultimo =
    localStorage.getItem("maderaVivaUltimoPedido");


if (ultimo && input) {
    input.value = ultimo;
}
