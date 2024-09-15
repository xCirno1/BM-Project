import { useState } from 'react';
import { Box, Button, ButtonGroup, Dialog, DialogTitle, DialogContent, Divider, IconButton, InputAdornment, Link, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {useTheme} from '@mui/material/styles'
import { useCookies } from 'react-cookie';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import api from '../services/api.js'
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

export default function SettingsDialog({openHandler, open}) {
    const theme = useTheme();
    const [, setCookie] = useCookies();
    const [fpOpen, setFpOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
    const [password, setPassword] = useState("");
    const [newPass1, setNewPass1] = useState("");
    const [newPass2, setNewPass2] = useState("");
    const [success, setSuccess] = useState(false);

    function clearMem(){
      setFpOpen(false);
      setShowPassword(false);
      setPassword("");
      setNewPass1("");
      setNewPass2("");
      setErrorMessage("");
      setSuccess(false);
    }

    function handleChangeButtonClick(){
      if (newPass1 !== newPass2){
        return setErrorMessage("Password confirmation is different.");
      }
      if (!password || !newPass1 || !newPass2){
        return setErrorMessage("You must not leave a field empty.");
      }
      api.post("/reset-password", {old: password, new: newPass1}).then(response => {
        clearMem();
        setSuccess(true);
      }).catch(error => {
      if (error.response.status === 400){
        setErrorMessage(error.response.data.detail)
      }
    })

    }
    return (
      <Dialog onClose={() => {openHandler(false); clearMem();}} open={open} fullWidth maxWidth="drq" 
        PaperProps={{sx: { minHeight: "300px" }}}>
        <DialogTitle sx={{ marginRight: 6, p: 2 }}>Settings</DialogTitle>
        <IconButton aria-label="close" onClick={() => {openHandler(false); clearMem();}} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500]}}>
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Typography fontSize="0.8rem" fontWeight="500" marginBottom="5px" color="rgb(107, 122, 144)" fontFamily={`"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`}>Theme</Typography>
          <ButtonGroup size="large">
            <Button key="light" onClick={() => {setCookie("theme", "light", {maxAge: 300 * 24 * 60 * 60})}} variant={theme.palette.mode === "light" ? 'contained' : 'outlined'} sx={{borderRadius: "15px 0 0 15px", fontWeight: "550", fontSize: "0.875rem", textTransform: 'none'}} color='darkLightModeButton' startIcon={<LightModeIcon/>}>Light</Button>
            <Button key="dark" onClick={() => {setCookie("theme", "dark", {maxAge: 300 * 24 * 60 * 60})}} variant={theme.palette.mode === "dark" ? 'contained' : 'outlined'} sx={{borderRadius: "0 15px 15px 0", fontWeight: "550", fontSize: "0.875rem", textTransform: 'none'}} color='darkLightModeButton' startIcon={<DarkModeIcon/>}>Dark</Button>,
          </ButtonGroup>

          <Typography fontSize="0.8rem" fontWeight="500" marginBottom="5px" mt="10px" color="rgb(107, 122, 144)" fontFamily={`"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`}>Password</Typography>

          <Button key="light" onClick={() => {setFpOpen(!fpOpen);setSuccess(false);}} variant={"outlined"} sx={{fontWeight: "550", fontSize: "0.875rem", textTransform: 'none', mb: "10px"}} color='redButton' startIcon={fpOpen ? <LockOpenIcon/> : <LockIcon/>}>{fpOpen ? "hide" :"Change Password"}</Button>
          {
            !fpOpen && success && <Typography color={theme.liveNowIndicatorColor} fontSize="15px" marginTop="-10px">Password is successfully changed!</Typography>
          }
          {
            fpOpen && <Box>
              <TextField 
                label="Old Password" 
                type={showPassword ? "text" : "password"} 
                variant="outlined"
                size="small"
                value={password}
                style={{ marginBottom: '8px', width: '100%' }}
                onChange={(event) => {setPassword(event.target.value); setErrorMessage("")}}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} onMouseDown={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }} />
              <TextField 
                label="New Password" 
                type="password"
                variant="outlined"
                size="small"
                value={newPass1}
                style={{ marginBottom: '8px', width: '100%' }}
                onChange={(event) => {setNewPass1(event.target.value); setErrorMessage("")}}
              />
              <TextField 
                label="Confirm New Password" 
                type="password"
                variant="outlined"
                size="small"
                value={newPass2}
                style={{ marginBottom: '8px', width: '100%' }}
                onChange={(event) => {setNewPass2(event.target.value); setErrorMessage(false)}}
              />
              {errorMessage && <Typography color="red" fontSize="15px" marginTop="-5px">{errorMessage}</Typography>}
              <Button onClick={() => {handleChangeButtonClick();}} variant={"contained"} color="lightgray" sx={{fontWeight: "550", maxHeight: "30px", fontSize: "0.875rem", textTransform: 'none', mb: "10px"}}>Update Password</Button>
            </Box>
          }
          
          <Divider sx={{marginTop: "15px"}}/>

          <Typography fontSize="0.7rem" fontWeight="500" marginBottom="5px" marginTop="5px" fontFamily={`"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`}>
            Check out the project source code at: <Link href="https://github.com/xCirno1/BM-Project">https://github.com/xCirno1/BM-Project</Link> 
          </Typography>
          <Typography sx={{opacity: "30%"}} fontSize="0.6rem" marginBottom="5px" fontFamily={`"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`}>
            Latest Commit Hash: 555b5ccb34a43499937de7fb04801e20ca6c6161
          </Typography>

        </DialogContent>
      </Dialog>
    );
  }
  