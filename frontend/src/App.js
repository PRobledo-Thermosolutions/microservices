import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import UserList from "./pages/user/UserList";
import UserDetail from "./pages/user/UserDetail";
import CreateUser from "./pages/user/CreateUser";

const App = () => {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/" element={!token ? <Login /> : <Navigate to="/users" />} />
        <Route path="/users" element={token ? <UserList /> : <Navigate to="/" />} />
        <Route path="/user/:id" element={token ? <UserDetail /> : <Navigate to="/" />} />
        <Route path="/create-user" element={token ? <CreateUser /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
