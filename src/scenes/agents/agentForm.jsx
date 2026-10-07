/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Header from "../../components/Header";
import axios from "axios";
import * as yup from "yup";
import Loading from "../../components/Loading";
import Swal from "sweetalert2";

const validationSchema = yup.object().shape({
  name: yup.string().required("First name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
});

const AgentForm = () => {
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [agent, setAgent] = useState({
    id: "",
    fName: "",
    lName: "",
    email: "",
    officePhone: "",
    cellPhone: "",
    language: "",
  });

  // Separate state for image handling
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState({
    fName: false,
    email: false
  });

  useEffect(() => {
    if (id && location.state && location.state.agent) {
      const loadedAgent = location.state.agent;
      setAgent(loadedAgent);
      if (loadedAgent.profileImage) {
        setImagePreview(loadedAgent.profileImage);
      }
    } else if (id) {
      setAgent((prevAgent) => ({ ...prevAgent, id }));
    }
  }, [id, location.state]);

  useEffect(() => {
    if (touched.fName || touched.email) {
      validateForm();
    }
  }, [agent.fName, agent.email]);

  const validateForm = async () => {
    try {
      await validationSchema.validate(
        { name: agent.fName, email: agent.email },
        { abortEarly: false }
      );
      setErrors({});
      setIsValid(true);
    } catch (yupError) {
      const newErrors = {};
      yupError.inner.forEach((error) => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
      setIsValid(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAgent((prevAgent) => ({
      ...prevAgent,
      [name]: value,
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

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

    setUploading(true);
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
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      fName: true,
      email: true
    });
    
    await validateForm();
    
    if (isValid) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("firstName", agent.fName);
        formData.append("lastName", agent.lName);
        formData.append("email", agent.email);
        formData.append("officePhone", agent.officePhone);
        formData.append("personalPhone", agent.cellPhone);
        formData.append("language", agent.language);

        if (imageFile) {
          formData.append("imageURL", imageFile);
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        };

        const res = await axios.post(
          process.env.REACT_APP_BACKEND_URL + "/landAgent/landAgentAdd",
          formData,
          { headers }
        );

        if (res.status === 200) {
          Swal.fire({
            title: "Success",
            text: "Agent has been created successfully",
            icon: "success",
            confirmButtonText: "OK",
          });
          
          // Clean up
          if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
          }
          
          // Reset form
          setAgent({
            id: "",
            fName: "",
            lName: "",
            email: "",
            officePhone: "",
            cellPhone: "",
            language: "",
          });
          setImagePreview(null);
          setImageFile(null);
          setTouched({
            fName: false,
            email: false
          });
          setTimeout(() => {
            navigate("/agents")
          }, 1000);
        }
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: "Error",
          text: "Failed to create agent",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setLoading(false);
        
      }
    }
  };

  return (
    <Box m="20px">
      <Header
        title={id ? "Edit Agent" : "Create Agent"}
        subtitle={id ? "Modify agent information" : "Add a new agent to the system"}
      />
      <form onSubmit={handleSubmit}>
        <Box
          display="grid"
          gap="30px"
          gridTemplateColumns="repeat(2, 1fr)"
          sx={{
            "& > div": { gridColumn: "span 1" },
          }}
        >
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="First Name"
            name="fName"
            value={agent.fName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.fName && !!errors.name}
            helperText={touched.fName && errors.name}
          />
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Last Name"
            name="lName"
            value={agent.lName}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            variant="filled"
            type="email"
            label="Email"
            name="email"
            value={agent.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && !!errors.email}
            helperText={touched.email && errors.email}
          />
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Office Phone"
            name="officePhone"
            value={agent.officePhone}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Cell Phone"
            name="cellPhone"
            value={agent.cellPhone}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Language"
            name="language"
            value={agent.language}
            onChange={handleChange}
          />

          {/* Image Upload Section */}
          <Box sx={{ gridColumn: "span 2" }}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="agent-image-upload"
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="agent-image-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
                disabled={uploading}
                sx={{ mb: 2 }}
              >
                {uploading ? "Processing..." : "Upload Profile Image"}
              </Button>
            </label>

            {imagePreview && (
              <Box position="relative" display="inline-block">
                <img
                  src={imagePreview}
                  alt="Profile Preview"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    marginLeft:"10px"
                  }}
                />
                <IconButton
                  onClick={handleRemoveImage}
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
            )}
          </Box>
        </Box>

        <Box display="flex" justifyContent="end" mt="20px">
          <Button
            type="submit"
            color="secondary"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Loading..." : id ? "Update Agent" : "Add Agent"}
          </Button>
        </Box>
      </form>
      {loading && <Loading />}
    </Box>
  );
};

export default AgentForm;