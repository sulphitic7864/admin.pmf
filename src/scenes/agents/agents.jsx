import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  Avatar,
} from "@mui/material";
import {
  Add,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,

} from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import axios from "axios";
import Loading from "../../components/Loading";

const AgentsTab = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  // const getAgents = async () => {
  //   setLoading(true);
  //   try {
  //     const headers = { Authorization: `Bearer ${token}` };
  //     const res = await axios.get(
  //       process.env.REACT_APP_BACKEND_URL + "/landAgent/getAllAgents",
  //       { headers }
  //     );
  //     setAgents(res.data.users);
  //     console.log(res);
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const deleteAgent = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(
        process.env.REACT_APP_BACKEND_URL + `/landAgent/deleteLandAgentById/${id}`,
        {
          headers,
        }
      );
    } catch (error) {
      console.log(error);
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
        setAgents(agents.filter((agent) => agent.id !== id));
        Swal.fire("Deleted!", "The agent has been deleted.", "success");
        deleteAgent(id);
      }
    });
  };

  const handleViewAgent = (agent) => {
    navigate(`/agents/${agent.id}`, { state: { agent } });
  };

  // const handleEditAgent = (agent) => {
  //   navigate(`/agents/edit/${agent.id}`, { state: { agent } });
  // };

  const handleAddAgent = () => {
    navigate("/agents/create");
  };

  const exportToPdf = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [
        ["ID", "First Name", "Last Name", "Email", "Office Phone", "Language"],
      ],
      body: agents.map(
        ({ id, firstName, lastName, email, officePhone, language }) => [
          id,
          firstName,
          lastName,
          email,
          officePhone,
          language,
        ]
      ),
    });
    doc.save("agents_data.pdf");
  };

  const columns = [
    {
      field: "imageURL",
      headerName: "Avatar",
      width: 60,
      renderCell: (params) => (
        <Avatar src={params.value} alt={params.row.name} />
      ),
    },
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "firstName", headerName: "First Name", flex: 1 },
    { field: "lastName", headerName: "Last Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "officePhone", headerName: "Office Phone", flex: 1 },
    { field: "language", headerName: "Language", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View">
            <IconButton onClick={() => handleViewAgent(params.row)}>
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          {/* <Tooltip title="Edit">
            <IconButton onClick={() => handleEditAgent(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip> */}
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDeleteAgent(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    const getAgents = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(
        process.env.REACT_APP_BACKEND_URL + "/landAgent/getAllAgents",
        { headers }
      );
      setAgents(res.data.users);
      console.log(res);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
    getAgents();
  }, [token]);

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Agents Management" subtitle="Managing the agents" />
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Add />}
          onClick={handleAddAgent}
        >
          Add Agent
        </Button>
      </Box>

      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <Button
          variant="contained"
          onClick={exportToPdf}
          sx={{
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
            fontSize: "14px",
            fontWeight: "bold",
            padding: "10px 20px",
            marginBottom: "10px",
          }}
        >
          Export PDF
        </Button>
        <DataGrid
          rows={agents}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>
      {loading && <Loading />}
    </Box>
  );
};

export default AgentsTab;
