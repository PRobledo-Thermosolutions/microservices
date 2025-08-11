// Configuración donde se define la URL base de la API
import Path from "../config";

/**
 * Realiza la solicitud de login al backend para obtener un token de acceso.
 *
 * @param {string} username - Nombre de usuario del formulario de login.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<string>} - Retorna el token de acceso si el login es exitoso.
 * @throws {Error} - Lanza un error si ocurre algún problema durante la solicitud.
 */
export const login = async (username, password) => {
  try {
    // Se realiza una solicitud POST al endpoint /login del backend
    const response = await fetch(`${Path.AUTH_API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        // Se indica que los datos se enviarán como formulario (x-www-form-urlencoded)
        "Content-Type": "application/x-www-form-urlencoded",
      },
      // Se construye el cuerpo de la solicitud con los parámetros username y password
      body: new URLSearchParams({
        username,
        password,
      }),
    });

    // Si la respuesta no es exitosa (status diferente de 200), se lanza un error
    if (!response.ok) {
      throw new Error("Login failed");
    }

    // Se parsea la respuesta como JSON y se extrae el token de acceso
    const data = await response.json();
    return data.access_token;

  } catch (error) {
    // Si ocurre un error (red, servidor, etc.), se muestra en consola y se propaga
    console.error("Error during login:", error);
    throw error;
  }
};
