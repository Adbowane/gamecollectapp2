import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  CssBaseline,
  Box,
} from "@mui/material";
import Navbar from "./components/Layout/Navbar";
import Home from "./pages/Home";
import Games from "./pages/Games";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Collections from "./pages/Collections";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { GamesProvider } from "./contexts/GamesContext";
import { useThemeMode } from "./contexts/ThemeContext";

// Composant qui gère le thème Material-UI
const ThemedApp = () => {
  const { mode } = useThemeMode();

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "light" ? "#2196f3" : "#90caf9",
      },
      secondary: {
        main: mode === "light" ? "#f50057" : "#f73378",
      },
      background: {
        default: mode === "light" ? "#f5f5f5" : "#121212",
        paper: mode === "light" ? "#ffffff" : "#1e1e1e",
      },
    },
    components: {
      MuiContainer: {
        styleOverrides: {
          root: {
            paddingLeft: {
              xs: "16px",
              sm: "24px",
            },
            paddingRight: {
              xs: "16px",
              sm: "24px",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "light" ? "#ffffff" : "#1e1e1e",
            transition: "all 0.3s ease-in-out",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: "8px",
          },
        },
      },
    },
    shape: {
      borderRadius: 8,
    },
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
    },
  });

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <GamesProvider>
          <Router>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                width: "100%",
                bgcolor: "background.default",
                color: "text.primary",
                transition: "all 0.3s ease-in-out",
              }}
            >
              <Navbar />
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  width: "100%",
                  overflowX: "hidden",
                }}
              >
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/jeux" element={<Games />} />
                  <Route path="/connexion" element={<Login />} />
                  <Route path="/inscription" element={<Register />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/ma-collection" element={<Collections />} />
                  <Route path="/wishlist" element={<Collections />} />
                </Routes>
              </Box>
            </Box>
          </Router>
        </GamesProvider>
      </AuthProvider>
    </MuiThemeProvider>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
};

export default App;
