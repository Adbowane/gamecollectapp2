import React from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  useTheme,
  useMediaQuery,
  Grid,
} from "@mui/material";
import { SportsEsports, Favorite, PlaylistAdd } from "@mui/icons-material";

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const features = [
    {
      icon: <SportsEsports sx={{ fontSize: { xs: 40, sm: 50, md: 60 } }} />,
      title: "Gérez votre collection",
      description:
        "Cataloguez tous vos jeux vidéo et gardez une trace de votre collection.",
    },
    {
      icon: <Favorite sx={{ fontSize: { xs: 40, sm: 50, md: 60 } }} />,
      title: "Créez votre wishlist",
      description:
        "Ajoutez les jeux que vous souhaitez acquérir à votre liste de souhaits.",
    },
    {
      icon: <PlaylistAdd sx={{ fontSize: { xs: 40, sm: 50, md: 60 } }} />,
      title: "Suivez vos parties",
      description:
        "Marquez les jeux auxquels vous avez joué et ceux que vous voulez découvrir.",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100%",
        width: "100%",
        py: { xs: 4, sm: 6, md: 8 },
        backgroundColor: "background.default",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          height: "100%",
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            mb: { xs: 4, sm: 6, md: 8 },
          }}
        >
          <Typography
            variant={isMobile ? "h3" : "h2"}
            component="h1"
            gutterBottom
            sx={{
              fontSize: {
                xs: "2rem",
                sm: "2.75rem",
                md: "3.75rem",
              },
              fontWeight: "bold",
              color: "text.primary",
              mb: { xs: 2, sm: 3 },
            }}
          >
            Bienvenue sur GameCollect
          </Typography>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{
              fontSize: {
                xs: "1rem",
                sm: "1.25rem",
                md: "1.5rem",
              },
              color: "text.secondary",
              maxWidth: "800px",
              mx: "auto",
              px: { xs: 2, sm: 0 },
            }}
          >
            Votre gestionnaire personnel de collection de jeux vidéo
          </Typography>
        </Box>

        <Grid
          container
          spacing={{ xs: 2, sm: 3, md: 4 }}
          sx={{ mt: { xs: 1, sm: 2 } }}
        >
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition:
                    "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 6,
                  },
                  borderRadius: 2,
                }}
                elevation={3}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    height: "100%",
                    p: { xs: 2, sm: 3 },
                  }}
                >
                  <Box
                    sx={{
                      color: "primary.main",
                      mb: { xs: 2, sm: 3 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom
                    sx={{
                      fontSize: {
                        xs: "1.25rem",
                        sm: "1.5rem",
                        md: "1.75rem",
                      },
                      fontWeight: "bold",
                      mb: 2,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      fontSize: {
                        xs: "0.875rem",
                        sm: "1rem",
                      },
                      flexGrow: 1,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
