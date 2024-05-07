import React, { Component, useEffect } from "react";
import { Menu, Typography, ListItem, ListItemText, Divider } from '@mui/material';
import {useTheme} from '@mui/material/styles'
import PeopleIcon from '@mui/icons-material/People';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import dayjs from "dayjs";
import { useCookies } from 'react-cookie';

function handleIcon(type){
  switch (type){
    case (1): return <PeopleIcon />
    default: return <QuestionMarkIcon />
  }
}


function RenderNotification({anchor, open, openHandler, messagesCountHandler, notifications}){
  const theme = useTheme();
  const [cookies, setCookie] = useCookies();

  function handleUnseenNotifications(notifications, seenNotificationId){
    const index = notifications.findIndex(notification => notification.id === seenNotificationId);
    if (index !== -1) {
      const slicedNotifications = notifications.slice(0, index);
      return slicedNotifications.map(notification => ({
        ...notification,
        seen: false
      }));
      } else {
        return notifications.slice().map(notification => ({
          ...notification,
          seen: false // Mark all notifications as unseen if the id is not found
        }));
      }
  }

  function renderUnseenNotifications(notifications){
    let seenNotificationId = cookies.lastNotificationSeen
    let idx = notifications.findIndex(notification => notification.id === seenNotificationId)
    notifications = [...handleUnseenNotifications(notifications, seenNotificationId), ...notifications.slice(idx, notifications.length)] 
    return notifications
  }

  useEffect(() => {
    if (Object.keys(cookies).includes("lastNotificationSeen")){
      messagesCountHandler(handleUnseenNotifications(notifications, cookies.lastNotificationSeen).length);
    }
  }, [cookies, messagesCountHandler, notifications]);

  notifications = renderUnseenNotifications(notifications);
  const notificationMenuId = 'primary-search-notification-menu';
  return (
    <Menu
      anchorEl={anchor.current}
      id={notificationMenuId}
      keepMounted
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      open={open}
      onClose={() => {
          let lastNotificationId = notifications[0]?.id
          openHandler(false); 
          setCookie("lastNotificationSeen", lastNotificationId, {maxAge: 300 * 24 * 60 * 60});
          messagesCountHandler(handleUnseenNotifications(notifications, lastNotificationId).length);
        }
      }
      PaperProps={{
        id: 'scrollbar',
        style: {maxHeight: 400, maxWidth: 400, overflow: 'hidden', overflowY: 'scroll'},
        elevation: 0,
        sx: {
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
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
          }, 
          ...theme.listItemColor
        }, 
      }}
    >
    <Typography variant="h6" gutterBottom component="div" sx={{ p: 2, pb: 0 }}> Inbox </Typography>
    <Divider />
    {!notifications.length ? <Typography variant="p" component="div" sx={{ p: 2, pb: 0, mb: 1 }}> No notifications available. </Typography> : notifications.map(({ id, title, content, type, timestamp, seen }) => (
      <ListItem key={id} sx={(!seen && seen !== undefined) ? (theme.palette.mode === "dark" ? {bgcolor: "#292929"} : {bgcolor: "#c2c2c2"}) : {}}>
        {handleIcon(type)}
        <ListItemText sx={{marginLeft: "15px"}} primary={title} secondary={
          <div>
            <div>{content}</div>
            <div style={{fontSize: "0.7rem", marginTop: "5px", float: "left"}}>{dayjs.unix(timestamp).format("dddd, D MMMM | H:m")}</div>
          </div>
          } />
      </ListItem>
      ))}
    </Menu>
  
    );
}


class DesktopNotification extends Component {
  constructor(props) {
    super(props);
    this.websocket = null;
    this.notifications = [];
  }

  componentDidMount() {
    if (!("Notification" in window)) {
      console.log("Browser does not support desktop notification.");
    } else {
      Notification.requestPermission();
    }
    this.connectWebsocket();
  }

  connectWebsocket() {
    this.websocket = new WebSocket(process.env.REACT_APP_BASE_WS_URL);

    this.websocket.onopen = (event) => {
      console.info("Established websocket connection.");
      event.target.send(JSON.stringify({s: 1}))
    };

    this.websocket.onmessage = (event) => {
      this.notifications = JSON.parse(event.data)
      this.props.messagesCountHandler(this.notifications.length);
    };
  }

  render() {
    return(
      <RenderNotification anchor={this.props.anchor} open={this.props.open} messagesCountHandler={this.props.messagesCountHandler} openHandler={this.props.openHandler} notifications={this.notifications}/>
    )
  }
}

export default DesktopNotification;