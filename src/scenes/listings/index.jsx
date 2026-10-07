/* eslint-disable react-hooks/exhaustive-deps */
import {
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
  } from "@mui/icons-material";
  import EditIcon from "@mui/icons-material/Edit";
  import { Box, Button, IconButton, Tooltip, useTheme } from "@mui/material";
  import { DataGrid, GridToolbar } from "@mui/x-data-grid";
  import jsPDF from "jspdf";
  import "jspdf-autotable";
  import React, { useEffect, useState } from "react";
  import { Link } from "react-router-dom";
  import Swal from "sweetalert2";
  import axios from "axios";
  import Header from "../../components/Header";
  import { tokens } from "../../theme";

  
  
  const Listings = () => {
    const [data, setData] = useState([]);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const token = localStorage.getItem("token");
    const [agents, setAgents] = useState([]);
  
   
    const fetchListings = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        let url = `${process.env.REACT_APP_BACKEND_URL}/land/getAlllands`;
        const response = await axios.get(url, { headers });
        const responseData = response.data;
        if (responseData.success) {
          const modifiedData = responseData.users.map((user) => ({
            id: user.id,
            landId: user.landId,
            landName: user.landName, 
            zip: user.zipCode ? user.zipCode : "N/A", 
            address: user.address,
            price: `$${user.price}`, 
            style: user.style,
            bedrooms: user.bedRooms,
            bathrooms: user.baths,
            halfBaths: user.halfBaths,
            size: user.sqrFt,
            agentId: user.landAgentId, 
          }));
    
          setData(modifiedData); 
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };
    

    // Fetch Agents
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
  
    useEffect(() => {
      fetchListings();
      fetchAgents();
    }, []);

    const getAgentName = (agentId) => {
      const agent = agents.find((agent) => agent.id === agentId);
      return agent ? agent.firstName +' '+ agent.lastName : "Unknown"; 
    };
  
    const exportToPdf = () => {
      const doc = new jsPDF();
      doc.autoTable({
        head: [["ID", "land Name", "Area", "Zip", "Address", "Price", "Bedrooms", "Bathrooms", "Half Baths", "Size (sq. ft.)", "Acreage","Agent",]],
        body: data.map(({ id, landName, area, zip, address, price, bedrooms, bathrooms, halfBaths, size, acreage,agentId, }) => [
          id,
          landName,
          area,
          zip,
          address,
          price,
          bedrooms,
          bathrooms,
          halfBaths,
          size,
          acreage,
          getAgentName(agentId),
        ]),
      });
      doc.save("listings_data.pdf");
    };
  
    const handleDeleteClick = (id) => {
      Swal.fire({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this listing!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Delete",
      }).then((result) => {
        if (result.isConfirmed) {
          const headers = { Authorization: `Bearer ${token}` };
          axios
            .delete(`${process.env.REACT_APP_BACKEND_URL}/land/deleteLandById/${id}`, { headers })
            .then((response) => {
              if (response.status !== 200) throw new Error("Failed to delete listing");
              setData(data.filter((item) => item.id !== id));
              Swal.fire("Deleted!", "The listing has been deleted.", "success");
            })
            .catch((error) => {
              console.error("Error deleting listing:", error);
              Swal.fire("Error!", "Failed to delete listing. Please try again later.", "error");
            });
        }
      });
    };
  
    const handleEditClick = (id) => {
      // Implement the edit functionality
    };
  
    // const handleStatusChange = (id, newStatus) => {
    //   Swal.fire({
    //     title: "Are you sure?",
    //     text: "Do you want to change the status of this listing?",
    //     icon: "warning",
    //     showCancelButton: true,
    //     confirmButtonColor: "#3085d6",
    //     cancelButtonColor: "#d33",
    //     confirmButtonText: "Yes, change it!",
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       const headers = {
    //         Authorization: `Bearer ${token}`,
    //       };
  
    //       axios
    //         .patch(process.env.REACT_APP_BACKEND_URL + `/listing/updateStatus/${id}`, { listingStatus: newStatus }, { headers })
    //         .then((response) => {
    //           if (response.status !== 200) {
    //             throw new Error("Failed to update status");
    //           }
  
    //           const updatedData = data.map((item) => {
    //             if (item.id === id) {
    //               return { ...item, listingStatus: newStatus };
    //             }
    //             return item;
    //           });
    //           setData(updatedData);
    //           Swal.fire("Updated!", "The listing status has been updated.", "success");
    //         })
    //         .catch((error) => {
    //           console.error("Error updating listing status:", error);
    //           Swal.fire(
    //             "Error!",
    //             "Failed to update listing status. Please try again later.",
    //             "error"
    //           );
    //         });
    //     }
    //   });
    // };
  

    const columns = [

      { field: "id", headerName: "ID", flex: 0.5 },
      { field: "landId", headerName: "Property Id", flex: 0.6 },
      { field: "address", headerName: "Address", flex: 1.2 },
      { field: "landName", headerName: "City", flex: 0.8 },
      { field: "zip", headerName: "Zip", flex: 0.6 },
      { field: "price", headerName: "Price", flex: 0.6 },
      { field: "style", headerName: "Style", flex: 0.8 },
      { field: "bedrooms", headerName: "Bedrooms", flex: 0.6 },
      { field: "bathrooms", headerName: "Bathrooms", flex: 0.6 },
      { field: "halfBaths", headerName: "Half Baths", flex: 0.6 },
      { field: "size", headerName: "Size (sq. ft.)", flex: 0.6 },
      {
        field: "agentId", // New Agent column
        headerName: "Agent",
        flex: 1,
        valueGetter: (params) => getAgentName(params.row.agentId), // Display agent name
      },
      {
        field: "Actions",
        headerName: "Actions",
        flex: 0.9,
        renderCell: (params) => (
          <Box>
            <Tooltip title="Edit">
              <Link to={`/listings/editListing/${params.row.id}`}>
                <IconButton onClick={() => handleEditClick(params.row.id)}>
                  <EditIcon />
                </IconButton>
              </Link>
            </Tooltip>
            <Tooltip title="View">
              <Link to={`/listings/viewListing/${params.row.id}`}>
                <IconButton>
                  <VisibilityIcon />
                </IconButton>
              </Link>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton onClick={() => handleDeleteClick(params.row.id)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ];
  
  
    return (
      <Box m="20px">
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="-10px">
          <Header title="Listings Management" subtitle="Managing the listings" />
          <Box>
            <Link to={"/listings/newListing"} style={{ marginRight: "10px" }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#6870fa",
                  color: "white",
                  fontSize: "16px",
                  "&:hover": {
                    backgroundColor: "#3e4396",
                  },
                }}
              >
                Add a Listing
              </Button>
            </Link>
          </Box>
        </Box>
        <Box
          m="10px 0 0 0"
          height="70vh"
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
              fontSize: "14px",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.greenAccent[700],
              borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: colors.greenAccent[700],
            },
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${colors.grey[100]} !important`,
            },
          }}
        >
          <Box display="flex" justifyContent="flex-start" alignItems="center" marginBottom="20px" gap="10px">
           
            <Button
              variant="contained"
              onClick={exportToPdf}
              sx={{
                backgroundColor: "#f57c00",
                color: "white",
                fontSize: "10px",
                "&:hover": {
                  backgroundColor: "#f9a825",
                },
              }}
            >
              Export PDF
            </Button>
          </Box>
          <DataGrid
            columns={columns}
            rows={data}
            components={{ Toolbar: GridToolbar }}
          />
        </Box>
      </Box>
    );
  };
  
  export default Listings;
  