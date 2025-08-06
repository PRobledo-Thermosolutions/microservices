import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocketContext } from '../../hooks/WebSocketContext';
import { getUsers } from '../../services/user';
import "../../styles/user/UserList.css"

// Constante para definir la cantidad de usuarios a mostrar por página
const USERS_PER_PAGE = 10;

/**
 * Componente de lista de usuarios con integración WebSocket.
 * Actualiza la lista automáticamente cuando se crean nuevos usuarios.
 */
const UserList = () => {
    const navigate = useNavigate();

    // Contexto WebSocket para recibir eventos en tiempo real
    const {
        userEvents,
        markUserEventAsRead,
    } = useWebSocketContext();

    // Estados del componente
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

    // Escuchar eventos de usuarios via WebSocket
    useEffect(() => {
        const newUserEvents = userEvents.filter(event =>
            event.event === 'user_created' && !event.read
        );

        if (newUserEvents.length > 0) {
            console.log('Nuevos usuarios detectados via WebSocket:', newUserEvents);

            // Actualizar lista de usuarios
            newUserEvents.forEach(event => {
                if (event.user) {
                    setUsers(prevUsers => {
                        // Verificar si el usuario ya existe para evitar duplicados
                        const existingUser = prevUsers.find(user => user.id === event.user.id);
                        if (!existingUser) {
                            return [event.user, ...prevUsers];
                        }
                        return prevUsers;
                    });

                    // Marcar evento como leído
                    markUserEventAsRead(event.id);
                }
            });
        }
    }, [userEvents, markUserEventAsRead]);

    /**
     * Carga la lista de usuarios desde la API
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

    /**
     * Refresca la lista manualmente
     */
    const handleRefresh = () => {
        loadUsers();
    };

    const handleLogout = () => {
        try {
            localStorage.removeItem("token");
            window.location.reload();
        } catch (error) {
            alert(error.message);
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

    /**
    * Navega a la vista de detalle de usuario al hacer clic en una fila.
    * @param {number|string} id - ID del usuario
    */
    const handleRowClick = (id) => {
        navigate(`/user/${id}`);
    };

    return (
        <>

            {/* Mensajes de estado */}
            {loading && (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#666',
                    fontSize: '16px'
                }}>
                    <div>⏳ Cargando usuarios...</div>
                </div>
            )}

            {error && (
                <div style={{
                    padding: '15px',
                    marginBottom: '20px',
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '5px',
                    color: '#721c24'
                }}>
                    <strong>Error:</strong> {error}
                    <button
                        onClick={handleRefresh}
                        style={{
                            marginLeft: '10px',
                            padding: '5px 10px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {/* Lista de usuarios */}
            {!loading && !error && (
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
            )}
        </>
    );
};

export default UserList;