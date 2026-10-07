/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';

const ViewListing = () => {
  const { id } = useParams();
  const [listingDetails, setListingDetails] = useState({
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
      landAgentId: ""
  });
  const token = localStorage.getItem("token");




useEffect(() => {
    const fetchData = async () => {
      try {
        // setLoading(true);
  
        // Fetch both agents and listing data concurrently
        const [agentResponse, listingResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/landAgent/getAllAgents`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/land/getLandById/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
  
        if (agentResponse.data.success && listingResponse.data.success) {
          const agents = agentResponse.data.users;
          const data = listingResponse.data.user;
  
          const selectedAgent = agents.find(agent => agent.id === data.landAgentId);
  
          const images = [
            data.landImage1,
            data.landImage2,
            data.landImage3,
            data.landImage4,
            data.landImage5,
            data.landImage6,
            data.landImage7,
            data.landImage8,
            data.landImage9,
            data.landImage10,
          ].filter(Boolean);
  
          setListingDetails({
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
            landAgentId: selectedAgent ? `${selectedAgent.firstName} ${selectedAgent.lastName}` : "",
            images: images, // Handle image preview separately
          });
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        // setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);
  

 

  return (
    <Box m="20px" height="80vh" overflow="auto" paddingRight="20px">
      <Header title={`View Listing ID: ${id}`} subtitle="" />
      <Box ml={"40px"}>
        <Grid container spacing={2}>
          {Object.entries(listingDetails).map(([field, value]) => (
            <React.Fragment key={field}>
              <Grid item xs={2}>
                <Typography variant="h5" component="span" fontWeight="bold">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography variant="h5" component="span" fontWeight="bold">
                  :
                </Typography>
              </Grid>
              <Grid item xs={9}>
                {field === 'images' ? (
                  <Box>
                    {value.map((image, index) => (
                      // eslint-disable-next-line jsx-a11y/img-redundant-alt
                      <img key={index} src={image} alt={`Listing Image ${index + 1}`} style={{ width: '200px', marginRight: '10px' }} />
                    ))}
                  </Box>
                ) : (
                  <Typography>{value}</Typography>
                )}
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default ViewListing;
