import { useCallback, useEffect, useMemo, useState } from "react";
import { AddRounded, ArticleOutlined, CheckCircleOutline, DeleteForeverOutlined, DeleteOutline, EditOutlined, HighlightOff, MoreVertOutlined, RefreshRounded, VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import { Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../api/endpoints";
import { api, getApiErrorMessage } from "../../api/client";
import DataGridToolbar from "../../components/DataGridToolbar";
import { formatCell, formatPaymentAmount, formatPaymentDate, getRecordId, normalizePaymentRow, normalizeRows, normalizeUserRow, resourceConfig } from "./resourceConfig";
import { VideoBanner } from "./ResourceComponents";
import ResourceDialogs from "./ResourceDialogs";

export default function ResourcePage({ page }) {
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
  const [viewPayment, setViewPayment] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [viewVideo, setViewVideo] = useState(null);
  const [videoToReject, setVideoToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionMenu, setActionMenu] = useState({ anchorEl: null, rowKey: null });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    danger: false,
    onConfirm: null,
  });
  const handleSearchChange = useCallback((event) => {
    setSearch(event.target.value);
  }, []);
  const openConfirmDialog = useCallback(({ title, message, confirmLabel = "Confirm", danger = false, onConfirm }) => {
    setConfirmDialog({ open: true, title, message, confirmLabel, danger, onConfirm });
  }, []);
  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog((current) => ({ ...current, open: false, onConfirm: null }));
  }, []);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(config.endpoint);
      const loadedRows = normalizeRows(response.data, config.collectionProperty);
      if (page === "payments") {
        setRows(loadedRows.map(normalizePaymentRow));
      } else if (page === "users") {
        setRows(loadedRows.map(normalizeUserRow));
      } else {
        setRows(loadedRows);
      }
    } catch (requestError) {
      if (requestError.response?.status === 404) {
        setRows([]);
      } else {
        toast.error(getApiErrorMessage(requestError));
      }
    } finally {
      setLoading(false);
    }
  }, [config, page]);

  useEffect(() => { loadRows(); }, [loadRows]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    if (page === "payments") {
      const searchableFields = [
        "payID",
        "customerName",
        "company",
        "email",
        "phone",
        "country",
        "paymentAmount",
        "currency",
        "status",
        "packageTitle",
        "packageAmount",
        "createdAt",
      ];
      return rows.filter((row) =>
        searchableFields.some((field) => String(row[field] ?? "").toLowerCase().includes(query))
      );
    }
    if (page === "users") {
      const searchableFields = ["id", "fullName", "username", "email", "createdAt", "updatedAt"];
      return rows.filter((row) =>
        searchableFields.some((field) => String(row[field] ?? "").toLowerCase().includes(query))
      );
    }
    return rows.filter((row) =>
      Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(query))
    );
  }, [page, rows, search]);

  const performDelete = async (row) => {
    const id = getRecordId(row);
    if (id === undefined || id === null) {
      toast.error("This record does not include an ID and cannot be removed.");
      return;
    }

    openConfirmDialog({
      title: "Delete Record",
      message: `Delete this ${config.title.toLowerCase().replace(/s$/, "")} record? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: async () => {
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
      },
    });
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

  const updateVideoSubmissionStatus = async (row, status, reason) => {
    const id = getRecordId(row);
    if (id === undefined || id === null) {
      toast.error("This submission does not include an ID and cannot be reviewed.");
      return;
    }

    const action = status === "approved" ? "approve" : "decline";
    const confirmConfig = status === "approved"
      ? {
        title: "Approve submission",
        message: `Are you sure you want to approve this film submission?`,
        confirmLabel: "Approve",
        danger: false,
      }
      : {
        title: "Decline submission",
        message: `Are you sure you want to decline this film submission?`,
        confirmLabel: "Decline",
        danger: false,
      };

    openConfirmDialog({
      ...confirmConfig,
      onConfirm: async () => {
        setBusy(true);
        try {
          await api.put(API_ENDPOINTS.videos.updateSubmissionStatus(id), {
            status,
            ...(status === "rejected" ? { rejectionReason: reason } : {}),
          });
          toast.success(`Submission ${status}.`);
          if (status === "rejected") {
            setVideoToReject(null);
            setRejectionReason("");
          }
          await loadRows();
        } catch (requestError) {
          toast.error(getApiErrorMessage(requestError));
        } finally {
          setBusy(false);
        }
      },
    });
  };

  const deleteSubmissionFiles = async (row) => {
    const id = getRecordId(row);
    if (id === undefined || id === null) {
      toast.error("This submission does not include an ID and cannot be updated.");
      return;
    }

    openConfirmDialog({
      title: "Delete files from server",
      message: "Delete this submission's uploaded files from the server? This keeps the film metadata and key art record intact.",
      confirmLabel: "Delete",
      danger: true,
      onConfirm: async () => {
        setBusy(true);
        try {
          await api.delete(API_ENDPOINTS.videos.deleteSubmissionFiles(id));
          toast.success("Submission files deleted from the server.");
          await loadRows();
        } catch (requestError) {
          toast.error(getApiErrorMessage(requestError));
        } finally {
          setBusy(false);
        }
      },
    });
  };

  const toggleVideoFrontendVisibility = async (row, hidden) => {
    const id = getRecordId(row);
    if (id === undefined || id === null) {
      toast.error("This submission does not include an ID and cannot be updated.");
      return;
    }

    const confirmationTitle = hidden ? "Hide video from frontend" : "Restore video on frontend";
    const confirmationMessage = hidden
      ? "Hide this video from the frontend while keeping the film key art and metadata?"
      : "Restore this video on the frontend?";

    openConfirmDialog({
      title: confirmationTitle,
      message: confirmationMessage,
      confirmLabel: hidden ? "Hide" : "Restore",
      danger: false,
      onConfirm: async () => {
        setBusy(true);
        try {
          await api.put(API_ENDPOINTS.videos.toggleFrontendVisibility(id), { hidden });
          toast.success(hidden ? "Video hidden from the frontend." : "Video restored on the frontend.");
          await loadRows();
        } catch (requestError) {
          toast.error(getApiErrorMessage(requestError));
        } finally {
          setBusy(false);
        }
      },
    });
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

  const actionMenuItems = (row) => {
    const rowKey = getRecordId(row);
    const items = [];

    if (config.paymentActions) {
      items.push({
        label: "View payment details",
        onClick: () => setViewPayment(row),
        Icon: VisibilityOutlined,
      });
    }
    if (config.userActions) {
      items.push({
        label: "View user details",
        onClick: () => setViewUser(row),
        Icon: VisibilityOutlined,
      });
    }
    if (config.couponActions) {
      items.push({
        label: "Edit coupon",
        onClick: () => openCouponEditor(row),
        Icon: EditOutlined,
      });
    }
    if (config.blogActions) {
      items.push({
        label: "View blog",
        onClick: () => setViewBlog(row),
        Icon: VisibilityOutlined,
      });
      items.push({
        label: "Edit blog",
        onClick: () => openBlogEditor(row),
        Icon: EditOutlined,
      });
      items.push({
        label: row.status === "Active" ? "Deactivate blog" : "Activate blog",
        onClick: () => toggleBlogStatus(row),
        Icon: CheckCircleOutline,
      });
    }
    if (config.videoActions) {
      if (row.submissionStatus !== "approved") {
        items.push({
          label: "Approve submission",
          onClick: () => updateVideoSubmissionStatus(row, "approved"),
          Icon: CheckCircleOutline,
        });
      }
      items.push({
        label: row.submissionStatus === "rejected" ? "Retry rejection notification" : "Decline submission",
        onClick: () => {
          setVideoToReject(row);
          setRejectionReason(row.reviewReason ?? "");
        },
        Icon: HighlightOff,
      });
      items.push({
        label: row.isFrontendHidden ? "Restore video on frontend" : "Remove video from frontend",
        onClick: () => toggleVideoFrontendVisibility(row, !row.isFrontendHidden),
        Icon: VisibilityOffOutlined,
      });
      items.push({
        label: "Delete files from server",
        onClick: () => deleteSubmissionFiles(row),
        Icon: DeleteOutline,
      });
    }
    if (config.deletable) {
      items.push({
        label: "Delete Record",
        onClick: () => performDelete(row),
        Icon: DeleteForeverOutlined,
      });
    }

    return { rowKey, items };
  };

  const columns = [
    ...(config.videoActions
      ? [{
        field: "videoBanner",
        headerName: "Video",
        width: 155,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: ({ row }) => (
          <VideoBanner video={row} onClick={() => setViewVideo(row)} />
        ),
      }]
      : []),
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
        if ((page === "payments" || page === "videos") && field === "createdAt") {
          const display = formatPaymentDate(value);
          return <Typography className="table-cell-text" title={display}>{display}</Typography>;
        }
        if (field === "status") {
          const active = String(value).toLowerCase() === "active" || String(value).toLowerCase() === "succeeded";
          return <Chip size="small" label={value || "Unknown"} className={`status-chip ${active ? "status-active" : "status-inactive"}`} />;
        }
        if (page === "payments" && field === "paymentAmount") {
          const display = formatPaymentAmount(value, row.currency);
          return <Typography className="table-cell-text" title={display}>{display}</Typography>;
        }
        if (page === "payments" && field === "packageAmount" && value !== "") {
          const display = `$${value}`;
          return <Typography className="table-cell-text" title={display}>{display}</Typography>;
        }
        const display = formatCell(value, field);
        return <Typography className="table-cell-text" title={display}>{display}</Typography>;
      },
    })),
    ...(config.deletable || config.blogActions || config.couponActions || config.paymentActions || config.userActions || config.videoActions ? [{
      field: "actions",
      headerName: "Actions",
      width: config.blogActions ? 195 : config.couponActions ? 125 : config.userActions ? 105 : config.videoActions ? 120 : 75,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => {
        const currentRowKey = getRecordId(row);
        const { items } = actionMenuItems(row);
        const isMenuOpen = actionMenu.rowKey === currentRowKey && Boolean(actionMenu.anchorEl);

        return (
          <>
            <IconButton
              size="small"
              onClick={(event) => setActionMenu({ anchorEl: event.currentTarget, rowKey: currentRowKey })}
              aria-label="Open actions menu"
              aria-controls={isMenuOpen ? "resource-row-actions-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={isMenuOpen ? "true" : undefined}
              sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}
            >
              <MoreVertOutlined fontSize="small" />
            </IconButton>
            <Menu
              id={isMenuOpen ? "resource-row-actions-menu" : undefined}
              anchorEl={actionMenu.anchorEl}
              open={isMenuOpen}
              onClose={() => setActionMenu({ anchorEl: null, rowKey: null })}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{ paper: { sx: { minWidth: 210, mt: 0.5 } } }}
            >
              {items.map(({ label, onClick, Icon }) => (
                <MenuItem
                  key={label}
                  onClick={() => {
                    onClick();
                    setActionMenu({ anchorEl: null, rowKey: null });
                  }}
                  sx={{ gap: 1 }}
                >
                  <ListItemIcon>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText sx={{ textTransform: "capitalize" }}>{label}</ListItemText>
                </MenuItem>
              ))}
            </Menu>
          </>
        );
      },
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
            <Chip
              label={rows.length}
              size="small"
              aria-label={`${rows.length} total records`}
              sx={{
                height: 24,
                color: "primary.dark",
                backgroundColor: "rgba(8, 117, 141, 0.1)",
                fontSize: 11,
                fontWeight: 700,
                "& .MuiChip-label": { px: 1 },
              }}
            />
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
              Toolbar: DataGridToolbar,
              NoRowsOverlay: () => (
                <Box className="grid-empty">
                  <Avatar className="empty-icon"><Icon /></Avatar>
                  <Typography variant="subtitle1">{loading ? "Loading records" : "Nothing here yet"}</Typography>
                  <Typography variant="body2">{loading ? "We’re getting the latest data." : "Records will appear here when they’re available."}</Typography>
                </Box>
              ),
            }}
            componentsProps={{
              toolbar: { search, onSearchChange: handleSearchChange },
            }}
            sx={{ border: 0 }}
          />
        </Box>
      </Box>

      <ResourceDialogs
        couponDialog={couponDialog}
        setCouponDialog={setCouponDialog}
        couponDraft={couponDraft}
        setCouponDraft={setCouponDraft}
        saveCoupon={saveCoupon}
        blogDialog={blogDialog}
        setBlogDialog={setBlogDialog}
        blogDraft={blogDraft}
        setBlogDraft={setBlogDraft}
        blogImage={blogImage}
        setBlogImage={setBlogImage}
        saveBlog={saveBlog}
        busy={busy}
        viewBlog={viewBlog}
        setViewBlog={setViewBlog}
        viewPayment={viewPayment}
        setViewPayment={setViewPayment}
        viewUser={viewUser}
        setViewUser={setViewUser}
        viewVideo={viewVideo}
        setViewVideo={setViewVideo}
        videoToReject={videoToReject}
        setVideoToReject={setVideoToReject}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        submitVideoRejection={(reason) => updateVideoSubmissionStatus(videoToReject, "rejected", reason)}
        theme={theme}
      />

      <Dialog open={confirmDialog.open} onClose={closeConfirmDialog} fullWidth maxWidth="xs">
        <DialogTitle sx={{ textTransform: "capitalize" }}>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5 }}>
          <Button onClick={closeConfirmDialog}>Cancel</Button>
          <Button
            color={confirmDialog.danger ? "error" : "primary"}
            variant={confirmDialog.danger ? "contained" : "outlined"}
            onClick={() => {
              closeConfirmDialog();
              if (confirmDialog.onConfirm) {
                confirmDialog.onConfirm();
              }
            }}
          >
            {confirmDialog.confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}