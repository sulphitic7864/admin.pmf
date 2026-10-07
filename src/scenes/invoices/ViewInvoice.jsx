import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';

const ViewInvoice = () => {
  const { id } = useParams();
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceTitle: "",
    invoiceDescription: "",
    sendDate: "",
    client: {
      firstName: "",
      lastName: "",
      email: "",
    },
    amount: "",
    invoiceStatus: "",
  });
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchInvoiceDetails();
  }, [id]);

  const fetchInvoiceDetails = async () => {
    try {

       
      const response = await axios.get(process.env.REACT_APP_BACKEND_URL + `/invoice/getInvoiceById/${id}`,{
        headers: {
            Authorization: `Bearer ${token}`
          }
      });
      const responseData = response.data;
      if (responseData.success) {
        const { invoice } = responseData;
        const { invoiceTitle, invoiceDescription, sendDate, client, amount, invoiceStatus } = invoice;
        const formattedClient = {
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
        };
        setInvoiceDetails({
          invoiceTitle,
          invoiceDescription,
          sendDate,
          client: formattedClient,
          amount,
          invoiceStatus,
        });
      } else {
        console.error('Failed to fetch invoice details:', responseData.message);
      }
    } catch (error) {
      console.error('Error fetching invoice details:', error);
    }
  };

  return (
    <Box m="20px" height="70vh" overflow="auto" paddingRight="20px">
      <Header title={`View Invoice ID: ${id}`} subtitle="" />
      <Box ml={"40px"}>
        <Grid container spacing={2}>
          {Object.entries(invoiceDetails)
            .filter(([field]) => field !== "client") // Filter out nested objects
            .map(([field, value]) => (
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
                  <Typography>{value}</Typography>
                </Grid>
              </React.Fragment>
            ))}
          {/* Client Details */}
          <Grid item xs={2}>
            <Typography variant="h5" component="span" fontWeight="bold">
              Client
            </Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography variant="h5" component="span" fontWeight="bold">
              :
            </Typography>
          </Grid>
          <Grid item xs={9}>
            <Typography>{`${invoiceDetails.client.firstName} ${invoiceDetails.client.lastName}`}</Typography>
            <Typography>{`Email: ${invoiceDetails.client.email}`}</Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ViewInvoice;
