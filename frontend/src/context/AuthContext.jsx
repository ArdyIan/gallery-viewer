import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Set auth token
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  };

  // Login user
  const login = async (formData) => {
    const res = await axios.post("/api/auth/login", formData);
    setAuthToken(res.data.token);
    setUser(res.data.user);
  };

  // Register user
  const register = async (formData) => {
    const res = await axios.post("/api/auth/register", formData);
    setAuthToken(res.data.token);
    setUser(res.data.user);
  };

  // Logout
  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  // Check if user is authenticated
  const loadUser = async () => {
    if (token) {
      setAuthToken(token);
      try {
        const res = await axios.get("/api/auth/user");
        setUser(res.data);
      } catch (err) {
        logout();
      }
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return <AuthContext.Provider value={{ user, token, login, register, logout }}>{children}</AuthContext.Provider>;
};

export default AuthContext;
