import { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AdminPage from "../dashboard/AdminPage";

export default function AdminShell() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("admin-sidebar-collapsed") === "true"
  );

  const toggleSidebar = () => {
    setSidebarCollapsed((collapsed) => {
      const nextCollapsed = !collapsed;
      localStorage.setItem("admin-sidebar-collapsed", String(nextCollapsed));
      return nextCollapsed;
    });
  };

  return (
    <Box className={`admin-app theme-${theme.palette.mode}${sidebarCollapsed ? " sidebar-collapsed" : ""}`}>
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isMobile={isMobile}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={toggleSidebar}
      />
      <Box component="main" className="admin-main">
        <Topbar onMenuClick={() => setMobileOpen(true)} isMobile={isMobile} />
        <Box className="admin-page-wrap">
          <Routes>
            <Route path="dd" element={<AdminPage page="dashboard" />} />
            <Route path="dashboard" element={<Navigate to="/dd" replace />} />
            <Route path="blog" element={<AdminPage page="blogs" />} />
            <Route path="payments" element={<AdminPage page="payments" />} />
            <Route path="feedback" element={<AdminPage page="feedback" />} />
            <Route path="coupons" element={<AdminPage page="coupons" />} />
            <Route path="users" element={<AdminPage page="users" />} />
            <Route path="videos" element={<AdminPage page="videos" />} />
            <Route path="contactusemail" element={<AdminPage page="contacts" />} />
            <Route path="*" element={<Navigate to="/dd" replace />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}
