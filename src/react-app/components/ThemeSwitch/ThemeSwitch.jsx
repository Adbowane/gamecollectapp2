import React from "react";
import { IconButton, Box, useTheme } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useThemeMode } from "../../contexts/ThemeContext";
import { motion as Motion } from "framer-motion";

const ThemeSwitch = () => {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "30px",
        padding: "4px",
        backgroundColor: theme.palette.background.default,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Motion.div
        initial={false}
        animate={{
          scale: [0.9, 1.1, 1],
          rotate: mode === "light" ? 0 : 180,
        }}
        transition={{ duration: 0.3 }}
      >
        <IconButton
          onClick={toggleMode}
          color="primary"
          sx={{
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          {mode === "light" ? (
            <Brightness7 sx={{ color: theme.palette.warning.main }} />
          ) : (
            <Brightness4 sx={{ color: theme.palette.primary.main }} />
          )}
        </IconButton>
      </Motion.div>
    </Box>
  );
};

export default ThemeSwitch;
