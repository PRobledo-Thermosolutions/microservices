import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../../services/user";
import useWebSocket from "../../hooks/useWebSocket";
import Path from "../../config";
import "../../styles/user/UserList.css";
import toast from 'react-hot-toast';

const USERS_PER_PAGE = 10;

const UserList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const { lastMessage } = useWebSocket(Path.WS_BASE_URL);

    useEffect(() => {
        if (lastMessage && lastMessage.event === 'user_created') {
            setUsers(prev => [...(prev || []), lastMessage.user]);
            toast.success(`New user ${lastMessage.user.username} created!`);
        }
    }, [lastMessage]);


    const handleLogout = () => {
        try {
            localStorage.removeItem("token");
            window.location.reload();
        } catch (error) {
            alert(error.message);
        }
    };

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

    useEffect(() => {
        fetchUsers();
    }, []);

    const s = search.toLowerCase();
    const filteredUsers = users.filter((user) => {
        if (!s) return true;

        return (
            user.id.toString().includes(s) ||
            user.email.toLowerCase().includes(s) ||
            user.username.toLowerCase().includes(s) ||
            (user.is_active ? "activo" : "inactivo").includes(s)
        );
    });


    const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
        (page - 1) * USERS_PER_PAGE,
        page * USERS_PER_PAGE
    );

    const handleRowClick = (id) => {
        navigate(`/user/${id}`);
    };

    return (
        <div className="userlist-container">
            <div className="userlist-header">
                <h1 className="userlist-title">Usuarios Registrados</h1>
                <button onClick={handleLogout} className="logout-button">
                    Cerrar sesión
                </button>
            </div>

            <div className="userlist-search">
                <input
                    type="text"
                    placeholder="Buscar por ID, email, username o activo"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
            </div>

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
