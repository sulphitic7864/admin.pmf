import {
  ChevronLeftRounded,
  ChevronRightRounded,
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
  Tooltip,
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

export default function Sidebar({
  mobileOpen,
  onClose,
  isMobile,
  collapsed,
  onToggleCollapsed,
}) {
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
        {!isMobile && (
          <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"} placement="right">
            <IconButton
              className="sidebar-toggle"
              onClick={onToggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              aria-controls="admin-sidebar-navigation"
              size="small"
            >
              {collapsed ? <ChevronRightRounded /> : <ChevronLeftRounded />}
            </IconButton>
          </Tooltip>
        )}
        {isMobile && (
          <IconButton onClick={onClose} aria-label="Close navigation" size="small">
            <CloseRounded />
          </IconButton>
        )}
      </Box>

      <Typography className="sidebar-section-label">WORKSPACE</Typography>
      <List disablePadding className="sidebar-nav" id="admin-sidebar-navigation">
        {navigation.map(({ label, path, icon: Icon }) => (
          <Tooltip
            key={path}
            title={collapsed && !isMobile ? label : ""}
            placement="right"
          >
            <ListItemButton
              component={NavLink}
              to={path}
              onClick={onClose}
              className="sidebar-link"
              aria-label={label}
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
          </Tooltip>
        ))}
      </List>

      <Box className="sidebar-footer">
        <Tooltip title={collapsed && !isMobile ? "Log out" : ""} placement="right">
          <Button
            className="sidebar-logout"
            onClick={logout}
            startIcon={<LogoutOutlined />}
            aria-label="Log out"
            fullWidth
          >
            {collapsed && !isMobile ? null : "Log out"}
          </Button>
        </Tooltip>
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
