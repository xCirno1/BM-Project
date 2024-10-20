import { useState, useEffect } from 'react';
import { Button, CircularProgress, FormControl, TextField, Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, InputLabel, Step, StepLabel, Stepper, Select, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers';
import {useTheme} from '@mui/material/styles'
import { PersonList } from '../dashboard/personList.js';
import api from '../services/api.js'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CLASSES } from "../index.js"


function SuccessDialogContent({done}){
  return (
    <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "50px"}}>
      {done ? 
        <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
          <CheckCircleIcon sx={{fontSize: "100px", color: "green"}}/>
          <Typography color="green">Meeting is successfully created!</Typography>
        </Box> : 
        <Box>
          <CircularProgress/>
        </Box>}
    </Box>
  );
}

function ConflictDialogContent({accountType, conflicts}){
  if (Object.keys(conflicts).length === 0){
    return (
      <Box>
        <Typography color="red">
          You have already created a personal meeting for today. 
          However, you can tell your class guardian to mark your personal tutor and you can create another tutor.
        </Typography>
      </Box>
    );
  }
  return (
    <Box>
      <Typography color="red">{accountType === "student" ? `Conflict found! You have created meetings with these teachers:` : `Conflict found! These following people are assigned to a different meeting already:`}</Typography>
      {Object.keys(conflicts).map(id => <Typography component="li" color={"red"}>{conflicts[id].name}</Typography>)}
    </Box>
  );
}

function DateAndTopicDialogContent({setErrorMessage, accountType, classError, dateTime, setDateTime, setClass, _class, setClassError, selectedPerson, setTopic, topic}){
  const theme = useTheme();
  const dateTimeNow = dayjs();

  return (
    <Box>        
      <Typography display="inline">Buat jadwal tutor dengan:</Typography>
      <Typography component="ul" >
        {selectedPerson.map(person => {
          return <Typography component="li" color={theme.personTargetNameColor}>{person.name}</Typography>
        })}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "20px" }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MobileDatePicker disablePast onChange={(value) => {setDateTime(value)}} views={["month", "day"]} value={dateTime} label="Tanggal" defaultValue={dateTimeNow} />
        </LocalizationProvider>
        {accountType === "teacher" && <FormControl sx={{ m: 0.5, minWidth: 100 }} error={classError}>
          <InputLabel>Kelas Tutor</InputLabel>
          <Select MenuProps={{
            PaperProps: {
              style: {
                maxHeight: "150px",
              },
            },
            }} value={_class} onChange={(event) => {setClass(event.target.value); setClassError(false)}} autoWidth label="Kelas Tutor">
            {CLASSES.map(
              c => <MenuItem value={c}>{c}</MenuItem>
            )}
          </Select>
        </FormControl>}
      </Box>
      <TextField value={topic} label="Topik" multiline rows={3} variant="filled" sx={{width: "100%", marginTop: "20px"}} onChange={(event) => {setTopic(event.target.value); setErrorMessage("")}} />
    </Box>
  );
}

const steps = ["Tujuan", "Tanggal & Topik", "Selesai"];

export default function CreateMeetingsDialog({accountType, openHandler, open, sessionCallback}) {
  const dateTimeNow = dayjs();
  const [dateTime, setDateTime] = useState(dateTimeNow);
  const [topic, setTopic] = useState("");
  const [_class, setClass] = useState("");
  const [classError, setClassError] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPerson, setSelectedPerson] = useState([]);
  const [people, setPeople] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [conflict, setConflict] = useState("");
  const [done, setDone] = useState(false);

  function handleClose(){
    setConflict("");
    setActiveStep(0);
    setSelectedPerson([]);
    setTopic("");
    setClass("");
    openHandler(false);
    setDone(false);
  }
  function handleBackButtonClicked(){
    setActiveStep(activeStep - 1)
  }
  function handleNextButtonClicked(){
    setErrorMessage("")
    if (activeStep === 0 && selectedPerson.length === 0){
      return setErrorMessage("You must select at least 1 person to continue.")
    }
    if (activeStep === 1){  // The submit button
      setSelectedPerson([]);
      setTopic("");
      setClass("");
      setActiveStep(0);
    }
    if (activeStep === 2){  // The finish button
      openHandler(false);
      setDone(false);
      return setActiveStep(0);
    }
    setActiveStep(activeStep + 1)
  }

  function handleSubmitButtonClick(){
    if (topic.length > 150){
      return setErrorMessage("Topic cannot be more than 150 characters.")
    }
    if (topic.length === 0){
      return setErrorMessage("Topic cannot be empty.")
    }
    if (!_class && accountType === "teacher"){return setClassError(true);}
    setActiveStep(2)
    api.post("/meetings", {time: dateTime.unix(), topic: topic, target: selectedPerson.map(person => person.id), meeting_class: _class}).then(response => {
      handleNextButtonClicked();
      setDone(true);
    }
    ).catch((error) => {
      if (error.response.status === 401){sessionCallback()}
      if (error.response.status === 403){setConflict(error.response.data.detail.conflicts)}
      }
    )
  }
  // {handleError(error, startCountdown(), {setMessage: setUnexpectedNotificationMessage, handler: setUnexpectedNotificationOpen})}
  useEffect(() => {
    api.get('/people').then(response => {
      setPeople(response.data)
    })}, []);

  return (
    <Dialog onClose={handleClose} open={open} PaperProps={{sx: {width: {drq: "500px",}}}} maxWidth="lg">
      <DialogTitle sx={{ marginRight: 6, p: 2 }}>Jadwal Tutor</DialogTitle>
      <IconButton aria-label="close" onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500]}}>
        <CloseIcon />
      </IconButton>
      
      <DialogContent dividers>
      <Box sx={{ maxHeight: 150, overflowY: "auto", marginBottom: "20px" }}>
        <Stepper activeStep={activeStep} sx={{ minWidth: "400px" }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {activeStep === 0 && !conflict &&
        <Box sx={{textAlign: "center"}}>
          <PersonList selectedPerson={selectedPerson} people={people} selectedPersonHandler={setSelectedPerson}/>
        </Box>
      }

      {activeStep === 1 && !conflict &&
        <DateAndTopicDialogContent setErrorMessage={setErrorMessage} accountType={accountType} classError={classError} dateTime={dateTime} setDateTime={setDateTime} setClass={setClass} _class={_class} setClassError={setClassError} selectedPerson={selectedPerson} setTopic={setTopic} topic={topic}/>
      }
      {activeStep === 2 && !conflict &&
        <SuccessDialogContent done={done}/>
      }
      {conflict && <ConflictDialogContent accountType={accountType} conflicts={conflict}/>}
      {errorMessage && <Typography color="red" fontSize="15px" marginTop="10px">{errorMessage}</Typography>}
      {activeStep !== 2 && !conflict && <Button sx={{marginTop: "20px"}} disabled={activeStep === 0} onClick={() => {handleBackButtonClicked(); setErrorMessage("");}}>
        Back
      </Button>}
      {activeStep === 1 && !conflict && <Button variant="outlined" sx={{float: "right", marginTop: "20px"}} onClick={handleSubmitButtonClick}>Buat Jadwal</Button>}
      {activeStep === 2 && !conflict && done && <Button sx={{float: "right", marginTop: "20px"}} onClick={handleNextButtonClicked}>
        Selesai
      </Button>}
      {activeStep === 0 && !conflict && <Button sx={{float: "right", marginTop: "20px"}} onClick={handleNextButtonClicked}>
        Next
      </Button>}

      {conflict &&
        <Box>
          <Button sx={{float: "left", marginTop: "20px"}} onClick={() => {setConflict(""); handleBackButtonClicked();}}>Kembali</Button>
          <Button sx={{float: "right", marginTop: "20px"}} onClick={handleClose}>Selesai</Button>
        </Box>}
      </DialogContent>
    </Dialog>
  );
}

