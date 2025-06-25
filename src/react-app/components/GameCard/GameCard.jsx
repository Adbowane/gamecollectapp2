import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  Button,
  Chip,
  Box,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Rating,
} from "@mui/material";
import {
  Favorite,
  PlaylistAdd,
  FavoriteBorder,
  Check,
} from "@mui/icons-material";
import { useThemeMode } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useGames } from "../../contexts/GamesContext";
import { motion as Motion } from "framer-motion";

const GameCard = ({ game }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { mode } = useThemeMode();
  const { isAuthenticated } = useAuth();
  const {
    addToFavorites,
    removeFromFavorites,
    addToCollection,
    createCollection,
    isGameInFavorites,
    isGameInCollection,
    collections,
  } = useGames();

  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isAddingToCollection, setIsAddingToCollection] = useState(false);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [gameStatus, setGameStatus] = useState("owned");
  const [gameRating, setGameRating] = useState(0);
  const [personalNotes, setPersonalNotes] = useState("");
  const [playTimeHours, setPlayTimeHours] = useState("");
  const [dateCompleted, setDateCompleted] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const isInWishlist = isGameInFavorites(game.id);
  const isInCollection = isGameInCollection(game.id);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      showSnackbar(
        "Vous devez être connecté pour ajouter à la wishlist",
        "warning"
      );
      return;
    }

    console.log("🔐 État authentification:", { isAuthenticated });
    console.log("🎮 Jeu à ajouter:", { id: game.id, title: game.title });

    setIsAddingToWishlist(true);
    try {
      if (isInWishlist) {
        await removeFromFavorites(game.id);
        showSnackbar("Jeu retiré de la wishlist", "info");
      } else {
        await addToFavorites(game.id);
        showSnackbar("Jeu ajouté à la wishlist !", "success");
      }
    } catch (error) {
      console.error("❌ Erreur wishlist:", error);
      let errorMessage = "Erreur lors de l'opération sur la wishlist";

      if (error.response?.status === 400) {
        errorMessage = "Données invalides. Vérifiez que le jeu existe.";
      } else if (error.response?.status === 401) {
        errorMessage = "Vous devez être connecté.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showSnackbar(errorMessage, "error");
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleAddToCollection = async () => {
    if (!isAuthenticated) {
      showSnackbar(
        "Vous devez être connecté pour ajouter à une collection",
        "warning"
      );
      return;
    }

    if (collections.length === 0) {
      // Créer une collection par défaut
      setIsAddingToCollection(true);
      try {
        const defaultCollection = await createCollection({
          name: "Ma Collection",
          description: "Collection par défaut",
        });

        await addToCollection(defaultCollection.id, game.id, {
          status: "owned",
        });
        showSnackbar("Jeu ajouté à la collection !", "success");
      } catch (error) {
        console.error("❌ Erreur collection:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Erreur lors de l'ajout à la collection";
        showSnackbar(errorMessage, "error");
      } finally {
        setIsAddingToCollection(false);
      }
    } else {
      // Ouvrir le dialog pour choisir la collection
      setCollectionDialogOpen(true);
    }
  };

  const handleConfirmAddToCollection = async () => {
    if (!selectedCollectionId) {
      showSnackbar("Veuillez sélectionner une collection", "warning");
      return;
    }

    // Vérifier si le jeu est déjà dans cette collection spécifique
    const selectedCollection = collections.find(
      (c) => c.id.toString() === selectedCollectionId.toString()
    );
    if (selectedCollection) {
      const gamesInCollection =
        selectedCollection.Games || selectedCollection.games || [];
      const isAlreadyInThisCollection = gamesInCollection.some(
        (gameInCollection) => {
          const actualGameId =
            gameInCollection.id ||
            gameInCollection.game_id ||
            gameInCollection.Game?.id;
          return actualGameId === game.id;
        }
      );

      if (isAlreadyInThisCollection) {
        showSnackbar("Ce jeu est déjà dans cette collection", "warning");
        return;
      }
    }

    console.log("🎯 Ajout à la collection:", {
      collectionId: selectedCollectionId,
      gameId: game.id,
      status: gameStatus,
      rating: gameRating,
    });

    setIsAddingToCollection(true);
    try {
      const gameData = {
        status: gameStatus,
        rating: gameRating > 0 ? gameRating : null,
        personal_notes: personalNotes.trim() || null,
        play_time_hours: playTimeHours ? parseFloat(playTimeHours) : null,
        date_completed: dateCompleted || null,
      };

      await addToCollection(selectedCollectionId, game.id, gameData);
      showSnackbar("Jeu ajouté à la collection avec succès !", "success");

      // Reset form
      setCollectionDialogOpen(false);
      setSelectedCollectionId("");
      setGameStatus("owned");
      setGameRating(0);
      setPersonalNotes("");
      setPlayTimeHours("");
      setDateCompleted("");
    } catch (error) {
      console.error("❌ Erreur collection:", error);
      let errorMessage = "Erreur lors de l'ajout à la collection";

      if (error.response?.status === 400) {
        errorMessage = "Données invalides. Vérifiez les informations saisies.";
      } else if (error.response?.status === 404) {
        errorMessage = "Collection ou jeu introuvable.";
      } else if (error.response?.status === 409) {
        errorMessage = "Ce jeu est déjà dans cette collection.";
      } else if (error.response?.status === 500) {
        // Vérifier si c'est une erreur de contrainte unique
        if (
          error.response?.data?.message?.includes("Duplicate") ||
          error.response?.data?.message?.includes("unique") ||
          error.message?.includes("unique") ||
          error.message?.includes("déjà dans cette collection")
        ) {
          errorMessage = "Ce jeu est déjà dans cette collection.";
        } else {
          errorMessage = "Erreur serveur. Veuillez réessayer.";
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showSnackbar(errorMessage, "error");
    } finally {
      setIsAddingToCollection(false);
    }
  };

  const statusOptions = [
    { value: "owned", label: "Possédé" },
    { value: "wishlist", label: "Liste de souhaits" },
    { value: "playing", label: "En cours" },
    { value: "completed", label: "Terminé" },
    { value: "dropped", label: "Abandonné" },
  ];

  return (
    <>
      <Motion.div whileTap={{ scale: 0.98 }} transition={{ duration: 0.1 }}>
        <Card
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            transition: "all 0.2s ease-in-out",
            backgroundColor:
              mode === "light" ? "background.paper" : "background.default",
            "&:active": {
              transform: isMobile ? "scale(0.98)" : "none",
            },
            borderRadius: { xs: "16px", sm: "8px" },
            overflow: "hidden",
          }}
          elevation={3}
        >
          <Motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <CardMedia
              component="img"
              height={isMobile ? "200" : "140"}
              image={
                game.cover_image_url || "https://via.placeholder.com/300x140"
              }
              alt={game.title}
              sx={{
                objectFit: "cover",
              }}
              onError={(e) => {
                console.error(
                  `❌ Erreur de chargement d'image pour "${game.title}":`,
                  game.cover_image_url
                );
                e.target.src =
                  "https://via.placeholder.com/300x140?text=Image+Non+Disponible";
              }}
            />
          </Motion.div>
          <CardContent
            sx={{
              flexGrow: 1,
              p: { xs: 2, sm: 2 },
              "&:last-child": { pb: 2 },
            }}
          >
            <Typography
              variant={isMobile ? "h6" : "h5"}
              component="h2"
              gutterBottom
              sx={{
                fontSize: {
                  xs: "1.1rem",
                  sm: "1.3rem",
                  md: "1.5rem",
                },
                fontWeight: "bold",
                mb: 1.5,
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {game.title}
            </Typography>
            <Box
              sx={{
                mb: { xs: 1.5, sm: 2 },
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Chip
                label={game.platform}
                size={isMobile ? "small" : "medium"}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: "white",
                  fontWeight: "500",
                  height: isMobile ? "28px" : "32px",
                }}
              />
              <Chip
                label={game.genre}
                size={isMobile ? "small" : "medium"}
                sx={{
                  backgroundColor: theme.palette.secondary.main,
                  color: "white",
                  fontWeight: "500",
                  height: isMobile ? "28px" : "32px",
                }}
              />
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: {
                  xs: "0.9rem",
                  sm: "1rem",
                },
                lineHeight: 1.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              }}
            >
              {game.description}
            </Typography>
          </CardContent>
          <CardActions
            sx={{
              p: 2,
              pt: 0,
              gap: 1,
              justifyContent: "space-between",
            }}
          >
            <Motion.div whileTap={{ scale: 0.95 }}>
              <Button
                size={isMobile ? "small" : "medium"}
                startIcon={
                  isAddingToWishlist ? (
                    <CircularProgress size={16} />
                  ) : isInWishlist ? (
                    <Favorite />
                  ) : (
                    <FavoriteBorder />
                  )
                }
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
                variant={isInWishlist ? "contained" : "outlined"}
                sx={{
                  borderRadius: "20px",
                  px: 2,
                  py: isMobile ? 0.5 : 1,
                  "&:active": {
                    transform: isMobile ? "scale(0.95)" : "none",
                  },
                }}
              >
                {isInWishlist ? "Dans la wishlist" : "Wishlist"}
              </Button>
            </Motion.div>
            <Motion.div whileTap={{ scale: 0.95 }}>
              <Button
                size={isMobile ? "small" : "medium"}
                startIcon={
                  isAddingToCollection ? (
                    <CircularProgress size={16} />
                  ) : isInCollection ? (
                    <Check />
                  ) : (
                    <PlaylistAdd />
                  )
                }
                onClick={handleAddToCollection}
                disabled={isAddingToCollection}
                variant={isInCollection ? "contained" : "outlined"}
                sx={{
                  borderRadius: "20px",
                  px: 2,
                  py: isMobile ? 0.5 : 1,
                  "&:active": {
                    transform: isMobile ? "scale(0.95)" : "none",
                  },
                }}
              >
                {isInCollection ? "Dans collection" : "Collection"}
              </Button>
            </Motion.div>
          </CardActions>
        </Card>
      </Motion.div>

      {/* Dialog pour choisir la collection et ajouter des détails */}
      <Dialog
        open={collectionDialogOpen}
        onClose={() => setCollectionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ajouter "{game.title}" à une collection</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Collection</InputLabel>
            <Select
              value={selectedCollectionId}
              label="Collection"
              onChange={(e) => setSelectedCollectionId(e.target.value)}
            >
              {collections.map((collection) => (
                <MenuItem key={collection.id} value={collection.id}>
                  {collection.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={gameStatus}
              label="Statut"
              onChange={(e) => setGameStatus(e.target.value)}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mb: 2 }}>
            <Typography component="legend" sx={{ mb: 1 }}>
              Note (sur 10)
            </Typography>
            <Rating
              value={gameRating}
              onChange={(event, newValue) => setGameRating(newValue || 0)}
              max={10}
              precision={1}
            />
          </Box>

          <TextField
            label="Temps de jeu (heures)"
            type="number"
            fullWidth
            value={playTimeHours}
            onChange={(e) => setPlayTimeHours(e.target.value)}
            sx={{ mb: 2 }}
            inputProps={{ min: 0, step: 0.5 }}
          />

          <TextField
            label="Date de completion"
            type="date"
            fullWidth
            value={dateCompleted}
            onChange={(e) => setDateCompleted(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Laissez vide si le jeu n'est pas terminé"
          />

          <TextField
            label="Notes personnelles"
            multiline
            rows={3}
            fullWidth
            value={personalNotes}
            onChange={(e) => setPersonalNotes(e.target.value)}
            placeholder="Vos impressions, commentaires..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCollectionDialogOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirmAddToCollection}
            variant="contained"
            disabled={!selectedCollectionId || isAddingToCollection}
          >
            {isAddingToCollection ? <CircularProgress size={20} /> : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default GameCard;
