import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AddRounded,
  AlternateEmailOutlined,
  ArticleOutlined,
  CalendarMonthOutlined,
  CheckCircleOutline,
  DeleteOutline,
  EditOutlined,
  EmailOutlined,
  FeedbackOutlined,
  LocalOfferOutlined,
  MovieOutlined,
  PaymentsOutlined,
  PeopleAltOutlined,
  PersonOutline,
  PlayCircleOutline,
  RefreshRounded,
  SearchRounded,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../api/endpoints";
import { api, getApiErrorMessage, responseRows } from "../../api/client";

const resourceConfig = {
  blogs: {
    title: "Blogs",
    subtitle: "Create and manage the stories published on Place My Films.",
    endpoint: API_ENDPOINTS.blogs.list,
    columns: [
      ["title", "Blog title", 210],
      ["author", "Author", 140],
      ["type", "Category", 110],
      ["status", "Status", 110],
      ["noOfReaders", "Readers", 95],
      ["createdAt", "Published", 150],
    ],
    icon: ArticleOutlined,
    deletable: true,
    blogActions: true,
  },
  payments: {
    title: "Payments",
    subtitle: "Review payment transactions recorded by the platform.",
    endpoint: API_ENDPOINTS.payments.list,
    columns: [
      ["pay_id", "Payment ID", 190],
      ["amount", "Amount", 100],
      ["currency", "Currency", 100],
      ["status", "Status", 120],
      ["createdAt", "Created", 170],
    ],
    icon: PaymentsOutlined,
  },
  feedback: {
    title: "Feedbacks",
    subtitle: "Read feedback submitted by the Place My Films community.",
    endpoint: API_ENDPOINTS.feedback.list,
    columns: [
      ["id", "ID", 75],
      ["blogId", "Blog ID", 95],
      ["description", "Description", 290],
      ["feedBackType", "Feedback type", 150],
      ["createdAt", "Received", 160],
    ],
    icon: FeedbackOutlined,
    deletable: true,
  },
  coupons: {
    title: "Coupons",
    subtitle: "Create, update, and manage promotional coupon codes.",
    endpoint: API_ENDPOINTS.coupons.list,
    columns: [
      ["code", "Code", 160],
      ["details", "Details", 280],
      ["amount", "Discount", 110],
      ["status", "Status", 115],
      ["createdAt", "Created", 160],
    ],
    icon: LocalOfferOutlined,
    deletable: true,
    couponActions: true,
  },
  users: {
    title: "Users",
    subtitle: "View registered user accounts and their profile details.",
    endpoint: API_ENDPOINTS.users.list,
    columns: [
      ["username", "Username", 170],
      ["firstName", "First name", 140],
      ["lastName", "Last name", 140],
      ["email", "Email address", 240],
      ["createdAt", "Joined", 165],
    ],
    icon: PeopleAltOutlined,
    deletable: true,
  },
  videos: {
    title: "All videos",
    subtitle: "Review videos uploaded by the Place My Films community.",
    endpoint: API_ENDPOINTS.videos.listAll,
    columns: [
      ["id", "ID", 85],
      ["filePath", "Video file", 370],
      ["createdAt", "Uploaded", 180],
    ],
    icon: MovieOutlined,
    deletable: true,
  },
  contacts: {
    title: "Contact inbox",
    subtitle: "Messages submitted through the Place My Films contact form.",
    endpoint: API_ENDPOINTS.contacts.list,
    collectionProperty: "contact",
    columns: [
      ["firstName", "First name", 130],
      ["lastName", "Last name", 130],
      ["email", "Email address", 220],
      ["phoneNumber", "Phone", 150],
      ["message", "Message", 280],
      ["createdAt", "Received", 165],
    ],
    icon: EmailOutlined,
    deletable: true,
  },
};

const dashboardItems = [
  { key: "blogs", label: "Published blogs", icon: ArticleOutlined, color: "blue" },
  { key: "payments", label: "Payment records", icon: PaymentsOutlined, color: "green" },
  { key: "users", label: "Registered users", icon: PeopleAltOutlined, color: "violet" },
  { key: "contacts", label: "Contact messages", icon: EmailOutlined, color: "orange" },
  { key: "feedback", label: "Feedback entries", icon: FeedbackOutlined, color: "pink" },
  { key: "videos", label: "Uploaded videos", icon: MovieOutlined, color: "cyan" },
];

function getRecordId(row) {
  return row.id ?? row.ID ?? row.pay_id;
}

function formatCell(value, field) {
  if (value === null || value === undefined || value === "") return "—";
  if (field === "createdAt" || field === "updatedAt") {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? String(value)
      : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
  }
  return String(value);
}

function normalizeRows(data, property) {
  if (property) return responseRows(data, property);
  if (Array.isArray(data?.result)) return data.result;
  if (data?.result && typeof data.result === "object") return [data.result];
  if (Array.isArray(data?.contact)) return data.contact;
  return responseRows(data);
}

function MetricCard({ item, count }) {
  const Icon = item.icon;
  return (
    <Box className={`metric-card metric-${item.color}`}>
      <Box className="metric-topline">
        <Avatar className="metric-icon"><Icon /></Avatar>
        <Typography className="metric-label">{item.label}</Typography>
      </Box>
      <Typography className="metric-value">{count ?? "—"}</Typography>
      <Typography className="metric-footnote">Current total in your workspace</Typography>
    </Box>
  );
}

function BlogPreview({ blog }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = blog.imageURL || blog.imageUrl;
  const createdAt = formatCell(blog.createdAt, "createdAt");

  return (
    <>
      <DialogTitle component="div" className="blog-preview-titlebar">
        <Typography className="blog-preview-kicker">BLOG PREVIEW</Typography>
        <Typography variant="h5" className="blog-preview-title">
          {blog.title || "Untitled blog"}
        </Typography>
      </DialogTitle>
      <DialogContent className="blog-preview">
        <Box className="blog-preview-hero">
          {imageUrl && !imageFailed ? (
            <img
              className="blog-preview-image"
              src={imageUrl}
              alt={`${blog.title || "Blog"} cover`}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <Box className="blog-preview-image-fallback">
              <ArticleOutlined />
              <Typography>{imageUrl ? "Cover image unavailable" : "No cover image"}</Typography>
            </Box>
          )}
          <Box className="blog-preview-badges">
            <Chip label={blog.type || "Blog"} className="blog-category-chip" />
            <Chip
              label={blog.status || "Unknown"}
              className={`status-chip ${String(blog.status).toLowerCase() === "active" ? "status-active" : "status-inactive"}`}
            />
          </Box>
        </Box>

        <Box className="blog-preview-meta">
          <Box className="blog-preview-meta-item">
            <PersonOutline />
            <Box>
              <Typography className="blog-preview-meta-label">AUTHOR</Typography>
              <Typography className="blog-preview-meta-value">{blog.author || "—"}</Typography>
            </Box>
          </Box>
          <Box className="blog-preview-meta-item">
            <AlternateEmailOutlined />
            <Box>
              <Typography className="blog-preview-meta-label">EMAIL</Typography>
              <Typography className="blog-preview-meta-value">{blog.email || "—"}</Typography>
            </Box>
          </Box>
          <Box className="blog-preview-meta-item">
            <CalendarMonthOutlined />
            <Box>
              <Typography className="blog-preview-meta-label">PUBLISHED</Typography>
              <Typography className="blog-preview-meta-value">{createdAt}</Typography>
            </Box>
          </Box>
        </Box>

        <Box className="blog-preview-body">
          <Typography className="blog-preview-section-label">ABOUT THIS STORY</Typography>
          <Typography className="blog-preview-description">
            {blog.description || "No description provided."}
          </Typography>
        </Box>

        {blog.videoURL && (
          <Button
            className="blog-preview-video"
            variant="outlined"
            startIcon={<PlayCircleOutline />}
            component="a"
            href={blog.videoURL}
            target="_blank"
            rel="noreferrer"
          >
            Watch attached video
          </Button>
        )}
      </DialogContent>
    </>
  );
}

function Dashboard() {
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
          <Typography variant="h4" className="page-title">Good to see you</Typography>
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

function ResourcePage({ page }) {
  const config = resourceConfig[page];
  const Icon = config.icon;
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [couponDialog, setCouponDialog] = useState(false);
  const [couponDraft, setCouponDraft] = useState(null);
  const [blogDialog, setBlogDialog] = useState(false);
  const [blogDraft, setBlogDraft] = useState(null);
  const [blogImage, setBlogImage] = useState(null);
  const [viewBlog, setViewBlog] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(config.endpoint);
      setRows(normalizeRows(response.data, config.collectionProperty));
    } catch (requestError) {
      if (requestError.response?.status === 404) {
        setRows([]);
      } else {
        toast.error(getApiErrorMessage(requestError));
      }
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => { loadRows(); }, [loadRows]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(query))
    );
  }, [rows, search]);

  const performDelete = async (row) => {
    const id = getRecordId(row);
    if (id === undefined || id === null) {
      toast.error("This record does not include an ID and cannot be removed.");
      return;
    }
    if (!window.confirm(`Delete this ${config.title.toLowerCase().replace(/s$/, "")} record? This cannot be undone.`)) return;

    setBusy(true);
    try {
      const endpointMap = {
        blogs: API_ENDPOINTS.blogs.remove,
        feedback: API_ENDPOINTS.feedback.remove,
        coupons: API_ENDPOINTS.coupons.remove,
        users: API_ENDPOINTS.users.remove,
        videos: API_ENDPOINTS.videos.removeVideo,
        contacts: API_ENDPOINTS.contacts.remove,
      };
      await api.delete(endpointMap[page](id));
      toast.success("Record deleted successfully.");
      await loadRows();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const toggleBlogStatus = async (row) => {
    const id = getRecordId(row);
    const status = row.status === "Active" ? "Inactive" : "Active";
    setBusy(true);
    try {
      await api.put(API_ENDPOINTS.blogs.updateStatus(id), { status });
      toast.success(`Blog set to ${status.toLowerCase()}.`);
      await loadRows();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const openCouponEditor = (row) => {
    setCouponDraft(row
      ? { id: getRecordId(row), code: row.code ?? "", details: row.details ?? "", amount: row.amount ?? "", status: row.status ?? "Active" }
      : { code: "", details: "", amount: "", status: "Active" });
    setCouponDialog(true);
  };

  const openBlogEditor = (row) => {
    setBlogDraft(row
      ? {
        id: getRecordId(row),
        title: row.title ?? "",
        author: row.author ?? "",
        email: row.email ?? "",
        description: row.description ?? "",
        type: row.type ?? "article",
        status: row.status ?? "Active",
        noOfReaders: row.noOfReaders ?? "",
        videoURL: row.videoURL ?? "",
      }
      : {
        title: "",
        author: "",
        email: "",
        description: "",
        type: "article",
        status: "Active",
        noOfReaders: "0",
        videoURL: "",
      });
    setBlogImage(null);
    setBlogDialog(true);
  };

  const saveBlog = async () => {
    const required = ["title", "author", "email", "description"];
    if (required.some((field) => !blogDraft[field]?.trim())) {
      toast.error("Complete the title, author, email, and description before saving.");
      return;
    }
    if (!blogDraft.id && !blogImage) {
      toast.error("Choose a cover image before publishing a new blog.");
      return;
    }
    setBusy(true);
    try {
      const payload = new FormData();
      Object.entries(blogDraft).forEach(([key, value]) => {
        if (key !== "id") payload.append(key, String(value ?? ""));
      });
      if (blogImage) payload.append("blog-image", blogImage);
      if (blogDraft.id) {
        await api.put(API_ENDPOINTS.blogs.update(blogDraft.id), payload);
      } else {
        await api.post(API_ENDPOINTS.blogs.create, payload);
      }
      setBlogDialog(false);
      toast.success(blogDraft.id ? "Blog updated successfully." : "Blog published successfully.");
      await loadRows();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const saveCoupon = async () => {
    if (!couponDraft.code.trim() || !String(couponDraft.amount).trim()) {
      toast.error("Enter a coupon code and discount amount before saving.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        code: couponDraft.code.trim(),
        details: couponDraft.details.trim(),
        amount: String(couponDraft.amount).trim(),
        status: couponDraft.status,
      };
      if (couponDraft.id) {
        await api.put(API_ENDPOINTS.coupons.update(couponDraft.id), payload);
      } else {
        await api.post(API_ENDPOINTS.coupons.create, payload);
      }
      setCouponDialog(false);
      toast.success(couponDraft.id ? "Coupon updated successfully." : "Coupon created successfully.");
      await loadRows();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    ...(config.blogActions
      ? [{
        field: "imageURL",
        headerName: "Cover",
        width: 88,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: ({ row }) => {
          const imageUrl = row.imageURL || row.imageUrl;
          return imageUrl ? (
            <Avatar
              variant="rounded"
              src={imageUrl}
              alt={`${row.title || "Blog"} cover`}
              className="blog-cover-thumbnail"
            >B</Avatar>
          ) : (
            <Avatar variant="rounded" className="blog-cover-placeholder">
              <ArticleOutlined fontSize="small" />
            </Avatar>
          );
        },
      }]
      : []),
    ...config.columns.map(([field, headerName, minWidth]) => ({
      field,
      headerName,
      minWidth,
      flex: field === "id" ? 0 : 1,
      sortable: true,
      renderCell: ({ value, row }) => {
        if (field === "status") {
          const active = String(value).toLowerCase() === "active" || String(value).toLowerCase() === "succeeded";
          return <Chip size="small" label={value || "Unknown"} className={`status-chip ${active ? "status-active" : "status-inactive"}`} />;
        }
        if (page === "payments" && field === "amount") {
          const amountInCents = Number(value);
          if (Number.isFinite(amountInCents)) {
            const currency = String(row.currency || "USD").toUpperCase();
            const display = new Intl.NumberFormat(undefined, {
              style: "currency",
              currency,
            }).format(amountInCents / 100);
            return <Typography className="table-cell-text" title={display}>{display}</Typography>;
          }
        }
        const display = formatCell(value, field);
        return <Typography className="table-cell-text" title={display}>{display}</Typography>;
      },
    })),
    ...(config.deletable || config.blogActions || config.couponActions ? [{
      field: "actions",
      headerName: "Actions",
      width: config.blogActions ? 195 : config.couponActions ? 125 : 75,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          {config.couponActions && (
            <Tooltip title="Edit coupon">
              <IconButton size="small" onClick={() => openCouponEditor(row)} aria-label="Edit coupon">
                <EditOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {config.blogActions && (
            <Tooltip title="View blog">
              <IconButton size="small" onClick={() => setViewBlog(row)} aria-label="View blog">
                <VisibilityOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {config.blogActions && (
            <Tooltip title="Edit blog">
              <IconButton size="small" onClick={() => openBlogEditor(row)} aria-label="Edit blog">
                <EditOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {config.blogActions && (
            <Tooltip title={row.status === "Active" ? "Deactivate blog" : "Activate blog"}>
              <IconButton size="small" disabled={busy} onClick={() => toggleBlogStatus(row)} aria-label="Toggle blog status">
                <CheckCircleOutline fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {config.deletable && (
            <Tooltip title="Delete record">
              <IconButton size="small" disabled={busy} onClick={() => performDelete(row)} aria-label="Delete record" color="error">
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    }] : []),
  ];

  return (
    <Box>
      <Box className="page-heading">
        <Box>
          <Typography className="page-eyebrow">CONTROL AREA</Typography>
          <Box className="resource-title-row">
            <Avatar className="resource-icon"><Icon /></Avatar>
            <Typography variant="h4" className="page-title">{config.title}</Typography>
          </Box>
          <Typography className="page-subtitle">{config.subtitle}</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {config.couponActions && (
            <Button variant="contained" startIcon={<AddRounded />} onClick={() => openCouponEditor(null)}>
              New coupon
            </Button>
          )}
          {config.blogActions && (
            <Button variant="contained" startIcon={<AddRounded />} onClick={() => openBlogEditor(null)}>
              New blog
            </Button>
          )}
          <Tooltip title="Refresh list">
            <span>
              <IconButton onClick={loadRows} disabled={loading} className="refresh-button" aria-label="Refresh list">
                <RefreshRounded />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>

      <Box className="table-card">
        <Box className="table-toolbar">
          <Box>
            <Typography className="table-heading">All {config.title.toLowerCase()}</Typography>
            <Typography variant="body2" className="table-caption">{rows.length} total records</Typography>
          </Box>
          <TextField
            size="small"
            placeholder="Search records"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="table-search"
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment>,
            }}
          />
        </Box>
        <Box className="data-grid-wrap">
          <DataGrid
            autoHeight
            rows={filteredRows.map((row, index) => ({ ...row, id: row.id ?? row.ID ?? row.pay_id ?? `record-${index}` }))}
            columns={columns}
            loading={loading || busy}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            getRowHeight={() => 62}
            components={{
              NoRowsOverlay: () => (
                <Box className="grid-empty">
                  <Avatar className="empty-icon"><Icon /></Avatar>
                  <Typography variant="subtitle1">{loading ? "Loading records" : "Nothing here yet"}</Typography>
                  <Typography variant="body2">{loading ? "We’re getting the latest data." : "Records will appear here when they’re available."}</Typography>
                </Box>
              ),
            }}
            sx={{ border: 0 }}
          />
        </Box>
      </Box>

      {couponDialog && (
        <Dialog open onClose={() => setCouponDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>{couponDraft?.id ? "Edit coupon" : "Create coupon"}</DialogTitle>
          <DialogContent className="coupon-form">
            <TextField
              autoFocus
              required
              label="Coupon code"
              value={couponDraft?.code ?? ""}
              onChange={(event) => setCouponDraft((draft) => ({ ...draft, code: event.target.value }))}
              fullWidth
            />
            <TextField
              label="Description"
              value={couponDraft?.details ?? ""}
              onChange={(event) => setCouponDraft((draft) => ({ ...draft, details: event.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              required
              label="Discount amount"
              value={couponDraft?.amount ?? ""}
              onChange={(event) => setCouponDraft((draft) => ({ ...draft, amount: event.target.value }))}
              fullWidth
            />
            <TextField
              select
              label="Status"
              value={couponDraft?.status ?? "Active"}
              onChange={(event) => setCouponDraft((draft) => ({ ...draft, status: event.target.value }))}
              fullWidth
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCouponDialog(false)} disabled={busy}>Cancel</Button>
            <Button onClick={saveCoupon} variant="contained" disabled={busy}>
              {busy ? "Saving…" : couponDraft?.id ? "Save changes" : "Create coupon"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {blogDialog && (
        <Dialog open onClose={() => setBlogDialog(false)} fullWidth maxWidth="md">
          <DialogTitle>{blogDraft?.id ? "Edit blog" : "Publish a blog"}</DialogTitle>
          <DialogContent className="coupon-form">
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>

              <TextField
                autoFocus
                required
                label="Title"
                value={blogDraft?.title ?? ""}
                onChange={(event) => setBlogDraft((draft) => ({ ...draft, title: event.target.value }))}
                fullWidth
              />
              <TextField
                label="Reader count"
                type="number"
                value={blogDraft?.noOfReaders ?? ""}
                onChange={(event) => setBlogDraft((draft) => ({ ...draft, noOfReaders: event.target.value }))}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                required
                label="Author"
                value={blogDraft?.author ?? ""}
                onChange={(event) => setBlogDraft((draft) => ({ ...draft, author: event.target.value }))}
                fullWidth
              />
              <TextField
                required
                label="Author email"
                type="email"
                value={blogDraft?.email ?? ""}
                onChange={(event) => setBlogDraft((draft) => ({ ...draft, email: event.target.value }))}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label="Category"
                value={blogDraft?.type ?? "article"}
                onChange={(event) => setBlogDraft((draft) => ({ ...draft, type: event.target.value }))}
                fullWidth
              >
                <MenuItem value="article">Article</MenuItem>
                <MenuItem value="poem">Poem</MenuItem>
                <MenuItem value="story">Story</MenuItem>
              </TextField>
              <TextField
                select
                label="Status"
                value={blogDraft?.status ?? "Active"}
                onChange={(event) => setBlogDraft((draft) => ({ ...draft, status: event.target.value }))}
                fullWidth
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              className="blog-field-row"
            >
              <TextField
                label="Video URL (optional)"
                value={blogDraft?.videoURL ?? ""}
                onChange={(event) => setBlogDraft((draft) => ({ ...draft, videoURL: event.target.value }))}
                fullWidth
              />
              <Button component="label" variant="outlined" className="blog-image-button" fullWidth>
                {blogImage?.name || (blogDraft?.id ? "Replace cover image (optional)" : "Choose cover image")}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(event) => setBlogImage(event.target.files?.[0] ?? null)}
                />
              </Button>
            </Stack>
            <TextField
              required
              label="Description"
              value={blogDraft?.description ?? ""}
              onChange={(event) => setBlogDraft((draft) => ({ ...draft, description: event.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />

          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBlogDialog(false)} disabled={busy}>Cancel</Button>
            <Button onClick={saveBlog} variant="contained" disabled={busy}>
              {busy ? "Saving…" : blogDraft?.id ? "Save changes" : "Publish blog"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {viewBlog && (
        <Dialog
          open
          onClose={() => setViewBlog(null)}
          fullWidth
          maxWidth="md"
          className="blog-preview-dialog"
          PaperProps={{
            sx: {
              backgroundColor: theme.palette.background.paper,
              "--border": theme.palette.divider,
              "--surface": theme.palette.background.paper,
              "--surface-soft": theme.palette.action.hover,
              "--text-primary": theme.palette.text.primary,
              "--text-secondary": theme.palette.text.secondary,
            },
          }}
        >
          <BlogPreview blog={viewBlog} />
          <DialogActions>
            <Button variant="contained" onClick={() => setViewBlog(null)}>Done</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

export default function AdminPage({ page }) {
  if (page === "dashboard") return <Dashboard />;
  return <ResourcePage page={page} />;
}
