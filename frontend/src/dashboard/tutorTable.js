import { Button, Chip, Collapse, IconButton, Table, TablePagination, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, ClickAwayListener, Popper, Grow, MenuList, Typography, Box } from '@mui/material';
import React, {useState, useRef, useEffect, useCallback} from 'react';
import { styled } from '@mui/system';
import useTheme from '@mui/material/styles/useTheme'
import TableSortLabel from '@mui/material/TableSortLabel';
import DoneIcon from '@mui/icons-material/Done';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import UpdateIcon from '@mui/icons-material/Update';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CircleIcon from '@mui/icons-material/Circle';
import Toolbar from './toolbar.js'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { RejectAction, DoneAction, CancelAction, NoClassAction, RescheduleAction } from './buttonActions.js';
import api from '../services/api.js'
import dayjs from "dayjs";
import '../css/font.css'

function WaitingEnd({ setSuccess, accountType, meeting, sessionCallback }){
  const [open, setOpen] = useState(false);
  const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
  const [noClassPopupOpen, setNoClassPopupOpen] = useState(false);
  const [reschedulePopupOpen, setReschedulePopupOpen] = useState(false);
  const anchorRef = useRef(null);

  function handleAcceptButtonClick(){
    if (accountType === "teacher"){
      return setNoClassPopupOpen(true);
    }
    setOpen(false);
    api.post(`/meetings/${meeting.id}/accept`).then(response => {
        setSuccess("Jadwal berhasil dikonfimasi!");
      }
    ).catch((error) => {
      if(error.response.status === 401){sessionCallback();}
      }
    )
  }

  return (
  <Box>
    <ChevronRightIcon sx={{display: "flex"}} onClick={() => {setOpen(!open)}} ref={anchorRef}/>
    <Popper
      open={open}
      anchorEl={anchorRef.current}
      placement="bottom"
      transition
      sx={{zIndex: "2147483647"}}
    >
      {({ TransitionProps, placement }) => (
        <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'left top' : 'left bottom',}}>
          <Paper>
            <ClickAwayListener onClickAway={() => {setOpen(false)}}>
              <MenuList autoFocusItem={open}>
              {accountType === "teacher" && (
                <>
                  <Button onClick={() => {handleAcceptButtonClick()}} sx={{display: "inline-block", marginLeft: "5px"}}>
                    <CheckIcon />
                    <Typography fontSize="10px">Accept</Typography>
                    
                  </Button>
                  <Button onClick={() => {setRejectPopupOpen(true); setOpen(false)}} sx={{display: "inline-block"}}>
                    <ClearIcon />
                    <Typography fontSize="10px">Reject</Typography>
                  </Button>
                </>
                )
              }
                <Button onClick={() => {setReschedulePopupOpen(true); setOpen(false)}} sx={{display: "inline-block", marginRight: "5px"}}>
                  <UpdateIcon />
                  <Typography fontSize="10px">Reschedule</Typography>
                </Button>
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
    <NoClassAction setSuccess={setSuccess} open={noClassPopupOpen} setOpen={setNoClassPopupOpen} anchorRef={anchorRef} sessionCallback={sessionCallback} meeting={meeting}/>
    <RejectAction setSuccess={setSuccess} open={rejectPopupOpen} setOpen={setRejectPopupOpen} anchorRef={anchorRef} sessionCallback={sessionCallback} meeting={meeting}/>
    <RescheduleAction setSuccess={setSuccess} open={reschedulePopupOpen} setOpen={setReschedulePopupOpen} anchorRef={anchorRef} sessionCallback={sessionCallback} meeting={meeting}></RescheduleAction>
  </Box>
  )
}
function PendingEnd({force, accountType, meeting, sessionCallback, setSuccess}){
  const [open, setOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reschedulePopupOpen, setReschedulePopupOpen] = useState(false);
  const anchorRef = useRef(null);

  if (accountType === "student"){
    return (
      <Box>
        <ChevronRightIcon sx={{display: "flex"}} onClick={() => {setOpen(!open)}} ref={anchorRef}/>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement="bottom"
          transition
          sx={{zIndex: "2147483647"}}
        >
          {({ TransitionProps, placement }) => (
            <Grow {...TransitionProps} style={{ transformOrigin: "bottom",}}>
              <Paper>
                <ClickAwayListener onClickAway={() => setOpen(false)}>
                  <MenuList autoFocusItem={open} id="composition-menu" aria-labelledby="composition-button">
                    <Box maxWidth={"300px"}>
                      <Typography color="red" fontSize="15px" margin={"5px"}>Silahkan koordinasi langsung kepada guru jika ingin mengubah jadwal tutor.</Typography>
                    </Box>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>)}
        </Popper>
      </Box>
    );
  }
  return (
    <Box>
    {force ? <Button color="secondary" sx={{textTransform: 'none'}} onClick={() => {setOpen(!open)}} ref={anchorRef}>
        Batch Action
      </Button> : 
      <ChevronRightIcon sx={{display: "flex"}} onClick={() => {setOpen(!open)}} ref={anchorRef}/>}
    <Popper
      open={open}
      anchorEl={anchorRef.current}
      placement="bottom"
      transition
      sx={{zIndex: "2147483647"}}
    >
      {({ TransitionProps, placement }) => (
        <Grow {...TransitionProps} style={{ transformOrigin: "bottom",}}>
          <Paper>
            <ClickAwayListener onClickAway={() => setOpen(false)}>
              <MenuList autoFocusItem={open} id="composition-menu" aria-labelledby="composition-button">
                <Button onClick={() => {setDoneOpen(true); setOpen(false)}} sx={{display: "inline-block", marginLeft: "5px"}}>
                  <CheckIcon />
                  <Typography fontSize="10px">Finish</Typography>
                </Button>
                <Button onClick={() => {setCancelOpen(true); setOpen(false)}} sx={{display: "inline-block"}}>
                  <ClearIcon />
                  <Typography fontSize="10px">Cancel</Typography>
                </Button>
                {!force && <Button onClick={() => {setReschedulePopupOpen(true); setOpen(false)}} sx={{display: "inline-block", marginRight: "5px"}}>
                  <UpdateIcon />
                  <Typography fontSize="10px">Reschedule</Typography>
                </Button>}

              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
    <DoneAction setSuccess={setSuccess} open={doneOpen} setOpen={setDoneOpen} anchorRef={anchorRef} meeting={meeting} sessionCallback={sessionCallback}></DoneAction>
    <CancelAction setSuccess={setSuccess} open={cancelOpen} setOpen={setCancelOpen} anchorRef={anchorRef} meeting={meeting} sessionCallback={sessionCallback}></CancelAction>
    <RescheduleAction setSuccess={setSuccess} open={reschedulePopupOpen} setOpen={setReschedulePopupOpen} anchorRef={anchorRef} sessionCallback={sessionCallback} meeting={meeting}></RescheduleAction>
  </Box>
  )
}

export function handleRealizationType(row, accountType, sessionCallback, setSuccess, force){
  // Here, row can be a list of meetings, so we need to adjust accordingly
  let cond = (row instanceof Object) ? (force ? row[0].realization : row.realization) : row;
  switch (cond){
    case ("1"): return {type: "1", logo: <DoneIcon/>, text: "Done", color: "green", tooltip: ({children}) => <Tooltip enterTouchDelay={0} sx={{color: 'lightgray', marginLeft: "5px", position: "relative", top: "-1px"}} title={row.evaluation} arrow>{children}</Tooltip>}
    case ("2" || force):
      let end;
      if (force){
        end = <span><PendingEnd force accountType={accountType} setSuccess={setSuccess} meeting={row} sessionCallback={sessionCallback}/></span> 
      }
      else{
        end = <span><PendingEnd accountType={accountType} setSuccess={setSuccess} meeting={row} sessionCallback={sessionCallback}/></span> 
      }
      return {type: "2", logo: <PendingIcon/>, text: "Pending", color: "#8B4000", tooltip: ({children}) => children, end: end}
    case ("3"): return {type: "3", logo: <RestartAltIcon/>, text: "Rescheduled", color: "darkgray", tooltip:  ({children}) => <Tooltip enterTouchDelay={0} sx={{color: 'lightgray', marginLeft: "5px", position: "relative", top: "-1px"}} title={row.description} arrow>{children}</Tooltip>}
    case ("4"): return {type: "4", logo: <ErrorIcon/>, text: "Failed", color: "red", tooltip: ({children}) => <Tooltip enterTouchDelay={0} sx={{color: 'lightgray', marginLeft: "5px", position: "relative", top: "-1px"}} title={row.description} arrow>{children}</Tooltip>}
    case ("5"): return {type: "5", logo: <HourglassEmptyIcon/>, text: "Waiting...", color: "purple", tooltip: ({children}) => <Tooltip enterTouchDelay={0} sx={{color: 'lightgray', marginLeft: "5px", position: "relative", top: "-1px"}} title="Menunggu konfirmasi guru..." arrow>{children}</Tooltip>, end: <span><WaitingEnd setSuccess={setSuccess} sessionCallback={sessionCallback} meeting={row} accountType={accountType}/></span>}
    default: return {type: "undefined", text: "undefined"}
  }
}
const BlinkingCircleIcon = styled(CircleIcon)`
animation: blink-animation 1s ease-in-out infinite alternate;

@keyframes blink-animation {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
`;

const subcolumns = [
  { id: 'name', label: 'Nama' },
  { id: 'topic', label: 'Topik' },
  { id: 'realization', label: 'Realisasi' },
];

function TableEntry({rows, accountType, sessionCallback, setSuccess}){
  const [open, setOpen] = useState(false);
  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("desc");
  const theme = useTheme();

  const handleRequestSort = (property) => () => {
    const isAscending = orderBy === property && order === "asc";
    setOrder(isAscending ? "desc" : "asc");
    setOrderBy(property);
  };
  const sortedRows = order === "asc"
    ? [...rows].sort((a, b) => ((orderBy === "name" ? a.student.name > b.student.name : a[orderBy] > b[orderBy]) ? 1 : -1))
    : [...rows].sort((a, b) => ((orderBy === "name" ? a.student.name < b.student.name : a[orderBy] < b[orderBy]) ? 1 : -1));
  let realization;
  return (
  <>
    <TableRow hover key={`${rows[0].group_key}#group`} sx={{'& > *': { borderBottom: 'unset' }}}>
      <TableCell sx={{ maxWidth: '20px', padding: '5px', verticalAlign: 'middle' }}>
        {(rows.length > 1 || (rows.length === 1 && rows[0].teacher)) && (
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        )}
        {dayjs.unix(rows[0].meeting_timestamp).isSame(dayjs(), 'date') && rows[0].realization !== "3" && (
          <BlinkingCircleIcon sx={{ fontSize: '10px', ml: "12px", color: theme.liveNowIndicatorColor }} />
        )}
      </TableCell>

      <TableCell component="th" scope="row">
        {dayjs.unix(rows[0].meeting_timestamp).format("dddd, MMMM D, YYYY")}
      </TableCell>
      {/* {TODO: Add student's class and display_name here} */}
      <TableCell sx={{maxWidth: "250px"}}>
        {rows[0].teacher ? 
          <Box>
            <Typography fontSize="12px" display="inline">
              {rows.length > 1 ? rows[0][accountType === "teacher" ? "student" : "teacher"].name.split(" ")[0] + "," : rows[0][accountType === "teacher" ? "student" : "teacher"].name}
              {rows.length === 1 && accountType === "teacher" ? ` (${rows[0].student.class})` : ""}
            </Typography>
            <Typography onClick={() => setOpen(true)} sx={{ "&:hover": { cursor: "pointer", color: "darkgrey" } }} fontSize="12px" display="inline" color="gray">{rows.length > 1 ? ` +${rows.length - 1} others` : ""}</Typography>
          </Box> : 
          <Box sx={{display: "flex", alignItems: "center", textAlign: "center"}}>
            <AccountCircleIcon/>
            <Typography sx={{ml: "3px"}} fontSize="12px" display="inline">
              Yourself
            </Typography>
          </Box>
        }
      </TableCell>
      <TableCell>{rows[0].meeting_class}{!rows[0].teacher ? " (Mandiri)" : ""}</TableCell>
      <TableCell sx={{maxWidth: "250px"}}>
        <Tooltip title={rows[0].topic} enterTouchDelay={0}>
          {!rows[0].topic.trim() ? <Typography fontSize="14px" color="grey">Tidak tersedia</Typography> : <Typography fontSize="14px">{rows[0].topic.length <= 70 ? rows[0].topic: (rows[0].topic.substr(0, 70) + "...")}</Typography>}
        </Tooltip>
      </TableCell>
      <TableCell sx={{minWidth: "125px"}}>
      {(realization = handleRealizationType(rows[0], accountType, sessionCallback, setSuccess)) && <></>}
      {accountType === "teacher" ? ( rows.length === 1 ?
          <Chip onDelete={realization.end ? () => {} : undefined} size="small" sx={{
              "& .MuiChip-label": {paddingLeft: "10px", paddingRight: "10px", color: "white"}, 
              "& .MuiChip-icon": {color: "white"},
              backgroundColor: realization.color
            }} 
            icon={realization.logo} 
            label={<realization.tooltip>{realization.text}</realization.tooltip>}
            deleteIcon={<Box sx={{marginLeft: "-10px!important"}}>{realization.end}</Box>}>
          </Chip> : 
          handleRealizationType(rows, accountType, sessionCallback, setSuccess, true).end
        ): undefined}
      </TableCell>
    </TableRow>
    {/* Everything below this comment should only be available to teachers. */}
    <TableRow sx={{border: "none"}}>
      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box sx={{ margin: 1 }}>
            <Typography align="center" variant="h6" fontSize="15px" gutterBottom component="div">
              Meeting {rows[0].group_key}
            </Typography>
            <Table size="small" aria-label="purchases">
              <TableHead>
                <TableRow>
                  {subcolumns.map((column) => (
                    <TableCell key={`${column.id}#sub`} sx={{ textAlign: "center",}}>
                      {column.id !== "none" && <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : "asc"}
                        onClick={handleRequestSort(column.id)}
                      >
                        {column.id === "name" && accountType === "teacher" ? column.label + " (kelas)": column.label}
                      </TableSortLabel>}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedRows.map(row => (
                  <TableRow hover>
                    {rows[0].teacher && <TableCell sx={{maxWidth: "100px"}}>{row[accountType === "teacher" ? "student" : "teacher"].name} {accountType === "teacher" && `(${row.student.class})`}</TableCell>}
                    <TableCell align="center">{row.topic}</TableCell>
                    <TableCell align="center" sx={{alignItems: "center", verticalAlign: "middle", minWidth: "125px", maxWidth: "180px"}}>
                    {(realization = handleRealizationType(row, accountType, sessionCallback, setSuccess)) && <></>}
                    <realization.tooltip>
                      <Chip onDelete={realization.end ? () => {} : undefined} size="small" sx={{
                          "& .MuiChip-label": {paddingLeft: "10px", paddingRight: "10px", color: "white"}, 
                          "& .MuiChip-icon": {color: "white"},
                          backgroundColor: realization.color
                        }} 
                        icon={realization.logo} 
                        label={realization.text}
                        deleteIcon={<Box sx={{marginLeft: "-10px!important"}}>{realization.end}</Box>}>
                      </Chip>
                    </realization.tooltip>
                    </TableCell>
                  </TableRow>
                ))}                
              </TableBody>
            </Table>
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  </>
  )
}

const columns = [
    { id: 'none', label: '' },
    { id: 'meeting_timestamp', label: 'Tanggal' },
    { id: 'name', label: 'Guru' },
    { id: 'meeting_class', label: 'Ruang Tutor' },
    { id: 'topic', label: 'Topik' },
    { id: 'realization', label: 'Realisasi' },
  ];

export function TutorListTable({ accountType, sessionCallback, setSuccess }) {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("meeting_timestamp");
  const [order, setOrder] = useState("desc");
  const [rows, setRows] = useState({});
  const [searchContent, setSearchContent] = useState("");
  const [dateFilterContent, setDateFilterContent] = useState({from: null, to: null});
  const [meetingRoomFilterContent, setMeetingRoomFilterContent] = useState([]);
  const [realizationFilterContent, setRealizationFilterContent] = useState([]);
  const [typeFilterContent, setTypeFilterContent] = useState(["Mandiri", "Bersama Guru"]);

  let filteredRows = rows;
  const handleRequestSort = (property) => () => {
    const isAscending = orderBy === property && order === "asc";
    setOrder(isAscending ? "desc" : "asc");
    setOrderBy(property);
  };

  function filterEntries(entries){
    const clone = structuredClone(entries);

    Object.keys(entries).map(
      (key) => {
        clone[key] = clone[key].filter(
          (item) => {
            const realizationFilterMatch = !realizationFilterContent.length || realizationFilterContent.includes(item.realization);
            const timestampFilterMatch = !dateFilterContent.from || (item.meeting_timestamp >= dateFilterContent.from.unix() && (!dateFilterContent.to || item.meeting_timestamp <= (dateFilterContent.to.unix() + 86400)));
            const classFilterMatch = !meetingRoomFilterContent.length || meetingRoomFilterContent.includes(item.meeting_class);
            // typeFilterMatch
            let first, second;
            if (typeFilterContent.includes("Mandiri")){
              first = !item.teacher
            }
            if (typeFilterContent.includes("Bersama Guru")){
              second = !!item.teacher
            }
            return (
            (realizationFilterMatch &&
            timestampFilterMatch &&
            classFilterMatch &&
            (first || second)) &&
            (item.topic.toLowerCase().includes(searchContent) ||
            item.meeting_class?.toLowerCase().includes(searchContent) ||
            item.student?.name?.toLowerCase().includes(searchContent) ||
            item.teacher?.name?.toLowerCase().includes(searchContent) ||
            handleRealizationType(item).text?.toLowerCase().includes(searchContent) ||
            dayjs.unix(item.meeting_timestamp).format("dddd, MMMM D, YYYY").toLowerCase().includes(searchContent)));
          }
        )
        if (!clone[key].length){
          delete clone[key];
        }
        return 1;
      }
    )
    return clone
  }

  function sortUsername(entries){
    return order === "asc"
    ? entries.sort((a, b) => {
      // if the length is the same, sort alphabetically from the first element
      // else, just sort it based on length
      if (a.length === 1 && b.length === 1){
        if (accountType === "teacher"){
          return entries.sort((a, b) => (a[0].student?.name > b[0].student?.name ? 1 : -1))
        }
        return entries.sort((a, b) => (a[0].teacher?.name > b[0].teacher?.name ? 1 : -1))
      }
      return a > b ? 1 : -1;
    })
    : entries.sort((a, b) => {
      if (a.length === 1 && b.length === 1){
        if (accountType === "teacher"){
          return entries.sort((a, b) => (a[0].student?.name < b[0].student?.name ? 1 : -1))
        }
        return entries.sort((a, b) => (a[0].teacher?.name < b[0].teacher?.name ? 1 : -1))
      }
      return a < b ? 1 : -1;
    });
  }

  function sortEntries(entries) {
    // Maps every meetings with similar class & date while also sorting them
    let retToday = [];
    let retOtherDays = [];

    Object.keys(entries).map(entry => {
      let group = entries[entry];
      if (dayjs.unix(group[0].meeting_timestamp).isSame(dayjs(), "date")) {
        retToday.push(group.map(a => {a.group_key = entry; return a}));
      } else {
        retOtherDays.push(group.map(a => {a.group_key = entry; return a}));
      }
      return entry;
    });
    retToday.sort((a, b) => (a[0][orderBy] > b[0][orderBy] ? 1 : -1));
    retOtherDays.sort((a, b) => (a[0][orderBy] > b[0][orderBy] ? 1 : -1));
    if (orderBy === "name"){
      retOtherDays = sortUsername(retOtherDays);
    }
    const sortedGroups = order === "asc"
    ? retOtherDays.sort((a, b) => (a[0][orderBy] > b[0][orderBy] ? 1 : -1))
    : retOtherDays.sort((a, b) => (a[0][orderBy] < b[0][orderBy] ? 1 : -1));
    return [...retToday, ...sortedGroups];
}

  const populateData = useCallback(() => {
    api.get('/meetings').then(response => {
      setRows(response.data);
  }).catch((error) => {if (error.response.status === 401){sessionCallback()}})
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])
  useEffect(() => {populateData()}, [populateData]);

  return (
    <Box sx={{
      marginTop: "20px",
      marginLeft: "1vw",
      display: "inline-block",

    }}>
      <Toolbar
        setSearchContent={setSearchContent} 
        setSuccess={setSuccess} 
        accountType={accountType} 
        searchContent={searchContent}
        sessionCallback={sessionCallback}
        dateFilterContent={dateFilterContent}
        setDateFilterContent={setDateFilterContent}
        meetingRoomFilterContent={meetingRoomFilterContent}
        setMeetingRoomFilterContent={setMeetingRoomFilterContent}
        realizationFilterContent={realizationFilterContent}
        setRealizationFilterContent={setRealizationFilterContent}
        typeFilterContent={typeFilterContent}
        setTypeFilterContent={setTypeFilterContent}
      />
      <TableContainer
        component={Paper}
        sx={{
          maxWidth: { qsm: "98vw", md: "1000px", lg: "1000px" },
          width: "98vw",
          minWidth: "350px",
          marginTop: "5px",
          verticalAlign: "top",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={`${column.id}#sub`} sx={{ textAlign: "center", borderWidth: "3px"}}>
                  {column.id !== "none" && <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : "asc"}
                    onClick={handleRequestSort(column.id)}
                  >
                    {column.id === "name" && accountType === "teacher" ? "Siswa " : column.label}
                  </TableSortLabel>}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(rows).length === 0 && 
              <TableRow>
                <TableCell align="center" colSpan={columns.length}>
                  <AutoAwesomeIcon sx={{fontSize: "100px", color: theme.emptyCellColor}}/>
                  <Typography color={theme.emptyCellColor}>Nothing to look here, create your first meeting!</Typography>
                </TableCell>
              </TableRow>}
            {sortEntries(filteredRows = filterEntries(rows)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <TableEntry setSuccess={setSuccess} rows={row} accountType={accountType} sessionCallback={sessionCallback}/>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ bgcolor: theme.paginationMenuBackground, display: 'flex', alignItems: 'center'}}>
          <TablePagination
            sx={{margin: '0px', width: "100%", overflow: "hidden"}}
            rowsPerPageOptions={[5, 10, 50]}
            component="div"
            labelDisplayedRows={({from, to, count}) => `${from}–${to} of ${count} (${Object.values(filteredRows).reduce((a, b) => a + b.length, 0)})`}
            count={Object.keys(filteredRows).length}
            rowsPerPage={rowsPerPage}
            labelRowsPerPage={window.innerWidth < 500 ? "Rows:" : "Rows per page:"}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {setRowsPerPage(parseInt(event.target.value, 10)); setPage(0);}}
          />
          <IconButton onClick={populateData}>
            <RefreshIcon />
          </IconButton>
      </Box>

    </Box>
  );
}

export default TutorListTable;
