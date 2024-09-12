import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, ListItemText, TextField, Popper, Grow, Paper, ClickAwayListener, Typography, MenuList, MenuItem, Divider} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React, { useState } from "react";
import api from '../services/api.js'
import CloseIcon from '@mui/icons-material/Close';
import dayjs from "dayjs";

export function PersonalTutorDialog({setSuccess, sessionCallback, open, openHandler}){
  const theme = useTheme();
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");

  function handleSubmitButtonClick(){
    if (topic.length > 150){
      return
    }
    api.post("/meetings", {topic: topic}).then(response => {
      openHandler(false);
      setSuccess("Jadwal tutor mandiri untuk hari ini berhasil dibuat.");
    }).catch((error) => {
      if (error.response.status === 401){sessionCallback()}
      else if (error.response.status === 403){setError("Cannot create multiple personal meetings in one day.")}
      }
    )
  }

  return (
    <Dialog PaperProps={{sx: {maxHeight: "600px", minWidth: "400px"}}} onClose={() => {openHandler(false); setError("")}} open={open} fullWidth>
      <DialogTitle sx={{ marginRight: 6, p: 2 }}>Tutor mandiri</DialogTitle>
      <IconButton onClick={() => {openHandler(false); setError("")}} sx={{ position: "absolute", right: 3, top: 8, color: (theme) => theme.palette.grey[500]}}>
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        <Typography display="inline">Tanggal: </Typography><Typography display="inline" color="#949494"><strong>{dayjs().format("dddd, MMMM D, YYYY")}</strong></Typography>
        <Box bgcolor={theme.collapseableTutorBackground} sx={{marginTop: "20px", alignItems: "left", marginBottom: "10px", paddingBottom: "3px"}}>
          <TextField
            sx={{width: "85%", mb: "10px", ml: "20px", mt: "8px"}}
            label="Topik"
            multiline
            variant="standard"
            onChange={(event) => {setTopic(event.target.value)}}
          />
          <Button onClick={handleSubmitButtonClick} sx={{display: "block", margin: "5px", textTransform: "none", marginLeft: "auto", marginRight: "20px"}} variant="outlined">
            Submit
          </Button>
        </Box>
        {error && <Typography color="red" fontSize="15px" marginTop="10px">{error}</Typography>}
      </DialogContent>
    </Dialog>
  );
}

export function PersonalTutorAction({anchorRef, open, openHandler, setMeetingDialogOpen, setPersonalDialogOpen}){
  const theme = useTheme();

  return (
    <Popper
      open={open}
      anchorEl={anchorRef.current}
      placement="bottom"
      transition
      sx={{zIndex: "2147483647", maxWidth: "200px"}}
    >
      {({ TransitionProps, placement }) => (
      <Grow {...TransitionProps} style={{ transformOrigin: 'bottom',}}>
        <Paper sx={{backgroundColor: theme.default}}>
          <ClickAwayListener onClickAway={() => openHandler(false)}>
            <MenuList autoFocusItem={open} sx={{backgroundColor: theme.filterColor,}}>
              <MenuItem dense onClick={() => {setMeetingDialogOpen(true); openHandler(false)}}><ListItemText>Tutor Bersama Guru</ListItemText></MenuItem>
              <MenuItem dense onClick={() => {setPersonalDialogOpen(true); openHandler(false)}}><ListItemText>Tutor Mandiri</ListItemText></MenuItem>
              <Divider /> 
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Grow>
    )}
    </Popper>
  )
}
