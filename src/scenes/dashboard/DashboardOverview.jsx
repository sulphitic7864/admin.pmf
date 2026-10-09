import { useCallback, useEffect, useState } from "react";
import { CheckCircleOutline, MovieOutlined, RefreshRounded } from "@mui/icons-material";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { api, getApiErrorMessage } from "../../api/client";
import { dashboardItems, normalizeRows, resourceConfig } from "./resourceConfig";
import { MetricCard } from "./ResourceComponents";

export default function DashboardOverview() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    const values = await Promise.all(
      Object.entries(resourceConfig).map(async ([key, config]) => {
        try {
          const response = await api.get(config.endpoint);
          return { key, count: normalizeRows(response.data, config.collectionProperty).length };
        } catch (requestError) {
          if (requestError.response?.status === 404) return { key, count: 0 };
          return { key, count: null, error: getApiErrorMessage(requestError) };
        }
      })
    );
    setCounts(Object.fromEntries(values.map(({ key, count }) => [key, count])));
    const firstFailure = values.find(({ error: message }) => message)?.error;
    if (firstFailure) toast.error(firstFailure);
    setLoading(false);
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  return (
    <Box>
      <Box className="page-heading">
        <Box>
          <Typography className="page-eyebrow">OVERVIEW</Typography>
          <Typography variant="h4" className="page-title">Good to see you!</Typography>
          <Typography className="page-subtitle">Here’s what’s happening across your platform today.</Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshRounded />}
          onClick={loadDashboard}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Box className="welcome-panel">
        <Box className="welcome-copy">
          <Typography className="welcome-kicker">PMF ADMIN CONSOLE</Typography>
          <Typography variant="h5">Your creative platform, at a glance.</Typography>
          <Typography>Manage your community, content, and customer activity from one place.</Typography>
        </Box>
        <Box className="welcome-emblem" aria-hidden="true">
          <MovieOutlined />
        </Box>
      </Box>

      <Box className="section-heading">
        <Box>
          <Typography variant="h6">Platform overview</Typography>
          <Typography variant="body2">A live snapshot of your PMF workspace</Typography>
        </Box>
        {loading && <CircularProgress size={20} />}
      </Box>
      <Box className="metrics-grid">
        {dashboardItems.map((item) => (
          <MetricCard key={item.key} item={item} count={counts[item.key]} />
        ))}
      </Box>
      <Box className="dashboard-note">
        <CheckCircleOutline />
        <Typography>Use the navigation to manage content, payments, users, and incoming messages.</Typography>
      </Box>
    </Box>
  );
}