import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Rating,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add,
  Favorite,
  Collections as CollectionsIcon,
  Edit,
  Delete,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useGames } from "../contexts/GamesContext";

const Collections = () => {
  const { isAuthenticated } = useAuth();
  const {
    favorites,
    collections,
    createCollection,
    updateGameInCollection,
    loading,
  } = useGames();
  const [currentTab, setCurrentTab] = useState(0);
  const [favoriteGames, setFavoriteGames] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [editGameData, setEditGameData] = useState({
    status: "",
    rating: 0,
    personal_notes: "",
    play_time_hours: "",
    date_completed: "",
  });

  useEffect(() => {
    console.log("📊 Favoris dans Collections:", favorites);
    console.log("📊 Collections dans Collections:", collections);
  }, [favorites, collections]);

  // Extraire les jeux des favoris - ils pourraient être des jeux complets ou juste des IDs
  useEffect(() => {
    if (isAuthenticated && favorites.length > 0) {
      // Si les favoris contiennent déjà les objets Game, les utiliser directement
      // Sinon, il faudrait les charger via gameService.getGameById
      const gamesFromFavorites = favorites
        .map((fav) => fav.Game || fav.game || fav) // Gérer différentes structures
        .filter((game) => game.title); // Filtrer seulement les objets avec un titre

      setFavoriteGames(gamesFromFavorites);
      console.log("🎮 Jeux favoris extraits:", gamesFromFavorites);
    } else {
      setFavoriteGames([]);
    }
  }, [favorites, isAuthenticated]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      await createCollection({
        name: newCollectionName,
        description: newCollectionDescription,
        is_public: false, // Par défaut privée
      });
      setCreateDialogOpen(false);
      setNewCollectionName("");
      setNewCollectionDescription("");
    } catch (error) {
      console.error("❌ Erreur création collection:", error);
    }
  };

  const handleEditGame = (game, collectionGameData, collectionId) => {
    setEditingGame({
      ...game,
      collectionId,
      collectionGameData,
    });
    setEditGameData({
      status: collectionGameData.status || "",
      rating: collectionGameData.rating || 0,
      personal_notes: collectionGameData.personal_notes || "",
      play_time_hours: collectionGameData.play_time_hours || "",
      date_completed: collectionGameData.date_completed || "",
    });
    setEditDialogOpen(true);
  };

  const handleUpdateGame = async () => {
    if (!editingGame) return;

    try {
      await updateGameInCollection(
        editingGame.collectionId,
        editingGame.id,
        editGameData
      );
      setEditDialogOpen(false);
      setEditingGame(null);
    } catch (error) {
      console.error("❌ Erreur mise à jour jeu:", error);
    }
  };

  const statusOptions = [
    { value: "owned", label: "Possédé" },
    { value: "wishlist", label: "Liste de souhaits" },
    { value: "playing", label: "En cours" },
    { value: "completed", label: "Terminé" },
    { value: "dropped", label: "Abandonné" },
  ];

  const GameCard = ({
    game,
    showDetails = false,
    collectionGameData = null,
    collectionId = null,
  }) => (
    <Card sx={{ height: "100%" }}>
      <CardMedia
        component="img"
        height="140"
        image={game.cover_image_url || "https://via.placeholder.com/300x140"}
        alt={game.title}
        onError={(e) => {
          e.target.src =
            "https://via.placeholder.com/300x140?text=Image+Non+Disponible";
        }}
      />
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom>
          {game.title}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
          {game.platform && (
            <Chip label={game.platform} size="small" color="primary" />
          )}
          {game.genre && (
            <Chip label={game.genre} size="small" color="secondary" />
          )}
        </Box>

        {/* Afficher les détails de collection si disponibles */}
        {showDetails && collectionGameData && (
          <Box sx={{ mt: 2 }}>
            {collectionGameData.status && (
              <Chip
                label={collectionGameData.status}
                size="small"
                variant="outlined"
                sx={{ mb: 1, mr: 1 }}
              />
            )}
            {collectionGameData.rating && (
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Note:
                </Typography>
                <Rating
                  value={collectionGameData.rating}
                  max={10}
                  size="small"
                  readOnly
                />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {collectionGameData.rating}/10
                </Typography>
              </Box>
            )}
            {collectionGameData.play_time_hours && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Temps de jeu: {collectionGameData.play_time_hours}h
              </Typography>
            )}
          </Box>
        )}

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {game.description}
        </Typography>

        {/* Bouton d'édition pour les jeux dans les collections */}
        {showDetails && collectionGameData && collectionId && (
          <Box sx={{ mt: 2, textAlign: "right" }}>
            <Button
              size="small"
              startIcon={<Edit />}
              onClick={() =>
                handleEditGame(game, collectionGameData, collectionId)
              }
              variant="outlined"
            >
              Modifier
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Vous devez être connecté pour voir vos collections et favoris.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mes Collections
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez vos jeux favoris et collections personnalisées
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
        >
          <Tab
            icon={<Favorite />}
            label={`Favoris (${favoriteGames.length})`}
            iconPosition="start"
          />
          <Tab
            icon={<CollectionsIcon />}
            label={`Collections (${collections.length})`}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {currentTab === 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Mes Jeux Favoris
          </Typography>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : favoriteGames.length > 0 ? (
            <Grid container spacing={3}>
              {favoriteGames.map((game) => (
                <Grid item xs={12} sm={6} md={4} key={game.id}>
                  <GameCard game={game} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              Aucun jeu dans vos favoris. Ajoutez des jeux depuis la page "Jeux"
              !
            </Alert>
          )}
        </Box>
      )}

      {currentTab === 1 && (
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5">Mes Collections</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Nouvelle Collection
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : collections.length > 0 ? (
            <Box>
              {collections.map((collection) => {
                // Gérer les différentes structures de données que l'API peut retourner
                const games = collection.Games || collection.games || [];

                return (
                  <Box key={collection.id} sx={{ mb: 4 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {collection.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {collection.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {games.length} jeu(s) •{" "}
                          {collection.is_public ? "Public" : "Privé"}
                        </Typography>
                      </Box>
                      <Box>
                        <Button
                          startIcon={<Edit />}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          Modifier
                        </Button>
                        <Button
                          startIcon={<Delete />}
                          size="small"
                          color="error"
                        >
                          Supprimer
                        </Button>
                      </Box>
                    </Box>

                    {games.length > 0 ? (
                      <Grid container spacing={2}>
                        {games.map((game) => {
                          // game peut être l'objet Game directement ou via CollectionGame
                          const gameData = game.Game || game;
                          const collectionGameData =
                            game.CollectionGame || game;

                          return (
                            <Grid item xs={12} sm={6} md={4} key={gameData.id}>
                              <GameCard
                                game={gameData}
                                showDetails={true}
                                collectionGameData={collectionGameData}
                                collectionId={collection.id}
                              />
                            </Grid>
                          );
                        })}
                      </Grid>
                    ) : (
                      <Alert severity="info">
                        Cette collection est vide. Ajoutez des jeux depuis la
                        page "Jeux" !
                      </Alert>
                    )}
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Alert severity="info">
              Aucune collection créée. Créez votre première collection !
            </Alert>
          )}
        </Box>
      )}

      {/* Dialog pour créer une nouvelle collection */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Créer une nouvelle collection</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de la collection"
            fullWidth
            variant="outlined"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (optionnelle)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newCollectionDescription}
            onChange={(e) => setNewCollectionDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
          <Button
            onClick={handleCreateCollection}
            variant="contained"
            disabled={!newCollectionName.trim()}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour éditer un jeu dans une collection */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Modifier "{editingGame?.title}" dans la collection
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={editGameData.status}
              label="Statut"
              onChange={(e) =>
                setEditGameData((prev) => ({ ...prev, status: e.target.value }))
              }
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
              value={editGameData.rating}
              onChange={(event, newValue) =>
                setEditGameData((prev) => ({ ...prev, rating: newValue || 0 }))
              }
              max={10}
              precision={1}
            />
          </Box>

          <TextField
            label="Temps de jeu (heures)"
            type="number"
            fullWidth
            value={editGameData.play_time_hours}
            onChange={(e) =>
              setEditGameData((prev) => ({
                ...prev,
                play_time_hours: e.target.value,
              }))
            }
            sx={{ mb: 2 }}
            inputProps={{ min: 0, step: 0.5 }}
          />

          <TextField
            label="Date de completion"
            type="date"
            fullWidth
            value={editGameData.date_completed}
            onChange={(e) =>
              setEditGameData((prev) => ({
                ...prev,
                date_completed: e.target.value,
              }))
            }
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
            value={editGameData.personal_notes}
            onChange={(e) =>
              setEditGameData((prev) => ({
                ...prev,
                personal_notes: e.target.value,
              }))
            }
            placeholder="Vos impressions, commentaires..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleUpdateGame} variant="contained">
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Collections;
