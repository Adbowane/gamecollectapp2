import axios from "axios";

const BASE_URL =
  "https://7e96-2a02-8440-b50d-2ad4-8930-fa9d-f30b-19f8.ngrok-free.app/api";
// Création de l'instance axios avec la configuration de base
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    Accept: "application/json",
  },
  timeout: 10000, // 10 secondes de timeout
});

// Système de retry pour les erreurs 429
const retryRequest = async (originalRequest, retryCount = 0) => {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 seconde de base

  if (retryCount >= maxRetries) {
    throw new Error(
      "Trop de tentatives. Veuillez réessayer dans quelques minutes."
    );
  }

  const delay = baseDelay * Math.pow(2, retryCount); // Délai exponentiel
  console.log(`⏳ Retry ${retryCount + 1}/${maxRetries} dans ${delay}ms...`);

  await new Promise((resolve) => setTimeout(resolve, delay));

  try {
    return await api(originalRequest);
  } catch (error) {
    if (error.response?.status === 429) {
      return retryRequest(originalRequest, retryCount + 1);
    }
    throw error;
  }
};

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        `🔐 Token ajouté à la requête ${config.method?.toUpperCase()} ${
          config.url
        }`
      );
    } else {
      console.warn(
        `⚠️ Aucun token trouvé pour ${config.method?.toUpperCase()} ${
          config.url
        }`
      );
    }
    console.log(`📤 Requête:`, {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
      headers: {
        Authorization: config.headers.Authorization
          ? "Bearer [TOKEN_PRESENT]"
          : "MISSING",
        "Content-Type": config.headers["Content-Type"],
      },
    });
    return config;
  },
  (error) => {
    console.error("❌ Erreur dans l'intercepteur de requête:", error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et erreurs avec retry automatique
api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ API Success: ${response.config.method?.toUpperCase()} ${
        response.config.url
      }`,
      response.data
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      console.error(
        `❌ API Error ${error.response.status}:`,
        error.response.data
      );

      // Gestion spécifique des erreurs 429 avec retry automatique
      if (error.response.status === 429 && !originalRequest._retry) {
        originalRequest._retry = true;
        console.warn("🚦 Rate limit atteint, tentative de retry...");

        try {
          return await retryRequest(originalRequest);
        } catch (retryError) {
          console.error("❌ Échec après tous les retries:", retryError);
          error.message =
            "Trop de requêtes. Veuillez patienter quelques minutes avant de réessayer.";
          return Promise.reject(error);
        }
      }

      // Gestion des autres erreurs
      if (error.response.status === 401) {
        console.warn("🔐 Token expiré ou invalide");
        localStorage.removeItem("token");
        window.location.href = "/connexion";
      }
    } else if (error.request) {
      console.error("❌ No response from server:", error.request);
      error.message =
        "Impossible de joindre le serveur. Vérifiez votre connexion.";
    } else {
      console.error("❌ Request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  register: (userData) => {
    console.log("📡 API - Envoi des données d'inscription:", userData);
    console.log("📡 API - URL complète:", `${BASE_URL}/auth/register`);
    return api.post("/auth/register", userData);
  },
  login: (credentials) => {
    console.log("📡 API - Envoi des données de connexion:", {
      email: credentials.email,
    });
    return api.post("/auth/login", credentials);
  },
  logout: () => api.post("/auth/logout"),
};

// Services des jeux
export const gameService = {
  getAllGames: (params) => api.get("/games", { params }),
  getGameById: (id) => api.get(`/games/${id}`),
  createGame: (gameData) => api.post("/games", gameData),
  updateGame: (id, gameData) => api.put(`/games/${id}`, gameData),
  deleteGame: (id) => api.delete(`/games/${id}`),
};

// Services des collections
export const collectionService = {
  getUserCollections: () => api.get("/collections"),
  getCollectionById: (id) => api.get(`/collections/${id}`),
  createCollection: (collectionData) =>
    api.post("/collections", collectionData),
  updateCollection: (id, collectionData) =>
    api.put(`/collections/${id}`, collectionData),
  deleteCollection: (id) => api.delete(`/collections/${id}`),
  addGameToCollection: (collectionId, gameId, gameData = {}) => {
    console.log("🔧 Service API - Ajout jeu à collection:", {
      collectionId,
      gameId,
      gameData,
    });

    // Construire le payload en excluant les valeurs null/undefined
    const payload = {
      game_id: parseInt(gameId),
    };

    // Ajouter seulement les champs qui ont des valeurs
    if (gameData.status) {
      payload.status = gameData.status;
    }

    if (gameData.rating && gameData.rating > 0) {
      payload.rating = gameData.rating;
    }

    if (gameData.personal_notes && gameData.personal_notes.trim()) {
      payload.personal_notes = gameData.personal_notes.trim();
    }

    if (gameData.play_time_hours && gameData.play_time_hours > 0) {
      payload.play_time_hours = parseFloat(gameData.play_time_hours);
    }

    if (gameData.date_completed) {
      // S'assurer que c'est une date valide au format YYYY-MM-DD
      const date = new Date(gameData.date_completed);
      if (!isNaN(date.getTime())) {
        payload.date_completed = date.toISOString().split("T")[0];
      }
    }

    console.log("📤 Payload final envoyé:", payload);
    return api.post(`/collections/${collectionId}/games`, payload);
  },
  updateGameInCollection: (collectionId, gameId, gameData = {}) => {
    console.log("🔧 Service API - Mise à jour jeu dans collection:", {
      collectionId,
      gameId,
      gameData,
    });

    // Construire le payload en excluant les valeurs null/undefined
    const payload = {};

    // Ajouter seulement les champs qui ont des valeurs
    if (gameData.status) {
      payload.status = gameData.status;
    }

    if (gameData.rating !== undefined && gameData.rating > 0) {
      payload.rating = gameData.rating;
    }

    if (
      gameData.personal_notes !== undefined &&
      gameData.personal_notes.trim()
    ) {
      payload.personal_notes = gameData.personal_notes.trim();
    }

    if (
      gameData.play_time_hours !== undefined &&
      gameData.play_time_hours > 0
    ) {
      payload.play_time_hours = parseFloat(gameData.play_time_hours);
    }

    if (gameData.date_completed) {
      // S'assurer que c'est une date valide au format YYYY-MM-DD
      const date = new Date(gameData.date_completed);
      if (!isNaN(date.getTime())) {
        payload.date_completed = date.toISOString().split("T")[0];
      }
    }

    console.log("📤 Payload mise à jour envoyé:", payload);
    return api.put(`/collections/${collectionId}/games/${gameId}`, payload);
  },
};

// Services utilisateur
export const userService = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (profileData) => api.put("/users/profile", profileData),
  getFavorites: () => api.get("/users/favorites"),
  addFavorite: (gameId) => {
    console.log("🔧 Service API - Ajout favori pour game ID:", gameId);
    return api.post("/users/favorites", { game_id: parseInt(gameId) });
  },
  removeFavorite: (gameId) => {
    console.log("🔧 Service API - Suppression favori pour game ID:", gameId);
    return api.delete(`/users/favorites/${gameId}`);
  },
};

// Services admin
export const adminService = {
  getAllUsers: () => api.get("/admin/users"),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getLogs: (params) => api.get("/admin/logs", { params }),
};

export default api;
