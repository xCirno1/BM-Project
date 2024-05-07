import { useEffect, useState } from 'react';
import { Box, Divider, Dialog, DialogTitle, DialogContent, IconButton, Typography, Tabs, Tab, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api.js'
import { useTheme } from "@mui/material/styles";
import { PersonList } from '../dashboard/personList.js';
import dayjs from 'dayjs';

function parseReview(string){
  const [r, d] = string.split(":")
  return {review: r, description: d}
}

function MeetingDetail({meetings}){
  const theme = useTheme();
  const [value, setValue] = useState(undefined);
  const classes = [...new Set(meetings.filter(obj => obj.teacher !== null).map(obj => obj.teacher.class))].sort();

  if (!value && classes.length !== 0){
    setValue(classes[0]);
  }

  if (classes.length === 0 || meetings.length === 0){
    return (<Typography mb="30px" mt="30px" align="center" fontSize="18px" color="grey">Tidak ada data yang tersedia.</Typography>);
  }

  return (
    <Box display="flex" sx={{marginTop: "30px", minWidth: "400px"}}>
      <Tabs orientation="vertical" variant="scrollable" value={value} onChange={(e, v) => setValue(v)} sx={{ borderRight: 1, borderColor: 'divider', marginRight: "30px" }}>
          {[...new Set(meetings.filter(obj => obj.teacher !== null).map(obj => obj.teacher.class))].sort().map(row => <Tab value={row} sx={{textTransform: "none"}} label={row} />)}
        </Tabs>
        <Box sx={{backgroundColor: theme.tableColor, width: "100%"}}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Teacher</TableCell>
                <TableCell>Topic</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {meetings.sort((a, b) => {return a.meeting_timestamp > b.meeting_timestamp ? -1 : 1}).filter(row => row.teacher !== null && row.teacher.class === value).map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{dayjs.unix(row.meeting_timestamp).format("dddd, MMMM D, YYYY")}</TableCell>
                  <TableCell>{row.teacher.name}</TableCell>
                  <TableCell>{row.topic}</TableCell>
                  <TableCell>{row.evaluation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </Box>
    </Box>
  );
}

function PersonalDetail({meetings}){
  const theme = useTheme();
  const personalMeetings = [...new Set(meetings.filter(obj => obj.teacher === null))]

  if (personalMeetings.length === 0){
    return (<Typography mb="30px" mt="30px" align="center" fontSize="18px" color="grey">Tidak ada data yang tersedia.</Typography>);
  }
  let rev;

  return (
    <Box display="flex" sx={{marginTop: "30px", minWidth: "400px"}}>
      <Box sx={{backgroundColor: theme.tableColor, width: "100%"}}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Topic</TableCell>
              <TableCell>Review</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {personalMeetings.sort((a, b) => {return a.meeting_timestamp > b.meeting_timestamp ? -1 : 1}).map((row) => (
              <TableRow key={row.id}>
                <TableCell>{dayjs.unix(row.meeting_timestamp).format("dddd, MMMM D, YYYY")}</TableCell>
                <TableCell>{row.topic}</TableCell>
                <TableCell>
                  <Typography fontSize="15px" color={(rev = parseReview(row.evaluation)).review === "good" ? "green" : "red"}>{rev.description}</Typography>
                  <Typography fontSize="10px" color={theme.textExtraColor}>Reviewed By: {row.created_by.name}</Typography>

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}

function PersonDetailDialog({person, meetings}){
  const [value, setValue] = useState("Meetings");

  return (
    <Box>
      <Tabs value={value} onChange={(e, v) => setValue(v)}>
        <Tab value="Meetings" label="Meetings"/>
        <Tab value="Personal" label="Personal" />
      </Tabs>
      <Divider></Divider>
      <Box>
        {value === "Meetings" && <MeetingDetail meetings={meetings}/>}
        {value === "Personal" && <PersonalDetail meetings={meetings}/>}
      </Box>
    </Box>
  )
}

function PeopleListDialog({people, selectedPerson, selectedPersonHandler}){
  return (
    <PersonList people={people} selectedPerson={selectedPerson} selectedPersonHandler={selectedPersonHandler} checkable={false}></PersonList>
  )
}

export default function PeopleDialog({accountType, profileName, open, openHandler, sessionCallback}){
  const [people, setPeople] = useState({});
  const [selectedPerson, setSelectedPerson] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const selectedPersonHandler = (person) => {setSelectedPerson([person])}
  useEffect(() => {
    if (accountType === "student" && selectedPerson.length === 0 && open){
      return setSelectedPerson([{id: "@me"}])
    }

    if (open){
    api.get("/people").then(response => {
      setPeople(response.data)
    }).catch((error) => {
      if(error.response.status === 401){sessionCallback()}
      // eslint-disable-next-line react-hooks/exhaustive-deps
      })}}, [open]);

  useEffect(() => {
    if (selectedPerson.length !== 0 && open){
      api.get(`/meetings/done/${selectedPerson[0]?.id}`).then(response => {
        setMeetings(response.data)
      }).catch((error) => {
        setMeetings([]);
        if(error.response.status === 401){sessionCallback()}
        // eslint-disable-next-line react-hooks/exhaustive-deps
        })}}, [selectedPerson, open])
  const dialogTitle = selectedPerson.length === 0 
    ? `Daftar ${accountType === "student" ? "Guru" : "Murid"}` 
    : `Siswa ${selectedPerson[0].name ? selectedPerson[0].name : profileName}`
  
  return (
  <Dialog PaperProps={{sx: {maxHeight: "600px", maxWidth: selectedPerson.length !== 0 ? "900px" : "500px"}}} onClose={() => {if (selectedPerson.length === 0 || accountType === "student"){openHandler(false)}; setSelectedPerson([]); setMeetings([])}} open={open} fullWidth>
    <DialogTitle sx={{ marginRight: 6, p: 2 }}> {open && dialogTitle}</DialogTitle>
    <IconButton onClick={() => {if (selectedPerson.length === 0 || accountType === "student"){openHandler(false)}; setSelectedPerson([]); setMeetings([])}} sx={{ position: "absolute", right: 8, top: 8, color: (theme) => theme.palette.grey[500]}}>
      <CloseIcon />
    </IconButton>
    <DialogContent dividers>
      {selectedPerson.length === 0 && open ? 
        <PeopleListDialog people={people} selectedPerson={selectedPerson} selectedPersonHandler={selectedPersonHandler}/> :
        <PersonDetailDialog person={selectedPerson[0]} meetings={meetings} />
      }
    </DialogContent>
  </Dialog>
  );
}