import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/auth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await login(username, password);
      localStorage.setItem("token", token);
      navigate("/users");
    } catch (err) {
      alert("Credenciales inválidas");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0b2a33]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Log in</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-cyan-600 text-white py-3 rounded hover:bg-cyan-700 transition-colors duration-200 font-medium text-lg"
        >
          Log in
        </button>

        <p className="text-center mt-4 text-gray-600 font-semibold">
          or, <span className="underline cursor-pointer hover:text-cyan-700">sign up</span>
        </p>
      </form>
    </div>
  );
};

export default Login;
