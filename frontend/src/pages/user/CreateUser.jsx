import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../services/user";
import { useWebSocketContext } from "../../hooks/WebSocketContext";
import "../../styles/user/CreateUser.css";

/**
 * Componente mejorado para crear un nuevo usuario con integración WebSocket.
 * Muestra el estado de conexión WebSocket y reacciona a eventos en tiempo real.
 */
const CreateUser = () => {
    const navigate = useNavigate();
    
    // Contexto WebSocket para recibir eventos en tiempo real
    const {
        isConnected, 
        userEvents 
    } = useWebSocketContext();

    // Estado para manejar los datos del formulario
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        is_active: true,
    });

    // Estado para manejar el proceso de creación
    const [isCreating, setIsCreating] = useState(false);

    /**
     * Actualiza el estado del formulario cuando cambian los inputs.
     */
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    /**
     * Escucha eventos de creación de usuarios via WebSocket
     */
    useEffect(() => {
        // Buscar el último evento de usuario creado que corresponda al usuario actual
        const latestUserEvent = userEvents.find(event => 
            event.event === 'user_created' && 
            event.user?.username === formData.username &&
            !event.processed
        );

        if (latestUserEvent && isCreating) {
            console.log('Usuario creado detectado via WebSocket:', latestUserEvent);
            setIsCreating(false);
            
            // Marcar el evento como procesado (esto requeriría una modificación al contexto)
            // Por ahora, mostrar éxito y navegar después de un delay
            setTimeout(() => {
                navigate("/users");
            }, 2000);
        }
    }, [userEvents, formData.username, isCreating, navigate]);

    /**
     * Maneja el envío del formulario con integración WebSocket.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isConnected) {
            alert("WebSocket no está conectado. El usuario se creará pero no recibirás notificaciones en tiempo real.");
        }

        setIsCreating(true);
        
        try {
            await createUser(formData);
            
            // Si WebSocket no está conectado, manejar éxito de forma tradicional
            if (!isConnected) {
                alert("Usuario creado exitosamente");
                navigate("/users");
                setIsCreating(false);
            }
            // Si está conectado, esperar el evento WebSocket (manejado en useEffect)
            
        } catch (error) {
            setIsCreating(false);
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
                    disabled={isCreating}
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
                    disabled={isCreating}
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
                    disabled={isCreating}
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
                    disabled={isCreating}
                />

                {/* Botón para enviar el formulario */}
                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isCreating}
                    style={{
                        opacity: isCreating ? 0.6 : 1,
                        cursor: isCreating ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isCreating ? (
                        <>
                            <span style={{ marginRight: '8px' }}>⏳</span>
                            {isConnected ? 'Creando... (esperando confirmación WebSocket)' : 'Creando...'}
                        </>
                    ) : (
                        'Crear'
                    )}
                </button>

                {/* Información adicional sobre WebSocket */}
                {isCreating && isConnected && (
                    <div style={{ 
                        marginTop: '15px', 
                        padding: '10px', 
                        backgroundColor: '#f8f9fa',
                        borderRadius: '5px',
                        fontSize: '14px',
                        color: '#666',
                        textAlign: 'center'
                    }}>
                        📡 Esperando confirmación del servidor via WebSocket...
                        <br />
                        <small>Se mostrará una notificación cuando se complete</small>
                    </div>
                )}
            </form>
        </div>
    );
};

export default CreateUser;