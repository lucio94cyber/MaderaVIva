const parametro = new URLSearchParams(window.location.search);
const status = parametro.get("status");

const paginaActual = window.location.pathname;

if (paginaActual.includes("pago-aprobado") && status !== "approved") {
    window.location.href = "index.html";
}

if (paginaActual.includes("pago-pendiente") && status !== "pending") {
    window.location.href = "index.html";
}

if (paginaActual.includes("pago-error") && status !== "rejected") {
    window.location.href = "index.html";
}