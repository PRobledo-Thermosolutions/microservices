// Configuración de la API
const Path = {
  API_BASE_URL: 'http://localhost:8000' // Ajusta según tu configuración
};

/**
 * Obtiene el token de autorización desde localStorage
 * @returns {string|null} Token JWT o null si no existe
 */
const getAuthToken = () => {
  return localStorage.getItem("token");
};

/**
 * Headers comunes para las peticiones HTTP
 * @returns {Object} Headers con autorización y content-type
 */
const getHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

/**
 * Maneja errores de respuesta HTTP
 * @param {Response} response - Respuesta HTTP
 * @returns {Promise<Response>} Respuesta si es exitosa
 * @throws {Error} Error con mensaje descriptivo
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (parseError) {
      // Si no se puede parsear el JSON, usar mensaje por defecto
      console.warn('No se pudo parsear la respuesta de error:', parseError);
    }
    
    throw new Error(errorMessage);
  }
  
  return response;
};

/**
 * Crea un nuevo usuario en el sistema
 * @param {Object} formData - Datos del usuario a crear
 * @param {string} formData.email - Email del usuario
 * @param {string} formData.username - Nombre de usuario
 * @param {string} formData.password - Contraseña del usuario
 * @param {boolean} formData.is_active - Estado activo del usuario
 * @returns {Promise<Object>} Datos del usuario creado
 * @throws {Error} Error si la creación falla
 */
export const createUser = async (formData) => {
  try {
    console.log('Enviando petición para crear usuario:', { ...formData, password: '[HIDDEN]' });
    
    const response = await fetch(`${Path.API_BASE_URL}/users`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(formData),
    });

    await handleResponse(response);
    const data = await response.json();
    
    console.log('Usuario creado exitosamente:', data);
    return data;
    
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error; // Re-lanza el error para que el componente lo maneje
  }
};

/**
 * Obtiene la lista de todos los usuarios
 * @returns {Promise<Array>} Array con todos los usuarios
 * @throws {Error} Error si la consulta falla
 */
export const getUsers = async () => {
  try {
    console.log('Obteniendo lista de usuarios...');
    
    const response = await fetch(`${Path.API_BASE_URL}/users`, {
      method: "GET",
      headers: getHeaders(),
    });

    await handleResponse(response);
    const data = await response.json();
    
    console.log(`Se obtuvieron ${data.length} usuarios`);
    return data;
    
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

/**
 * Obtiene un usuario específico por ID
 * @param {number|string} userId - ID del usuario
 * @returns {Promise<Object>} Datos del usuario
 * @throws {Error} Error si la consulta falla
 */
export const getUserById = async (userId) => {
  try {
    console.log(`Obteniendo usuario con ID: ${userId}`);
    
    const response = await fetch(`${Path.API_BASE_URL}/users/${userId}`, {
      method: "GET",
      headers: getHeaders(),
    });

    await handleResponse(response);
    const data = await response.json();
    
    console.log('Usuario obtenido:', data);
    return data;
    
  } catch (error) {
    console.error(`Error al obtener usuario ${userId}:`, error);
    throw error;
  }
};

/**
 * Actualiza un usuario existente
 * @param {number|string} userId - ID del usuario a actualizar
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Datos del usuario actualizado
 * @throws {Error} Error si la actualización falla
 */
export const updateUser = async (userId, updateData) => {
  try {
    console.log(`Actualizando usuario ${userId}:`, updateData);
    
    const response = await fetch(`${Path.API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });

    await handleResponse(response);
    const data = await response.json();
    
    console.log('Usuario actualizado exitosamente:', data);
    return data;
    
  } catch (error) {
    console.error(`Error al actualizar usuario ${userId}:`, error);
    throw error;
  }
};

/**
 * Elimina un usuario del sistema
 * @param {number|string} userId - ID del usuario a eliminar
 * @returns {Promise<Object>} Mensaje de confirmación
 * @throws {Error} Error si la eliminación falla
 */
export const deleteUser = async (userId) => {
  try {
    console.log(`Eliminando usuario con ID: ${userId}`);
    
    const response = await fetch(`${Path.API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    await handleResponse(response);
    
    // Algunas APIs retornan datos, otras solo status 204
    let data = { message: 'Usuario eliminado exitosamente' };
    try {
      data = await response.json();
    } catch (parseError) {
      // No problem si no hay contenido JSON
    }
    
    console.log('Usuario eliminado exitosamente');
    return data;
    
  } catch (error) {
    console.error(`Error al eliminar usuario ${userId}:`, error);
    throw error;
  }
};

/**
 * Verifica el estado de la API
 * @returns {Promise<Object>} Estado de la API
 * @throws {Error} Error si la API no responde
 */
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${Path.API_BASE_URL}/health`, {
      method: "GET",
    });

    await handleResponse(response);
    const data = await response.json();
    
    console.log('Estado de la API:', data);
    return data;
    
  } catch (error) {
    console.error('Error al verificar estado de la API:', error);
    throw error;
  }
};

/**
 * Utilidades para manejo de errores
 */
export const UserServiceErrors = {
  UNAUTHORIZED: 'No autorizado - Token inválido o expirado',
  FORBIDDEN: 'Prohibido - Sin permisos suficientes',
  NOT_FOUND: 'Usuario no encontrado',
  CONFLICT: 'Conflicto - El usuario ya existe',
  VALIDATION_ERROR: 'Error de validación en los datos',
  NETWORK_ERROR: 'Error de conexión con el servidor'
};

/**
 * Helper para determinar el tipo de error
 * @param {Error} error - Error capturado
 * @returns {string} Tipo de error clasificado
 */
export const classifyError = (error) => {
  const message = error.message.toLowerCase();
  
  if (message.includes('401') || message.includes('unauthorized')) {
    return UserServiceErrors.UNAUTHORIZED;
  }
  if (message.includes('403') || message.includes('forbidden')) {
    return UserServiceErrors.FORBIDDEN;
  }
  if (message.includes('404') || message.includes('not found')) {
    return UserServiceErrors.NOT_FOUND;
  }
  if (message.includes('409') || message.includes('conflict')) {
    return UserServiceErrors.CONFLICT;
  }
  if (message.includes('400') || message.includes('validation')) {
    return UserServiceErrors.VALIDATION_ERROR;
  }
  if (message.includes('network') || message.includes('fetch')) {
    return UserServiceErrors.NETWORK_ERROR;
  }
  
  return error.message;
};