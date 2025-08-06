import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../services/user";

const USERS_PER_PAGE = 10;

const Welcome = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Error:", error);
            alert("No se pudieron cargar los usuarios.");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user) => {
        const s = search.toLowerCase();
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
        <div className="min-h-screen bg-blue-100 p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-blue-900">Usuarios Registrados</h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Cerrar sesión
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar por ID, email, username o activo"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2 border rounded shadow"
                />
            </div>

            <div className="overflow-x-auto bg-white p-4 rounded shadow">
                <table className="table-auto w-full border-collapse">
                    <thead>
                        <tr className="bg-blue-800 text-white">
                            <th className="px-4 py-2 border">ID</th>
                            <th className="px-4 py-2 border">Email</th>
                            <th className="px-4 py-2 border">Username</th>
                            <th className="px-4 py-2 border">Activo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4">
                                    No hay usuarios.
                                </td>
                            </tr>
                        ) : (
                            paginatedUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    onClick={() => handleRowClick(user.id)}
                                    className="cursor-pointer bg-blue-100 hover:bg-blue-200 transition"
                                >
                                    <td className="border px-4 py-2 text-center">{user.id}</td>
                                    <td className="border px-4 py-2">{user.email}</td>
                                    <td className="border px-4 py-2">{user.username}</td>
                                    <td className="border px-4 py-2 text-center">
                                        {user.is_active ? "Activo" : "Inactivo"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`px-3 py-1 rounded ${page === i + 1
                                ? "bg-blue-800 text-white"
                                : "bg-white border text-blue-800 hover:bg-blue-100"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
            <button
                onClick={() => navigate("/create-user")}
                className="mb-4 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
            >
                Crear nuevo usuario
            </button>

        </div>
    );
};

export default Welcome;
