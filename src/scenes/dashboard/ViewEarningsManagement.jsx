import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../api/endpoints";
import { api, getApiErrorMessage } from "../../api/client";

const formatCurrency = (value) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
}).format(Number(value || 0));

const formatRate = (rate) => `$${Number(rate || 0).toFixed(2)} per view`;

export default function ViewEarningsManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewsToAdd, setViewsToAdd] = useState(10000);
  const [rateDraft, setRateDraft] = useState(0.05);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ lifetimeViews: 0, lifetimeEarnings: 0, monthlySummary: [] });

  const loadUsers = async () => {
    try {
      const { data } = await api.get(API_ENDPOINTS.viewEarnings.users);
      if (!data?.status) {
        throw new Error(data?.message || "Unable to load users.");
      }
      setUsers(data.result || []);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const loadTransactions = async (userId) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.viewEarnings.transactions, {
        params: userId ? { userId } : {},
      });
      if (!data?.status) {
        throw new Error(data?.message || "Unable to load transactions.");
      }
      setTransactions(data.result || []);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const loadSummary = async (userId) => {
    if (!userId) {
      setSummary({ lifetimeViews: 0, lifetimeEarnings: 0, monthlySummary: [] });
      return;
    }
    try {
      const { data } = await api.get(API_ENDPOINTS.viewEarnings.summary(userId));
      if (!data?.status) {
        throw new Error(data?.message || "Unable to load user summary.");
      }
      setSummary(data.result || { lifetimeViews: 0, lifetimeEarnings: 0, monthlySummary: [] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await Promise.all([loadUsers(), loadTransactions()]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      loadTransactions();
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser) {
      loadTransactions();
      return;
    }
    loadTransactions(selectedUser.id);
    loadSummary(selectedUser.id);
    setRateDraft(Number(selectedUser.viewRate || 0));
  }, [selectedUser]);

  const calculatedEarnings = useMemo(() => {
    const safeViews = Number(viewsToAdd || 0);
    const safeRate = Number(rateDraft || 0);
    return safeViews * safeRate;
  }, [rateDraft, viewsToAdd]);

  const handleRateUpdate = async () => {
    if (!selectedUser) {
      toast.error("Choose a user before updating their rate.");
      return;
    }

    try {
      const parsedRate = Number(rateDraft);
      if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
        toast.error("Enter a valid payment rate greater than zero.");
        return;
      }
      const { data } = await api.put(API_ENDPOINTS.viewEarnings.setRate(selectedUser.id), { rate: parsedRate });
      if (!data?.status) {
        throw new Error(data?.message || "Unable to save the user's payment rate.");
      }
      toast.success("User payment rate updated.");
      await loadUsers();
      const updatedUser = data.result || { ...selectedUser, viewRate: parsedRate };
      setSelectedUser(updatedUser);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleAddViews = async () => {
    if (!selectedUser) {
      toast.error("Select a user before adding views.");
      return;
    }

    const viewCount = Number(viewsToAdd);
    if (!Number.isInteger(viewCount) || viewCount <= 0) {
      toast.error("Enter a valid whole number of views greater than zero.");
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.post(API_ENDPOINTS.viewEarnings.transactions, {
        userId: selectedUser.id,
        viewsAdded: viewCount,
      });
      if (!data?.status) {
        throw new Error(data?.message || "Unable to add views.");
      }
      toast.success(`${viewCount.toLocaleString()} views added for ${selectedUser.username || selectedUser.email}.`);
      setViewsToAdd(10000);
      await Promise.all([loadUsers(), loadTransactions(selectedUser.id), loadSummary(selectedUser.id)]);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Box>
        <Typography variant="h4" fontWeight={700}>Views & Earnings</Typography>
        <Typography variant="body2" color="text.secondary">
          Manually add views, update a user's pay rate, and review monthly totals from saved transactions.
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Autocomplete
              sx={{ flex: 1 }}
              options={users}
              getOptionLabel={(user) => `${user.username || user.email || "User"} (${user.email || "No email"})`}
              value={selectedUser}
              onChange={(_, nextValue) => setSelectedUser(nextValue)}
              loading={loading}
              renderInput={(params) => <TextField {...params} label="Select user" />} 
            />
            <TextField
              label="Views to add"
              type="number"
              value={viewsToAdd}
              onChange={(event) => setViewsToAdd(event.target.value)}
              inputProps={{ min: 1, step: 1 }}
              sx={{ minWidth: 180 }}
            />
          </Stack>

          {selectedUser && (
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
              <TextField
                label="Payment rate per view"
                type="number"
                value={rateDraft}
                onChange={(event) => setRateDraft(event.target.value)}
                inputProps={{ min: 0.01, step: 0.01 }}
                sx={{ minWidth: 220 }}
              />
              <Button variant="outlined" onClick={handleRateUpdate}>
                Update Rate
              </Button>
              <Typography variant="body1" fontWeight={700}>
                Current Rate: {formatRate(selectedUser.viewRate || rateDraft)}
              </Typography>
            </Stack>
          )}

          <Alert severity="info">
            {selectedUser
              ? `${viewsToAdd || 0} views × ${formatRate(rateDraft)} = ${formatCurrency(calculatedEarnings)}`
              : "Choose a user and enter a number of views to calculate the earnings."}
          </Alert>

          <Button
            variant="contained"
            color="primary"
            onClick={handleAddViews}
            disabled={!selectedUser || saving || loading}
            sx={{ alignSelf: "flex-start" }}
          >
            {saving ? "Saving…" : "Add views"}
          </Button>
        </Stack>
      </Paper>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">Lifetime views</Typography>
            <Typography variant="h5" fontWeight={700}>{(summary.lifetimeViews || 0).toLocaleString()}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">Lifetime earnings</Typography>
            <Typography variant="h5" fontWeight={700}>{formatCurrency(summary.lifetimeEarnings || 0)}</Typography>
          </CardContent>
        </Card>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Monthly Summary</Typography>
        {summary.monthlySummary?.length ? (
          <Stack spacing={1.5}>
            {summary.monthlySummary.map((entry) => (
              <Box key={entry.month} sx={{ display: "flex", justifyContent: "space-between", gap: 2, p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                <Box>
                  <Typography fontWeight={700}>{entry.month}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2">Monthly views: {Number(entry.views || 0).toLocaleString()}</Typography>
                  <Typography variant="body2">Payment rate: {formatRate(entry.rate || 0)}</Typography>
                  <Typography variant="body2">Monthly earnings: {formatCurrency(entry.earnings || 0)}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary">No view transactions have been recorded for this user yet.</Typography>
        )}
      </Paper>

      <Paper
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 12px 28px rgba(7, 152, 181, 0.06)",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, textTransform: "capitalize" }}>Recent view transactions</Typography>
        <TableContainer
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
            backgroundColor: "background.paper",
          }}
        >
          <Table size="small" sx={{ borderCollapse: "separate", borderSpacing: 0 }}>
            <TableHead sx={{ backgroundColor: "rgba(7, 152, 181, 0.04)" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "text.primary", borderBottom: "1px solid", borderColor: "divider" }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.primary", borderBottom: "1px solid", borderColor: "divider" }}>Views</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.primary", borderBottom: "1px solid", borderColor: "divider" }}>Rate</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.primary", borderBottom: "1px solid", borderColor: "divider" }}>Earned</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.primary", borderBottom: "1px solid", borderColor: "divider" }}>Date & time</TableCell>
                {/* <TableCell sx={{ fontWeight: 700, color: "text.primary", borderBottom: "1px solid", borderColor: "divider" }}>Month</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length ? transactions.slice(0, 8).map((transaction) => (
                <TableRow
                  key={transaction.id}
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "rgba(7, 152, 181, 0.015)" },
                    "&:hover": { backgroundColor: "rgba(7, 152, 181, 0.04)" },
                  }}
                >
                  <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider" }}>{transaction.user?.username || transaction.user?.email || `User ${transaction.userId}`}</TableCell>
                  <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider" }}>{Number(transaction.viewsAdded || 0).toLocaleString()}</TableCell>
                  <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider" }}>{formatRate(transaction.ratePerView || 0)}</TableCell>
                  <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider", fontWeight: 600 }}>{formatCurrency(transaction.earnings || 0)}</TableCell>
                  <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider" }}>{new Date(transaction.transactionDate).toLocaleString()}</TableCell>
                  {/* <TableCell sx={{ borderBottom: "1px solid", borderColor: "divider" }}>{transaction.month || "—"}</TableCell> */}
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 3, borderBottom: "none" }}>
                    <Typography color="text.secondary">No transactions yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
