export const login = async (username, password) => {
  try {
    const response = await fetch("http://localhost:8000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const data = await response.json();
  return data.access_token;
  
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};
