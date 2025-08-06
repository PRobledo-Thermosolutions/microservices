import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import UserDetail from "./pages/UserDetail";
import CreateUser from "./pages/CreateUser";

const App = () => {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/" element={!token ? <Login /> : <Navigate to="/welcome" />} />
        <Route path="/welcome" element={token ? <Welcome /> : <Navigate to="/" />} />
        <Route path="/user/:id" element={token ? <UserDetail /> : <Navigate to="/" />} />
        <Route path="/create-user" element={token ? <CreateUser /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
