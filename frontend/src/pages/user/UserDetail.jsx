import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, updateUser, deleteUser } from "../../services/user";
import "../../styles/user/UserDetail.css";

/**
 * Componente que muestra el detalle y formulario para editar un usuario específico.
 * Permite actualizar o eliminar al usuario.
 */
const UserDetail = () => {
  const navigate = useNavigate();
  // Obtiene el parámetro `id` de la URL para identificar el usuario
  const { id } = useParams();

  // Estado para almacenar los datos completos del usuario
  const [user, setUser] = useState(null);

  // Estado para manejar el formulario con campos editables
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    is_active: true,
  });

  // Efecto para cargar los datos del usuario cuando cambia el ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Solicita los datos del usuario al backend
        const data = await getUserById(id);
        setUser(data);
        // Inicializa el formulario con los datos recibidos, dejando contraseña vacía
        setForm({ ...data, password: "" });
      } catch (err) {
        alert(err.message);
      }
    };
    fetchUser();
  }, [id]);

  /**
   * Manejador para actualizar el estado del formulario según los inputs cambien.
   * Soporta inputs tipo texto y checkbox.
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * Función para enviar los cambios al backend y actualizar el usuario.
   */
  const handleUpdate = async () => {
    try {
      await updateUser(id, form);
      alert("Usuario actualizado correctamente");
    } catch (err) {
      alert(err.message);
    }
  };

  /**
   * Función para eliminar el usuario después de confirmar con el usuario.
   * Navega a la lista de usuarios luego de eliminar.
   */
  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await deleteUser(id);
      navigate("/users");
    } catch (err) {
      alert(err.message);
    }
  };

  // Muestra un mensaje mientras se cargan los datos
  if (!user) return <div className="detail-loading">Cargando...</div>;

  return (
    <div className="detail-container">
      <div className="detail-card">
        {/* Botón para volver a la lista de usuarios */}
        <button
          type="button"
          onClick={() => navigate("/users")}
          className="back-button"
        >
          Volver a la lista
        </button>

        <h2 className="detail-title">Editar Usuario</h2>

        {/* Campo Email */}
        <label className="form-label">
          Email
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="form-input"
          />
        </label>

        {/* Campo Username */}
        <label className="form-label">
          Username
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="form-input"
          />
        </label>

        {/* Campo Contraseña */}
        <label className="form-label">
          Contraseña
          <input
            name="password"
            type="password"
            placeholder="(dejar en blanco para no cambiar)"
            value={form.password}
            onChange={handleChange}
            className="form-input"
          />
        </label>

        {/* Botones para guardar o eliminar */}
        <div className="button-group">
          <button onClick={handleUpdate} className="btn-primary">
            Guardar cambios
          </button>
          <button onClick={handleDelete} className="btn-danger">
            Eliminar usuario
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
