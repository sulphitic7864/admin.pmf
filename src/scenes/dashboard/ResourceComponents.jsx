import { useState } from "react";
import { AlternateEmailOutlined, ArticleOutlined, CalendarMonthOutlined, MovieOutlined, PersonOutline, PlayCircleOutline } from "@mui/icons-material";
import { Avatar, Box, Button, ButtonBase, Chip, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { formatCell, formatPaymentAmount, formatPaymentDate } from "./resourceConfig";

export function PaymentDetail({ payment }) {
  const user = payment.user ?? {};
  const billing = payment.billingdetails ?? {};
  const transaction = payment.payments ?? {};
  const packageDetails = payment.packagedetails ?? {};
  const billingName = [
    billing.first_name ?? user.firstName,
    billing.last_name ?? user.lastName,
  ].filter(Boolean).join(" ");
  const paymentStatus = transaction.status ?? payment.status ?? "Unknown";

  const sections = [
    {
      title: "Transaction",
      items: [
        ["Payment reference", transaction.pay_id ?? payment.payID ?? payment.pay_id],
        ["Record ID", payment.id],
        ["Payment record", payment.paymentId ?? transaction.id],
        ["Billing record", payment.billingId ?? billing.id],
        ["User ID", payment.userid ?? user.id],
        ["Package ID", payment.packageid ?? packageDetails.id],
        ["Amount", formatPaymentAmount(transaction.amount ?? payment.amount, transaction.currency ?? payment.currency)],
        ["Currency", (transaction.currency ?? payment.currency ?? "").toUpperCase()],
        ["Status", paymentStatus],
        ["Created", formatPaymentDate(transaction.createdAt ?? payment.createdAt)],
        ["Updated", formatPaymentDate(transaction.updatedAt ?? payment.updatedAt)],
      ],
    },
    {
      title: "Customer and billing",
      items: [
        ["Customer", billingName || "—"],
        ["Username", user.username ?? billing.username],
        ["Email", user.email ?? billing.email_add],
        ["Phone", billing.phone],
        ["Company", billing.company_name],
        ["Address", [billing.address1, billing.address2].filter(Boolean).join(", ")],
        ["City", billing.city],
        ["State / region", billing.state],
        ["Postal code", billing.zip_code],
        ["Country", billing.country],
      ],
    },
    {
      title: "Package",
      items: [
        ["Package", packageDetails.title?.trim()],
        ["Price", packageDetails.amount ? `$${packageDetails.amount}` : "—"],
        ["Storage", packageDetails.storage],
        ["Video limit", packageDetails.speed],
        ["Package status", packageDetails.status],
        ["Description", packageDetails.description],
      ],
    },
  ];

  return (
    <Stack spacing={2.5} sx={{ pt: 1 }}>
      {sections.map((section) => (
        <Box key={section.title}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            {section.title}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 1.5,
            }}
          >
            {section.items.map(([label, value]) => (
              <Box key={label} sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography
                  variant="body2"
                  sx={{ overflowWrap: "anywhere", whiteSpace: label === "Description" ? "pre-line" : "normal" }}
                >
                  {value === null || value === undefined || value === "" ? "—" : String(value)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

export function UserDetail({ user }) {
  const details = [
    ["User ID", user.id],
    ["First name", user.firstName],
    ["Last name", user.lastName],
    ["Username", user.username],
    ["Email address", user.email],
    ["Joined", formatPaymentDate(user.createdAt)],
    ["Last updated", formatPaymentDate(user.updatedAt)],
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
        gap: 2,
        pt: 1,
      }}
    >
      {details.map(([label, value]) => (
        <Box key={label} sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
          <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
            {value === null || value === undefined || value === "" ? "—" : String(value)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export function VideoBanner({ video, onClick }) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={`Play ${video.title || `video ${video.id}`}`}
      sx={{
        position: "relative",
        display: "flex",
        width: 124,
        height: 58,
        overflow: "hidden",
        justifyContent: "flex-start",
        borderRadius: 1.5,
        color: "#fff",
        background: "linear-gradient(125deg, #102534 0%, #08758d 58%, #20a79a 100%)",
        "&:hover .video-banner-play": {
          transform: "scale(1.1)",
          backgroundColor: "rgba(255, 255, 255, 0.32)",
        },
      }}
    >
      <MovieOutlined sx={{ position: "absolute", right: -4, bottom: -9, fontSize: 54, opacity: 0.17 }} />
      <Box
        className="video-banner-play"
        sx={{
          zIndex: 1,
          display: "grid",
          width: 30,
          height: 30,
          ml: 1,
          placeItems: "center",
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          transition: "transform 150ms ease, background-color 150ms ease",
        }}
      >
        <PlayCircleOutline fontSize="small" />
      </Box>
      <Typography
        variant="caption"
        sx={{
          zIndex: 1,
          px: 0.75,
          overflow: "hidden",
          fontSize: 10,
          fontWeight: 700,
          textAlign: "left",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {video.title || `Video #${video.id}`}
      </Typography>
    </ButtonBase>
  );
}

export function VideoPlayer({ video }) {
  const [playbackError, setPlaybackError] = useState(false);
  const videoUrl = video.url || video.filePath;

  if (!videoUrl || playbackError) {
    return (
      <Box
        sx={{
          display: "grid",
          aspectRatio: "16 / 9",
          placeItems: "center",
          borderRadius: 1.5,
          color: "text.secondary",
          backgroundColor: "rgba(10, 18, 26, 0.94)",
        }}
      >
        <Typography>
          {playbackError ? "This video could not be played." : "No video file is available for this record."}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="video"
      src={videoUrl}
      controls
      autoPlay
      playsInline
      onError={() => setPlaybackError(true)}
      sx={{
        display: "block",
        width: "100%",
        maxHeight: "70vh",
        aspectRatio: "16 / 9",
        borderRadius: 1.5,
        backgroundColor: "#080d12",
      }}
    />
  );
}

export function MetricCard({ item, count }) {
  const Icon = item.icon;
  return (
    <Box
      component={Link}
      to={item.path}
      className={`metric-card metric-${item.color}`}
      aria-label={`Open ${item.label}`}
    >
      <Box className="metric-topline">
        <Avatar className="metric-icon"><Icon /></Avatar>
        <Typography className="metric-label">{item.label.replace(/\b\w/g, (letter) => letter.toUpperCase())}</Typography>
      </Box>
      <Typography className="metric-value">{count ?? "—"}</Typography>
      <Typography className="metric-footnote">Current total in your workspace</Typography>
    </Box>
  );
}

export function BlogPreview({ blog }) {
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