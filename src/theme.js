import { createTheme } from "@mui/material/styles";
import { createContext, useMemo, useState } from "react";

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useMode = () => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem("pmf-admin-theme");
    return savedMode === "dark" ? "dark" : "light";
  });

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((currentMode) => {
          const nextMode = currentMode === "light" ? "dark" : "light";
          localStorage.setItem("pmf-admin-theme", nextMode);
          return nextMode;
        });
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#0798b5", light: "#42c8d1", dark: "#08758d" },
          secondary: { main: "#37c7b1" },
          background: {
            default: mode === "dark" ? "#101a25" : "#f4f7fa",
            paper: mode === "dark" ? "#172431" : "#ffffff",
          },
          text: {
            primary: mode === "dark" ? "#eef5f9" : "#182b3a",
            secondary: mode === "dark" ? "#a5b4c1" : "#738495",
          },
          divider: mode === "dark" ? "rgba(203, 222, 235, 0.12)" : "#e8edf2",
        },
        typography: {
          fontFamily: '"Inter", "Segoe UI", Arial, sans-serif',
          h4: { fontWeight: 750, letterSpacing: "-0.035em" },
          h5: { fontWeight: 700, letterSpacing: "-0.025em" },
          h6: { fontWeight: 700 },
          button: { textTransform: "capitalize", fontWeight: 650 },
        },
        shape: { borderRadius: 12 },
        components: {
          MuiButton: {
            styleOverrides: {
              root: { borderRadius: 10, paddingInline: 18, cursor: "pointer" },
              containedPrimary: {
                background: "linear-gradient(110deg, #0798b5, #35c7b1)",
                boxShadow: "0 6px 16px rgba(7, 152, 181, 0.18)",
              },
            },
          },
          MuiPaper: { styleOverrides: { rounded: { borderRadius: 16 } } },
          MuiTextField: { defaultProps: { size: "small" } },
        },
      }),
    [mode]
  );

  return [theme, colorMode];
};
