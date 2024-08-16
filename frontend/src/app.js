import { BrowserRouter, Route, Navigate, Routes } from 'react-router-dom';
import {React, useState, useEffect} from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useCookies } from 'react-cookie';

import Dashboard from './dashboard.js';
import Login from "./login.js";
import './css/app.css';
import {themeDark, themeLight} from "./index.js";
import NotFound from './notFound.js';

function PrepareTheme({themeHandler}){
  const [cookies, setCookie] = useCookies();
  useEffect(() => {
    if (Object.keys(cookies).includes("theme")){
      themeHandler(cookies.theme === "light" ? themeLight : themeDark);
    }
    else {
      setCookie("theme", "light");
    }
    }, [cookies, setCookie, themeHandler]);
  return <></>
}

function App() {
  const [theme, setTheme] = useState(themeLight);

  return (
    <BrowserRouter>
      <PrepareTheme themeHandler={setTheme}/>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {process.env.REACT_APP_BASE_CLIENT_ROUTE !== "/" && <Route path="/" element={<Navigate to={`${process.env.REACT_APP_BASE_CLIENT_ROUTE.replace(/\/+$/, '')}/login`} />} />}
          <Route path={`${process.env.REACT_APP_BASE_CLIENT_ROUTE.replace(/\/+$/, '')}`} element={<Navigate to={`${process.env.REACT_APP_BASE_CLIENT_ROUTE.replace(/\/+$/, '')}/login`} />} />
          <Route path={`${process.env.REACT_APP_BASE_CLIENT_ROUTE.replace(/\/+$/, '')}/login`} element={<Login />} />
          <Route path={`${process.env.REACT_APP_BASE_CLIENT_ROUTE.replace(/\/+$/, '')}/dashboard`} element={<Dashboard />} />
          <Route path='*' exact={true} element={<NotFound></NotFound>} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
    );
  }


export default App;
