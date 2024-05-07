import { Button, ButtonGroup, Dialog, DialogTitle, DialogContent, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {useTheme} from '@mui/material/styles'
import { useCookies } from 'react-cookie';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';


export default function SettingsDialog({openHandler, open}) {
    const theme = useTheme();
    const [, setCookie] = useCookies();
  
    return (
      <Dialog onClose={() => openHandler(false)} open={open} fullWidth maxWidth="drq" 
        PaperProps={{sx: { minHeight: "300px" }}}>
        <DialogTitle sx={{ marginRight: 6, p: 2 }}>Settings</DialogTitle>
        <IconButton aria-label="close" onClick={() => openHandler(false)} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500]}}>
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Typography fontSize="0.8rem" fontWeight="500" marginBottom="5px" color="rgb(107, 122, 144)" fontFamily={`"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`}>Theme</Typography>
          <ButtonGroup size="large">
            <Button key="light" onClick={() => {setCookie("theme", "light", {maxAge: 300 * 24 * 60 * 60})}} variant={theme.palette.mode === "light" ? 'contained' : 'outlined'} sx={{borderRadius: "15px 0 0 15px", fontWeight: "550", fontSize: "0.875rem", textTransform: 'none'}} color='darkLightModeButton' startIcon={<LightModeIcon/>}>Light</Button>
            <Button key="dark" onClick={() => {setCookie("theme", "dark", {maxAge: 300 * 24 * 60 * 60})}} variant={theme.palette.mode === "dark" ? 'contained' : 'outlined'} sx={{borderRadius: "0 15px 15px 0", fontWeight: "550", fontSize: "0.875rem", textTransform: 'none'}} color='darkLightModeButton' startIcon={<DarkModeIcon/>}>Dark</Button>,
          </ButtonGroup>        
        </DialogContent>
      </Dialog>
    );
  }
  