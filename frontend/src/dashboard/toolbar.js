import { Box, Button, Divider, FormControl, InputLabel, ListItemText, ListItemIcon, MenuItem, ListItem, OutlinedInput, Select, InputAdornment, IconButton, Typography } from "@mui/material";
import React, { useState, useRef } from "react";
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers';
import CreateMeetingsDialog from "../dialogs/createMettingsDialog";
import { useTheme } from "@emotion/react";
import { PersonalTutorAction, PersonalTutorDialog } from "./personalTutor";
import CloseIcon from '@mui/icons-material/Close';
import Check from '@mui/icons-material/Check';
import FloatingMenu from "../components/floatingMenu";
import { handleRealizationType } from "./tutorTable";
import CircleIcon from '@mui/icons-material/Circle';
import { CLASSES } from "../index.js"
import ManageSearchIcon from '@mui/icons-material/ManageSearch';

function DateSubmenu({dateFilterContent, setDateFilterContent, anchor, open, openHandler}){
  return (
    <FloatingMenu anchor={anchor.current} open={open} openHandler={openHandler} arrowPos="left">
      <ListItem dense>
        <ListItemText>Date Filter</ListItemText>
        <IconButton sx={{height: "25px", width: "25px"}}>
          <CloseIcon onClick={() => {openHandler(false)}} sx={{fontSize: "20px", color: (theme) => theme.palette.grey[500]}}/>
        </IconButton>
      </ListItem>
      <Divider />
      <Box style={{ display: 'flex', flexDirection: 'column' }}>
        <Box>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MobileDatePicker 
              sx={{mr: "5px", mt: "8px"}} 
              value={dateFilterContent.from} 
              maxDate={dateFilterContent.to} 
              slotProps={{
                actionBar: {
                  actions: ["clear", "cancel", "accept", "today"],
                  onclear: () => {
                    setDateFilterContent({from: null, to: null});
                  }
                }
              }}  
              onChange={(value) => {
                setDateFilterContent(d => ({...d, from: value }));
              }} views={["month", "day"]} label="From" />
            <MobileDatePicker 
              sx={{mt: "8px"}} 
              value={dateFilterContent.to} 
              minDate={dateFilterContent.from}
              slotProps={{
                actionBar: {
                  actions: ["clear", "cancel", "accept"],
                  onclear: () => {
                    setDateFilterContent(d => ({...d, to: null}))
                  }
                }
              }}
              onChange={(value) => {
                setDateFilterContent(d => ({...d, to: value }));
              }} views={["month", "day"]} label="To" />
          </LocalizationProvider>
        </Box>
        <Box style={{marginTop: "8px"}}>
          <Button onClick={() => {setDateFilterContent({from: null, to: null});}} variant="text" sx={{textTransform: "none", marginBottom: "-6px", marginLeft: "auto", marginRight: "8px"}} ><Typography fontSize="14px">Clear</Typography></Button>
        </Box>
      </Box>
    </FloatingMenu>
  );
}

function MeetingRoomSubmenu({meetingRoomFilterContent, setMeetingRoomFilterContent, anchor, open, openHandler}){
  return (
    <FloatingMenu anchor={anchor.current} open={open} openHandler={openHandler} arrowPos="left">
      <ListItem dense>
        <ListItemText>Ruang Tutor Filter</ListItemText>
        <IconButton sx={{height: "25px", width: "25px"}}>
          <CloseIcon onClick={() => {openHandler(false)}} sx={{fontSize: "20px", color: (theme) => theme.palette.grey[500]}}/>
        </IconButton>
      </ListItem>
      <Divider />
      <FormControl sx={{ m: 0.5, minWidth: 100 }}>
        <InputLabel>Kelas Tutor</InputLabel>
        <Select MenuProps={{
          PaperProps: {
            style: {
              maxHeight: "150px",
            },
          },
          }}
          multiple
          value={meetingRoomFilterContent}
          onChange={
            (event) => {
              const {target: { value }} = event;
              // On autofill we get a stringified value.
              setMeetingRoomFilterContent(typeof value === "string" ? value.split(",") : value);
            }
          }
          autoWidth label="Kelas Tutor">
          {CLASSES.map(c => <MenuItem value={c}>{c}</MenuItem>)}
        </Select>
        </FormControl>
        <Box style={{marginTop: "8px"}}>
          <Button onClick={() => {setMeetingRoomFilterContent([]);}} variant="text" sx={{textTransform: "none", marginBottom: "-6px", marginLeft: "auto", marginRight: "8px"}} ><Typography fontSize="14px">Clear</Typography></Button>
        </Box>
    </FloatingMenu>
  );
}

const realizations = ["1", "2", "3", "4", "5"]
function RealizationSubmenu({realizationFilterContent, setRealizationFilterContent, anchor, open, openHandler}){
  return (
    <FloatingMenu anchor={anchor.current} open={open} openHandler={openHandler} arrowPos="left">
      <ListItem dense>
        <ListItemText>Realisasi Filter</ListItemText>
        <IconButton sx={{height: "25px", width: "25px"}}>
          <CloseIcon onClick={() => {openHandler(false)}} sx={{fontSize: "20px", color: (theme) => theme.palette.grey[500]}}/>
        </IconButton>
      </ListItem>
      <Divider />
      {realizations.map(item => {return handleRealizationType(item)}).map(realization => {
        let isSelected = realizationFilterContent.includes(realization.type);
        return (
          <MenuItem sx={{width: "100%"}} dense onClick={() => isSelected ? setRealizationFilterContent(realizationFilterContent.filter(i => i !== realization.type)) : setRealizationFilterContent(realizationFilterContent.concat([realization.type]))}>
            {isSelected && <ListItemIcon>
              <Check sx={{fontSize: "15px"}}/>
            </ListItemIcon>}
            <ListItemText inset={!isSelected}>
              <CircleIcon sx={{mb: "-2px", fontSize: "13px", color: realization.color, textAlign: "baseline"}}/>
              <Typography ml="5px" fontSize="13px" display={"inline"}>{realization.text}</Typography>
            </ListItemText>
          </MenuItem>
        );
      })
      }
    </FloatingMenu>
  );
}

function TypeSubmenu({typeFilterContent, setTypeFilterContent, anchor, open, openHandler}){
  return (
    <FloatingMenu anchor={anchor.current} open={open} openHandler={openHandler} arrowPos="left">
      <ListItem dense>
        <ListItemText>Tipe Filter</ListItemText>
        <IconButton sx={{height: "25px", width: "25px"}}>
          <CloseIcon onClick={() => {openHandler(false)}} sx={{fontSize: "20px", color: (theme) => theme.palette.grey[500]}}/>
        </IconButton>
      </ListItem>
      <Divider />
      {["Mandiri", "Bersama Guru"].map(type => {
        let isSelected = typeFilterContent.includes(type);
        return (
          <MenuItem sx={{width: "100%"}} dense onClick={() => isSelected ? setTypeFilterContent(typeFilterContent.filter(i => i !== type)) : setTypeFilterContent(typeFilterContent.concat([type]))}>
            {isSelected && <ListItemIcon>
              <Check sx={{fontSize: "15px"}}/>
            </ListItemIcon>}
            <ListItemText inset={!isSelected}>
              <Typography ml="5px" fontSize="13px" display={"inline"}>{type}</Typography>
            </ListItemText>
          </MenuItem>
        );
      })
      }
    </FloatingMenu>
  );
}

function FilterMenu({
  open, 
  anchor, 
  openHandler,
  accountType,
  dateFilterContent,
  setDateFilterContent,
  meetingRoomFilterContent,
  setMeetingRoomFilterContent,
  realizationFilterContent,
  setRealizationFilterContent,
  typeFilterContent,
  setTypeFilterContent
}){
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [meetingRoomMenuOpen, setMeetingRoomMenuOpen] = useState(false);
  const [realizationMenuOpen, setRealizationMenuOpen] = useState(false);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);

  return (
    <Box>
      <FloatingMenu anchor={anchor.current} open={open} openHandler={openHandler} arrowPos="left">
        <ListItem dense>
          <ListItemText>Filters</ListItemText>
          <IconButton sx={{height: "25px", width: "25px"}}>
            <CloseIcon onClick={() => {openHandler(false)}} sx={{fontSize: "20px", color: (theme) => theme.palette.grey[500]}}/>
          </IconButton>
        </ListItem>
        <Divider />
        <MenuItem sx={{width: "100%"}} dense onClick={() => {setDateMenuOpen(true); openHandler(false)}}>
          {!!dateFilterContent.from && <ListItemIcon>
            <Check sx={{fontSize: "18px"}}/>
          </ListItemIcon>}        
          <ListItemText inset={!dateFilterContent.from}>
            Tanggal
            {!!dateFilterContent.from && <ListItemText sx={{color: "orange"}}>[{dateFilterContent.from.format("ddd, MMMM D")}{dateFilterContent.to && ` to `}{dateFilterContent.to?.format("ddd, MMMM D")}]</ListItemText>}
          </ListItemText>
        </MenuItem>
        <MenuItem dense onClick={() => {setMeetingRoomMenuOpen(true); openHandler(false)}}>
          {!!meetingRoomFilterContent.length && <ListItemIcon>
            <Check sx={{fontSize: "18px"}}/>
          </ListItemIcon>}        
          <ListItemText inset={!meetingRoomFilterContent.length}>
            Ruang Tutor
            {!!meetingRoomFilterContent.length && <ListItemText sx={{color: "orange"}}>[{meetingRoomFilterContent.join(", ")}]</ListItemText>}
          </ListItemText>
        </MenuItem>
        <MenuItem dense onClick={() => {setRealizationMenuOpen(true); openHandler(false)}}>
          {!!realizationFilterContent.length && <ListItemIcon>
            <Check sx={{fontSize: "18px"}}/>
          </ListItemIcon>}        
          <ListItemText inset={!realizationFilterContent.length}>
            Realisasi
            {!!realizationFilterContent.length && <ListItemText sx={{color: "orange"}}>  <Box sx={{ whiteSpace: "pre-wrap" }}>[{realizationFilterContent.map(i => handleRealizationType(i).text).join(", ")}]</Box></ListItemText>}
          </ListItemText>
        </MenuItem>
        {accountType === "student" && <MenuItem dense onClick={() => {setTypeMenuOpen(true); openHandler(false)}}>
          {!!typeFilterContent.length && <ListItemIcon>
            <Check sx={{fontSize: "18px"}}/>
          </ListItemIcon>}        
          <ListItemText inset={!typeFilterContent.length}>
            Tipe
            {!!typeFilterContent.length && <ListItemText sx={{color: "orange"}}>  <Box sx={{ whiteSpace: "pre-wrap" }}>[{typeFilterContent.join(", ")}]</Box></ListItemText>}
          </ListItemText>
        </MenuItem>}
      </FloatingMenu>
      <DateSubmenu dateFilterContent={dateFilterContent} setDateFilterContent={setDateFilterContent} anchor={anchor} open={dateMenuOpen} openHandler={setDateMenuOpen}/>
      <MeetingRoomSubmenu meetingRoomFilterContent={meetingRoomFilterContent} setMeetingRoomFilterContent={setMeetingRoomFilterContent} anchor={anchor} open={meetingRoomMenuOpen} openHandler={setMeetingRoomMenuOpen}/>
      <RealizationSubmenu realizationFilterContent={realizationFilterContent} setRealizationFilterContent={setRealizationFilterContent} anchor={anchor} open={realizationMenuOpen} openHandler={setRealizationMenuOpen}/>
      <TypeSubmenu typeFilterContent={typeFilterContent} setTypeFilterContent={setTypeFilterContent} anchor={anchor} open={typeMenuOpen} openHandler={setTypeMenuOpen}/>
    </Box>
  );
}

export default function Toolbar({
  setSearchContent, 
  setSuccess, 
  accountType, 
  sessionCallback,
  searchContent,
  dateFilterContent,
  setDateFilterContent,
  meetingRoomFilterContent,
  setMeetingRoomFilterContent,
  realizationFilterContent,
  setRealizationFilterContent,
  typeFilterContent,
  setTypeFilterContent

}){
  const theme = useTheme();
  const anchorRefMeeting = useRef(null);
  const anchorRefFilter = useRef(null);

  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [personalDialogOpen, setPersonalDialogOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <Box>
      <Box
        sx={{
          display: "inline-flex",
          maxWidth: { qsm: "98vw", md: "1000px", lg: "1000px" },
          width: "98vw",
          minWidth: "350px",
          verticalAlign: "top",
          height: "37px"
        }}>
          <Button 
            endIcon={<ArrowDropDownIcon />} 
            variant="contained" 
            color="filter"
            ref={anchorRefFilter}
            onClick={() => setFilterOpen(true)}
            sx={{boxShadow: "none", borderRadius: "6px 0 0 6px", textTransform: "none", display: "inline-flex"}}>
              Filter
          </Button>
          <OutlinedInput 
            sx={{height: "37px", width: "100%", outline: 0, borderRadius: "0 6px 6px 0", backgroundColor: theme.toolbarSearchColor}}
            startAdornment={<InputAdornment position="start"><SearchIcon /></InputAdornment>}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") {
                ev.preventDefault();
                setSearchContent(ev.target.value);
              }
            }}
          
          />
          <Button onClick={() => setMeetingDialogOpen(true)} variant="contained" color="success" sx={{marginLeft: "20px", width: "150px", borderRadius: accountType === "student" ? "6px 0 0 6px" : "6px", textTransform: "none", display: "inline-flex"}}>New meeting</Button>
          {accountType === "student" && 
            <Button 
              ref={anchorRefMeeting} 
              onClick={() => setPopupOpen(true)} 
              endIcon={<ArrowDropDownIcon sx={{marginLeft: "-10px"}}/>} 
              variant="contained" 
              color="success" 
              sx={{padding: 0, minWidth: "30px!important", backgroundColor: theme.toolBarNewEndColor, borderRadius: "0 6px 6px 0", textTransform: "none", display: "inline-flex"}}>
            </Button>
          }
          <CreateMeetingsDialog accountType={accountType} open={meetingDialogOpen} openHandler={setMeetingDialogOpen} sessionCallback={sessionCallback}/>
          <PersonalTutorAction setPersonalDialogOpen={setPersonalDialogOpen} setMeetingDialogOpen={setMeetingDialogOpen} anchorRef={anchorRefMeeting} setSuccess={setSuccess} open={popupOpen} openHandler={setPopupOpen} sessionCallback={sessionCallback}/>
          <PersonalTutorDialog setSuccess={setSuccess} sessionCallback={sessionCallback} open={personalDialogOpen} openHandler={setPersonalDialogOpen}/>
          <FilterMenu 
            open={filterOpen} 
            openHandler={setFilterOpen} 
            anchor={anchorRefFilter}
            accountType={accountType}
            dateFilterContent={dateFilterContent}
            setDateFilterContent={setDateFilterContent}
            meetingRoomFilterContent={meetingRoomFilterContent}
            setMeetingRoomFilterContent={setMeetingRoomFilterContent}
            realizationFilterContent={realizationFilterContent}
            setRealizationFilterContent={setRealizationFilterContent}
            typeFilterContent={typeFilterContent}
            setTypeFilterContent={setTypeFilterContent}    
          />
      </Box>
      {searchContent && <Box sx={{
        display: "inline-flex",
        maxWidth: { qsm: "98vw", md: "1000px", lg: "1000px" },
        width: "98vw",
        minWidth: "350px",
        verticalAlign: "top",
        height: "37px"
      }}>
        <ManageSearchIcon /><Typography ml="5px">{searchContent}</Typography>
      </Box>}
    </Box>
  );
}