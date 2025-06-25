import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { register, error, loading } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Nettoyer l'erreur du champ modifié
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = "Le nom d'utilisateur est requis";
    } else if (formData.username.length > 50) {
      errors.username =
        "Le nom d'utilisateur ne peut pas dépasser 50 caractères";
    }

    if (!formData.firstName.trim()) {
      errors.firstName = "Le prénom est requis";
    } else if (formData.firstName.length > 50) {
      errors.firstName = "Le prénom ne peut pas dépasser 50 caractères";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Le nom est requis";
    } else if (formData.lastName.length > 50) {
      errors.lastName = "Le nom ne peut pas dépasser 50 caractères";
    }

    if (!formData.email) {
      errors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }

    if (!formData.password) {
      errors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Veuillez confirmer le mot de passe";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("❌ Validation échouée:", formErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

      // Redirection vers la page de connexion après inscription réussie
      alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
      navigate("/connexion");
    } catch (err) {
      console.error("Erreur d'inscription:", err);

      let errorMessage = "Erreur lors de l'inscription";

      if (err.response?.status === 400) {
        if (err.response.data?.errors) {
          // Erreurs de validation spécifiques
          const validationErrors = err.response.data.errors;
          errorMessage = validationErrors.map((e) => e.msg).join(", ");
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.response?.status === 409) {
        errorMessage = "Cet email ou nom d'utilisateur est déjà utilisé";
      } else if (err.response?.status === 429) {
        errorMessage =
          "Trop de tentatives d'inscription. Veuillez patienter quelques minutes.";
      } else if (err.response?.status === 500) {
        errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setFormErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestRegister = async () => {
    const testData = {
      username: "testuser123",
      email: "test123@example.com",
      password: "123456",
      first_name: "Test",
      last_name: "User",
    };

    try {
      console.log("🧪 Test d'inscription avec données fixes:", testData);
      const result = await register(testData);
      console.log("✅ Test d'inscription réussi:", result);
      alert("Test d'inscription réussi !");
    } catch (err) {
      console.error("❌ Test d'inscription échoué:", err);
      alert("Test d'inscription échoué - voir console");
    }
  };

  if (loading) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        py: { xs: 4, sm: 6, md: 8 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Paper
        elevation={isMobile ? 0 : 3}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: { xs: 0, sm: 2 },
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "1.8rem", sm: "2.125rem" },
            }}
          >
            Inscription
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Créez votre compte GameCollect
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {formErrors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {formErrors.general}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Nom d'utilisateur"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={!!formErrors.username}
            helperText={formErrors.username}
            margin="normal"
            autoComplete="username"
            autoFocus
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Prénom"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
              autoComplete="given-name"
            />
            <TextField
              fullWidth
              label="Nom"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
              autoComplete="family-name"
            />
          </Box>

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            margin="normal"
            autoComplete="email"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Mot de passe"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            margin="normal"
            autoComplete="new-password"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Confirmer le mot de passe"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
            margin="normal"
            autoComplete="new-password"
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{
              py: 1.5,
              mb: 3,
              fontSize: "1.1rem",
              borderRadius: 2,
            }}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Inscription...
              </>
            ) : (
              "S'inscrire"
            )}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Vous avez déjà un compte ?{" "}
              <Link
                component={RouterLink}
                to="/connexion"
                sx={{ fontWeight: "medium" }}
              >
                Se connecter
              </Link>
            </Typography>

            {/* Bouton de test - à supprimer une fois le problème résolu */}
            <Button
              onClick={handleTestRegister}
              variant="outlined"
              size="small"
              sx={{ mt: 2 }}
            >
              🧪 Test d'inscription
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
