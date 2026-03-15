async function finalizarCompra() { 
// Función que se ejecuta cuando el usuario hace clic en "Finalizar compra"

    let carrito = JSON.parse(localStorage.getItem("carrito")) || []; 
    // Trae el carrito guardado en LocalStorage y lo convierte de texto JSON a objeto JS

    if (carrito.length === 0) { 
    // Verifica si el carrito está vacío
        alert("Tu carrito está vacío"); 
        // Muestra un mensaje al usuario si no hay productos
        return; 
        // Detiene la ejecución de la función
    }

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", { 
    // Hace una petición a la API de Mercado Pago para crear una "preferencia de pago"

        method: "POST", 
        // Indica que se está enviando información para crear algo en la API

        headers: {
            "Content-Type": "application/json", 
            // Indica que los datos que enviamos están en formato JSON

            "Authorization": "Bearer TEST-2842962534545081-030915-73ad8a1b71d53428829e63064f5a23aa-179836166"
            // Token de seguridad de Mercado Pago que identifica tu cuenta
        },

        body: JSON.stringify({
        // Convierte el objeto JS en JSON para enviarlo a la API

            items: carrito.map(producto => ({
            // Recorre cada producto del carrito para enviarlo a Mercado Pago

                title: producto.nombre, 
                // Nombre del producto que se mostrará en el checkout

                quantity: producto.cantidad || 1, 
                // Cantidad del producto (si no existe usa 1)

                unit_price: producto.precio
                // Precio del producto
            })),

            back_urls: {
            // URLs a las que Mercado Pago redirige cuando termina el pago

                success: "https://tusitio.com/pago-aprobado.html", 
                // Página a la que vuelve si el pago se aprueba

                failure: "https://tusitio.com/pago-error.html", 
                // Página a la que vuelve si el pago falla

                pending: "https://tusitio.com/pago-pendiente.html"
                // Página a la que vuelve si el pago queda pendiente
            },

            auto_return: "approved"
            // Si el pago se aprueba, Mercado Pago vuelve automáticamente a tu sitio
        })
    });

    const data = await response.json(); 
    // Convierte la respuesta de la API en un objeto que JavaScript puede usar

    window.location.href = data.init_point; 
    // Redirige al usuario al checkout de Mercado Pago para completar el pago
}