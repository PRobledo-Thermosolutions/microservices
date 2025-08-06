import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocketContext } from '../../hooks/WebSocketContext'; // Ajusta la ruta
import { getUsers } from '../../services/user';
import '../../styles/user/UserList.css'; // Tu archivo CSS existente

// Constante para definir la cantidad de usuarios a mostrar por página
const USERS_PER_PAGE = 10;

/**
 * Componente UserList con funcionalidad WebSocket integrada de forma invisible.
 * Mantiene tu diseño original pero agrega actualización automática.
 */
const UserList = () => {
    const navigate = useNavigate();

    // WebSocket context para eventos en tiempo real (sin modificar UI)
    const { unprocessedEvents, markEventAsProcessed } = useWebSocketContext();

    // Estado para almacenar la lista completa de usuarios
    const [users, setUsers] = useState([]);

    // Estado para el texto de búsqueda
    const [search, setSearch] = useState("");

    // Estado para la página actual en la paginación
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar usuarios inicialmente
    useEffect(() => {
        loadUsers();
    }, []);

    // Escuchar eventos WebSocket de manera silenciosa
    useEffect(() => {
        const newUserEvents = unprocessedEvents.filter(event =>
            event.event === 'user_created'
        );

        if (newUserEvents.length > 0) {
            // Procesar cada evento de usuario creado
            newUserEvents.forEach(event => {
                if (event.user) {
                    setUsers(prevUsers => {
                        // Verificar si el usuario ya existe para evitar duplicados
                        const existingUser = prevUsers.find(user => user.id === event.user.id);
                        if (!existingUser) {
                            // Agregar nuevo usuario al inicio de la lista
                            return [event.user, ...prevUsers];
                        }
                        return prevUsers;
                    });

                    // Marcar evento como procesado
                    markEventAsProcessed(event.id);
                }
            });
        }
    }, [unprocessedEvents, markEventAsProcessed]);

    /**
     * Función para cargar usuarios - mantener tu implementación original
     */
    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const usersData = await getUsers();
            setUsers(usersData);
        } catch (err) {
            setError('Error al cargar usuarios: ' + err.message);
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    };

    // Convierte la búsqueda a minúsculas para comparación insensible a mayúsculas
    const s = search.toLowerCase();

    // Filtra usuarios según el texto de búsqueda por ID, email, username o estado activo
    const filteredUsers = users.filter((user) => {
        if (!s) return true; // Si no hay búsqueda, retorna todos

        return (
            user.id.toString().includes(s) ||
            user.email.toLowerCase().includes(s) ||
            user.username.toLowerCase().includes(s) ||
            (user.is_active ? "activo" : "inactivo").includes(s)
        );
    });

    // Calcula total de páginas para paginación
    const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

    // Obtiene solo los usuarios de la página actual
    const paginatedUsers = filteredUsers.slice(
        (page - 1) * USERS_PER_PAGE,
        page * USERS_PER_PAGE
    );

     const handleLogout = () => {
        try {
            localStorage.removeItem("token");
            window.location.reload();
        } catch (error) {
            alert(error.message);
        }
    };

    // Aquí mantienes tu JSX original exactamente como lo tienes
    // Solo cambio los datos de muestra por tu implementación real

    if (loading) {
        return (
            <div className="userlist-container">
                <div className="loading">Cargando usuarios...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="userlist-container">
                <div className="error">
                    {error}
                    <button onClick={loadUsers}>Reintentar</button>
                </div>
            </div>
        );
    }

    /**
     * Navega a la vista de detalle de usuario al hacer clic en una fila.
     * @param {number|string} id - ID del usuario
     */
    const handleRowClick = (id) => {
        navigate(`/user/${id}`);
    };

    return (
        <div className="userlist-container">
            {/* Header con título y botón de logout */}
            <div className="userlist-header">
                <h1 className="userlist-title">Usuarios Registrados</h1>
                <button onClick={handleLogout} className="logout-button">
                    Cerrar sesión
                </button>
            </div>

            {/* Campo de búsqueda */}
            <div className="userlist-search">
                <input
                    type="text"
                    placeholder="Buscar por ID, email, username o activo"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Tabla con usuarios */}
            <div className="userlist-table-wrapper">
                <table className="userlist-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Username</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="no-users">
                                    No hay usuarios.
                                </td>
                            </tr>
                        ) : (
                            paginatedUsers.map((user) => (
                                <tr key={user.id} onClick={() => handleRowClick(user.id)}>
                                    <td>{user.id}</td>
                                    <td>{user.email}</td>
                                    <td>{user.username}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación si hay más de una página */}
            {totalPages > 1 && (
                <div className="pagination">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`page-button ${page === i + 1 ? "active" : ""}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Botón para crear nuevo usuario */}
            <button
                onClick={() => navigate("/create-user")}
                className="create-user-button"
            >
                Crear nuevo usuario
            </button>
        </div>
    );
};

export default UserList;