import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, Checkbox, TextField, List, ListItem, ListSubheader, ListItemText, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React, { useState } from "react";

function PersonEntry({selectMultiple, person, selectedPersonHandler, selectedPerson, checkable}){
  return (
  <li onClick={() => {
    if (!checkable){
      return selectedPersonHandler(person);
    }
    if (selectedPerson?.includes(person)){
      selectedPersonHandler(selectedPerson.filter(e => e !== person))
    } 
    else {
      selectedPersonHandler([...selectedPerson, person]);
    } 
  }}>
    <ListItem sx={{maxHeight: "48px"}}>
      <ListItemText primary={`${person.name}`} />{selectMultiple && checkable && <Checkbox checked={selectedPerson?.includes(person)}/>}
    </ListItem>
  </li>
  )
}

function ListSubheaderCheckbox({displayedPeople, people, selectedPerson, selectedPersonHandler, _class}){
  let checked;
  let usePeople;
  return (
    <>
    <Checkbox sx={{height: "5px"}} checked={checked = ((usePeople = (Object.keys(displayedPeople).length !== 0 ? displayedPeople : people))[_class].every(element => selectedPerson.includes(element)))}
    onClick={
      () => {
        if (!checked){
          return selectedPersonHandler(
              [...new Set([...usePeople[_class], ...selectedPerson])]
            )
          }
        else{
          return selectedPersonHandler(selectedPerson.filter(person => {return !(usePeople[_class].includes(person))}))
        }
        }
      }
    /></>
  );
}
export function PersonList({ people, selectedPersonHandler, selectedPerson, checkable = true }) {
  const theme = useTheme();
  const [displayedPeople, setDisplayedPeople] = useState({});

  function filterPeople(people, query) {
    const filteredPeople = {};
    Object.keys(people).map((_class) => {
      filteredPeople[_class] = people[_class].filter((person) => {
        let name = person["name"].toLowerCase();
        return name.split(" ").some((subname) => subname.startsWith(query)) || name.startsWith(query.toLowerCase());
      });
      return filteredPeople;
    });
    setDisplayedPeople(filteredPeople);
  }
  return (
    <List id="scrollbar"
      sx={{
        maxWidth: "400px",
        minWidth: "20px",
        width: "98vw",
        bgcolor: 'background.paper',
        maxHeight: "500px",
        marginTop: "20px",
        '& ul': { padding: 0 },
        verticalAlign: "top",
        borderRadius: "4px",
        ...theme.listItemColor
      }}
      subheader={<ListSubheader />}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-end', marginBottom: "10px", marginLeft: "10px" }}>
        <SearchIcon fontSize="small" />
        <TextField variant="standard" onChange={(event) => filterPeople(people, event.target.value)} />
        {selectedPerson?.length >= 1 && checkable &&
          <Button onClick={() => {selectedPersonHandler([]);}} variant="text" sx={{textTransform: "none", marginBottom: "-6px", marginLeft: "auto", marginRight: "8px"}} ><Typography fontSize="14px">Clear</Typography></Button>
        }
      </Box>
      <Box sx={{ overflow: "auto", maxHeight: "250px" }}>
        {(Object.keys(displayedPeople).length === 0 ? Object.keys(people) : Object.keys(displayedPeople)).map((_class) => (
          <Box>
            <ListSubheader sx={{ bgcolor: theme.peopleListSubheaderColor, color: theme.peopleListSubheaderTextColor, lineHeight: "25px", textAlign: "center" }}>
              {`Kelas ${_class}`} 
              {checkable && <ListSubheaderCheckbox displayedPeople={displayedPeople} people={people} selectedPerson={selectedPerson} selectedPersonHandler={selectedPersonHandler} _class={_class}/>}
            </ListSubheader>
            {(Object.keys(displayedPeople).length === 0 ? people : displayedPeople)[_class].map((person) => (
              <PersonEntry checkable={checkable} selectedPerson={selectedPerson} selectedPersonHandler={selectedPersonHandler} selectMultiple={true} person={person}/>
            ))}
          </Box>
        ))}
      </Box>
    </List>
  );
}
