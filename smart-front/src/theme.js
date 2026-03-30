import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#1565C0" },
    secondary: { main: "#26A69A" },
  },
  typography: {
    h1: { fontSize: 28, fontWeight: 700 },
    h2: { fontSize: 22, fontWeight: 600 },
    body1: { fontSize: 16 },
  }
});

export default theme;
