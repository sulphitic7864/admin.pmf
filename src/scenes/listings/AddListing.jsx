import {
    Box,
    Button,
    TextField,
    Snackbar,
    Typography,
    MenuItem,
    IconButton,
    FormControl,
    Select,
    FormHelperText
  } from "@mui/material";
  import DeleteIcon from "@mui/icons-material/Delete";
  import { Formik } from "formik";
  import React, { useState, useEffect } from "react";
  import { useNavigate, useParams } from "react-router-dom";
  import * as yup from "yup";
  import axios from "axios";
  import MuiAlert from "@mui/material/Alert";
  import Header from "../../components/Header";
  import Loading from "../../components/Loading";
  
  const AddListing = () => {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
  
    const [initialValues, setInitialValues] = useState({
      landName: "",
      address: "",
      zipCode: "",
      price: "",
      bedRooms: 0,
      baths: 0,
      halfBaths: 0,
      sqrFt: 0,
      acreage: 0,
      style: "",
      images: [],
      landAgentId: "",
      landId:""
    });
    const [loading, setLoading] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState("success");
    const [agents, setAgents] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
   
  
    useEffect(() => {
      const fetchAgents = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/landAgent/getAllAgents`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.success) {
            setAgents(response.data.users);
          }
        } catch (error) {
          console.error("Failed to fetch agents", error);
        }
      };
  
      if (isEditMode) {
        fetchListingData(id);
      }
  
      fetchAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, id]);
  
    const fetchListingData = async (listingId) => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/land/getLandById/${listingId}`,{
          headers: { Authorization: `Bearer ${token}` },
        });
       
        if (response.data.success) {
          const data = response.data.user;
        
          const images = Array.from({ length: 10 }, (_, i) => i + 1)
                    .map(position => ({
                        position,
                        url: data[`landImage${position}`]
                    }))
                    .filter(image => image.url);


          setInitialValues({
            id:data.id || '',
            landName: data.landName || "",
            address: data.address || "",
            zipCode: data.zipCode || "",
            price: data.price || 0,
            bedRooms: data.bedRooms || 0,
            baths: data.baths || 0,
            halfBaths: data.halfBaths || 0,
            sqrFt: data.sqrFt || 0,
            acreage: data.acreage || 0,
            style: data.style || "",
            images: [], 
            landAgentId: data.landAgentId || "",
            landId:data.landId || ''
          });
          setExistingImages(images || []); 
        }
      } catch (error) {
        console.error("Failed to fetch listing data", error);
      } finally {
        setLoading(false);
      }
    };
  
    

    const handleFormSubmit = async (values, { resetForm }) => {
        setLoading(true);
        try {
          const headers = { Authorization: `Bearer ${token}` };
          const formData = new FormData();
      
          const totalImages = newImages.filter(image => image !== null).length + existingImages.filter(image => image !== null).length;
          
          if (totalImages > 10) {
            setAlertSeverity("error");
            setAlertMessage("You can only upload up to 10 images.");
            setOpenSnackbar(true);
            setLoading(false);
            return;
          }
      
          // Append the form fields
          formData.append("landName", values.landName);
          formData.append("address", values.address);
          formData.append("zipCode", values.zipCode);
          formData.append("price", values.price);
          formData.append("bedRooms", values.bedRooms);
          formData.append("baths", values.baths);
          formData.append("halfBaths", values.halfBaths);
          formData.append("sqrFt", values.sqrFt);
          formData.append("style", values.style);
          formData.append("landAgentId", values.landAgentId);
          formData.append("landId", values.landId);

          const allPositions = Array.from({ length: 10 }, (_, i) => i + 1);
        const usedPositions = existingImages.filter(img => img !== null).map(img => img.position);
        const availablePositions = allPositions.filter(pos => !usedPositions.includes(pos));
    

        newImages.forEach((image, index) => {
          if (index < availablePositions.length) {
              const position = availablePositions[index];
              formData.append(`landImage${position}`, image);
          }
      });

      
          let response;
          if (isEditMode) {
            response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/land/updateLandData/${id}`, formData, {
              headers: { ...headers, "Content-Type": "multipart/form-data" },
            });
          } else {
            response = await axios.post(process.env.REACT_APP_BACKEND_URL + "/land/landAdd", formData, {
              headers: { ...headers, "Content-Type": "multipart/form-data" },
            });
          }
      
          if (response.data.success || response.data.status) {
            setAlertSeverity("success");
            setAlertMessage(isEditMode ? "Listing Updated Successfully" : "Listing Added Successfully");
            setTimeout(() => {
              navigate("/listings");
            }, 100);
            resetForm();
          } else {
            setAlertSeverity("error");
            setAlertMessage(response.data.result.message);
          }
        } catch (error) {
          setAlertSeverity("error");
          setAlertMessage(isEditMode ? "Failed to update listing" : "Failed to add listing");
          console.log(error);
        } finally {
          setLoading(false);
          setOpenSnackbar(true);
        }
      };

      // const handleImageChange = (event) => {
      //   const files = Array.from(event.target.files);
      //   const maxImageSize = 2 * 1024 * 1024; 
      
      //   const oversizedFiles = files.filter(file => file.size > maxImageSize);
      
      //   if (oversizedFiles.length > 0) {
      //     setAlertSeverity("error");
      //     setAlertMessage("Some images exceed the maximum size of 2MB.");
      //     setOpenSnackbar(true);
      //     return; 
      //   }
      
      //   const remainingSlots = 10 - existingImages.length;
        
      //   const validFiles = files
      //     .filter(file => file.size <= maxImageSize)
      //     .slice(0, remainingSlots);
      
      //   if (validFiles.length + existingImages.length > 10) {
      //     setAlertSeverity("error");
      //     setAlertMessage("Maximum 10 images allowed");
      //     setOpenSnackbar(true);
      //     return;
      //   }
      
      //   setNewImages(validFiles);
      // };

      const handleImageChange = (event) => {
        const files = Array.from(event.target.files);
        const maxImageSize = 2 * 1024 * 1024; 
    
        const oversizedFiles = files.filter(file => file.size > maxImageSize);
    
        if (oversizedFiles.length > 0) {
          setAlertSeverity("error");
          setAlertMessage("Some images exceed the maximum size of 2MB.");
          setOpenSnackbar(true);
          return;
        }
    
        const totalImagesAfterAdd = existingImages.length + newImages.length + files.length;
    
        if (totalImagesAfterAdd > 10) {
          setAlertSeverity("error");
          setAlertMessage("Maximum 10 images allowed");
          setOpenSnackbar(true);
          return;
        }
    
        
        const validFiles = files.filter(file => file.size <= maxImageSize);
    
        setNewImages(prevImages => {
          const updatedImages = [...prevImages, ...validFiles];
          const remainingSlots = 10 - existingImages.length;
          return updatedImages.slice(0, remainingSlots);
        });
      };
      
      const handleRemoveNewImage = (index) => {
        setNewImages(prevImages => {
          const newImages = [...prevImages];
          newImages.splice(index, 1);
          return newImages;
        });
      };
      

    const handleRemoveExistingImage = async (position, id) => {
      const headers = { Authorization: `Bearer ${token}` };
      try {
        setLoading(true);
        const response = await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/land/landImage${position}SetNull/${id}`,
          {},
          {
            headers: { ...headers, "Content-Type": "multipart/form-data" },
          }
        );
  
        if (response.data.success || response.data.status) {
          // Remove the image from existingImages array by filtering
          setExistingImages(prevImages => prevImages.filter(img => img && img.position !== position));
          setAlertSeverity("success");
          setAlertMessage("Image deleted successfully");
        } else {
          setAlertSeverity("error");
          setAlertMessage(response.data.result.message);
        }
      } catch (err) {
        setAlertSeverity("error");
        setAlertMessage("Failed to delete image");
        console.log("error", err);
      } finally {
        setLoading(false);
        setOpenSnackbar(true);
      }
    };

   
      
  
    return (
      <Box m="20px">
        <Header title={isEditMode ? "Edit Listing" : "Add Listing"} />
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={listingSchema}
          onSubmit={handleFormSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
          }) => (
            <form onSubmit={handleSubmit}>
                 <Box display="grid" gap="30px" >

                 <Typography fontWeight="bold" fontSize="16px">Address*</Typography>
              <Box mt={-2}>
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.address}
                  name="address"
                  error={!!touched.address && !!errors.address}
                  helperText={touched.address && errors.address}
                />
              </Box>

             <Typography fontWeight="bold" fontSize="16px">City*</Typography>
              <Box mt={-2}>
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.landName}
                  name="landName"
                  error={!!touched.landName && !!errors.landName}
                  helperText={touched.landName && errors.landName}
                />
              </Box>

              <Typography fontWeight="bold" fontSize="16px">ZIP Code*</Typography>
              <Box mt={-2}>
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.zipCode}
                  name="zipCode"
                  error={!!touched.zipCode && !!errors.zipCode}
                  helperText={touched.zipCode && errors.zipCode}
                />
              </Box>

<Typography fontWeight="bold" fontSize="16px">Price*</Typography>
<Box mt={-2}>
  <TextField
    fullWidth
    variant="filled"
    type="text" 
    onWheel={(e) => e.target.blur()}
    onBlur={(e) => {
      const value = e.target.value.replaceAll(',', ''); 
      handleBlur(e);
      const formattedValue = new Intl.NumberFormat().format(value); 
      e.target.value = formattedValue; 
    }}
    onChange={(e) => {
      const value = e.target.value.replaceAll(',', '');
      handleChange({ target: { name: "price", value: value } }); 
    }}
    value={new Intl.NumberFormat().format(values.price)} 
    name="price"
    error={!!touched.price && !!errors.price}
    helperText={touched.price && errors.price}
  />
</Box>


              <Typography fontWeight="bold" fontSize="16px">Bedrooms*</Typography>
              <Box mt={-2}>
                <TextField
                  fullWidth
                  variant="filled"
                  type="number"
                  onWheel={(e) => e.target.blur()}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.bedRooms}
                  name="bedRooms"
                  error={!!touched.bedRooms && !!errors.bedRooms}
                  helperText={touched.bedRooms && errors.bedRooms}
                />
              </Box>

              <Typography fontWeight="bold" fontSize="16px">Bathrooms*</Typography>
              <Box mt={-2}>
                <TextField
                  fullWidth
                  variant="filled"
                  type="number"
                  onWheel={(e) => e.target.blur()}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.baths}
                  name="baths"
                  error={!!touched.baths && !!errors.baths}
                  helperText={touched.baths && errors.baths}
                />
              </Box>

              <Typography fontWeight="bold" fontSize="16px">Half Baths*</Typography>
              <Box mt={-2}>
                <TextField
                  fullWidth
                  variant="filled"
                  type="number"
                  onWheel={(e) => e.target.blur()}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.halfBaths}
                  name="halfBaths"
                  error={!!touched.halfBaths && !!errors.halfBaths}
                  helperText={touched.halfBaths && errors.halfBaths}
                />
              </Box>

              <Typography fontWeight="bold" fontSize="16px">Square Feet*</Typography>
              <Box mt={-2}>
                <TextField
                  fullWidth
                  variant="filled"
                  type="number"
                  onWheel={(e) => e.target.blur()}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.sqrFt}
                  name="sqrFt"
                  error={!!touched.sqrFt && !!errors.sqrFt}
                  helperText={touched.sqrFt && errors.sqrFt}
                />
              </Box>

              

<Typography fontWeight="bold" fontSize="16px">Style*</Typography>
<Box mt={-2}>
  <FormControl fullWidth variant="filled" error={!!touched.style && !!errors.style}>
   
    <Select
      name="style"
      value={values.style}
      onBlur={handleBlur}
      onChange={handleChange}
    >
      <MenuItem value="House">House</MenuItem>
      <MenuItem value="Townhome">Townhome</MenuItem>
      <MenuItem value="Multi-family">Multi-family</MenuItem>
      <MenuItem value="Single Family">Single Family</MenuItem>
      <MenuItem value="Condo/Co-Ops">Condo/Co-Ops</MenuItem>
      <MenuItem value="Commercial">Commercial</MenuItem>
      <MenuItem value="Residential">Residential</MenuItem>
      <MenuItem value="Manufactured">Manufactured</MenuItem>
      <MenuItem value="Property Management">Property Management</MenuItem>
      <MenuItem value="Lots/Land">Lots/Land</MenuItem>
      <MenuItem value="Apartments">Apartments</MenuItem>
    </Select>
    {touched.style && errors.style && <FormHelperText>{errors.style}</FormHelperText>}
  </FormControl>
</Box>



              <Typography fontWeight="bold" fontSize="16px">Select Agent</Typography>
              <Box mt={-2}>
                <TextField
                  select
                  fullWidth
                  variant="filled"
                  value={values.landAgentId}
                  name="landAgentId"
                  onChange={handleChange}
                  error={!!touched.landAgentId && !!errors.landAgentId}
                  helperText={touched.landAgentId && errors.landAgentId}
                >
                  {agents.map((agent) => (
                    <MenuItem key={agent.id} value={agent.id}>
                      {agent.firstName + ' ' + agent.lastName}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Typography fontWeight="bold" fontSize="16px">Property ID</Typography>
              <Box mt={-2}>
                <TextField
                  fullWidth
                  variant="filled"
                  type="number"
                  onWheel={(e) => e.target.blur()}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.landId}
                  name="landId"
                  error={!!touched.landId && !!errors.landId}
                  helperText={touched.landId && errors.landId}
                />
              </Box>
              
              <Typography fontWeight="bold" fontSize="16px">Upload Images (Max: 10 images, Max image size: 2MB)</Typography>
              <Box>
                
                {existingImages.length > 0 && (
      <Box display="flex" gap="10px" flexWrap="wrap">
        {existingImages.map((image) => (
          <Box key={image.position} position="relative">
            <img 
              src={image.url} 
              alt={`Existing Preview ${image.position}`} 
              width={100} 
              height={100} 
            />
            <IconButton
              onClick={() => handleRemoveExistingImage(image.position, values.id)}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                color: "red",
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Box>
    )}
  
                {/* New Images Preview */}
                <Box display="flex" gap="10px" flexWrap="wrap">
                  {newImages.map((image, index) => (
                    <Box key={index} position="relative">
                      <img src={URL.createObjectURL(image)} alt={`New Preview ${index + 1}`} width={100} height={100} />
                      <IconButton
                        onClick={() => handleRemoveNewImage(index)}
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          color: "red",
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>

                </Box>
  
                <Button variant="contained" component="label"  mt={-2} sx={{ width: '130px' }}>
                  Select Images
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              </Box>
  
              {/* Submit Button */}
              <Box mt={4}>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? "Saving..." : isEditMode ? "Update Listing" : "Add Listing"}
                </Button>
              </Box>
            </form>
          )}
        </Formik>
  
        {/* Snackbar for Notifications */}
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
        {loading && <Loading />}
      </Box>
    );
  };
  
  const listingSchema = yup.object().shape({
    landName: yup.string().required("Required"),
    address: yup.string().required("Required"),
    zipCode: yup.string().required("Required"),
    price: yup.number().required("Required"),
    bedRooms: yup.number().required("Required"),
    baths: yup.number().required("Required"),
    halfBaths: yup.number(),
    sqrFt: yup.number().required("Required"),
    acreage: yup.number().required("Required"),
    style: yup.string().required("Required"),
    landAgentId: yup.string().required("Required"),
    landId: yup.string(),
  });
  
  export default AddListing;
  