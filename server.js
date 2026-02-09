// Servidor Node.js para Gestión de Productos
// Aquí construiremos nuestro servidor paso a paso
// === IMPORTACIONES DE MÓDULOS ===
const http = require('node:http'); // Módulo HTTP para crear el servidor
const { URL } = require('node:url'); // Utilidad para parsear URL y query params
// const https = require('node:https'); // Módulo HTTPS para descargar imágenes
const fs = require('node:fs'); // Módulo de sistema de archivos (streams)
const fsp = require('node:fs/promises'); // Módulo de sistema de archivos (promesas)
const path = require('node:path'); // Módulo de rutas para manejar rutas de archivos

// === CONFIGURACIÓN DEL SERVIDOR ===
const PORT = 3000; // Puerto donde correrá el servidor

const RUTA_PRODUCTOS = path.join(__dirname, 'resources', 'productos.txt'); // Ruta al archivo de productos
// const RUTA_IMAGENES = path.join(__dirname, 'docs', 'assets', 'img'); // Carpeta local de imágenes

// === FUNCIONALIDAD EXTRA: descarga de imagenes web ===
// Guarda una imagen relacionada al producto en docs/assets/img
// Fuente: Pollinations (AI, sin clave)
// async function guardarImagenProducto(nombreProducto) {
//     const nombreSeguro = String(nombreProducto || '')
//         .trim()
//         .toLowerCase()
//         .replace(/\s+/g, '_')
//         .replace(/[^a-z0-9_\-]/g, '');
//
//     if (!nombreSeguro) {
//         return;
//     }
//
//     const archivoDestino = path.join(RUTA_IMAGENES, `${nombreSeguro}.jpg`);
//
//     try {
//         await fsp.access(archivoDestino);
//         return; // Si ya existe, no descargamos de nuevo
//     } catch (error) {
//         // Continuamos si no existe
//     }
//
//     const prompt = `product photo of ${nombreProducto}, ecommerce, studio lighting`;
//     const urlPollinations = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=400`;
//     const urlFallback = 'https://picsum.photos/600/400';
//
//     await fsp.mkdir(RUTA_IMAGENES, { recursive: true });
//
//     await new Promise((resolve, reject) => {
//         const descargar = (url, onFail) => {
//             const archivo = fs.createWriteStream(archivoDestino);
//             https.get(url, response => {
//                 if (response.statusCode !== 200) {
//                     archivo.close();
//                     if (onFail) {
//                         onFail(new Error(`Respuesta no exitosa: ${response.statusCode}`));
//                         return;
//                     }
//                     reject(new Error(`Respuesta no exitosa: ${response.statusCode}`));
//                     return;
//                 }
//                 response.pipe(archivo);
//                 archivo.on('finish', () => {
//                     archivo.close(resolve);
//                 });
//             }).on('error', error => {
//                 archivo.close();
//                 if (onFail) {
//                     onFail(error);
//                     return;
//                 }
//                 reject(error);
//             });
//         };
//
//         descargar(urlPollinations, () => descargar(urlFallback));
//     });
// }

// === CREACIÓN DEL SERVIDOR HTTP ===
// Crear el servidor HTTP
const server = http.createServer(async (req, res) => { // Manejar solicitudes entrantes
    // CORS: permite solicitudes desde el cliente (archivo local o servidor distinto)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        // Preflight CORS
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'GET') { // === MANEJO DE PETICIONES GET (LISTAR PRODUCTOS) ===
        try {
            const productosArchivo = await fsp.readFile(RUTA_PRODUCTOS, 'utf-8');
            const lineasProductos = productosArchivo.split('\n'); // Dividir el contenido en líneas
            const productos = lineasProductos
                .map(linea => linea.trim())
                .filter(linea => linea.length > 0)
                .map(linea => {
                    const partes = linea.split(','); // Suponiendo que los campos están separados por comas
                    return { nombre: partes[0].trim(), precio: Number(partes[1]) };
                });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(productos)); // Enviar la respuesta con los productos en formato JSON

        } catch (error) {
            console.error('Error al leer productos:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error interno del servidor' }));
        }

    } else if (req.method === 'POST') {
        // === MANEJO DE PETICIONES POST (AGREGAR PRODUCTO) ===
        let body = ''; // Variable para almacenar los datos entrantes
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', async () => { // Cuando se reciben todos los datos
            try {
                const producto = JSON.parse(body); // Parsear el cuerpo de la solicitud
                if (!producto.nombre || producto.precio === undefined || producto.precio === null || producto.precio === '') {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Nombre y precio son requeridos' }));
                    return;
                }
                try {
                    const productosArchivo = await fsp.readFile(RUTA_PRODUCTOS, 'utf-8');
                    const lineasProductos = productosArchivo.split('\n');
                    const productosExistentes = lineasProductos
                        .map(linea => linea.trim())
                        .filter(linea => linea.length > 0)
                        .map(linea => {
                            const partes = linea.split(',');
                            return { nombre: partes[0].trim(), precio: Number(partes[1]) };
                        });

                    const nombreNormalizado = String(producto.nombre).trim().toLowerCase();
                    const precioNormalizado = Number(producto.precio);
                    const duplicado = productosExistentes.some(item => (
                        item.nombre.toLowerCase() === nombreNormalizado && item.precio === precioNormalizado
                    ));

                    if (duplicado) {
                        res.writeHead(409, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Producto duplicado (mismo nombre y precio)' }));
                        return;
                    }

                    const nuevaLinea = `${producto.nombre}, ${producto.precio}\n`;
                    await fsp.appendFile(RUTA_PRODUCTOS, nuevaLinea);
                    // Bloque de descarga de imagenes deshabilitado temporalmente.
                    // try {
                    //     await guardarImagenProducto(producto.nombre);
                    // } catch (error) {
                    //     console.error('No se pudo descargar imagen:', error);
                    // }
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Producto agregado correctamente' }));
                } catch (error) {
                    console.error('Error al guardar producto:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Error al guardar el producto' }));
                }
            } catch (error) {
                console.error('JSON inválido en POST:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'JSON inválido' }));
            }
        });

    } else if (req.method === 'DELETE') {
        // === MANEJO DE PETICIONES DELETE (ELIMINAR PRODUCTO) ===
        const url = new URL(req.url, `http://${req.headers.host}`);
        const nombre = url.searchParams.get('nombre');
        const precioTexto = url.searchParams.get('precio');
        const precio = Number(precioTexto);

        if (!nombre || Number.isNaN(precio)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Nombre y precio son requeridos para eliminar' }));
            return;
        }

        try {
            const productosArchivo = await fsp.readFile(RUTA_PRODUCTOS, 'utf-8');
            const lineasProductos = productosArchivo.split('\n');
            const productos = lineasProductos
                .map(linea => linea.trim())
                .filter(linea => linea.length > 0)
                .map(linea => {
                    const partes = linea.split(',');
                    return { nombre: partes[0].trim(), precio: Number(partes[1]) };
                });

            const nombreNormalizado = nombre.trim().toLowerCase();
            const productosFiltrados = productos.filter(item => (
                !(item.nombre.toLowerCase() === nombreNormalizado && item.precio === precio)
            ));

            if (productosFiltrados.length === productos.length) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Producto no encontrado' }));
                return;
            }

            const contenido = productosFiltrados
                .map(item => `${item.nombre}, ${item.precio}`)
                .join('\n');
            const contenidoFinal = contenido.length > 0 ? `${contenido}\n` : '';

            await fsp.writeFile(RUTA_PRODUCTOS, contenidoFinal, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Producto eliminado correctamente' }));
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error al eliminar el producto' }));
        }
    } else {
        // === MANEJO DE MÉTODOS NO PERMITIDOS ===
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Método no permitido' }));
    }

});

// === INICIAR SERVIDOR ===
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
