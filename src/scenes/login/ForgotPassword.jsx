import { Alert, Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function ForgotPassword() {
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
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Password assistance</Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          Admin password recovery is not currently exposed by the backend. Contact your platform owner to reset your access.
        </Alert>
        <Button component={Link} to="/" variant="contained" fullWidth>
          Back to sign in
        </Button>
      </Box>
    </Box>
  );
}
