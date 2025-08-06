# Microservicios FastAPI y React

## Link de Video
https://drive.google.com/file/d/1VXTa0PwrXAKok2Wb_rtmaFypSmumANuE/view?usp=sharing

## React User Management App

Esta es una aplicación frontend hecha con **React** que permite gestionar usuarios: login, listado con búsqueda y paginación, creación, edición, eliminación y actualización en tiempo real vía WebSocket.

---

### Tecnologías y librerías usadas

* React con Create React App
* React Router DOM para navegación
* Fetch API para comunicación con backend REST
* WebSocket para eventos en tiempo real (usuarios creados)
* react-hot-toast para notificaciones
* CSS modularizado para estilos
* Variables de entorno para configuración de URLs
* LocalStorage para manejo simple de token JWT

---

### Características principales

* **Login y autenticación** con token JWT guardado en localStorage
* **Protección de rutas** con redirección si no hay token
* **Listado de usuarios** con búsqueda por ID, email, username o estado
* **Paginación** manual para manejar grandes listados
* **WebSocket** para recibir notificaciones en tiempo real de nuevos usuarios creados
* **CRUD de usuarios:** crear, ver detalle, actualizar y eliminar
* **Navegación entre pantallas** usando React Router

---

### Configuración

#### Variables de entorno

Crear un archivo `.env` en la raíz con:

```
REACT_APP_PATH_TO_API=http://localhost:8000
REACT_APP_WS_PATH_TO_API=ws://localhost:8000/ws
```

Ajusta las URLs según tu backend.

---
#### Instalar dependencias dentro de /frontend
En el directorio del proyecto frontend, ejecuta:
```
npm install
```

#### Scripts disponibles dentro de /frontend

En el directorio del proyecto frontend, ejecuta:

#### `npm run start`

Ejecuta la app en modo desarrollo.
Abre [http://localhost:3000](http://localhost:3000) para verla.
```
npm run build
```

Genera una versión optimizada para producción en la carpeta `build`.

---

### Estructura principal

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

### Uso básico

1. Iniciar backend y asegurarse que esté corriendo en la URL configurada.
2. Ejecutar la app con `npm run start`.
3. Ingresar con credenciales válidas en el login.
4. Navegar y administrar usuarios desde la interfaz.

## API de Gestión de Usuarios

Esta API proporciona endpoints para la gestión completa de usuarios, incluyendo operaciones CRUD (Crear, Leer, Actualizar, Eliminar) y autenticación.

### Base URL
```
http://localhost:8000
```

### Instalar dependencias dentro de /backend
```
pip install fastapi uvicorn
```

### Iniciar la API dentro de /backend
```
python -m uvicorn main:app --reload
```

### Modelos de Datos

#### UserModel
```json
{
  "email": "string (opcional)",
  "username": "string (opcional)", 
  "password": "string (opcional)",
  "is_active": "boolean (opcional)"
}
```

#### LoginModel
```json
{
  "username": "string (opcional)",
  "password": "string (opcional)"
}
```

### Endpoints

#### 1. Crear Usuario
**POST** `/users`

Crea un nuevo usuario en el sistema. La contraseña se encripta automáticamente antes de almacenarla.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "username": "nombreusuario",
  "password": "contraseña123",
  "is_active": true
}
```

**Respuestas:**
- **201 Created**: Usuario creado exitosamente
- **422 Unprocessable Entity**: Error de validación en los datos

**Ejemplo de uso:**
```bash
curl -X POST "http://localhost:8000/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@ejemplo.com",
    "username": "juan123",
    "password": "micontraseña",
    "is_active": true
  }'
```

---

#### 2. Obtener Usuario
**GET** `/users/{user_id}`

Obtiene la información de un usuario específico por su ID.

**Parámetros de Ruta:**
- `user_id` (int): ID único del usuario

**Respuestas:**
- **200 OK**: Usuario encontrado
- **404 Not Found**: Usuario no encontrado

**Ejemplo de Respuesta (200):**
```json
{
  "id": 1,
  "email": "juan@ejemplo.com",
  "username": "juan123",
  "password": "$2b$12$...", 
  "is_active": true
}
```

**Ejemplo de uso:**
```bash
curl -X GET "http://localhost:8000/users/1"
```

---

#### 3. Actualizar Usuario
**PUT** `/users/{user_id}`

Actualiza la información de un usuario existente. Solo se actualizan los campos proporcionados. Las contraseñas se encriptan automáticamente.

**Parámetros de Ruta:**
- `user_id` (int): ID único del usuario

**Request Body:**
```json
{
  "email": "nuevoemail@ejemplo.com",
  "username": "nuevonombre", 
  "password": "nuevacontraseña",
  "is_active": false
}
```

**Respuestas:**
- **200 OK**: Usuario actualizado exitosamente
- **404 Not Found**: Usuario no encontrado
- **422 Unprocessable Entity**: Error de validación

**Ejemplo de Respuesta (200):**
```json
{
  "id": 1,
  "email": "nuevoemail@ejemplo.com",
  "username": "nuevonombre",
  "password": "$2b$12$...",
  "is_active": false
}
```

**Ejemplo de uso:**
```bash
curl -X PUT "http://localhost:8000/users/1" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.nuevo@ejemplo.com",
    "is_active": false
  }'
```

---

#### 4. Eliminar Usuario
**DELETE** `/users/{user_id}`

Elimina permanentemente un usuario del sistema.

**Parámetros de Ruta:**
- `user_id` (int): ID único del usuario

**Respuestas:**
- **204 No Content**: Usuario eliminado exitosamente
- **404 Not Found**: Usuario no encontrado

**Ejemplo de uso:**
```bash
curl -X DELETE "http://localhost:8000/users/1"
```

---

#### 5. Iniciar Sesión
**POST** `/login`

Autentica un usuario con sus credenciales y devuelve información básica del usuario.

**Request Body:**
```json
{
  "username": "nombreusuario",
  "password": "contraseña"
}
```

**Respuestas:**
- **200 OK**: Autenticación exitosa
- **401 Unauthorized**: Credenciales incorrectas
- **404 Not Found**: Usuario no encontrado

**Ejemplo de Respuesta (200):**
```json
{
  "message": "Inicio de sesión exitoso",
  "user_id": 1,
  "username": "juan123",
  "email": "juan@ejemplo.com"
}
```

**Ejemplo de uso:**
```bash
curl -X POST "http://localhost:8000/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan123",
    "password": "micontraseña"
  }'
```

### Códigos de Error Comunes

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 204 | No Content - Operación exitosa sin contenido de respuesta |
| 401 | Unauthorized - Credenciales incorrectas |
| 404 | Not Found - Recurso no encontrado |
| 422 | Unprocessable Entity - Error de validación de datos |

### Notas de Seguridad

- Las contraseñas se encriptan usando bcrypt antes de almacenarse
- La API valida las credenciales comparando la contraseña hasheada
- Todos los campos en los modelos son opcionales para mayor flexibilidad
- Se recomienda usar HTTPS en producción para proteger las credenciales

### Dependencias

- **FastAPI**: Framework web para crear la API
- **SQLAlchemy**: ORM para manejo de base de datos
- **Pydantic**: Validación y serialización de datos
- **bcrypt**: Encriptación de contraseñas
