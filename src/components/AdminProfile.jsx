/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  useTheme,
  IconButton,
  Avatar,
  Tooltip,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

import Header from "./Header";
import axios from "axios";
import * as yup from "yup";
import Loading from "./Loading";
import Swal from "sweetalert2";
import { tokens } from "../theme";

const validationSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email"),
  password: yup.string().min(6, "Password must be at least 6 characters"),
});

const AdminProfile = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    profileImage: "",
  });

  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [uploading, setUploading] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false); // Track interaction with the password field

  useEffect(() => {
    validateForm();
  }, [user]);

  const validateForm = async () => {
    try {
      await validationSchema.validate(user, { abortEarly: false });
      setErrors({});
      setIsValid(true);
    } catch (yupError) {
      const newErrors = {};
      yupError.inner.forEach((error) => {
        if (error.path === "password" && !passwordTouched) {
          // Skip password validation if user hasn't interacted with the password field
          return;
        }
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
      setIsValid(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "password") {
      setPasswordTouched(true); // Mark that the user interacted with the password field
    }

    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      Swal.fire({
        title: "Error",
        text: "File upload failed",
        icon: "error",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ok",
      });
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser((prevUser) => ({
          ...prevUser,
          profileImage: reader.result,
        }));
        setUploading(false);
      };
      reader.readAsDataURL(file);

      Swal.fire({
        title: "Success",
        text: "File upload successful",
        icon: "success",
        showCancelButton: false,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
    } catch (error) {
      console.error("Error uploading image: ", error);
      Swal.fire({
        title: "Error",
        text: "File upload failed",
        icon: "error",
        showCancelButton: false,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (isValid) {
      try {
        const formData = new FormData();
        formData.append("firstName", user.firstName);
        formData.append("lastName", user.lastName);
        formData.append("email", user.email);
        if (user.password) {
          formData.append("password", user.password);
        }

        if (user.profileImage) {
          const byteString = atob(user.profileImage.split(",")[1]);
          const mimeString = user.profileImage
            .split(",")[0]
            .split(":")[1]
            .split(";")[0];
          const arrayBuffer = new ArrayBuffer(byteString.length);
          const intArray = new Uint8Array(arrayBuffer);
          for (let i = 0; i < byteString.length; i++) {
            intArray[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([intArray], { type: mimeString });
          formData.append("profileImage", blob, "profileImage.png");
        }

        // Replace with your actual API endpoint
        const res = await axios.post(
          process.env.REACT_APP_BACKEND_URL + "/user/updateProfile",
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (res.status === 200) {
          Swal.fire({
            title: "Success",
            text: "Profile has been updated successfully",
            icon: "success",
            showCancelButton: false,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: "Error",
          text: "Failed to update profile",
          icon: "error",
          showCancelButton: false,
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const token = localStorage.getItem("token")

  const getAdmin = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(process.env.REACT_APP_BACKEND_URL + "/admin/getAdmin", {
        headers,
      });

      console.log(res);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getAdmin();
  }, []);
  return (
    <Box m="20px">
      <Header
        title="Admin Profile"
        subtitle="Manage your profile information"
      />
      <form onSubmit={handleSubmit}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          mb="30px"
        >
          <Box position="relative">
            <Avatar
              src={user.profileImage}
              alt="Profile"
              sx={{ width: 120, height: 120 }}
            />
            <Tooltip title="Update Profile Picture">
              <IconButton
                aria-label="upload picture"
                component="label"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: colors.primary[400],
                  "&:hover": { backgroundColor: colors.primary[300] },
                }}
              >
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleImageUpload}
                />
                <CameraAltIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
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
            name="firstName"
            value={user.firstName}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Last Name"
            name="lastName"
            value={user.lastName}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            variant="filled"
            type="email"
            label="Email"
            name="email"
            value={user.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            fullWidth
            variant="filled"
            type="password"
            label="New Password (optional)"
            name="password"
            value={user.password}
            onChange={handleChange}
            error={passwordTouched && !!errors.password} // Show error only if the password field is touched
            helperText={passwordTouched && errors.password} // Show error message only if touched
          />
        </Box>

        <Box display="flex" justifyContent="end" mt="20px">
          <Button
            type="submit"
            color="secondary"
            variant="contained"
            disabled={!isValid || loading}
          >
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </Box>
      </form>
      {loading && <Loading />}
    </Box>
  );
};

export default AdminProfile;
