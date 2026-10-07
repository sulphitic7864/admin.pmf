import { useContext, useEffect, useState } from "react";
import {
  AccountCircleOutlined,
  DarkModeOutlined,
  LightModeOutlined,
  MenuRounded,
  PasswordOutlined,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { ColorModeContext } from "../../theme";
import { jwtDecode } from "jwt-decode";
import { API_ENDPOINTS } from "../../api/endpoints";
import { api, getApiErrorMessage } from "../../api/client";
import { toast } from "react-toastify";

export default function Topbar({ onMenuClick, isMobile }) {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const [isDark, setIsDark] = useState(theme.palette.mode === "dark");
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [dialog, setDialog] = useState("");
  const [adminId, setAdminId] = useState("");
  const [profile, setProfile] = useState({ name: "", email: "", image: "" });
  const [profileDraft, setProfileDraft] = useState({ name: "", email: "" });
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      setAdminId(decoded.AdminId ?? "");
    } catch {
      toast.error("The admin session is invalid. Please sign in again.");
    }
  }, []);

  useEffect(() => {
    if (!adminId) return;
    api.get(API_ENDPOINTS.admin.profile)
      .then(({ data }) => {
        const admins = Array.isArray(data) ? data : data?.result ?? [];
        const currentAdmin = admins.find((admin) => String(admin.id) === String(adminId));
        if (!currentAdmin) {
          toast.error("Your admin profile could not be found.");
          return;
        }
        setProfile({
          name: currentAdmin.name ?? "",
          email: currentAdmin.email ?? "",
          image: currentAdmin.image ?? "",
        });
      })
      .catch((error) => toast.error(getApiErrorMessage(error)));
  }, [adminId]);

  const toggleTheme = () => {
    colorMode.toggleColorMode();
    setIsDark((current) => !current);
  };

  const closeDialog = () => {
    setDialog("");
    setOldPassword("");
    setNewPassword("");
    setProfileDraft({ name: profile.name, email: profile.email });
  };

  const openDialog = (name) => {
    setProfileAnchor(null);
    setProfileDraft({ name: profile.name, email: profile.email });
    setDialog(name);
  };

  const saveProfile = async () => {
    if (!profileDraft.name.trim() || !profileDraft.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setBusy(true);
    try {
      await api.put(API_ENDPOINTS.admin.updateDetails(adminId), {
        name: profileDraft.name.trim(),
        email: profileDraft.email.trim(),
      });
      setProfile((current) => ({ ...current, ...profileDraft }));
      toast.success("Admin details updated successfully.");
      closeDialog();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const savePassword = async () => {
    if (!oldPassword || newPassword.length < 8) {
      toast.error("Enter your current password and a new password of at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      await api.put(API_ENDPOINTS.admin.changePassword(adminId), { oldPassword, newPassword });
      toast.success("Password changed successfully.");
      closeDialog();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box component="header" className="admin-topbar">
      <Box className="topbar-heading">
        {isMobile && (
          <IconButton onClick={onMenuClick} aria-label="Open navigation">
            <MenuRounded />
          </IconButton>
        )}
        <Box>
          <Typography className="topbar-eyebrow">PLACE MY FILMS</Typography>
          <Typography className="topbar-title">Admin workspace</Typography>
        </Box>
      </Box>
      <Box className="topbar-actions">
        <Tooltip title={`Switch to ${isDark ? "light" : "dark"} mode`}>
          <IconButton onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? <LightModeOutlined /> : <DarkModeOutlined />}
          </IconButton>
        </Tooltip>
        <Box className="topbar-divider" />
        <IconButton
          aria-label="Open account menu"
          onClick={(event) => setProfileAnchor(event.currentTarget)}
          sx={{ p: 0.25 }}
        >
          <Avatar src={profile.image || undefined} className="admin-avatar">
            {profile.name ? profile.name.slice(0, 1).toUpperCase() : "A"}
          </Avatar>
        </IconButton>
        {!isMobile && (
          <Box className="topbar-user">
            <Typography variant="body2">{profile.name || "Administrator"}</Typography>
            <Typography variant="caption">{profile.email || "PMF team"}</Typography>
          </Box>
        )}
      </Box>
      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
      >
        <MenuItem onClick={() => openDialog("profile")}>
          <AccountCircleOutlined fontSize="small" sx={{ mr: 1.25 }} /> Edit details
        </MenuItem>
        <MenuItem onClick={() => openDialog("password")}>
          <PasswordOutlined fontSize="small" sx={{ mr: 1.25 }} /> Change password
        </MenuItem>
      </Menu>
      <Dialog open={Boolean(dialog)} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle>{dialog === "profile" ? "Edit admin details" : "Change password"}</DialogTitle>
        <DialogContent>
          {dialog === "profile" ? (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Name"
                value={profileDraft.name}
                onChange={(event) => setProfileDraft((current) => ({ ...current, name: event.target.value }))}
                fullWidth
              />
              <TextField
                label="Email address"
                type="email"
                value={profileDraft.email}
                onChange={(event) => setProfileDraft((current) => ({ ...current, email: event.target.value }))}
                fullWidth
              />
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Current password"
                type="password"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
                autoComplete="current-password"
                fullWidth
              />
              <TextField
                label="New password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                helperText="Use at least 8 characters."
                fullWidth
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} disabled={busy}>Cancel</Button>
          <Button
            onClick={dialog === "profile" ? saveProfile : savePassword}
            variant="contained"
            disabled={busy}
          >
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
