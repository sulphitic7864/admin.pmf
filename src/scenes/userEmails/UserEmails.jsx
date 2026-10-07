/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import axios from 'axios';
import Header from "../../components/Header";
import { tokens } from "../../theme";

const UserEmailTable = () => {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const fetchUsers = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(process.env.REACT_APP_BACKEND_URL + '/user/getAllUsers', { headers });
      if (response.data.success) {
        const modifiedData = response.data.users.map((user) => ({
          id: user.id,
          email: user.email,
          status: user.status,
          createdAt: user.createdAt,
          
        }));
        setUsers(modifiedData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
 
  }, []);

  const columns = [
    { field: 'id', headerName: 'ID', flex: 0.5 },
    { field: 'email', headerName: 'Email', flex: 1.5 },
    // { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'createdAt', headerName: 'Created On', renderCell: (params) => formatDate(params.value), flex: 1 },
    
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}-${month}-${year}, ${hours}:${minutes}`;
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="User Emails" subtitle="Managing users details" />
      </Box>
      <Box
        m="40px 0 0 0"
        height="75vh"
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
        <DataGrid
          rows={users}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default UserEmailTable;