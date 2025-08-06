import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../services/user";

const CreateUser = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        is_active: true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await createUser(formData);

            alert("Usuario creado exitosamente");
            navigate("/users");
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-blue-100 flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-bold text-center mb-6">Crear Usuario</h2>

                <label className="block mb-2 font-medium">Email</label>
                <input
                    type="email"
                    name="email"
                    className="w-full px-3 py-2 mb-4 border rounded"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <label className="block mb-2 font-medium">Username</label>
                <input
                    type="text"
                    name="username"
                    className="w-full px-3 py-2 mb-4 border rounded"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />

                <label className="block mb-2 font-medium">Contraseña</label>
                <input
                    type="password"
                    name="password"
                    className="w-full px-3 py-2 mb-4 border rounded"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Crear
                </button>
            </form>
        </div>
    );
};

export default CreateUser;
