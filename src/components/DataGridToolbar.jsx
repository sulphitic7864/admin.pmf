import { InputAdornment, Stack, TextField } from "@mui/material";
import { SearchRounded } from "@mui/icons-material";
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";

export default function DataGridToolbar({ search, onSearchChange }) {
  return (
    <GridToolbarContainer
      sx={{
        width: "100%",
        minHeight: "unset",
        flexWrap: "nowrap",
        justifyContent: "space-between",
        gap: 2,
        px: 2.5,
        py: 1.75,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.25} sx={{ minWidth: 0, flexWrap: "nowrap" }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </Stack>
      <TextField
        size="small"
        placeholder="Search records"
        value={search}
        onChange={onSearchChange}
        sx={{
          width: "min(270px, 32vw)",
          flex: "0 0 auto",
          "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: 11 },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRounded fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
    </GridToolbarContainer>
  );
}
