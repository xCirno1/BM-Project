import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFound(){
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(`${process.env.REACT_APP_BASE_CLIENT_ROUTE.replace(/\/+$/, '')}/login`);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: 2,
      }}
    >
      <Typography variant="h1" component="div" sx={{ fontSize: '6rem', fontWeight: 'bold', mb: 2 }}>
        404
      </Typography>
      <Typography variant="h5" component="div" sx={{ mb: 4 }}>
        Oops! The page you are looking for does not exist.
      </Typography>
      <Button variant="text" color="primary" onClick={handleGoBack}>
        Go Back Home
      </Button>
    </Box>
  );
};
