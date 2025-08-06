import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, updateUser, deleteUser } from "../../services/user";
import "../../styles/UserDetail.css";

const UserDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    is_active: true,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserById(id);
        setUser(data);
        setForm({ ...data, password: "" });
      } catch (err) {
        alert(err.message);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = async () => {
    try {
      await updateUser(id, form);
      alert("Usuario actualizado correctamente");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await deleteUser(id);
      navigate("/users");
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user) return <div className="detail-loading">Cargando...</div>;

  return (
    <div className="detail-container">
      <div className="detail-card">
        <button
          type="button"
          onClick={() => navigate("/users")}
          className="back-button"
        >
          Volver a la lista
        </button>

        <h2 className="detail-title">Editar Usuario</h2>

        <label className="form-label">
          Email
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="form-input"
          />
        </label>

        <label className="form-label">
          Username
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="form-input"
          />
        </label>

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
