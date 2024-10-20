import { useState } from 'react';
import { Button, Checkbox, FormControlLabel, TextField, Box, Grid, Typography, InputAdornment, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import useTheme from '@mui/material/styles/useTheme'
import BackgroundImage from './assets/bg_login.webp'
import { useNavigate } from "react-router-dom";

import api from './services/api.js'

function Login(){
  const navigate = useNavigate();
  const theme = useTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [passwordEmpty, setPasswordEmpty] = useState(false);
  const [usernameEmpty, setUsernameEmpty] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [incorrectEntries, setIncorrectEntries] = useState(false);

  function handleLoginButtonClick(){
    let passwordIsEmpty = password.length === 0
    let usernameIsEmpty = username.length === 0
    setPasswordEmpty(passwordIsEmpty);
    setUsernameEmpty(usernameIsEmpty);
    if (!passwordIsEmpty && !usernameIsEmpty){
      tryLogin(username, password, keepLoggedIn);
    }
  }

  function tryLogin(username, password, keepLoggedIn){
    api.post("/login", {username: username, password: password, remember: keepLoggedIn}).then(response => {
        navigate(`${process.env.REACT_APP_BASE_CLIENT_ROUTE.replace(/\/+$/, '')}/dashboard`);
      }
    ).catch(error => {
      if (error.response.status === 401){
        setIncorrectEntries(true);
      }
    })
  }
  
  return(
    <Grid sx={{background: `url(${BackgroundImage})`, backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundAttachment: "fixed"}} container position="fixed" bottom={0} height="100vh" spacing={0} direction="column" alignItems="center" justifyContent="center">
      <Box
        sx={{
          marginTop: -4,
          maxWidth: 500, // 525
          width: "80vw",
          maxHeight: 500,  // 575
          height: "70vh",
          p: "32px",
          display: "flex",
          flexFlow: "wrap",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "20px",
          borderRadius: "10px",
          bgcolor: theme.loginFormBackground,
        }}
      >
      <div style={{ marginTop: "auto", display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', width: '100%'}}>
        <Typography marginTop="auto" fontFamily="Roboto, sans-serif" color={theme.welcomeMessageColor} fontSize="1.5rem" variant="h3" component='h3'><b>Welcome Back</b></Typography>
        <Typography marginBottom="10px" marginTop="10px" color={theme.credentialsMessageColor} component='caption' fontSize="1rem" textAlign='center'> Enter your credentials to continue</Typography>
        <TextField 
          label="Email Address / Nomor Induk" 
          variant="outlined" 
          style={{ marginBottom: '20px', width: '100%', marginTop: "30px"}}
          error={incorrectEntries || usernameEmpty}
          helperText={usernameEmpty ? "Username cannot be empty." : ""}
          onChange={(event) => {setUsername(event.target.value); setUsernameEmpty(false); setIncorrectEntries(false)}} />
        <TextField 
          label="Password" 
          type={showPassword ? "text" : "password"} 
          variant="outlined" 
          style={{ marginBottom: '20px', width: '100%' }}
          onChange={(event) => {setPassword(event.target.value); setPasswordEmpty(false); setIncorrectEntries(false)}}
          onKeyDown={(event) => {
            if (!event.repeat){
              if (event.key === "Enter"){
                handleLoginButtonClick();
              }  
            }
          }}
          error={incorrectEntries || passwordEmpty}
          helperText={passwordEmpty ? "Password cannot be empty." : (incorrectEntries ? "Incorrect username or password.": "")}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} onMouseDown={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </InputAdornment>
            )
          }} />
        <FormControlLabel control={<Checkbox name="checkedC" />} label="Keep me logged in" style={{ marginRight: "auto", marginBottom: "20px" }} onChange={(event) => {setKeepLoggedIn(event.target.checked)}}/>
        <Button variant="contained" color="info" sx={{ marginBottom: 'auto', width: '100%', height: "45px"}} onClick={handleLoginButtonClick}>Sign In</Button>
        </div>
      </Box>
    </Grid>
  );
}

export default Login;