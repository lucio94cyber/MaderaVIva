const STORAGE_KEY = "maderaVivaCarrito";

let carrito = leerCarrito();
let productosData = [];

const isNestedPage = window.location.pathname.includes("/assets/pages/");
const ROOT = isNestedPage ? "../../" : "./";

function leerCarrito() {
  try {
    const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(guardado) ? guardado : [];
  } catch {
    return [];
  }
}

function guardarCarrito() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
}

function dinero(valor) {
  return new Intl.NumberFormat("es-AR").format(Number(valor) || 0);
}

function mostrarMensaje(texto) {
  const mensaje = document.getElementById("mensaje-carrito");
  if (!mensaje) return;

  mensaje.textContent = texto;
  mensaje.classList.add("mostrar");

  clearTimeout(mostrarMensaje.timer);
  mostrarMensaje.timer = setTimeout(() => {
    mensaje.classList.remove("mostrar");
  }, 2200);
}

async function cargarProductos() {
  const contenedor = document.getElementById("contenedor-productos");
  if (!contenedor) return;

  try {
    const respuesta = await fetch(ROOT + "data/productos.json", { cache: "no-store" });
    if (!respuesta.ok) throw new Error("No se pudo cargar el catálogo");

    productosData = await respuesta.json();
    mostrarProductos();
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `
      <div class="catalog-error">
        <h3>No pudimos cargar la colección.</h3>
        <p>Actualizá la página e intentá nuevamente.</p>
      </div>
    `;
  }
}

function mostrarProductos() {
  const contenedor = document.getElementById("contenedor-productos");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  productosData.forEach((producto, index) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "catalog-product";

    const imagen = ROOT + "assets/productos/" + producto.imagen;

    tarjeta.innerHTML = `
      <div class="catalog-product-image">
        <span class="product-number">${String(index + 1).padStart(2, "0")}</span>
        <img src="${imagen}" alt="${producto.nombre}" loading="lazy">
        <button class="product-quick-add" data-product-id="${producto.id}" type="button">
          Agregar +
        </button>
      </div>

      <div class="catalog-product-info">
        <div>
          <small>MADERA VIVA</small>
          <h2>${producto.nombre}</h2>
          <p>${producto.medida}</p>
        </div>

        <div class="product-price">
          <strong>$${dinero(producto.precio)}</strong>
          <button class="add-button" data-product-id="${producto.id}" type="button">
            Agregar al pedido <span>→</span>
          </button>
        </div>
      </div>
    `;

    contenedor.appendChild(tarjeta);
  });
}

async function asegurarProductos() {
  if (productosData.length) return true;

  try {
    const respuesta = await fetch(ROOT + "data/productos.json", { cache: "no-store" });
    if (!respuesta.ok) throw new Error("No se pudo cargar el catálogo");
    productosData = await respuesta.json();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function agregarAlCarrito(id) {
  const cargado = await asegurarProductos();
  if (!cargado) {
    mostrarMensaje("No pudimos cargar el producto");
    return;
  }

  const producto = productosData.find(p => Number(p.id) === Number(id));
  if (!producto) {
    mostrarMensaje("No encontramos ese producto");
    return;
  }

  const existente = carrito.find(p => Number(p.id) === Number(id));

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  guardarCarrito();
  renderCarrito();
  mostrarMensaje(`${producto.nombre} agregado a tu pedido`);
  abrirCarrito();
}

function renderCarrito() {
  const contenedor = document.getElementById("carrito-items");
  const totalElement = document.getElementById("carrito-total");
  const numero = document.getElementById("carrito-numero");
  const empty = document.getElementById("cart-empty");

  if (!contenedor) return;

  contenedor.innerHTML = "";

  let total = 0;
  let cantidadTotal = 0;

  carrito.forEach((producto, index) => {
    const cantidad = Math.max(1, Number(producto.cantidad) || 1);
    producto.cantidad = cantidad;

    const subtotal = (Number(producto.precio) || 0) * cantidad;
    total += subtotal;
    cantidadTotal += cantidad;

    const item = document.createElement("div");
    item.className = "cart-product";
    item.innerHTML = `
      <img src="${ROOT}assets/productos/${producto.imagen}" alt="${producto.nombre}">
      <div class="cart-product-data">
        <div>
          <strong>${producto.nombre}</strong>
          <span>${producto.medida || ""}</span>
        </div>
        <div class="cart-product-bottom">
          <strong>$${dinero(subtotal)}</strong>
          <div class="quantity" aria-label="Cantidad">
            <button type="button" data-action="minus" data-index="${index}" aria-label="Restar una unidad">−</button>
            <span>${cantidad}</span>
            <button type="button" data-action="plus" data-index="${index}" aria-label="Sumar una unidad">+</button>
          </div>
        </div>
      </div>
    `;
    contenedor.appendChild(item);
  });

  if (totalElement) totalElement.textContent = "$" + dinero(total);
  if (numero) numero.textContent = cantidadTotal;
  if (empty) empty.style.display = carrito.length ? "none" : "block";

  guardarCarrito();
}

function cambiarCantidad(index, delta) {
  if (!carrito[index]) return;

  carrito[index].cantidad += delta;
  if (carrito[index].cantidad <= 0) carrito.splice(index, 1);

  guardarCarrito();
  renderCarrito();
}

function vaciarCarrito() {
  if (!carrito.length) {
    mostrarMensaje("El pedido ya está vacío");
    return;
  }

  carrito = [];
  guardarCarrito();
  renderCarrito();
  mostrarMensaje("Pedido vaciado");
}

function abrirCarrito() {
  const drawer = document.getElementById("carrito-lista");
  if (!drawer) return;

  drawer.classList.add("open");
  document.body.classList.add("cart-open");
}

function cerrarCarrito() {
  const drawer = document.getElementById("carrito-lista");
  if (!drawer) return;

  drawer.classList.remove("open");
  document.body.classList.remove("cart-open");
}

function continuarCheckout() {
  if (!carrito.length) {
    mostrarMensaje("Agregá al menos un producto");
    return;
  }

  window.location.href = ROOT + "assets/pages/checkout.html";
}

document.addEventListener("DOMContentLoaded", () => {
  renderCarrito();
  cargarProductos();

  const cart = document.getElementById("header-cart");
  cart?.addEventListener("click", event => {
    event.preventDefault();
    abrirCarrito();
  });

  document.getElementById("carrito-cerrar")?.addEventListener("click", cerrarCarrito);
  document.getElementById("cart-overlay")?.addEventListener("click", cerrarCarrito);
  document.getElementById("carrito-checkout")?.addEventListener("click", continuarCheckout);
  document.getElementById("carrito-vaciar")?.addEventListener("click", vaciarCarrito);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") cerrarCarrito();
  });

  document.addEventListener("click", event => {
    const botonProducto = event.target.closest("[data-product-id]");
    if (botonProducto) {
      agregarAlCarrito(Number(botonProducto.dataset.productId));
      return;
    }

    const botonCantidad = event.target.closest("[data-action]");
    if (botonCantidad) {
      const index = Number(botonCantidad.dataset.index);
      cambiarCantidad(index, botonCantidad.dataset.action === "plus" ? 1 : -1);
    }
  });

  const menuButton = document.getElementById("menu-button");
  const mobileNav = document.getElementById("mobile-nav");

  menuButton?.addEventListener("click", () => {
    mobileNav?.classList.toggle("mostrar");
    menuButton.classList.toggle("activo");
  });
});
