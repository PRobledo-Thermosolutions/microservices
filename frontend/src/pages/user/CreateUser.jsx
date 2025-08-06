import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../services/user";
import "../../styles/user/CreateUser.css";

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
        <div className="createuser-container">
            <form onSubmit={handleSubmit} className="createuser-form">
                <button
                    type="button"
                    onClick={() => navigate("/users")}
                    className="back-button"
                >
                    Volver a la lista
                </button>

                <h2 className="createuser-title">Crear Usuario</h2>

                <label className="form-label">Email</label>
                <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <label className="form-label">Username</label>
                <input
                    type="text"
                    name="username"
                    className="form-input"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />

                <label className="form-label">Contraseña</label>
                <input
                    type="password"
                    name="password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <button type="submit" className="submit-button">
                    Crear
                </button>
            </form>
        </div>
    );
};

export default CreateUser;
