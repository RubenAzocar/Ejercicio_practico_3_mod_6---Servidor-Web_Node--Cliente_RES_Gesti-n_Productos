# 🛒 Gestión de Productos

API REST con servidor Node.js y cliente web para listar, ordenar y registrar productos.

## 📋 Descripción

Sistema fullstack que permite gestionar un catálogo de productos tecnológicos con funcionalidades de ordenamiento, alta y eliminación mediante API JSON.

## 🛠️ Tecnologías

- **Backend:** Node.js (HTTP nativo + File System)
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Almacenamiento:** Archivo de texto plano

## 📁 Estructura del Proyecto

```
├── server.js             # Servidor HTTP y endpoints API
├── resources/
│   └── productos.txt     # Archivo de datos
└── docs/
    ├── index.html        # Cliente web
    ├── script.js         # Lógica frontend
    ├── styles.css        # Estilos modernos
    └── assets/img/       # Imágenes de productos
```

## 🚀 Uso

```bash
node server.js
```
Abrir en navegador: [docs/index.html](docs/index.html)

## 📡 Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `http://localhost:3000/` | Lista todos los productos |
| POST | `http://localhost:3000/` | Agrega un producto (JSON) |
| DELETE | `http://localhost:3000/?nombre=X&precio=Y` | Elimina producto por nombre y precio |

### Ejemplo POST
```json
{
  "nombre": "Monitor",
  "precio": 300
}
```

## ✨ Características

- ✅ Prevención de productos duplicados (mismo nombre y precio)
- ✅ Ordenamiento por nombre o precio (ascendente/descendente)
- ✅ Validación de entrada con mensajes popup
- ✅ Manejo de CORS para peticiones cross-origin
- ✅ Interfaz moderna con diseño responsivo

## 👨‍💻 Autor

**Rubén** - Módulo 6 | Talento Digital 2026
# Ejercicio_practico_3_mod_6---Servidor-Web_Node--Cliente_RES_Gesti-n_Productos
