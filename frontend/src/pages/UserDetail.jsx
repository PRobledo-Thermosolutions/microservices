import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, updateUser } from "../services/user";

const UserDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ email: "", username: "", password: "", is_active: true });

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
      updateUser(id, form);
      alert("Usuario actualizado correctamente");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("No se pudo eliminar el usuario");
      alert("Usuario eliminado");
      navigate("/welcome");
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user) return <div className="p-8">Cargando...</div>;

  return (
    <div className="min-h-screen bg-blue-100 p-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">Editar Usuario</h2>
        <label className="block mb-2">
          Email:
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
          />
        </label>
        <label className="block mb-2">
          Username:
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
          />
        </label>
        <label className="block mb-2">
          Contraseña:
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="(dejar en blanco para no cambiar)"
            className="w-full mt-1 p-2 border rounded"
          />
        </label>
        <label className="block mb-4">
          <input
            name="is_active"
            type="checkbox"
            checked={form.is_active}
            onChange={handleChange}
            className="mr-2"
          />
          Usuario activo
        </label>

        <div className="flex justify-between">
          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Guardar cambios
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Eliminar usuario
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
