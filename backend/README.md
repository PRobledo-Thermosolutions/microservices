# API de Gestión de Usuarios

Esta API proporciona endpoints para la gestión completa de usuarios, incluyendo operaciones CRUD (Crear, Leer, Actualizar, Eliminar) y autenticación.

## Base URL
```
http://localhost:8000
```

## Instalar dependencias
```
pip install fastapi uvicorn
```

## Dentro del proyecto backend, iniciar la API
```
python -m uvicorn main:app --reload
```

## Modelos de Datos

### UserModel
```json
{
  "email": "string (opcional)",
  "username": "string (opcional)", 
  "password": "string (opcional)",
  "is_active": "boolean (opcional)"
}
```

### LoginModel
```json
{
  "username": "string (opcional)",
  "password": "string (opcional)"
}
```

## Endpoints

### 1. Crear Usuario
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

### 2. Obtener Usuario
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

### 3. Actualizar Usuario
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

### 4. Eliminar Usuario
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

### 5. Iniciar Sesión
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

## Códigos de Error Comunes

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 204 | No Content - Operación exitosa sin contenido de respuesta |
| 401 | Unauthorized - Credenciales incorrectas |
| 404 | Not Found - Recurso no encontrado |
| 422 | Unprocessable Entity - Error de validación de datos |

## Notas de Seguridad

- Las contraseñas se encriptan usando bcrypt antes de almacenarse
- La API valida las credenciales comparando la contraseña hasheada
- Todos los campos en los modelos son opcionales para mayor flexibilidad
- Se recomienda usar HTTPS en producción para proteger las credenciales

## Dependencias

- **FastAPI**: Framework web para crear la API
- **SQLAlchemy**: ORM para manejo de base de datos
- **Pydantic**: Validación y serialización de datos
- **bcrypt**: Encriptación de contraseñas