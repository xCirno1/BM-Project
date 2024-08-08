import { useEffect, useState, useRef } from 'react';
import { AppBar, Box, Toolbar, IconButton, Badge, Typography, MenuItem, Menu, Divider, ListItemIcon, Avatar } from '@mui/material';

import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';

import { useNavigate } from "react-router-dom";
import Logo from './assets/bintangmulia_logo.png'
import api from './services/api.js'
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import DesktopNotification from './desktopNotification.js';
import SettingsDialog from './dialogs/settingsDialog.js';
import ClassMappingDialog from './dialogs/classMappingDialog.js';
import PeopleDialog from './dialogs/peopleDialog.js';
import FloatingMenu from './components/floatingMenu.js';
import './css/navbar.css';

function ProfileMenu({anchor, open, openHandler, profileName, handleLogout, setSettingsDialogOpen}){
  return (
  <FloatingMenu open={open} openHandler={openHandler} anchor={anchor.current} color="background.paper" >
    <MenuItem onClick={() => openHandler(false)}>
      <Avatar /> {profileName}
    </MenuItem>
    <Divider />
    <MenuItem onClick={() => {openHandler(false); setSettingsDialogOpen(true)}}>
      <ListItemIcon>
        <Settings fontSize="small" />
      </ListItemIcon>
      Settings
    </MenuItem>
    <MenuItem onClick={() => {openHandler(false); handleLogout()}}>
      <ListItemIcon>
        <Logout fontSize="small" />
      </ListItemIcon>
      Logout
    </MenuItem>
  </FloatingMenu>
  );
}

function AppNavigationBar({accountType, accountTypeHandler, sessionCallback}) {
  const profileAnchor = useRef(null);
  const mobileMoreAnchor = useRef(null);
  const notificationAnchor = useRef(null);

  const [profileName, setProfileName] = useState("");
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [messagesCount, setMessagesCount] = useState(0);
  const [peopleMenuOpen, setPeopleMenuOpen] = useState(false);
  const [classMappingOpen, setClassMappingOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    api.get("/me").then(response => {
      setProfileName(response.data.display_name);
      accountTypeHandler(response.data.type)
      console.info("LOGGED IN AS:", response.data)
    }).catch(error => {
      if (error.response.status === 401){
        sessionCallback();
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    })}, []);
  
  function handleLogout(){
    api.post("/logout").then(response => {
      navigate(`${process.env.REACT_APP_BASE_CLIENT_ROUTE.replace(/\/+$/, '')}/login`);
    }).catch(error => {
      if (error.response.status === 401){
        navigate(`${process.env.REACT_APP_BASE_CLIENT_ROUTE.replace(/\/+$/, '')}/login`);
      }
    })}
  
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchor.current}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right'}}
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
    >
      <MenuItem onClick={() => setClassMappingOpen(true)}>
        <IconButton size="large" color="inherit">
          <EventNoteIcon />
        </IconButton>
        <p>Personal Tutors</p>
      </MenuItem>

      <MenuItem onClick={() => setPeopleMenuOpen(true)}>
        <IconButton size="large" color="inherit">
          <PeopleIcon />
        </IconButton>
        <p>People</p>
      </MenuItem>

      <MenuItem onClick={() => setNotificationMenuOpen(true)}>
        <IconButton size="large" color="inherit">
          <Badge badgeContent={messagesCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={() => setProfileMenuOpen(true)}>
        <IconButton size="large" color="inherit">
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1}}>
      <AppBar position="static">
        <Toolbar sx={{width: "100%"}}>
          <Box component="img" src={Logo} alt="logo BM" width="100px" sx={{ display: { sm: 'none', qsm: 'block' }}}/>
          <Typography variant="h6" component="h6" sx={{ display: { xs: 'none', sm: 'block' }, flexGrow: 0, marginLeft: "1vw" }}>
            Dashboard {accountType === "student" ? "Siswa" : "Guru"}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <IconButton size="large" color="inherit" onClick={() => setClassMappingOpen(true)}>
              <EventNoteIcon />
            </IconButton>
            <IconButton size="large" color="inherit" onClick={() => setPeopleMenuOpen(true)}>
              <PeopleIcon />
            </IconButton>
            <IconButton ref={notificationAnchor} size="large" color="inherit" onClick={() => setNotificationMenuOpen(true)}>
              <Badge badgeContent={messagesCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton ref={profileAnchor} size="large" edge="end" onClick={() => setProfileMenuOpen(true)} color="inherit">
              <AccountCircle />
            </IconButton>
          </Box>
          <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
            <IconButton ref={mobileMoreAnchor} size="large" onClick={() => setMobileMenuOpen(true)} color="inherit">
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      <ProfileMenu anchor={profileAnchor} open={profileMenuOpen} openHandler={setProfileMenuOpen} profileName={profileName} handleLogout={handleLogout} setSettingsDialogOpen={setSettingsDialogOpen}/>
      <DesktopNotification anchor={notificationAnchor} open={notificationMenuOpen} openHandler={setNotificationMenuOpen} messagesCountHandler={setMessagesCount}/>
      <SettingsDialog openHandler={setSettingsDialogOpen} open={settingsDialogOpen}/>
      <ClassMappingDialog accountType={accountType} open={classMappingOpen} openHandler={setClassMappingOpen} sessionCallback={sessionCallback}/>
      <PeopleDialog profileName={profileName} accountType={accountType} open={peopleMenuOpen} openHandler={setPeopleMenuOpen} sessionCallback={sessionCallback} />
      </Box>
  );
}
export default AppNavigationBar;