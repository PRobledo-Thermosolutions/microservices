export const getAllUsers = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:8000/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Error al obtener usuarios");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    alert("No se pudieron cargar los usuarios.");
  }
};

export const getUserById = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:8000/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("No se pudo obtener el usuario");
    const data = await res.json();
    return data;
  } catch (error) {
        alert(error.message);
  }
};

export const createUser = async (formData) => {
  try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      return response;
  } catch (error) {
        alert(error.message);
  }
};

export const updateUser = async (id, form) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("No se pudo actualizar el usuario");
      alert("Usuario actualizado correctamente");
    } catch (err) {
      alert(err.message);
    }
  };
