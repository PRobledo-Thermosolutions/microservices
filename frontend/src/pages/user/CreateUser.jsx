import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../services/user";
import { useWebSocketContext } from "../../hooks/WebSocketContext"; // Ajusta la ruta
import "../../styles/user/CreateUser.css";

/**
 * Componente CreateUser con funcionalidad WebSocket integrada de forma invisible.
 * Mantiene el diseño original pero agrega capacidades de tiempo real.
 */
const CreateUser = () => {
    const navigate = useNavigate();

    // WebSocket context para eventos en tiempo real (sin modificar UI)
    const { unprocessedEvents, markEventAsProcessed } = useWebSocketContext();

    // Estado original sin modificaciones
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        is_active: true,
    });

    // Estado para rastrear si estamos esperando confirmación WebSocket
    const [awaitingWebSocketConfirmation, setAwaitingWebSocketConfirmation] = useState(false);

    /**
     * Escucha eventos WebSocket de manera silenciosa
     */
    useEffect(() => {
        if (awaitingWebSocketConfirmation) {
            // Buscar evento de usuario creado que coincida con nuestros datos
            const matchingEvent = unprocessedEvents.find(event =>
                event.event === 'user_created' &&
                event.user?.username === formData.username
            );

            if (matchingEvent) {
                // Marcar evento como procesado
                markEventAsProcessed(matchingEvent.id);
                setAwaitingWebSocketConfirmation(false);

                // Mostrar mensaje de éxito original y navegar
                alert("Usuario creado exitosamente");
                navigate("/users");
            }
        }
    }, [unprocessedEvents, formData.username, awaitingWebSocketConfirmation, markEventAsProcessed, navigate]);

    /**
     * Maneja cambios en el formulario - sin modificaciones
     */
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    /**
     * Maneja el envío del formulario con funcionalidad WebSocket opcional
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await createUser(formData);

            // Intentar esperar confirmación WebSocket por 3 segundos
            setAwaitingWebSocketConfirmation(true);

            // Fallback: si no llega confirmación WebSocket en 3 segundos, proceder normalmente
            setTimeout(() => {
                if (awaitingWebSocketConfirmation) {
                    setAwaitingWebSocketConfirmation(false);
                    alert("Usuario creado exitosamente");
                    navigate("/users");
                }
            }, 3000);

        } catch (error) {
            setAwaitingWebSocketConfirmation(false);
            alert("Error: " + error.message);
        }
    };

    // Render original sin modificaciones visuales
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