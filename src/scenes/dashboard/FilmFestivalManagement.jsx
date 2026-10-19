import { useCallback, useEffect, useState } from "react";
import { AddRounded, DeleteOutline, SaveOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../api/endpoints";
import { api, getApiErrorMessage } from "../../api/client";

const defaultPage = {
  heading: "FILM CONTEST",
  description: "Share your story with the world. Our film contest connects talented filmmakers with industry opportunities.",
  entryFee: "299.00",
  deadline: "March 31, 2026",
  eligibleGenres: "Feature, Short, Documentary, Animation and More",
  benefits: [
    "Get your film in front of industry professionals",
    "Gain exposure and new opportunities",
    "Be part of a global community of filmmakers",
  ],
};

const pageFields = [
  ["heading", "Main heading"],
  ["description", "Description"],
  ["entryFee", "Entry Fee (USD)"],
  ["deadline", "Submission Deadline"],
  ["eligibleGenres", "Eligible Genres"],
];

export default function FilmFestivalManagement() {
  const [page, setPage] = useState(defaultPage);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(API_ENDPOINTS.filmFestival.page);
      if (!data?.status || !data?.result) {
        throw new Error(data?.message || "Festival page settings could not be loaded.");
      }
      setPage({
        ...defaultPage,
        ...data.result,
        entryFee: String(data.result.entryFee ?? defaultPage.entryFee),
        benefits: Array.isArray(data.result.benefits)
          ? data.result.benefits
          : defaultPage.benefits,
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateBenefit = (index, value) => {
    setPage((current) => ({
      ...current,
      benefits: current.benefits.map((benefit, benefitIndex) => (
        benefitIndex === index ? value : benefit
      )),
    }));
  };

  const savePage = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.put(API_ENDPOINTS.filmFestival.page, {
        ...page,
        entryFee: String(page.entryFee).trim(),
      });
      if (!data?.status || !data?.result) {
        throw new Error(data?.message || "Festival page settings were not saved.");
      }
      setPage({
        ...defaultPage,
        ...data.result,
        entryFee: String(data.result.entryFee),
      });
      toast.success("Film Festival page published.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700}>Film Festival</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Edit the content shown on the public Film Festival page.
        </Typography>
      </Box>
      <Paper component="form" onSubmit={savePage} sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} gap={2} mb={3}>
          <Box>
            <Typography variant="h6">Festival page content</Typography>
            <Typography variant="body2" color="text.secondary">
              Edit the heading, description, entry fee, deadline, eligible genres, and benefit points shown publicly.
            </Typography>
          </Box>
          <Button type="submit" variant="contained" startIcon={<SaveOutlined />} disabled={loading || busy}>
            Publish changes
          </Button>
        </Stack>
        {loading ? (
          <Typography color="text.secondary">Loading festival settings...</Typography>
        ) : (
          <Stack spacing={2.5}>
            {pageFields.map(([field, label]) => (
              <TextField
                key={field}
                label={label}
                value={page[field]}
                onChange={(event) => setPage((current) => ({ ...current, [field]: event.target.value }))}
                type={field === "entryFee" ? "number" : "text"}
                inputProps={{
                  maxLength: field === "heading" ? 150
                    : field === "description" ? 2000
                      : field === "eligibleGenres" ? 500
                        : 150,
                  ...(field === "entryFee" ? { min: 0.01, step: "0.01" } : {}),
                }}
                multiline={field === "description" || field === "eligibleGenres"}
                minRows={field === "description" ? 3 : field === "eligibleGenres" ? 2 : undefined}
                helperText={field === "eligibleGenres" ? "Displayed under Eligible Genres on the public contest page." : undefined}
                fullWidth
                required
              />
            ))}

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>Why Enter?</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add each benefit as a separate point.
                  </Typography>
                </Box>
                <Button
                  type="button"
                  startIcon={<AddRounded />}
                  disabled={page.benefits.length >= 20}
                  onClick={() => setPage((current) => ({ ...current, benefits: [...current.benefits, ""] }))}
                >
                  Add point
                </Button>
              </Stack>
              <Stack spacing={1.5}>
                {page.benefits.map((benefit, index) => (
                  <Stack key={index} direction="row" spacing={1} alignItems="flex-start">
                    <TextField
                      label={`Point ${index + 1}`}
                      value={benefit}
                      onChange={(event) => updateBenefit(index, event.target.value)}
                      inputProps={{ maxLength: 300 }}
                      fullWidth
                      required
                    />
                    <IconButton
                      type="button"
                      aria-label={`Remove benefit point ${index + 1}`}
                      disabled={page.benefits.length <= 1}
                      onClick={() => setPage((current) => ({
                        ...current,
                        benefits: current.benefits.filter((_, benefitIndex) => benefitIndex !== index),
                      }))}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            </Box>
            <Alert severity="info">
              Saving a new entry fee also updates the active supported festival package price, so checkout charges the displayed amount.
            </Alert>
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
