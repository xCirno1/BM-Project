import { useEffect, useState } from 'react';
import { Box, Checkbox, Collapse, List, Table, TableHead, TextField, TableRow, TableBody, TableCell, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, IconButton, Typography } from '@mui/material';
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

function Rating({checkedPerson, setCheckedPerson, done, setDone, meeting, row, sessionCallback}){
  const [greenPressed, setGreenPressed] = useState(false);
  const [redPressed, setRedPressed] = useState(false);
  const [topic, setTopic] = useState("");
  const [thisDone, setThisDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const theme = useTheme();

  function handleDoneButtonClick(){
    if (topic.length === 0){
      return setErrorMessage("Evaluasi tidak boleh kosong.")
    }
    api.post(`/meetings/${row.id}/review`, {judgement: redPressed ? "bad" : "good", information: topic, meetings: checkedPerson}).then(response => {
      if (!checkedPerson.length){
        setThisDone(true);
      }
      setCheckedPerson([]);
      setDone(checkedPerson);
    }).catch((error) => {
    if(error.response.status === 401){sessionCallback(true);}
    }
  )}
  if (thisDone || row.reviewed || done.includes(row.id)){
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

function CheckBox({done, checkedPerson, setCheckedPerson, row}){
  let isDone = done.includes(row.id)
  return (
    <Checkbox size="medium" sx={{padding: 0, margin: 0}} disabled={row.reviewed || !row.attend || isDone} onClick={() => {
      if (checkedPerson.includes(row.id)){
          setCheckedPerson(checkedPerson.filter(e => e !== row.id));
        }
      else{
        setCheckedPerson([...checkedPerson, row.id]);
      }
    }} checked={checkedPerson.includes(row.id) || row.reviewed || isDone} />
  );
}

function DetailDialog({accountType, dkey, datas, meetings, sessionCallback}){
  const theme = useTheme();
  const filtered = meetings.filter((row) => row.meeting_class === dkey);
  const [checkedPerson, setCheckedPerson] = useState([]);
  const [done, setDone] = useState([]);
  const [meetingExpanded, setMeetingExpanded] = useState(true);
  const [privateExpanded, setPrivateExpanded] = useState(true);

  let cb;
  return (
    <Box minHeight="200px" minWidth="400px" sx={{display: "block"}}>
      <Typography display="inline">Tanggal: </Typography>
      <Typography display="inline" color="#949494">
        <strong>{dayjs().format("dddd, MMMM D, YYYY")}</strong>
      </Typography>
      
      <Box onClick={() => setMeetingExpanded(!meetingExpanded)} sx={{borderBottom: `2px solid ${theme.lineColor}`, height: 0, margin: "10px 0 16px", textAlign: "center", '&:hover': {cursor: "pointer",}}}>
        <Box sx={{display: "inline-block", fontSize: "16px", position: "relative", top: "-12px", padding: "0 6px", bgcolor: theme.dialogColor}}>
          <Typography display="inline"><strong>{filtered.length} </strong></Typography>
          <Typography display="inline" color={theme.textExtraColor}>On-going Meetings</Typography>
        </Box>
      </Box>
      <Collapse in={meetingExpanded} timeout="auto" unmountOnExit>
        {filtered.length === 0 ? (
          <Typography align="center" fontSize="18px" color="grey">Tidak ada data yang tersedia.</Typography>
        ) : (
          <Table size="small" sx={{backgroundColor: theme.tableColor, width: "100%", tableLayout: "fixed"}}>
            <TableHead>
              <TableRow>
                <TableCell sx={{width: "30%"}}>Name</TableCell>
                <TableCell sx={{width: "30%"}}>Teacher</TableCell>
                <TableCell sx={{width: "40%"}}>Topic</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell size="small">{truncateName(row.student.name)}</TableCell>
                  <TableCell size="small">{truncateName(row.teacher.name)}</TableCell>
                  <TableCell size="small">{row.topic}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Collapse>
      <Box height="20px"></Box>
      <Box onClick={() => setPrivateExpanded(!privateExpanded)} sx={{borderBottom: `2px solid ${theme.lineColor}`, height: 0, margin: "10px 0 16px", textAlign: "center", '&:hover': {cursor: "pointer",}}}>
        <Box sx={{display: "inline-block", fontSize: "16px", position: "relative", top: "-12px", padding: "0 6px", bgcolor: theme.dialogColor}}>
          <Typography display="inline"><strong>{datas[dkey].length} </strong></Typography>
          <Typography display="inline" color={theme.textExtraColor}>Personal Tutors</Typography>
        </Box>
      </Box>

      {checkedPerson.length > 1 && (
        <Typography fontSize={"13px"}>
          Note: When selecting multiple people, you can click on any row and that review will be applied to every selected person.
        </Typography>
      )}
      <Collapse in={privateExpanded} timeout="auto" unmountOnExit>
        <Table size="small" sx={{backgroundColor: theme.tableColor, width: "100%", tableLayout: "fixed"}}>
          <TableHead>
            <TableRow>
              {accountType === "teacher" ? (
                <TableCell sx={{width: "30%"}}>
                  <Checkbox
                    checked={(cb = datas[dkey].filter(row => row.attend && !row.reviewed).length === checkedPerson.length)}
                    onClick={() => {
                      if (!cb) {
                        setCheckedPerson(datas[dkey].filter(row => row.attend && !row.reviewed).map(row => row.id));
                      } else {
                        setCheckedPerson([]);
                      }
                    }}
                  />
                </TableCell>
              ) : undefined}
              <TableCell sx={{width: "30%"}}>Name</TableCell>
              <TableCell sx={{width: "40%"}}>Topic</TableCell>
              {accountType === "teacher" ? <TableCell align="center" sx={{width: "30%"}}>Rating</TableCell> : undefined}
            </TableRow>
          </TableHead>
          <TableBody>
            {datas[dkey].map((row) => {
              let color = "inherit";
              let bgcolor = "inherit";
              let meeting = meetings.filter(d => d.student.id === row.student.id);
              let topic;
              if (meeting.length > 0) {
                bgcolor = theme.excludeItemColor;
                topic = (
                  <Typography fontSize="14px">
                    Meeting with <Typography display="inline" fontSize="14px" color={theme.systemTopicColor}>{`${meeting[0].teacher.name}`}</Typography>.
                  </Typography>
                );
              } else if (!row.attend) {
                color = theme.notFilledItemColor;
              } else {
                topic = <Typography fontSize="14px">{row.topic}</Typography>;
              }
              return (
                <TableRow sx={{backgroundColor: bgcolor}} key={row.id}>
                  {accountType === "teacher" ? (
                    <TableCell size="small">
                      <CheckBox row={row} done={done} attend={row.attend} checkedPerson={checkedPerson} setCheckedPerson={setCheckedPerson} />
                    </TableCell>
                  ) : undefined}
                  <TableCell size="small" sx={{color: color, width: "30%"}}>{truncateName(row.student.name)}</TableCell>
                  <TableCell size="small" width="100%">{topic}</TableCell>
                  {accountType === "teacher" ? (
                    <TableCell size="small" align="center">
                      <Rating
                        checkedPerson={checkedPerson}
                        done={done}
                        setDone={setDone}
                        setCheckedPerson={setCheckedPerson}
                        meeting={meeting}
                        row={row}
                        sessionCallback={sessionCallback}
                      />
                    </TableCell>
                  ) : undefined}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Collapse>
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
        <ListItemText sx={{color: "gray", marginLeft: "auto", flex: "none"}} primary={`${meetings.filter(m => m.meeting_class === dkey).length} ${window.innerWidth > 500 ? "On-going Meetings" : "OM"}, ${datas[dkey].filter(d => d.attend).length} ${window.innerWidth > 500 ? "Personal Tutors" : "PT"}`} />
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
        {window.innerWidth <= 500 && selectedClass.length === 0 && <Typography fontSize={"12px"}>OM = On-going Meetings<br/>PT = Private Tutor</Typography>}
        {selectedClass.length === 0 ? Object.keys(data).map(key => 
            <MappingEntry datas={data} dkey={key} setSelectedClass={setSelectedClass} meetings={meetings}/>
          ) : <DetailDialog accountType={accountType} dkey={selectedClass} datas={data} meetings={meetings} sessionCallback={sessionCallback}/>
        }
      </DialogContent>
    </Dialog>
  );
}

