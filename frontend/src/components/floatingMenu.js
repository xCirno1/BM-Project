import useTheme from '@mui/material/styles/useTheme'
import { Menu } from "@mui/material";


export default function FloatingMenu({anchor, open, openHandler, children, arrowPos, color}){
  const theme = useTheme()

  return (
    <Menu
      anchorEl={anchor}
      open={open}
      onClose={() => openHandler(false)}
      PaperProps={{
        elevation: 0,
        sx: {
          backgroundColor: color ? color : theme.filterColor,
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          mt: 1.5,
          '& .MuiAvatar-root': {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
          '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            backgroundColor: color ? color : theme.filterColor,
            top: 0,
            [arrowPos === "left" ? "left" : "right"]: 14,
            right: arrowPos === "left" ? 0 : 14, 
            width: 10,
            height: 10,
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {children}    
    </Menu>);
}