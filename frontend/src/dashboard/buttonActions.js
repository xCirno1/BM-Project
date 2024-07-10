import React, {useState} from 'react';
import { useTheme } from "@mui/material/styles";
import { Typography, Box, Popper, Grow, Paper, ClickAwayListener, MenuList, IconButton, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import api from '../services/api.js'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

export function RejectAction({setSuccess, open, setOpen, anchorRef, meeting, sessionCallback}){
  const [reason, setReason] = useState("");
  const theme = useTheme();
  function handleRejectButtonClick(){
    setOpen(false);
    api.post(`/meetings/${meeting.id}/reject`, {reason: reason}).then(response => {
        setSuccess("Jadwal berhasil ditolak!")
      }
    ).catch((error) => {
      if(error.response.status === 401){sessionCallback();}
      }
    )
  }

  return (
    <Popper
      open={open}
      anchorEl={anchorRef.current}
      placement="bottom"
      transition
      sx={{zIndex: "2147483648"}}
    >
      {({ TransitionProps, placement }) => (
        <Grow {...TransitionProps} style={{ transformOrigin: 'bottom',}}>
        <Paper>
            <ClickAwayListener onClickAway={() => setOpen(false)}>
            <MenuList autoFocusItem={open} sx={{minWidth: "350px"}}>
                <TextField
                  sx={{display: "inline-block", minWidth: "200px", width: "80%", marginBottom: "10px", marginLeft: "20px"}}
                  label="Reason"
                  multiline
                  fullWidth 
                  variant="standard"
                  onChange={(event) => {setReason(event.target.value)}}
                />
                <IconButton onClick={handleRejectButtonClick} sx={{display: "inline-block", marginTop: "10px", color: theme.iconButton}} color="secondary">
                  <CheckIcon />
                </IconButton>
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  )
}

export function DoneAction({setSuccess, open, setOpen, anchorRef, meeting, sessionCallback}){
  const [evaluation, setEvaluation] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const theme = useTheme();

  function handleDoneButtonClick(){
    const isBefore = dayjs.unix(meeting.meeting_timestamp).isBefore(dayjs(), "date");
    const isToday = dayjs.unix(meeting.meeting_timestamp).isToday(dayjs(), "date");

    if (!(isBefore || isToday)){
      return setErrorMessage("Tidak bisa menyelesaikan tutor pada hari sebelum jadwal yang ditentukan.");
    }
    setOpen(false);
    api.post(`/meetings/${meeting.id}/done`, {evaluation: evaluation}).then(response => {
      setSuccess("Jadwal berhasil diselesaikan!");
      }
    ).catch((error) => {
      if(error.response.status === 401){sessionCallback();}
      }
    )
  }

  return (
    <Popper
      open={open}
      anchorEl={anchorRef.current}
      placement="bottom"
      transition
      sx={{zIndex: "2147483648"}}
    >
      {({ TransitionProps, placement }) => (
        <Grow {...TransitionProps} style={{ transformOrigin: 'bottom',}}>
        <Paper>
            <ClickAwayListener onClickAway={() => setOpen(false)}>
              <MenuList autoFocusItem={open} sx={{minWidth: "350px"}}>
                {errorMessage.length !== 0 ? <Typography color="red" fontSize="15px" margin={"10px"}>{errorMessage}</Typography> : <Box><TextField
                  sx={{display: "inline-block", minWidth: "200px", width: "80%", marginBottom: "10px", marginLeft: "20px"}}
                  label="Evaluation"
                  placeholder="Bagaimana perkembangan peserta didik?"
                  multiline
                  fullWidth 
                  variant="standard"
                  onChange={(event) => {setEvaluation(event.target.value)}}
                />
                <IconButton onClick={handleDoneButtonClick} sx={{display: "inline-block", marginTop: "10px", color: theme.iconButton}} color="secondary">
                  <CheckIcon />
                </IconButton></Box>}
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  )
}

export function CancelAction({setSuccess, open, setOpen, anchorRef, meeting, sessionCallback}){
  const [reason, setReason] = useState("");
  const theme = useTheme();

  function handleCancelButtonClick(){
    setOpen(false);
    api.post(`/meetings/${meeting.id}/cancel`, {reason: reason}).then(response => {
        setSuccess("Jadwal berhasil dibatalkan!")
      }
    ).catch((error) => {
      if(error.response.status === 401){sessionCallback();}
      }
    )
  }

  return (
    <Popper
      open={open}
      anchorEl={anchorRef.current}
      placement="bottom"
      transition
      sx={{zIndex: "2147483648"}}
    >
      {({ TransitionProps, placement }) => (
        <Grow {...TransitionProps} style={{ transformOrigin: 'bottom',}}>
        <Paper>
            <ClickAwayListener onClickAway={() => setOpen(false)}>
              <MenuList autoFocusItem={open} sx={{minWidth: "350px"}}>
                <TextField
                  sx={{display: "inline-block", minWidth: "200px", width: "80%", marginBottom: "10px", marginLeft: "20px"}}
                  label="Reason"
                  multiline
                  fullWidth 
                  variant="standard"
                  onChange={(event) => {setReason(event.target.value)}}
                />
                <IconButton onClick={handleCancelButtonClick} sx={{display: "inline-block", marginTop: "10px", color: theme.iconButton}} color="secondary">
                  <CheckIcon />
                </IconButton>
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  )
}

const classes = ["10A", "10B", "10C", "11A1", "11A2", "11S", "12A1", "12A2", "12S"];

export function NoClassAction({setSuccess, open, setOpen, anchorRef, meeting, sessionCallback}){
  const [meetingClass, setMeetingClass] = useState("");
  const [classError, setClassError] = useState(false);
  const theme = useTheme();

  function handleCheckButtonClick(){
    if (!meetingClass){return setClassError(true)}
    setOpen(false);
    api.post(`/meetings/${meeting.id}/accept`, {meeting_class: meetingClass}).then(response => {
      setSuccess("Jadwal berhasil dikonfirmasi.")
      }
    ).catch((error) => {
      if(error.response.status === 401){sessionCallback(true);}
      }
    )
  }

  return (
    <Popper
      open={open}
      anchorEl={anchorRef.current}
      placement="bottom"
      transition
      sx={{zIndex: "2147483648", maxWidth: "200px"}}
    >
      {({ TransitionProps, placement }) => (
      <Grow {...TransitionProps} style={{ transformOrigin: 'bottom',}}>
        <Paper>
          <ClickAwayListener onClickAway={() => setOpen(false)}>
          <MenuList autoFocusItem={open} sx={{minWidth: "350px"}}>
            <FormControl sx={{ m: 0.5, minWidth: 150 }} error={classError}>
              <InputLabel>Kelas Tutor</InputLabel>
              <Select MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: "150px",
                  },
                },
                }} value={meetingClass} onChange={(event) => {setMeetingClass(event.target.value); setClassError(false)}} autoWidth label="Kelas Tutor">
                {classes.map(
                  c => <MenuItem value={c}>{c}</MenuItem>
                )}
              </Select>
            </FormControl>
            <IconButton onClick={handleCheckButtonClick} sx={{display: "inline-block", marginTop: "10px", color: theme.iconButton}} color="secondary">
              <CheckIcon />
            </IconButton>
          </MenuList>

          </ClickAwayListener>
        </Paper>
      </Grow>
    )}
    </Popper>
  )
}

export function RescheduleAction({setSuccess, open, setOpen, anchorRef, meeting, sessionCallback}){
  const dateTimeNow = dayjs();
  const [datetime, setDateTime] = useState(dateTimeNow);
  const [errorMessage, setErrorMessage] = useState("");
  const theme = useTheme();

  function handleCheckButtonClick(){
    api.post(`/meetings/${meeting.id}/reschedule`, {time: datetime.unix()}).then(response => {
        setOpen(false);
        setSuccess(`Jadwal berhasil diubah ke ${datetime.format("dddd, DD MMMM YYYY, HH:mm:ss")}.`)
      }
    ).catch((error) => {
      if (error.response.status === 406){
        setErrorMessage("You cannot set reschedule date to the same date as before.")
      }
      if(error.response.status === 401){sessionCallback(true);}
      }
    )
  }

  return (
    <Popper
      open={open}
      anchorEl={anchorRef.current}
      placement="bottom"
      transition
      sx={{zIndex: "3", maxWidth: "300px"}}
    >
      {({ TransitionProps, placement }) => (
      <Grow {...TransitionProps} style={{ transformOrigin: 'bottom',}}>
        <Paper>
          <ClickAwayListener onClickAway={() => {setOpen(false); setErrorMessage("");}}>
            <Box>
              <MenuList component="div" autoFocusItem={open} sx={{display: "flex"}}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <MobileDatePicker sx={{zIndex: "2147483648", maxWidth: "200px"}} disablePast onChange={(value) => {setDateTime(value)}} views={["month", "day"]} label="Tanggal" defaultValue={dateTimeNow} />
                </LocalizationProvider>

                <IconButton onClick={handleCheckButtonClick} sx={{display: "inline-block", marginTop: "10px", color: theme.iconButton}}>
                  <CheckIcon />
                </IconButton>

              </MenuList>
              {errorMessage && <Typography color="red" fontSize="15px" margin={"3px 4px 10px 2px"}>{errorMessage}</Typography>}
            </Box>
          </ClickAwayListener>
        </Paper>
      </Grow>
    )}
    </Popper>
  )
}
