import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, userService } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
    );
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Vérification initiale au chargement de l'app
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        console.log("🔐 Vérification du token au démarrage...");
        const response = await userService.getProfile();
        console.log("✅ Utilisateur connecté:", response.data);
        setUser(response.data);
        setError("");
      } catch (err) {
        console.warn("⚠️ Token invalide, déconnexion:", err);
        localStorage.removeItem("token");
        setUser(null);
        setError("");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      console.log("🔐 Tentative de connexion...");
      const response = await authService.login(credentials);
      const { token, user: userData } = response.data;

      console.log("✅ Connexion réussie:", userData);

      localStorage.setItem("token", token);
      setUser(userData);
      setError("");

      return userData;
    } catch (err) {
      console.error("❌ Erreur de connexion:", err);
      setError(err.response?.data?.message || "Erreur de connexion");
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      console.log("🔐 Tentative d'inscription:", userData);
      const response = await authService.register(userData);
      console.log("✅ Inscription réussie:", response.data);

      setError("");
      return response.data;
    } catch (err) {
      console.error("❌ Erreur d'inscription:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Erreur d'inscription";
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    try {
      console.log("🚪 Déconnexion...");
      await authService.logout();
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setError("");
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  console.log("🔍 État d'authentification:", {
    user: user?.username || "non connecté",
    isAuthenticated: !!user,
    loading,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
