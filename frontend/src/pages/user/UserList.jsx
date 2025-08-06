import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../../services/user";
import useWebSocket from "../../hooks/useWebSocket";
import Path from "../../config";
import "../../styles/user/UserList.css";
import toast from 'react-hot-toast';

// Constante para definir la cantidad de usuarios a mostrar por página
const USERS_PER_PAGE = 10;

/**
 * Componente que muestra una lista paginada y filtrable de usuarios.
 * Permite buscar, navegar a detalles, crear usuario nuevo y cerrar sesión.
 */
const UserList = () => {
    const navigate = useNavigate();

    // Estado para almacenar la lista completa de usuarios
    const [users, setUsers] = useState([]);

    // Estado para el texto de búsqueda
    const [search, setSearch] = useState("");

    // Estado para la página actual en la paginación
    const [page, setPage] = useState(1);

    // Hook personalizado para manejar mensajes en tiempo real vía WebSocket
    const { lastMessage } = useWebSocket(Path.WS_BASE_URL);

    // Efecto que escucha mensajes WebSocket para usuarios nuevos creados
    useEffect(() => {
        if (lastMessage && lastMessage.event === 'user_created') {
            // Añade el nuevo usuario al listado actual
            setUsers(prev => [...(prev || []), lastMessage.user]);
            // Notifica con toast el nuevo usuario creado
            toast.success(`New user ${lastMessage.user.username} created!`);
        }
    }, [lastMessage]);

    /**
     * Función para cerrar sesión:
     * Elimina el token y recarga la página para volver al login.
     */
    const handleLogout = () => {
        try {
            localStorage.removeItem("token");
            window.location.reload();
        } catch (error) {
            alert(error.message);
        }
    };

    /**
     * Función para obtener todos los usuarios desde el backend.
     * Actualiza el estado con los datos recibidos.
     */
    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data || []);
        } catch (error) {
            console.error("Error:", error);
            setUsers([]);
            alert("No se pudieron cargar los usuarios.");
        }
    };

    // Efecto que carga la lista de usuarios al montar el componente
    useEffect(() => {
        fetchUsers();
    }, []);

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
