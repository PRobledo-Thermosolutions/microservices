# React User Management App

Esta es una aplicación frontend hecha con **React** que permite gestionar usuarios: login, listado con búsqueda y paginación, creación, edición, eliminación y actualización en tiempo real vía WebSocket.

---

## Tecnologías y librerías usadas

* React con Create React App
* React Router DOM para navegación
* Fetch API para comunicación con backend REST
* WebSocket para eventos en tiempo real (usuarios creados)
* react-hot-toast para notificaciones
* CSS modularizado para estilos
* Variables de entorno para configuración de URLs
* LocalStorage para manejo simple de token JWT

---

## Características principales

* **Login y autenticación** con token JWT guardado en localStorage
* **Protección de rutas** con redirección si no hay token
* **Listado de usuarios** con búsqueda por ID, email, username o estado
* **Paginación** manual para manejar grandes listados
* **WebSocket** para recibir notificaciones en tiempo real de nuevos usuarios creados
* **CRUD de usuarios:** crear, ver detalle, actualizar y eliminar
* **Navegación entre pantallas** usando React Router

---

## Configuración

### Variables de entorno

Crear un archivo `.env` en la raíz con:

```
REACT_APP_PATH_TO_API=http://localhost:8000
REACT_APP_WS_PATH_TO_API=ws://localhost:8000/ws
```

Ajusta las URLs según tu backend.

---
## Instalar dependencias
En el directorio del proyecto frontend, ejecuta:

### `npm install`

## Scripts disponibles

En el directorio del proyecto frontend, ejecuta:

### `npm run start`

Ejecuta la app en modo desarrollo.
Abre [http://localhost:3000](http://localhost:3000) para verla.

### `npm run build`

Genera una versión optimizada para producción en la carpeta `build`.

---

## Estructura principal

* `/src/pages/auth/Login.jsx`
  Pantalla de login con formulario y manejo de token.

* `/src/pages/user/UserList.jsx`
  Listado de usuarios con búsqueda, paginación y actualización en tiempo real.

* `/src/pages/user/UserDetail.jsx`
  Detalle y edición de un usuario seleccionado.

* `/src/pages/user/CreateUser.jsx`
  Formulario para crear un nuevo usuario.

* `/src/services/auth.js` y `/src/services/user.js`
  Funciones para llamar al backend y realizar acciones de login y gestión de usuarios.

* `/src/hooks/useWebSocket.js`
  Hook personalizado para conexión WebSocket y manejo de mensajes.

* `/src/config.js`
  Configuración centralizada para URLs base (API y WebSocket) cargadas desde `.env`.

---

## Uso básico

1. Iniciar backend y asegurarse que esté corriendo en la URL configurada.
2. Ejecutar la app con `npm run start`.
3. Ingresar con credenciales válidas en el login.
4. Navegar y administrar usuarios desde la interfaz.
