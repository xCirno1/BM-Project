import { useEffect, useState } from 'react';
import { Box, List, Table, TableHead, TextField, TableRow, TableBody, TableCell, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api.js'
import { useTheme } from "@mui/material/styles";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import dayjs from "dayjs";
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function truncateName(string) {
  const split = string.split(" ");
  let truncatedName = `${split[0]} `;

  for (let i = 1; i < split.length - 1; i++) {
    truncatedName += `${split[i].charAt(0)}. `;
  }

  truncatedName += split[split.length - 1];
  return truncatedName;
}

function Rating({meeting, row, sessionCallback}){
  const [greenPressed, setGreenPressed] = useState(false);
  const [redPressed, setRedPressed] = useState(false);
  const [topic, setTopic] = useState("");
  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const theme = useTheme();

  function handleDoneButtonClick(){
    if (topic.length === 0){
      return setErrorMessage("Evaluasi tidak boleh kosong.")
    }
    api.post(`/meetings/${row.id}/review`, {judgement: redPressed ? "bad" : "good", information: topic}).then(response => {
      setDone(true);
    }
  ).catch((error) => {
    if(error.response.status === 401){sessionCallback(true);}
    }
  )

  }
  if (done || row.reviewed){
    return (
      <CheckIcon />
    );
  }
  if (greenPressed || redPressed){
    return (
      <Box sx={{minWidth: "200px", display: "flex", alignItems: "center"}}>
        <IconButton onClick={() => {setGreenPressed(false); setRedPressed(false); setErrorMessage("")}} sx={{marginTop: "10px", color: theme.iconButton}} color="secondary">
          <ArrowBackIcon />
        </IconButton>

        <TextField
          error={errorMessage.length !== 0}
          helperText={errorMessage}
          sx={{minWidth: "200px", width: "80%", marginBottom: "10px"}}
          label={`Komentar ${redPressed ? "Negatif" : "Positif"}`}
          multiline
          fullWidth 
          variant="standard"
          onChange={(event) => {setErrorMessage(""); setTopic(event.target.value)}}
        />
        <IconButton onClick={handleDoneButtonClick} sx={{marginTop: "10px", color: theme.iconButton}} color="secondary">
          <CheckIcon />
        </IconButton>
      </Box>
    );
  }

  if (meeting.length === 0 && row.attend){
    return ( 
      <Box sx={{minWidth: "70px"}}>
        <IconButton onClick={() => setGreenPressed(true)} sx={{ padding: "2px 4px 0 4px", display: "inline-block"}}>
          <ThumbUpIcon sx={{color: "green"}}/>
        </IconButton>
        <IconButton onClick={() => setRedPressed(true)} sx={{ padding: "2px 4px 0 4px", display: "inline-block"}}>
          <ThumbDownIcon sx={{color: "red"}} />
        </IconButton>
      </Box>
    );  
  }
}

function DetailDialog({accountType, dkey, datas, meetings, sessionCallback}){
  const theme = useTheme();
  const filtered = meetings.filter((row) => row.meeting_class === dkey);

  return (
    <Box minHeight="200px" sx={{display: "block"}}>
      <Typography display="inline">Tanggal: </Typography><Typography display="inline" color="#949494"><strong>{dayjs().format("dddd, MMMM D, YYYY")}</strong></Typography>
      <Box sx={{borderBottom: `2px solid ${theme.lineColor}`, height: 0, margin: "10px 0 16px", textAlign: "center"}}>
        <Box sx={{display: "inline-block", fontSize: "16px", position: "relative", top: "-12px", padding: "0 6px", bgcolor: theme.dialogColor}}>
          <Typography display="inline"><strong>{filtered.length} </strong></Typography>
          <Typography display="inline" color={theme.textExtraColor}>On-going Meetings</Typography>
        </Box>
      </Box>
      {filtered.length === 0 ? <Typography align="center" fontSize="18px" color="grey">Tidak ada data yang tersedia.</Typography> : 
      <Table sx={{backgroundColor: theme.tableColor}}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Teacher</TableCell>
            <TableCell>Topic</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{truncateName(row.student.name)}</TableCell>
              <TableCell>{truncateName(row.teacher.name)}</TableCell>
              <TableCell>{row.topic}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>}
      <Box height="20px"></Box>
      <Box sx={{borderBottom: `2px solid ${theme.lineColor}`, height: 0, margin: "10px 0 16px", textAlign: "center"}}>
        <Box sx={{display: "inline-block", fontSize: "16px", position: "relative", top: "-12px", padding: "0 6px", bgcolor: theme.dialogColor}}>
          <Typography display="inline"><strong>{datas[dkey].length} </strong></Typography>
          <Typography display="inline" color={theme.textExtraColor}>Personal Tutors</Typography>
        </Box>
      </Box>
      <Table size="small" sx={{backgroundColor: theme.tableColor}}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Topic</TableCell>
            {accountType === "teacher" ? <TableCell align="center">Rating</TableCell>: undefined}
          </TableRow>
        </TableHead>
        <TableBody>
          {datas[dkey].map((row) => {
            let color = "inherit";
            let bgcolor = "inherit";
            let meeting = meetings.filter(d => d.student.id === row.student.id);
            let topic;
            if (meeting.length > 0){
              bgcolor = theme.excludeItemColor
              topic = <Typography fontSize="14px">Meeting with <Typography display="inline" fontSize="14px" color={theme.systemTopicColor}>{`${meeting[0].teacher.name}`}.</Typography></Typography>
            }
            else if (!row.attend){
              color = theme.notFilledItemColor
            }
            else{
              topic = <Typography fontSize="14px">{row.topic}</Typography>
            }
            return (
            <TableRow sx={{backgroundColor: bgcolor}} key={row.id} >
              <TableCell sx={{color: color, width: "30%", maxWidth: "300px"}}>{truncateName(row.student.name)}</TableCell>
              <TableCell width="100%">{topic}</TableCell>
              {accountType === "teacher" ? 
                <TableCell align="center">
                  <Rating meeting={meeting} row={row} sessionCallback={sessionCallback}/> 
                </TableCell> : undefined}
            </TableRow>
          )})}
        </TableBody>
      </Table>
    </Box>
  );

}

function MappingEntry({datas, dkey, setSelectedClass, meetings}){
  const theme = useTheme();
  return (
  <Box>
    <List onClick={() => {setSelectedClass(dkey)}} dense sx={{padding: 0, marginTop: "10px", ...theme.listItemColor}}>
      <ListItem>
        <ListItemText primary={dkey}/>
        <ListItemText sx={{color: "gray", marginLeft: "auto", flex: "none"}} primary={`${meetings.filter(m => m.meeting_class === dkey).length} on-going meetings, ${datas[dkey].filter(d => d.attend).length} personal tutors`} />
      </ListItem>
    </List>
  </Box>
)
}

export default function ClassMappingDialog({accountType, openHandler, open, sessionCallback}) {
  const [data, setData] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    if (selectedClass.length === 0){
      api.get("/meetings/personal").then(response => {
        setData(response.data)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }).catch((error) => {sessionCallback();})}}, [selectedClass]); 
  
  function closeHandler(){
    if (selectedClass){
      setSelectedClass("")  
    }
    else{
      openHandler(false); 
    }
  }

  useEffect(
    () => {
      if (!open){
        return
      }
      if (selectedClass.length === 0){
        api.post("/meetings/today").then(response => {
          setMeetings(response.data);
        }).catch((error) => {sessionCallback();})
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClass, open]
  )
  return (
    <Dialog PaperProps={{sx: {maxHeight: "600px", maxWidth: selectedClass ? "900px" : "600px"}}} onClose={() => {closeHandler()}} open={open} fullWidth>
      <DialogTitle sx={{ marginRight: 6, p: 2 }}>{selectedClass.length === 0 ? "Jadwal Tutor" : `Jadwal Tutor Kelas ${selectedClass}`}</DialogTitle>
      <IconButton onClick={() => {closeHandler()}} sx={{ position: "absolute", right: 8, top: 8, color: (theme) => theme.palette.grey[500]}}>
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        {selectedClass.length === 0 ? Object.keys(data).map(key => 
            <MappingEntry datas={data} dkey={key} setSelectedClass={setSelectedClass} meetings={meetings}/>
          ) : <DetailDialog accountType={accountType} dkey={selectedClass} datas={data} meetings={meetings} sessionCallback={sessionCallback}/>
        }
      </DialogContent>
    </Dialog>
  );
}

