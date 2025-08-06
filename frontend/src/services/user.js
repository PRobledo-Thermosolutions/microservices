// Se importa la configuración base de rutas de la API
import Path from "../config";

/**
 * Obtiene todos los usuarios desde la API.
 *
 * @returns {Promise<Array>} - Lista de usuarios si la solicitud es exitosa.
 */
export const getAllUsers = async () => {
  try {
    // Se obtiene el token de autenticación del localStorage
    const token = localStorage.getItem("token");

    // Se realiza una solicitud GET al endpoint /users con el token
    const response = await fetch(`${Path.API_BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Si la respuesta no es exitosa, se lanza un error
    if (!response.ok) throw new Error("Error al obtener usuarios");

    // Se convierte la respuesta en JSON y se retorna
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    alert("No se pudieron cargar los usuarios.");
  }
};

/**
 * Obtiene los datos de un usuario por su ID.
 *
 * @param {string|number} userId - ID del usuario a buscar.
 * @returns {Promise<Object>} - Objeto con los datos del usuario.
 */
export const getUserById = async (userId) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${Path.API_BASE_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("No se pudo obtener el usuario");

    const data = await res.json();
    return data;
  } catch (error) {
    alert(error.message);
  }
};

/**
 * Crea un nuevo usuario en la base de datos.
 *
 * @param {Object} formData - Datos del formulario para crear el usuario.
 * @returns {Promise<Object>} - Objeto del nuevo usuario creado.
 */
export const createUser = async (formData) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${Path.API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) throw new Error("No se pudo crear el usuario");

    const data = await response.json();
    return data;
  } catch (error) {
    alert(error.message);
  }
};

/**
 * Actualiza los datos de un usuario existente.
 *
 * @param {string|number} id - ID del usuario a actualizar.
 * @param {Object} form - Objeto con los nuevos datos del usuario.
 */
export const updateUser = async (id, form) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${Path.API_BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) throw new Error("No se pudo actualizar el usuario");

    alert("Usuario actualizado correctamente");
  } catch (err) {
    alert(err.message);
  }
};

/**
 * Elimina un usuario de la base de datos.
 *
 * @param {string|number} id - ID del usuario a eliminar.
 */
export const deleteUser = async (id) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${Path.API_BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("No se pudo eliminar el usuario");

    alert("Usuario eliminado correctamente");
  } catch (err) {
    alert(err.message);
  }
};
