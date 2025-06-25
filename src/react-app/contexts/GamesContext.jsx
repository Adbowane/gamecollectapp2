import React, { createContext, useContext, useState, useEffect } from "react";
import { userService, collectionService } from "../services/api";
import { useAuth } from "./AuthContext";

const GamesContext = createContext();

export const useGames = () => {
  const context = useContext(GamesContext);
  if (!context) {
    throw new Error(
      "useGames doit être utilisé à l'intérieur d'un GamesProvider"
    );
  }
  return context;
};

export const GamesProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les favoris et collections de l'utilisateur
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    } else {
      setFavorites([]);
      setCollections([]);
    }
  }, [isAuthenticated, user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Chargement des données utilisateur...");

      const [favoritesResponse, collectionsResponse] = await Promise.all([
        userService.getFavorites().catch((err) => {
          console.warn("⚠️ Erreur favoris (sera ignorée):", err);
          return { data: [] };
        }),
        collectionService.getUserCollections().catch((err) => {
          console.warn("⚠️ Erreur collections (sera ignorée):", err);
          return { data: [] };
        }),
      ]);

      console.log("📊 Favoris reçus:", favoritesResponse.data);
      console.log("📊 Collections reçues:", collectionsResponse.data);

      // Les favoris viennent de UserFavorite qui a game_id
      setFavorites(favoritesResponse.data || []);
      // Les collections incluent déjà les jeux via l'association
      setCollections(collectionsResponse.data || []);
    } catch (error) {
      console.error(
        "❌ Erreur lors du chargement des données utilisateur:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (gameId) => {
    try {
      console.log("➕ Ajout aux favoris:", gameId);
      console.log("📡 Données envoyées:", { game_id: gameId });
      const response = await userService.addFavorite(gameId);
      console.log("✅ Réponse favoris:", response.data);
      // Ajouter localement avec game_id comme l'API retourne
      setFavorites((prev) => [...prev, { game_id: gameId, id: Date.now() }]);
      return true;
    } catch (error) {
      console.error("❌ Erreur ajout favoris:", error);
      console.error("❌ Détails erreur:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  };

  const removeFromFavorites = async (gameId) => {
    try {
      console.log("➖ Suppression des favoris:", gameId);
      await userService.removeFavorite(gameId);
      // Supprimer localement
      setFavorites((prev) =>
        prev.filter((fav) => fav.game_id !== gameId && fav.id !== gameId)
      );
      return true;
    } catch (error) {
      console.error("❌ Erreur suppression favoris:", error);
      throw error;
    }
  };

  const addToCollection = async (collectionId, gameId, gameData = {}) => {
    try {
      console.log("➕ Ajout à la collection:", {
        collectionId,
        gameId,
        gameData,
      });
      await collectionService.addGameToCollection(
        collectionId,
        gameId,
        gameData
      );
      // Recharger les collections pour avoir les données à jour
      const collectionsResponse = await collectionService.getUserCollections();
      setCollections(collectionsResponse.data || []);
      return true;
    } catch (error) {
      console.error("❌ Erreur ajout collection:", error);

      // Gestion spécifique des erreurs de contrainte unique
      if (
        error.response?.status === 500 &&
        (error.response?.data?.message?.includes("Duplicate") ||
          error.response?.data?.message?.includes("unique") ||
          error.message?.includes("unique"))
      ) {
        const customError = new Error("Ce jeu est déjà dans cette collection");
        customError.response = {
          status: 409,
          data: { message: "Ce jeu est déjà dans cette collection" },
        };
        throw customError;
      }

      throw error;
    }
  };

  const updateGameInCollection = async (
    collectionId,
    gameId,
    gameData = {}
  ) => {
    try {
      console.log("✏️ Mise à jour jeu dans collection:", {
        collectionId,
        gameId,
        gameData,
      });
      await collectionService.updateGameInCollection(
        collectionId,
        gameId,
        gameData
      );
      // Recharger les collections pour avoir les données à jour
      const collectionsResponse = await collectionService.getUserCollections();
      setCollections(collectionsResponse.data || []);
      return true;
    } catch (error) {
      console.error("❌ Erreur mise à jour collection:", error);
      throw error;
    }
  };

  const createCollection = async (collectionData) => {
    try {
      console.log("🆕 Création collection:", collectionData);
      const response = await collectionService.createCollection(collectionData);
      setCollections((prev) => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur création collection:", error);
      throw error;
    }
  };

  const isGameInFavorites = (gameId) => {
    const inFavorites = favorites.some(
      (fav) => fav.game_id === gameId || fav.id === gameId
    );
    console.log(`🔍 Jeu ${gameId} dans favoris:`, inFavorites, favorites);
    return inFavorites;
  };

  const isGameInCollection = (gameId) => {
    const inCollection = collections.some((collection) => {
      // Vérifier si le jeu est dans les Games de la collection
      const gamesArray = collection.Games || collection.games || [];
      return gamesArray.some((game) => {
        // Le jeu peut être directement l'objet Game ou via CollectionGame
        const actualGameId = game.id || game.game_id || game.Game?.id;
        return actualGameId === gameId;
      });
    });
    console.log(`🔍 Jeu ${gameId} dans collection:`, inCollection, {
      collections,
      searchedGameId: gameId,
    });
    return inCollection;
  };

  const value = {
    favorites,
    collections,
    loading,
    addToFavorites,
    removeFromFavorites,
    addToCollection,
    updateGameInCollection,
    createCollection,
    isGameInFavorites,
    isGameInCollection,
    loadUserData,
  };

  return (
    <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
  );
};

export default GamesContext;
