// ===============================
// Cliente JavaScript para consumir la API REST
// ===============================
// Este archivo contiene toda la lógica del cliente para:
// - Obtener productos del servidor (GET)
// - Agregar nuevos productos (POST)
// - Ordenar productos localmente
// - Mostrar productos en el DOM

// ===============================
// VARIABLE GLOBAL
// ===============================
// Almacena los productos obtenidos del servidor para poder ordenarlos sin hacer peticiones adicionales
let productosGuardados = [];

// ===============================
// Función para obtener productos desde el servidor (GET)
// ===============================
// Esta función es asíncrona porque espera respuestas del servidor
async function obtenerDatos() {
    try {
        // Hace una petición HTTP GET al servidor en localhost:3000
        const response = await fetch('http://localhost:3000');

        // Convierte la respuesta JSON a un objeto/array de JavaScript
        const datos = await response.json();

        // Guarda los productos en la variable global para usarlos en ordenamiento
        productosGuardados = datos;

        // Muestra los productos en el DOM
        mostrarProductos(datos);
    } catch (error) {
        // Si ocurre un error (servidor no disponible, error de red, etc.), lo muestra en consola
        console.error('Error:', error);
    }
}

// ===============================
// Event Listener para el botón de listar productos
// ===============================
// Escucha el clic en el botón "Listar Productos" y ejecuta la función obtenerDatos
document.getElementById('listarProductos').addEventListener('click', obtenerDatos);

// ===============================
// Función para mostrar productos en el DOM
// ===============================
// Recibe un array de productos y los renderiza en formato HTML
function mostrarProductos(productos) {
    // Selecciona el div contenedor donde se mostrarán los productos
    const display = document.getElementById('productosDisplay');

    // Variable que acumulará el HTML de todos los productos
    let html = '';

    // Recorre cada producto del array
    for (const producto of productos) {
        const imagenUrl = obtenerImagenProducto(producto.nombre);
        // Usa template literals para construir el HTML de cada producto con mejor estructura
        // Cada producto se envuelve en un div con clase para aplicar estilos CSS
        html += `
            <article class="producto-item">
                <div class="producto-media">
                    <img src="${imagenUrl}" alt="${producto.nombre}" loading="lazy" onerror="this.onerror=null;this.src='assets/img/laptop.png';">
                </div>
                <div class="producto-info">
                    <h3 class="producto-nombre">${producto.nombre}</h3>
                    <p class="producto-precio">$${producto.precio}</p>
                </div>
                <button class="btn ghost" type="button">Ver detalle</button>
            </article>
        `;
    }

    // Aplica el HTML generado al contenedor
    display.innerHTML = html;
}

// ===============================
// Popup de errores (toast)
// ===============================
function mostrarPopup(mensaje) {
    const toast = document.getElementById('toast');
    toast.textContent = mensaje;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3000);
}

// ===============================
// Mapa simple de imagenes por producto
// ===============================
function obtenerImagenProducto(nombre) {
    const key = String(nombre || '').toLowerCase();
    const slug = key
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_\-]/g, '');
    const catalogo = {
        laptop: 'assets/img/laptop.png',
        mouse: 'assets/img/mouse.png',
        teclado: 'assets/img/teclado.png',
        monitor: 'assets/img/monitor.png',
        webcam: 'assets/img/webcam.png',
        mousepad: 'assets/img/mousepad.png',
        'mouse gamer': 'assets/img/Mouse_gamer.png'
    };

    return catalogo[key] || `assets/img/${slug}.jpg`;
}

// ===============================
// Event Listener para el formulario (POST)
// ===============================
// Cambio: separamos el envio del formulario del renderizado para evitar mezclar responsabilidades.
document.getElementById('productoForm').addEventListener('submit', enviarProducto);

// ===============================
// Función para enviar un nuevo producto al servidor (POST)
// ===============================
async function enviarProducto(event) {
    event.preventDefault(); // Cambio: evita el recargo de la pagina al enviar el formulario.

    // Obtiene los valores ingresados en los inputs del formulario
    const nombre = document.getElementById('nombre').value;
    const precio = Number.parseFloat(document.getElementById('precio').value); // Convierte el string a número decimal

    // Hace una petición POST al servidor para agregar el nuevo producto
    fetch('http://localhost:3000', {
        method: 'POST', // Método HTTP para enviar datos
        headers: {
            'Content-Type': 'application/json' // Indica que enviamos datos en formato JSON
        },
        body: JSON.stringify({ nombre, precio }) // Convierte el objeto JavaScript a JSON
    })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                if (response.status === 409) {
                    mostrarPopup('Producto duplicado: mismo nombre y precio.');
                } else {
                    mostrarPopup(data.error || 'No se pudo agregar el producto.');
                }
                return;
            }
            console.log('Respuesta del servidor:', data);
            // Actualiza la lista de productos para mostrar el recién agregado
            obtenerDatos();
        })
        .catch(error => {
            // Captura errores de red o del servidor
            console.error('Error al enviar producto:', error);
            mostrarPopup('Error de red al agregar el producto.');
        });
}


// ===============================
// Función para ordenar y mostrar productos
// ===============================
// Esta función ordena los productos según el criterio seleccionado por el usuario
function ordenarYMostrar() {
    // Obtiene el valor del select (nombre, precioAscendente o precioDescendente)
    const criterio = document.getElementById('criterioOrden').value;

    // Crea una copia del array original usando spread operator [...]
    // Esto evita modificar el array original
    let productosOrdenados = [...productosGuardados];

    console.log('Criterio seleccionado:', criterio);

    // Verifica el criterio seleccionado y aplica el ordenamiento correspondiente
    if (criterio === 'nombre') {
        // Ordena alfabéticamente por nombre usando localeCompare
        productosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (criterio === 'precioAscendente') {
        // Ordena numéricamente de menor a mayor (ascendente)
        // a.precio - b.precio devuelve negativo si a < b, positivo si a > b
        productosOrdenados.sort((a, b) => a.precio - b.precio);
    } else if (criterio === 'precioDescendente') {
        // Ordena numéricamente de mayor a menor (descendente)
        // b.precio - a.precio invierte el orden
        productosOrdenados.sort((a, b) => b.precio - a.precio);
    }

    // Muestra los productos ya ordenados en el DOM
    mostrarProductos(productosOrdenados);
}

// ===============================
// Event Listener para el botón de ordenar productos
// ===============================
// Escucha el clic en el botón de ordenar y ejecuta la función ordenarYMostrar
document.getElementById('ordenarBtn').addEventListener('click', ordenarYMostrar);
