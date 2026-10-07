/* eslint-disable react-hooks/exhaustive-deps */
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    IconButton,
    Snackbar,
  } from "@mui/material";
  import DeleteIcon from "@mui/icons-material/Delete";
  import React, { useState, useEffect } from "react";
  import axios from "axios";
  import MuiAlert from "@mui/material/Alert";
  import Header from "../../components/Header";
  
  const SliderImages = () => {
    const token = localStorage.getItem("token");
    const [loading, setLoading] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState("success");
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
  
    useEffect(() => {
      fetchSliderImages();
    // eslint-disable-next-line no-use-before-define
    }, []);
  
    const fetchSliderImages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/slide/getSlideById/1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.data.success) {
          const data = response.data.user || [];
       
        const images = Array.from({ length: 10 }, (_, i) => i + 1)
                    .map(position => ({
                        position,
                        url: data[`slideImage${position}`]
                    }))
                    .filter(image => image.url);
          setExistingImages(images);

        }
      } catch (error) {
        console.error("Failed to fetch slider images", error);
        setAlertSeverity("error");
        setAlertMessage("Failed to load slider images");
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };
  
    const handleImageChange = (event) => {
      const files = Array.from(event.target.files);
      const maxImageSize = 10 * 1024 * 1024; // 2MB

      const remainingSlots = 10 - existingImages.length - newImages.length;
      if (remainingSlots <= 0) {
        setAlertSeverity("error");
        setAlertMessage("Maximum 10 images allowed");
        setOpenSnackbar(true);
        return;
      }
  
      const validFiles = files.filter(file => file.size <= maxImageSize);
      const previewImages = validFiles.slice(0, remainingSlots);
      setNewImages([...newImages, ...previewImages]);
    };
  
    const handleRemoveNewImage = (index) => {
      setNewImages(newImages.filter((_, i) => i !== index));
    };
  
    const handleRemoveExistingImage = async (imageId) => {
      try {
        setLoading(true);
        const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/slide/slideImage${imageId}SetNull/1`,{}, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.data.success) {
          setExistingImages(prevImages => prevImages.filter(img => img.position !== imageId));
          setAlertSeverity("success");
          setAlertMessage("Image deleted successfully");
        } else {
          setAlertSeverity("error");
          setAlertMessage("Failed to delete image");
        }
      } catch (error) {
        console.error("Failed to delete image", error);
        setAlertSeverity("error");
        setAlertMessage("Failed to delete image");
      } finally {
        setLoading(false);
        setOpenSnackbar(true);
      }
    };
  
    const handleUploadImages = async () => {
      if (newImages.length === 0) return;
  
      try {
        setLoading(true);
        const formData = new FormData();
        const allPositions = Array.from({ length: 10 }, (_, i) => i + 1);
        const usedPositions = existingImages.map(img => img.position);
        const availablePositions = allPositions.filter(pos => !usedPositions.includes(pos));

        newImages.forEach((image, index) => {
            if (index < availablePositions.length) {
                const position = availablePositions[index];
                formData.append(`slideImage${position}`, image);
            }
        });


        let response = {};
            response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/slide/slideUpdate/1`, formData, {
                headers: { 
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "multipart/form-data"
                },
              });

        if (response.data.status) {
          setAlertSeverity("success");
          setAlertMessage("Images uploaded successfully");
          setNewImages([]);
          fetchSliderImages(); // Refresh the existing images
        } else {
          setAlertSeverity("error");
          setAlertMessage("Failed to upload images");
        }
      } catch (error) {
        console.error("Failed to upload images", error);
        setAlertSeverity("error");
        setAlertMessage("Failed to upload images");
      } finally {
        setLoading(false);
        setOpenSnackbar(true);
      }
    };
  
    return (
      <Box m="20px">
        <Header title="Home Page Slider Images" />
        
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Upload Slider Images (Max: 10 images)
            </Typography>
  
            {existingImages.length === 0 && newImages.length === 0 && (
              <Typography color="textSecondary" sx={{ my: 4 }}>
                No images available
              </Typography>
            )}
  
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Current Slider Images
                </Typography>
                <Box display="flex" gap="10px" flexWrap="wrap">
                  {existingImages.map((image) => (
                    <Box key={image.position} position="relative">
                      <img
                        src={image.url}
                        alt={`Slider ${image.position}`}
                        style={{
                          width: "200px",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "4px"
                        }}
                      />
                      <IconButton
                        onClick={() => handleRemoveExistingImage(image.position)}
                        sx={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                          },
                        }}
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
  
            {/* New Images Preview */}
            {newImages.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  New Images to Upload
                </Typography>
                <Box display="flex" gap="10px" flexWrap="wrap">
                  {newImages.map((image, index) => (
                    <Box key={index} position="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`New ${index + 1}`}
                        style={{
                          width: "200px",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "4px"
                        }}
                      />
                      <IconButton
                        onClick={() => handleRemoveNewImage(index)}
                        sx={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                          },
                        }}
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
  
            {/* Upload Buttons */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                component="label"
                disabled={loading || existingImages.length + newImages.length >= 10}
              >
                Select Images
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
  
              {newImages.length > 0 && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUploadImages}
                  disabled={loading}
                >
                  {loading ? "Uploading..." : "Upload Selected Images"}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
  
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={() => setOpenSnackbar(false)}
            severity={alertSeverity}
          >
            {alertMessage}
          </MuiAlert>
        </Snackbar>
      </Box>
    );
  };
  
  export default SliderImages;