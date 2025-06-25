import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Container,
  Divider,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import ThemeSwitch from "../ThemeSwitch/ThemeSwitch";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Debug de l'état d'authentification
  console.log("🔍 Navbar - État auth:", {
    user: user?.username || "null",
    isAuthenticated,
    userObject: user,
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
    navigate("/");
  };

  const publicMenuItems = [{ text: "Jeux", path: "/jeux" }];

  const authenticatedMenuItems = [
    { text: "Jeux", path: "/jeux" },
    { text: "Ma Collection", path: "/ma-collection" },
    { text: "Wishlist", path: "/wishlist" },
  ];

  const menuItems = isAuthenticated ? authenticatedMenuItems : publicMenuItems;

  // Menu mobile drawer
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2, color: "primary.main" }}>
        GameCollect
      </Typography>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Button
              component={Link}
              to={item.path}
              fullWidth
              sx={{
                color:
                  location.pathname === item.path
                    ? "primary.main"
                    : "text.primary",
                fontWeight: location.pathname === item.path ? "bold" : "normal",
                justifyContent: "flex-start",
                px: 2,
                py: 1,
              }}
            >
              <ListItemText primary={item.text} />
            </Button>
          </ListItem>
        ))}
        <Divider sx={{ my: 2 }} />
        {isAuthenticated ? (
          <>
            <ListItem>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  px: 2,
                }}
              >
                <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                  {user?.firstName?.[0]?.toUpperCase()}
                </Avatar>
                <Typography variant="body2">
                  {user?.firstName} {user?.lastName}
                </Typography>
              </Box>
            </ListItem>
            <ListItem disablePadding>
              <Button
                onClick={handleLogout}
                fullWidth
                startIcon={<LogoutIcon />}
                sx={{
                  justifyContent: "flex-start",
                  px: 2,
                  py: 1,
                  color: "text.primary",
                }}
              >
                <ListItemText primary="Déconnexion" />
              </Button>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <Button
                component={Link}
                to="/connexion"
                fullWidth
                sx={{
                  justifyContent: "flex-start",
                  px: 2,
                  py: 1,
                  color: "primary.main",
                }}
              >
                <ListItemText primary="Connexion" />
              </Button>
            </ListItem>
            <ListItem disablePadding>
              <Button
                component={Link}
                to="/inscription"
                fullWidth
                variant="contained"
                sx={{
                  mx: 2,
                  my: 1,
                }}
              >
                S'inscrire
              </Button>
            </ListItem>
          </>
        )}
        <Divider sx={{ my: 2 }} />
        <ListItem>
          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <ThemeSwitch />
          </Box>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "background.paper",
        boxShadow: 2,
        width: "100%",
      }}
    >
      <Container maxWidth={false}>
        <Toolbar
          sx={{
            justifyContent: "space-between",
            width: "100%",
            px: { xs: 1, sm: 2 },
            minHeight: { xs: 56, sm: 64 },
          }}
        >
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              color: "primary.main",
              fontWeight: "bold",
              fontSize: { xs: "1.2rem", sm: "1.5rem" },
              "&:hover": {
                color: "primary.dark",
              },
              flexShrink: 0,
            }}
          >
            GameCollect
          </Typography>

          {isMobile ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ThemeSwitch />
              <IconButton
                color="inherit"
                aria-label="ouvrir menu"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ color: "text.primary" }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Menu navigation */}
              <Box sx={{ display: "flex", gap: 1 }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.text}
                    component={Link}
                    to={item.path}
                    sx={{
                      color:
                        location.pathname === item.path
                          ? "primary.main"
                          : "text.primary",
                      fontWeight:
                        location.pathname === item.path ? "bold" : "normal",
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>

              <ThemeSwitch />

              {/* Authentification */}
              {isAuthenticated ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton
                    onClick={handleUserMenuOpen}
                    sx={{ p: 0 }}
                    aria-label="menu utilisateur"
                  >
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {user?.firstName?.[0]?.toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleUserMenuClose}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                  >
                    <MenuItem disabled>
                      <Typography variant="body2">
                        {user?.firstName} {user?.lastName}
                      </Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon sx={{ mr: 1 }} />
                      Déconnexion
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    component={Link}
                    to="/connexion"
                    sx={{
                      color: "text.primary",
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    Connexion
                  </Button>
                  <Button
                    component={Link}
                    to="/inscription"
                    variant="contained"
                    size="medium"
                  >
                    S'inscrire
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Toolbar>
      </Container>

      {/* Menu mobile drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
