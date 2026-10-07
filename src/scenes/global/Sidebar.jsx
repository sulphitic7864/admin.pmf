import {
  ArticleOutlined,
  DashboardOutlined,
  EmailOutlined,
  FeedbackOutlined,
  LocalOfferOutlined,
  LogoutOutlined,
  MovieOutlined,
  PaymentsOutlined,
  PeopleAltOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import CloseRounded from "@mui/icons-material/CloseRounded";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const navigation = [
  { label: "Dashboard", path: "/dd", icon: DashboardOutlined },
  { label: "Blogs", path: "/blog", icon: ArticleOutlined },
  { label: "Payments", path: "/payments", icon: PaymentsOutlined },
  { label: "Feedbacks", path: "/feedback", icon: FeedbackOutlined },
  { label: "Coupons", path: "/coupons", icon: LocalOfferOutlined },
  { label: "Users", path: "/users", icon: PeopleAltOutlined },
  { label: "All videos", path: "/videos", icon: MovieOutlined },
  { label: "Contact inbox", path: "/contactusemail", icon: EmailOutlined },
];

export default function Sidebar({ mobileOpen, onClose, isMobile }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    onClose();
    navigate("/", { replace: true });
  };

  const drawerContent = (
    <Box className="sidebar-content">
      <Box className="brand-row">
        <img className="brand-logo" src={logo} alt="Place My Films" />
        <Box className="brand-copy">
          <Typography className="brand-name">Place My Films</Typography>
          <Typography className="brand-caption">ADMIN CONSOLE</Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={onClose} aria-label="Close navigation" size="small">
            <CloseRounded />
          </IconButton>
        )}
      </Box>

      <Typography className="sidebar-section-label">WORKSPACE</Typography>
      <List disablePadding className="sidebar-nav">
        {navigation.map(({ label, path, icon: Icon }) => (
          <ListItemButton
            key={path}
            component={NavLink}
            to={path}
            onClick={onClose}
            className="sidebar-link"
            sx={{
              "&.active": {
                color: theme.palette.primary.main,
                backgroundColor: theme.palette.action.selected,
                "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
              },
            }}
          >
            <ListItemIcon><Icon /></ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>

      <Box className="sidebar-footer">
        <Button
          className="sidebar-logout"
          onClick={logout}
          startIcon={<LogoutOutlined />}
          fullWidth
        >
          Log out
        </Button>
      </Box>
    </Box>
  );

  return isMobile ? (
    <Drawer
      open={mobileOpen}
      onClose={onClose}
      className="admin-drawer"
      PaperProps={{ className: "admin-sidebar-paper" }}
    >
      {drawerContent}
    </Drawer>
  ) : (
    <Box component="aside" className="admin-sidebar">
      {drawerContent}
    </Box>
  );
}
