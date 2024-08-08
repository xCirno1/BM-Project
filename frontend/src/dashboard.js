import React, { useState, useEffect } from 'react';
import AppNavigationBar from './navbar.js';
import { useNavigate } from "react-router-dom";
import { Box } from '@mui/material';

import { SessionExpiredNotification, ScheduleSuccessNotification } from './notifications.js';
import { TutorListTable } from './dashboard/tutorTable.js';

function Dashboard(){
  const navigate = useNavigate();
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);
  const [scheduleSuccessContent, setScheduleSuccessContent] = useState("");
  const [accountType, setAccountType] = useState("");

  const [countdown, setCountdown] = useState(5);

  const startCountdown = () => {
    if (!sessionExpiredOpen){
      setCountdown(5);
    }
    setSessionExpiredOpen(true);
  };

  useEffect(() => {
    if (sessionExpiredOpen) {
      const countdownInterval = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);

      setTimeout(() => {
        setSessionExpiredOpen(false);
        clearInterval(countdownInterval);
        navigate(process.env.REACT_APP_BASE_CLIENT_ROUTE)
      }, 5000);
    }
  }, [sessionExpiredOpen, navigate]);

  return (
    <div className="App">
    	<AppNavigationBar accountType={accountType} accountTypeHandler={setAccountType} sessionCallback={startCountdown}/>
      <SessionExpiredNotification open={sessionExpiredOpen} openHandler={setSessionExpiredOpen} countdown={countdown}/>
      <ScheduleSuccessNotification content={scheduleSuccessContent} setContent={setScheduleSuccessContent} />
      <TutorListTable setSuccess={setScheduleSuccessContent} sessionCallback={startCountdown} accountType={accountType}/>
      <Box sx={{display: "inline-block", minWidth: "300px"}}></Box>
    </div>
  )
}

export default Dashboard;