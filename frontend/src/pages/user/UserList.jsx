import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../../services/user";
import "../../styles/UserList.css";

const USERS_PER_PAGE = 10;

const UserList = () => {
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
