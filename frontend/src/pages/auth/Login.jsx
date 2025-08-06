import React, { useState } from "react";
// Importa la función login que realiza la autenticación en el backend
import { login } from "../../services/auth";
// Importa estilos CSS específicos para esta pantalla
import "../../styles/auth/Login.css";

/**
 * Componente funcional de Login.
 * Permite a los usuarios ingresar sus credenciales y autenticarse.
 */
const Login = () => {
  // Estado para almacenar el nombre de usuario ingresado
  const [username, setUsername] = useState("");
  // Estado para almacenar la contraseña ingresada
  const [password, setPassword] = useState("");

  /**
   * Función que se ejecuta al enviar el formulario de login.
   * - Previene el comportamiento por defecto del formulario.
   * - Llama a la función login con las credenciales ingresadas.
   * - Si es exitoso, guarda el token en localStorage y recarga la página.
   * - Si falla, muestra una alerta con mensaje de error.
   *
   * @param {React.FormEvent} e - Evento de envío del formulario.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await login(username, password);
      localStorage.setItem("token", token);
      // Recarga la página para actualizar el estado de autenticación global
      window.location.reload();
    } catch (err) {
      alert("Credenciales inválidas");
    }
  };

  return (
    <div className="login-container">
      {/* Formulario de login */}
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Log in</h2>

        {/* Input para nombre de usuario */}
        <input
          type="text"
          placeholder="Username"
          className="login-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Input para contraseña */}
        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Botón para enviar el formulario */}
        <button type="submit" className="login-button">
          Log in
        </button>
      </form>
    </div>
  );
};

export default Login;
