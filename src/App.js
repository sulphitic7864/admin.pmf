import { CssBaseline, ThemeProvider } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import { useMode, ColorModeContext } from "./theme";
import PrivateRoute from "./PrivateRoutes";
import Login from "./scenes/login";
import ForgotPassword from "./scenes/login/ForgotPassword";
import AdminShell from "./scenes/global/AdminShell";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [theme, colorMode] = useMode();
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <AdminShell />
              </PrivateRoute>
            }
          />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          theme={theme.palette.mode}
          toastClassName="pmf-toast"
        />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
