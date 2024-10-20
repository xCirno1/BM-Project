import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import App from './app.js';

import { createTheme } from '@mui/material/styles';

import reportWebVitals from './reportWebVitals';

const breakpoints = {
  values: {
    xs: 100,  // extra small
    vsm: 150,  // very small
    sm: 300,  // small
    drq: 400,  // dialog requirement
    qsm: 500,  // quite small
    md: 800,  // medium
    lg: 1200,  // large
    xl: 1536,  // extra large
  }
}

const { palette } = createTheme();
const { augmentColor } = palette;
const createColor = (mainColor) => augmentColor({ color: { main: mainColor } });

export const themeLight = createTheme({
  palette: {
    darkLightModeButton: createColor("#434d5b"),
    redButton: createColor("#ba3732"),
    lightgray: createColor("#e3e3e3"),

    mode: "light",
    background: {
      default: "#D5DCE7"
    },
    filter: {
      main: "#F0F0F0",
    }

  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "rgba(0,0,0,0.1)",
            width: "8px"
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#A8A8A8",
            minHeight: 24,
          },
        },
      },
    },
  },
  listItemColor: {
    "& .MuiListItem-root:hover": {backgroundColor: "#cccccc", cursor: "pointer"},
    "& .MuiListItem-root": {backgroundColor: "#f2f2f2"}
  },
  default: "#ffffff",

  // Buttons
  iconButton: "#1976d2",

  // Indicators
  liveNowIndicatorColor: "green",
  
  // Meetings Mapping Dialog
  lineColor: "#d6d6d6",
  textExtraColor: "#6d6e6f",
  textInfoColor: "#4F4F4F",
  tableColor: "#f2f2f2",
  excludeItemColor: "green",
  notFilledItemColor: "red",
  systemTopicColor: "#c9c9c9",
  border: "0.5px solid black",

  // Toolbar
  toolbarSearchColor: "#F0F0F0",
  toolBarNewEndColor: "#3a823d",
  filterColor: "#F0F0F0",

  // Dialog
  dialogColor: "#FFF",

  // Login
  loginFormBackground: "#D5DCE7",
  welcomeMessageColor: "rgba(103, 58, 183, 1)",
  credentialsMessageColor: "rgba(105, 117, 134, 1)",

  // People List
  peopleListSubheaderColor: "lightgray",
  peopleListSubheaderTextColor: "#1976d2",
  personTargetNameColor: "#808080",
  
  paginationMenuBackground: "#f0f0f0",
  collapseableTutorBackground: "#ffffff",
  emptyCellColor: "#adadad",
  breakpoints: breakpoints
});

export const themeDark = createTheme({
  palette: {
    darkLightModeButton: createColor('#c7d0dd'),
    redButton: createColor("#d43c37v"),
    lightgray: createColor("#525252"),
    mode: "dark",
    background: {
      default: "#222222"
    },
    filter: {
      main: "#3b3b3b",
    }
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "rgba(0,0,0,0.1)",
            width: "8px"
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#363636",
            minHeight: 24,
          },
        },
      },
    },
  },
  listItemColor: {
    "& .MuiListItem-root:hover": {backgroundColor: "#696969", cursor: "pointer"},
    "& .MuiListItem-root": {backgroundColor: "#212121"}
  },
  default: "#000000",

  // Buttons
  iconButton: "lightblue",

  // Indicators
  liveNowIndicatorColor: "lightgreen",
  
  // Meetings Mapping Dialog
  lineColor: "#4F4F4F",
  textExtraColor: "#8C8C8C",
  textInfoColor: "#4F4F4F",
  tableColor: "#292929",
  excludeItemColor: "green",
  notFilledItemColor: "red",
  systemTopicColor: "#acacac",
  border: "0.5px solid white",

  // Toolbar
  toolbarSearchColor: "#212121",
  toolBarNewEndColor: "#53B256",
  filterColor: "#3b3b3b",

  // Dialog
  dialogColor: "#383838",

  // Login
  loginFormBackground: "#222222",
  welcomeMessageColor: "rgba(132, 163, 235, 1)",
  credentialsMessageColor: "rgba(169, 177, 188, 1)",

  // People List
  peopleListSubheaderColor: "#2e2e2e",
  peopleListSubheaderTextColor: "rgba(132, 163, 235, 1)",
  personTargetNameColor: "#b5b5b5",

  paginationMenuBackground: "#242424",
  collapseableTutorBackground: "#2e2e2e",
  emptyCellColor: "gray",
  breakpoints: breakpoints
});

export const CLASSES = ["10A", "10B", "10C", "11A1", "11A2", "11S", "12A1", "12A2", "12S"];


class ErrorBoundary extends React.Component {
  state = { 
    hasError: false, 
    error: null, 
    info: null 
  };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    console.log(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <p>
          {this.props.fallback} <br /><br />
          {this.state.error?.toString()} <br /><br />
          {this.state.info?.componentStack}
        </p>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ErrorBoundary fallback="An unexpected error happen. Please report this to the IT team, or create an issue at the GitHub page directly.">
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
