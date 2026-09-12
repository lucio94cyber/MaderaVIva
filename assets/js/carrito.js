const STORAGE_KEY = "maderaVivaCarrito";

let carrito =
  JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

let productosData = [];

/* Detecta si estamos dentro de /assets/pages/ */
const isNestedPage =
  window.location.pathname.includes("/assets/pages/");

const ROOT = isNestedPage ? "../../" : "./";


/* =========================
   GUARDAR CARRITO
========================= */

function guardarCarrito() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(carrito)
  );
}


/* =========================
   FORMATO DINERO
========================= */

function dinero(valor) {
  return new Intl.NumberFormat("es-AR").format(valor);
}


/* =========================
   MENSAJE
========================= */

function mostrarMensaje(texto) {
  const mensaje =
    document.getElementById("mensaje-carrito");

  if (!mensaje) return;

  mensaje.textContent = texto;

  mensaje.classList.add("mostrar");

  setTimeout(() => {
    mensaje.classList.remove("mostrar");
  }, 2200);
}


/* =========================
   CARGAR PRODUCTOS
========================= */

async function cargarProductos() {
  const contenedor =
    document.getElementById("contenedor-productos");

  /*
    En el index no existe catálogo.
    En ese caso simplemente no hacemos nada.
  */
  if (!contenedor) return;

  try {
    const respuesta = await fetch(
      ROOT + "data/productos.json"
    );

    if (!respuesta.ok) {
      throw new Error(
        "No se pudo cargar el catálogo"
      );
    }

    productosData = await respuesta.json();

    mostrarProductos();

  } catch (error) {

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


/* =========================
   MOSTRAR PRODUCTOS
========================= */

function mostrarProductos() {
  const contenedor =
    document.getElementById(
      "contenedor-productos"
    );

  if (!contenedor) return;

  contenedor.innerHTML = "";

  productosData.forEach(
    (producto, index) => {

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
            ${String(index + 1).padStart(2, "0")}
          </span>

          <img
            src="${imagen}"
            alt="${producto.nombre}"
            loading="lazy"
          >

          <button
            class="product-quick-add"
            data-id="${producto.id}"
            type="button"
          >
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
              data-id="${producto.id}"
              type="button"
            >
              Agregar al pedido
              <span>→</span>
            </button>

          </div>

        </div>
      `;

      contenedor.appendChild(tarjeta);
    }
  );


  /*
    Eventos de agregar producto
  */

  document
    .querySelectorAll("[data-id]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          agregarAlCarrito(
            Number(button.dataset.id)
          );

        }
      );

    });
}


/* =========================
   AGREGAR AL CARRITO
========================= */

function agregarAlCarrito(id) {

  const producto =
    productosData.find(
      p => p.id === id
    );

  /*
    Si estamos en el index y todavía
    no cargamos productos, buscamos
    directamente desde el JSON.
  */

  if (!producto) {
    cargarProductosParaAgregar(id);
    return;
  }

  const existente =
    carrito.find(
      p => p.id === id
    );

  if (existente) {

    existente.cantidad += 1;

  } else {

    carrito.push({
      ...producto,
      cantidad: 1
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


/* =========================
   CARGA DE SEGURIDAD
========================= */

async function cargarProductosParaAgregar(id) {

  try {

    const respuesta =
      await fetch(
        ROOT + "data/productos.json"
      );

    if (!respuesta.ok) {
      throw new Error(
        "No se pudo cargar el catálogo"
      );
    }

    productosData =
      await respuesta.json();

    agregarAlCarrito(id);

  } catch (error) {

    console.error(error);

    mostrarMensaje(
      "No pudimos agregar el producto"
    );
  }
}


/* =========================
   RENDER CARRITO
========================= */

function renderCarrito() {

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

  if (!contenedor) return;

  contenedor.innerHTML = "";

  let total = 0;
  let cantidadTotal = 0;


  carrito.forEach(
    (producto, index) => {

      const subtotal =
        producto.precio *
        producto.cantidad;

      total += subtotal;

      cantidadTotal +=
        producto.cantidad;


      const item =
        document.createElement("div");

      item.className =
        "cart-product";


      item.innerHTML = `
        <img
          src="${ROOT}assets/productos/${producto.imagen}"
          alt="${producto.nombre}"
        >

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
                type="button"
                data-action="minus"
                data-index="${index}"
              >
                −
              </button>

              <span>
                ${producto.cantidad}
              </span>

              <button
                type="button"
                data-action="plus"
                data-index="${index}"
              >
                +
              </button>

            </div>

          </div>

        </div>
      `;

      contenedor.appendChild(item);

    }
  );


  if (totalElement) {

    totalElement.textContent =
      "$" + dinero(total);

  }


  if (numero) {

    numero.textContent =
      cantidadTotal;

  }


  if (empty) {

    empty.style.display =
      carrito.length
        ? "none"
        : "block";

  }


  /*
    Eventos + / -
  */

  document
    .querySelectorAll("[data-action]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset.index
            );

          if (
            button.dataset.action ===
            "plus"
          ) {

            carrito[index].cantidad += 1;

          }


          if (
            button.dataset.action ===
            "minus"
          ) {

            carrito[index].cantidad -= 1;


            if (
              carrito[index].cantidad <= 0
            ) {

              carrito.splice(index, 1);

            }

          }

          guardarCarrito();

          renderCarrito();

        }
      );

    });
}


/* =========================
   VACIAR CARRITO
========================= */

function vaciarCarrito() {

  if (!carrito.length) {

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


/* =========================
   ABRIR CARRITO
========================= */

function abrirCarrito() {

  const drawer =
    document.getElementById(
      "carrito-lista"
    );

  if (!drawer) return;

  /*
    Forzamos la apertura desde JS.
    Esto funciona tanto desde index
    como desde las páginas internas.
  */

  drawer.classList.add("open");

  document.body.classList.add(
    "cart-open"
  );
}


/* =========================
   CERRAR CARRITO
========================= */

function cerrarCarrito() {

  const drawer =
    document.getElementById(
      "carrito-lista"
    );

  if (!drawer) return;

  drawer.classList.remove(
    "open"
  );

  document.body.classList.remove(
    "cart-open"
  );
}


/* =========================
   CHECKOUT
========================= */

function continuarCheckout() {

  if (!carrito.length) {

    mostrarMensaje(
      "Agregá al menos un producto"
    );

    return;
  }

  window.location.href =
    ROOT +
    "assets/pages/checkout.html";
}


/* =========================
   INICIALIZACIÓN
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /*
      Primero pintamos el carrito.
      Esto hace que también funcione
      si ya había productos guardados.
    */

    renderCarrito();


    /*
      Cargamos catálogo solamente
      cuando corresponde.
    */

    cargarProductos();


    /* =====================
       BOTÓN CARRITO HEADER
    ===================== */

    const cart =
      document.getElementById(
        "header-cart"
      );

    if (cart) {

      cart.addEventListener(
        "click",
        function (event) {

          event.preventDefault();

          event.stopPropagation();

          abrirCarrito();

        }
      );

    }


    /* =====================
       CERRAR CARRITO
    ===================== */

    const cerrar =
      document.getElementById(
        "carrito-cerrar"
      );

    cerrar?.addEventListener(
      "click",
      cerrarCarrito
    );


    /* =====================
       OVERLAY
    ===================== */

    const overlay =
      document.getElementById(
        "cart-overlay"
      );

    overlay?.addEventListener(
      "click",
      cerrarCarrito
    );


    /* =====================
       VACIAR
    ===================== */

    const vaciar =
      document.getElementById(
        "carrito-vaciar"
      );

    vaciar?.addEventListener(
      "click",
      vaciarCarrito
    );


    /* =====================
       CHECKOUT
    ===================== */

    const checkout =
      document.getElementById(
        "carrito-checkout"
      );

    checkout?.addEventListener(
      "click",
      continuarCheckout
    );


    /* =====================
       ESCAPE
    ===================== */

    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Escape"
        ) {

          cerrarCarrito();

        }

      }
    );


    /* =====================
       MENÚ MOBILE
    ===================== */

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

        nav?.classList.toggle(
          "mostrar"
        );

        menu.classList.toggle(
          "activo"
        );

      }
    );


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

          }
        );

      });

  }
);
