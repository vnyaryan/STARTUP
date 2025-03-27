import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#FFD700", // Gold
    },
    secondary: {
      main: "#8B0000", // Dark Red
    },
    background: {
      default: "#121212", // Dark Mode Background
      paper: "#1E1E1E",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#AAAAAA",
    },
  },
  typography: {
    fontFamily: "Poppins, sans-serif",
    h1: { fontWeight: 700, fontSize: "2.5rem" },
    h2: { fontWeight: 600, fontSize: "2rem" },
    h3: { fontWeight: 500, fontSize: "1.75rem" },
    button: { textTransform: "none" },
  },
});

export default theme;
