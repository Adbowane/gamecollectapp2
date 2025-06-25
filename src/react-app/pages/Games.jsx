import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import GameCard from "../components/GameCard/GameCard";
import PullToRefresh from "../components/PullToRefresh/PullToRefresh";
import { gameService } from "../services/api";

const Games = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [platform, setPlatform] = useState("all");
  const [genre, setGenre] = useState("all");

  // Charger les jeux depuis l'API
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        console.log("🎮 Chargement des jeux...");

        const response = await gameService.getAllGames();
        console.log("📦 Réponse complète:", response);
        console.log("📋 Données reçues:", response.data);
        console.log(
          "📊 Type de données:",
          typeof response.data,
          Array.isArray(response.data)
        );

        // Vérifier si les données sont dans un format attendu
        let gamesData = response.data;

        // Si les données sont encapsulées dans un objet (ex: {games: [...], total: 10})
        if (
          gamesData &&
          typeof gamesData === "object" &&
          !Array.isArray(gamesData)
        ) {
          if (gamesData.games && Array.isArray(gamesData.games)) {
            gamesData = gamesData.games;
            console.log("✅ Données extraites du wrapper:", gamesData);
          } else if (gamesData.data && Array.isArray(gamesData.data)) {
            gamesData = gamesData.data;
            console.log("✅ Données extraites de data:", gamesData);
          }
        }

        // Vérifier que nous avons bien un tableau
        if (!Array.isArray(gamesData)) {
          console.warn("⚠️ Les données ne sont pas un tableau:", gamesData);
          gamesData = [];
        }

        console.log(`✅ ${gamesData.length} jeu(x) chargé(s):`, gamesData);

        setGames(gamesData);
        setError(null);
      } catch (err) {
        console.error("❌ Erreur lors du chargement des jeux:", err);
        setError("Impossible de charger les jeux depuis l'API");
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  // Filtrer les jeux en fonction des critères
  const filteredGames = games.filter((game) => {
    console.log("🔍 Filtrage du jeu:", game);

    const title = game.title || game.name || "";
    const matchesSearch = title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPlatform = platform === "all" || game.platform === platform;
    const matchesGenre = genre === "all" || game.genre === genre;

    const matches = matchesSearch && matchesPlatform && matchesGenre;
    console.log(
      `   - Titre: "${title}", Recherche: ${matchesSearch}, Plateforme: ${matchesPlatform}, Genre: ${matchesGenre}, Résultat: ${matches}`
    );

    return matches;
  });

  console.log(
    `📊 Affichage: ${filteredGames.length} jeu(x) après filtrage sur ${games.length} total(aux)`
  );

  const handleRefresh = async () => {
    try {
      console.log("🔄 Rafraîchissement des jeux...");
      const response = await gameService.getAllGames();

      let gamesData = response.data;
      if (
        gamesData &&
        typeof gamesData === "object" &&
        !Array.isArray(gamesData)
      ) {
        if (gamesData.games && Array.isArray(gamesData.games)) {
          gamesData = gamesData.games;
        } else if (gamesData.data && Array.isArray(gamesData.data)) {
          gamesData = gamesData.data;
        }
      }

      if (!Array.isArray(gamesData)) {
        gamesData = [];
      }

      setGames(gamesData);
      setSnackbarOpen(true);
      setError(null);
      console.log("✅ Jeux rafraîchis:", gamesData);
    } catch (err) {
      console.error("❌ Erreur lors du rafraîchissement:", err);
      setError("Impossible de rafraîchir les données");
    }
  };

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 2, sm: 3, md: 4 },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress size={60} />
        <Typography sx={{ ml: 2 }}>Chargement des jeux...</Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Typography
        variant={isMobile ? "h4" : "h3"}
        component="h1"
        gutterBottom
        sx={{
          fontSize: {
            xs: "1.75rem",
            sm: "2.25rem",
            md: "3rem",
          },
          fontWeight: "bold",
          mb: { xs: 2, sm: 3, md: 4 },
        }}
      >
        Catalogue de Jeux
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!error && games.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Aucun jeu trouvé. Vérifiez que votre API backend est démarrée et
          retourne des données.
        </Alert>
      )}

      {games.length > 0 && (
        <Alert severity="success" sx={{ mb: 3 }}>
          ✅ {games.length} jeu(x) chargé(s) depuis l'API
        </Alert>
      )}

      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: { xs: 3, sm: 4 },
          backgroundColor: "background.paper",
        }}
      >
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} sm={12} md={4}>
            <TextField
              fullWidth
              label="Rechercher un jeu"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "primary.main",
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Plateforme</InputLabel>
              <Select
                value={platform}
                label="Plateforme"
                onChange={(e) => setPlatform(e.target.value)}
              >
                <MenuItem value="all">Toutes les plateformes</MenuItem>
                <MenuItem value="Nintendo Switch">Nintendo Switch</MenuItem>
                <MenuItem value="PS5">PS5</MenuItem>
                <MenuItem value="PC">PC</MenuItem>
                <MenuItem value="Xbox">Xbox</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Genre</InputLabel>
              <Select
                value={genre}
                label="Genre"
                onChange={(e) => setGenre(e.target.value)}
              >
                <MenuItem value="all">Tous les genres</MenuItem>
                <MenuItem value="Action">Action</MenuItem>
                <MenuItem value="RPG">RPG</MenuItem>
                <MenuItem value="Action-RPG">Action-RPG</MenuItem>
                <MenuItem value="Aventure">Aventure</MenuItem>
                <MenuItem value="Sport">Sport</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Informations de debug */}
      <Box sx={{ mb: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          🐛 Debug: {games.length} jeux total | {filteredGames.length} après
          filtrage | Recherche: "{searchTerm}" | Plateforme: {platform} | Genre:{" "}
          {genre}
        </Typography>
      </Box>

      <PullToRefresh onRefresh={handleRefresh}>
        <Grid
          container
          spacing={{ xs: 2, sm: 3, md: 4 }}
          sx={{
            mt: { xs: 1, sm: 2 },
          }}
        >
          {filteredGames.length > 0 ? (
            filteredGames.map((game, index) => {
              console.log(`🎯 Rendu du jeu ${index + 1}:`, game);
              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={game.id || game._id || index}
                  sx={{
                    display: "flex",
                  }}
                >
                  <GameCard game={game} />
                </Grid>
              );
            })
          ) : !loading && !error ? (
            <Grid item xs={12}>
              <Typography
                variant="h6"
                textAlign="center"
                color="text.secondary"
              >
                Aucun jeu ne correspond aux critères de recherche.
                {games.length > 0 && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    ({games.length} jeu(x) disponible(s) au total)
                  </Typography>
                )}
              </Typography>
            </Grid>
          ) : null}
        </Grid>
      </PullToRefresh>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Liste des jeux mise à jour !
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Games;
