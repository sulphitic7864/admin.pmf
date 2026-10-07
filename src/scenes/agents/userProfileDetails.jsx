import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Edit,
  Save,
  Cancel,
  Delete,
  CameraAlt,
  Visibility,
  Assignment,
} from "@mui/icons-material";
import * as Yup from "yup";
import axios from "axios";
import Loading from "../../components/Loading";
import Swal from "sweetalert2";

const UserProfileDetails = ({ isAdmin = true }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // UPDATED: Extract only the agent ID from location state
  const agentId = location.state?.agent?.id; // UPDATED
  const token = localStorage.getItem("token");

  const formData = new FormData();
  const [isEditing, setIsEditing] = useState(false);

  // UPDATED: Initialize editedAgent as an empty object
  const [editedAgent, setEditedAgent] = useState({}); // UPDATED
  const [listings, setListings] = useState([]);
  const [listingToRemove, setListingToRemove] = useState(null);
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);
  // const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  // const [isChanged, setIsChanged] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // New state to store the selected image file
  const [imageFile, setImageFile] = useState(null);

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string(),
    email: Yup.string().email("Invalid email"),
    officePhone: Yup.string(),
    cellPhone: Yup.string(),
    language: Yup.string(),
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (e.g., 10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      Swal.fire({
        title: "Error",
        text: "File size should not exceed 10MB",
        icon: "error",
        confirmButtonText: "Ok",
      });
      return;
    }

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setImageFile(file);
    } catch (error) {
      console.error("Error processing image: ", error);
      Swal.fire({
        title: "Error",
        text: "Error processing image",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
    }
  };

  // UPDATED: Modify fetchAgent to use agentId
  const fetchAgent = async () => {
    // UPDATED
    if (!agentId) {
      // UPDATED
      Swal.fire({
        title: "Error",
        text: "Agent ID is missing.",
        icon: "error",
        showCancelButton: false,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
      navigate("/agents"); // Redirect if no agent ID
      return;
    }

    setLoading(true);
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const res = await axios.get(
        process.env.REACT_APP_BACKEND_URL + `/landAgent/getLandAgentById/${agentId}`, // UPDATED
        { headers }
      );

      setEditedAgent(res.data.user);
      setListings(res.data.user.lands || []); 
    } catch (error) {
      console.error("Error fetching agent:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch agent details.",
        icon: "error",
        showCancelButton: false,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {

    try {
      await validationSchema.validate(editedAgent, { abortEarly: false });
      setIsSaveDialogOpen(true);
    } catch (err) {
      const validationErrors = {};
      err.inner.forEach((error) => {
        validationErrors[error.path] = error.message;
      });
      setErrors(validationErrors);
    }
  };

  const handleConfirmSave = async () => {

    setIsSaveDialogOpen(false);
    await handleUpdate();
    setIsEditing(false);
    setErrors({});
  };

  const handleCancel = () => {
    // UPDATED: Reset to fetched agent details instead of initial agent
    fetchAgent(); // UPDATED
    setIsEditing(false);
    setImageFile(null); // Reset the image file state on cancel
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedAgent({ ...editedAgent, [name]: value });
    setErrors({ ...errors, [name]: undefined });
   
  };


  const handleConfirmRemove = async () => {
    const updatedListings = listings.filter(
      (listing) => listing.id !== listingToRemove
    );
    setListings(updatedListings);
    setIsConfirmingRemove(false);
    setListingToRemove(null);
    await handleUpdate();
  };

  const deleteAgent = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(
        process.env.REACT_APP_BACKEND_URL + `/landAgent/deleteLandAgentById/${id}`,
        {
          headers,
        }
      );
      Swal.fire({
        title: "Deleted!",
        text: "Agent has been deleted.",
        icon: "success",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
      navigate("/agents"); // Moved navigate here to ensure redirection after deletion
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "Error",
        text: "Failed to delete agent",
        icon: "error",
        showCancelButton: false,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
    }
  };

  const handleDeleteAgent = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAgent(id);
      }
    });
  };

  const handleUpdate = async () => {
    setLoading(true);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      let response;

      if (imageFile) {

        formData.append("firstName", editedAgent.firstName);
        formData.append("lastName", editedAgent.lastName);
        formData.append("email", editedAgent.email);
        formData.append("officePhone", editedAgent.officePhone);
        formData.append("personalPhone", editedAgent.personalPhone);
        formData.append("language", editedAgent.language);
        formData.append("imageURL", imageFile);

        response = await axios.put(
          process.env.REACT_APP_BACKEND_URL +
            `/landAgent/updateLandAgentData/${editedAgent.id}`,
          formData,
          {
            headers: {
              ...headers,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // If no image is selected, send JSON data
        const payload = {
          firstName: editedAgent.firstName,
          lastName: editedAgent.lastName,
          email: editedAgent.email,
          // imageURL: editedAgent.imageURL, // Existing image URL
          officePhone: editedAgent.officePhone,
          personalPhone: editedAgent.personalPhone,
          language: editedAgent.language,
          lands: listings,
        };

        response = await axios.put(
          process.env.REACT_APP_BACKEND_URL +
            `/landAgent/updateLandAgentData/${editedAgent.id}`,
          payload,
          { headers }
        );
      }


      // Update the local state with the response data to reflect changes
      setEditedAgent(response.data.data); // Adjust based on your API response structure

      Swal.fire({
        title: "Success",
        text: "Agent profile updated successfully",
        icon: "success",
        showCancelButton: false,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "Error",
        text: "Failed to update agent profile",
        icon: "error",
        showCancelButton: false,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgent(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]); 

  return (
    <Box sx={{ p: 3, backgroundColor: "#f0f8ff", minHeight: "100vh" }}>
      <Paper elevation={3} sx={{ p: 3, backgroundColor: "white", mb: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h4">Agent Profile</Typography>
          <Box>
            {isAdmin && !isEditing && (
              <Button startIcon={<Edit />} onClick={handleEdit}>
                Edit Profile
              </Button>
            )}
            {isAdmin && !isEditing && (
              <Button
                startIcon={<Delete />}
                onClick={() => handleDeleteAgent(editedAgent.id)} // UPDATED
              >
                Delete Agent
              </Button>
            )}
          </Box>

          {isAdmin && isEditing && (
            <Box>
              <IconButton onClick={handleSave} color="primary">
                <Save />
              </IconButton>
              <IconButton onClick={handleCancel} color="error">
                <Cancel />
              </IconButton>
            </Box>
          )}
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Box
                position="relative"
                // onMouseEnter={() => setIsHoveringAvatar(true)}
                // onMouseLeave={() => setIsHoveringAvatar(false)}
              >
                <Avatar
                  src={imagePreview||editedAgent.imageURL}
                  alt={`${editedAgent.firstName} ${editedAgent.lastName}`}
                  sx={{
                    width: 150,
                    height: 150,
                    mb: 2,
                  }}
                />
                {isEditing && (
                  <>
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="raised-button-file"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="raised-button-file">
                      <IconButton
                        sx={{
                          position: "absolute",
                          bottom: 10,
                          right: 10,
                          backgroundColor: "rgba(255, 255, 255, 0.7)",
                        }}
                        onClick={() => fileInputRef.current.click()}
                      >
                        <CameraAlt />
                      </IconButton>
                    </label>
                  </>
                )}
              </Box>
              <Typography variant="h5">{`${editedAgent.firstName || ""} ${
                editedAgent.lastName || ""
              }`}</Typography>{" "}
              {/* UPDATED */}
              <Typography variant="body1" color="textSecondary">
                {editedAgent.email || "N/A"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              {[
                { label: "ID", field: "id", editable: false },
                { label: "First Name", field: "firstName", editable: true },
                { label: "Last Name", field: "lastName", editable: true },
                { label: "Email", field: "email", editable: true },
                { label: "Office Phone", field: "officePhone", editable: true },
                { label: "Cell Phone", field: "personalPhone", editable: true },
                { label: "Language", field: "language", editable: true },
              ].map((item) => (
                <Grid item xs={12} sm={6} key={item.field}>
                  {isEditing && item.editable ? (
                    <TextField
                      fullWidth
                      label={item.label}
                      name={item.field}
                      value={editedAgent[item.field] || ""}
                      onChange={handleChange}
                      error={!!errors[item.field]}
                      helperText={errors[item.field]}
                    />
                  ) : (
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {item.label}
                      </Typography>
                      <Typography variant="body1">
                        {editedAgent[item.field] || "N/A"}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, backgroundColor: "white" }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5">Listings</Typography>
          {/* {isAdmin && isEditing && (
            <Button
              startIcon={<Add />}
              onClick={handleAddListing}
              variant="contained"
              color="primary"
            >
              Add Listing
            </Button>
          )} */}
        </Box>
        {listings.length !== 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      ID
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Name
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Zip Code
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Address
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Actions
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>{listing.id}</TableCell>
                    <TableCell>{listing.landName}</TableCell>
                    <TableCell>{listing.zipCode}</TableCell>
                    <TableCell>{listing.address}</TableCell>
                    <TableCell>
                      {isAdmin && (
                        <>
                          <IconButton
                            aria-label="view"
                            onClick={() => {
                              navigate(`/listings/viewListing/${listing.id}`);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                          {/* Uncomment the following block if you want to enable deletion of listings
                          <IconButton
                            aria-label="delete"
                            onClick={() => handleRemoveListing(listing.id)}
                          >
                            <Delete />
                          </IconButton>
                          */}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "300px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
            }}
          >
            <Assignment sx={{ fontSize: 64, color: "#bdbdbd", mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Listings Available
            </Typography>
            <Typography variant="body1" color="textSecondary" align="center">
              There are currently no listings for you to display.
              {/* {isAdmin && " Click the 'Assign A Listing' button to add one."} */}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Confirmation Modal for Deletion */}
      <Dialog
        open={isConfirmingRemove}
        onClose={() => setIsConfirmingRemove(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Listing Removal"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this listing? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmingRemove(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmRemove} color="error" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <Dialog
        open={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        aria-labelledby="save-dialog-title"
      >
        <DialogTitle id="save-dialog-title">Save Changes</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to save the changes?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSaveDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmSave} color="primary" autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Overlay */}
      {loading && <Loading />}
    </Box>
  );
};

export default UserProfileDetails;
