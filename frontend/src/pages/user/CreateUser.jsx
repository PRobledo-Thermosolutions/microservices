import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../services/user";
import "../../styles/user/CreateUser.css";

/**
 * Componente para crear un nuevo usuario.
 * Contiene un formulario controlado para ingresar email, username y contraseña.
 * Al enviarlo, llama al servicio para crear el usuario y navega a la lista.
 */
const CreateUser = () => {
    const navigate = useNavigate();

    // Estado para manejar los datos del formulario
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        is_active: true, // activo por defecto (aunque no se edita en formulario)
    });

    /**
     * Actualiza el estado del formulario cuando cambian los inputs.
     * Soporta inputs tipo texto, email y checkbox (aunque no hay checkbox aquí).
     */
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    /**
     * Maneja el envío del formulario.
     * Previene el envío por defecto, intenta crear el usuario con los datos.
     * Si es exitoso, muestra alerta y navega a la lista.
     * Si falla, muestra alerta con el error.
     */
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
                {/* Botón para volver a la lista de usuarios */}
                <button
                    type="button"
                    onClick={() => navigate("/users")}
                    className="back-button"
                >
                    Volver a la lista
                </button>

                <h2 className="createuser-title">Crear Usuario</h2>

                {/* Campo email */}
                <label className="form-label">Email</label>
                <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                {/* Campo username */}
                <label className="form-label">Username</label>
                <input
                    type="text"
                    name="username"
                    className="form-input"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />

                {/* Campo contraseña */}
                <label className="form-label">Contraseña</label>
                <input
                    type="password"
                    name="password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                {/* Botón para enviar el formulario */}
                <button type="submit" className="submit-button">
                    Crear
                </button>
            </form>
        </div>
    );
};

export default CreateUser;
