import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { BlogPreview, PaymentDetail, UserDetail, VideoPlayer } from "./ResourceComponents";

export default function ResourceDialogs({ couponDialog, setCouponDialog, couponDraft, setCouponDraft, saveCoupon, blogDialog, setBlogDialog, blogDraft, setBlogDraft, blogImage, setBlogImage, saveBlog, busy, viewBlog, setViewBlog, viewPayment, setViewPayment, viewUser, setViewUser, viewVideo, setViewVideo, videoToReject, setVideoToReject, rejectionReason, setRejectionReason, submitVideoRejection, theme }) {
  return (
    <>
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
      {viewPayment && (
        <Dialog
          open
          onClose={() => setViewPayment(null)}
          fullWidth
          maxWidth="md"
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
          <DialogTitle>Payment details</DialogTitle>
          <DialogContent>
            <PaymentDetail payment={viewPayment} />
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={() => setViewPayment(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
      {viewUser && (
        <Dialog
          open
          onClose={() => setViewUser(null)}
          fullWidth
          maxWidth="sm"
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
          <DialogTitle>{viewUser.fullName || viewUser.username || "User details"}</DialogTitle>
          <DialogContent>
            <UserDetail user={viewUser} />
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={() => setViewUser(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
      {viewVideo && (
        <Dialog
          open
          onClose={() => setViewVideo(null)}
          fullWidth
          maxWidth="lg"
          PaperProps={{
            sx: {
              p: { xs: 1.5, sm: 2.5 },
              backgroundColor: theme.palette.background.paper,
              "--border": theme.palette.divider,
              "--surface": theme.palette.background.paper,
              "--surface-soft": theme.palette.action.hover,
              "--text-primary": theme.palette.text.primary,
              "--text-secondary": theme.palette.text.secondary,
            },
          }}
        >
          <DialogTitle sx={{ px: 0, pt: 0 }}>
            {viewVideo.title || `Video #${viewVideo.id}`}
          </DialogTitle>
          <DialogContent sx={{ px: 0 }}>
            <VideoPlayer video={viewVideo} />
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
              <Chip size="small" label={`User ${viewVideo.user_id ?? "—"}`} />
              <Chip size="small" label={`Package ${viewVideo.packageType ?? "—"}`} />
              <Chip size="small" label={`${viewVideo.viewCount ?? 0} views`} />
              {viewVideo.submissionStatus && (
                <Chip size="small" label={viewVideo.submissionStatus} />
              )}
            </Stack>
            {viewVideo.submissionFiles && Object.keys(viewVideo.submissionFiles).length > 0 && (
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Required submission files</Typography>
                {[
                  ["keyArtPortrait", "Key Art (270x390)"],
                  ["keyArtLandscape", "Key Art (800x450)"],
                  ["keyArtWide", "Key Art (1920x720)"],
                  ["keyArtFullHd", "Key Art (1920x1080)"],
                  ["subtitleFile", "Subtitle File SRT"],
                  ["metadataFile", "Meta Data"],
                  ["video", "Video File (MP4)"],
                ].map(([field, label]) => {
                  const fileUrl = viewVideo.submissionFiles[field];
                  return fileUrl ? (
                    <Button
                      key={field}
                      component="a"
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      size="small"
                      variant="outlined"
                      sx={{ alignSelf: "flex-start", textTransform: "none" }}
                    >
                      {label}
                    </Button>
                  ) : (
                    <Typography key={field} variant="body2" color="error">
                      Missing: {label}
                    </Typography>
                  );
                })}
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 0, pb: 0 }}>
            <Button variant="contained" onClick={() => setViewVideo(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
      {videoToReject && (
        <Dialog
          open
          onClose={() => {
            if (!busy) {
              setVideoToReject(null);
              setRejectionReason("");
            }
          }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Decline film submission</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Enter the reason this submission was not approved. The submitter will see it in their dashboard and receive it by email.
            </Typography>
            <TextField
              autoFocus
              required
              fullWidth
              multiline
              minRows={3}
              maxRows={8}
              label="Rejection reason"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              inputProps={{ maxLength: 2000 }}
              helperText={`${rejectionReason.length}/2000`}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setVideoToReject(null);
                setRejectionReason("");
              }}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              color="error"
              variant="contained"
              disabled={busy || !rejectionReason.trim()}
              onClick={() => submitVideoRejection(rejectionReason.trim())}
            >
              {busy ? "Sending…" : "Reject submission"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
