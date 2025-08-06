import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WebSocketProvider } from './hooks/WebSocketContext'; // Ajusta la ruta según tu estructura
// Importación de páginas o vistas
import Login from "./pages/auth/Login";
import UserList from "./pages/user/UserList";
import UserDetail from "./pages/user/UserDetail";
import CreateUser from "./pages/user/CreateUser";
// Importa tus otros componentes como los tienes actualmente

/**
 * App component - solo agrega WebSocketProvider sin modificar tu estructura existente
 */
function App() {
  // Se obtiene el token del almacenamiento local para verificar si el usuario está autenticado
  const token = localStorage.getItem("token");

  return (
    <div className="App">
      {/* 
        Solo envuelve tu aplicación existente con WebSocketProvider
        Mantén toda tu estructura y diseño actual
      */}
      <WebSocketProvider>
        {/* Tu Router y Routes exactamente como los tienes */}
        <Router>
          <Routes>
        {/* Ruta raíz "/" */}
        {/* Si no hay token, se muestra la página de login. Si hay token, redirige a "/users" */}
        <Route path="/" element={!token ? <Login /> : <Navigate to="/users" />} />

        {/* Ruta para listar usuarios */}
        {/* Si hay token, se muestra el listado de usuarios. Si no, redirige a la página de login */}
        <Route path="/users" element={token ? <UserList /> : <Navigate to="/" />} />

        {/* Ruta para ver el detalle de un usuario específico */}
        {/* Requiere autenticación (token), si no, redirige a login */}
        <Route path="/user/:id" element={token ? <UserDetail /> : <Navigate to="/" />} />

        {/* Ruta para crear un nuevo usuario */}
        {/* Requiere autenticación (token), si no, redirige a login */}
        <Route path="/create-user" element={token ? <CreateUser /> : <Navigate to="/" />} />
          </Routes>
        </Router>
      </WebSocketProvider>
    </div>
  );
}

export default App;