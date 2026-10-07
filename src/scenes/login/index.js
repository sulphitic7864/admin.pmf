import { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../api/endpoints";
import { api, getApiErrorMessage } from "../../api/client";
import logo from "../../assets/logo.png";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submitLogin = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Enter your email address and password to continue.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(API_ENDPOINTS.admin.login, {
        email: email.trim(),
        password,
      });
      const result = response.data?.result;
      if (!result?.status || !result?.token) {
        toast.error(response.data?.message || "The server did not return a valid sign-in session.");
        return;
      }
      localStorage.setItem("token", result.token);
      localStorage.setItem("isAuthenticated", "true");
      navigate("/dd", { replace: true });
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-page">
      <Box className="login-card">
        <Box className="login-brand">
          <img className="brand-logo" src={logo} alt="Place My Films" />
          <Box>
            <Typography className="brand-name">Place My Films</Typography>
            <Typography className="brand-caption">ADMIN CONSOLE</Typography>
          </Box>
        </Box>
        <Box className="login-heading">
          <Typography variant="h4">Welcome back</Typography>
          <Typography>Sign in to manage your creative platform.</Typography>
        </Box>
        <Box component="form" onSubmit={submitLogin} className="login-form">
          <TextField
            autoComplete="username"
            autoFocus
            fullWidth
            label="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            autoComplete="current-password"
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((current) => !current)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box className="login-forgot">
            <Link to="/forgotPassword">Forgot password?</Link>
          </Box>
          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </Box>
        <Typography className="login-footer">Secure access for the PMF team</Typography>
      </Box>
    </Box>
  );
}
