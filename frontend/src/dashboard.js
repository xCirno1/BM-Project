import React, { useState } from 'react';
import { useTheme } from "@mui/material/styles";
import AppNavigationBar from './navbar.js';
import { Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { TutorListTable } from './dashboard/tutorTable.js';

function Dashboard(){
  const theme = useTheme();
  const [accountType, setAccountType] = useState("");

  return (
    <div className="App">
    	<AppNavigationBar accountType={accountType} accountTypeHandler={setAccountType}/>
      <TutorListTable accountType={accountType}/>
      <Box sx={{display: "inline-block", minWidth: "300px"}}></Box>
      <ToastContainer pauseOnFocusLoss={false} pauseOnHover={false} theme={theme.palette.mode}/>
    </div>
  )
}

export default Dashboard;