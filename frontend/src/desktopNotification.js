import React, { Component, useEffect } from "react";
import { Menu, Typography, ListItem, ListItemText, Divider } from '@mui/material';
import {useTheme} from '@mui/material/styles'
import PeopleIcon from '@mui/icons-material/People';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import dayjs from "dayjs";
import UpdateIcon from '@mui/icons-material/Update';
import WarningIcon from '@mui/icons-material/Warning';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const NotificationType = Object.freeze({
  REQUEST: 1,
  REARRANGED: 2,
  REJECTED: 3,
  REMINDER: 4,
  WARNING: 5,
  CONFIRMED: 6
});

function handleIcon(type){
  switch (type){
    case (NotificationType.REQUEST): return <PeopleIcon />
    case (NotificationType.REARRANGED): return <UpdateIcon />
    case (NotificationType.REJECTED): return <ClearIcon />
    case (NotificationType.REMINDER): return <NotificationsActiveIcon />
    case (NotificationType.WARNING): return <WarningIcon />
    case (NotificationType.CONFIRMED): return <CheckCircleOutlineIcon />
    default: return <QuestionMarkIcon />
  }
}

function handleUnseenNotifications(notifications, seenNotificationId){
  const index = notifications.findIndex(notification => notification.id === seenNotificationId);
  if (index !== -1) {
    const slicedNotifications = notifications.slice(0, index);  // Offset by 1
    return slicedNotifications.map(notification => ({
      ...notification,
      seen: false
    }));
    } 
  else {
    return notifications.map(notification => ({
      ...notification,
      seen: false // Mark all notifications as unseen if the id is not found
    }));
  }
}

function RenderNotification({anchor, open, openHandler, messagesCountHandler, notifications}){
  const theme = useTheme();
  const seenNotificationId = localStorage.getItem("lastNotificationSeen");


  function renderUnseenNotifications(notifications){
    let idx = notifications.findIndex(notification => notification.id === seenNotificationId)
    // When the index is not found, idx will result to -1. Slicing with (-1, length) will cause
    // the last element to be copied twice. To avoid this, we set the index to the last element,
    // so that slicing with (length, length) returns an empty array.
    idx = idx === -1 ? notifications.length : idx
    notifications = [...handleUnseenNotifications(notifications, seenNotificationId), ...notifications.slice(idx, notifications.length)] 
    return notifications
  }

  useEffect(() => {
    if (localStorage.getItem("lastNotificationSeen")){
      messagesCountHandler(handleUnseenNotifications(notifications, seenNotificationId).length);
    }
  }, [seenNotificationId, messagesCountHandler, notifications]);

  notifications = renderUnseenNotifications(notifications);

  const unreadStyles = theme.palette.mode === "dark"
  ? { bgcolor: "#292929", color: "#ffffff" }
  : { bgcolor: "#f0f0f0", color: "#000000" };

  const readStyles = theme.palette.mode === "dark"
    ? { bgcolor: "#1a1a1a", color: "#b0b0b0", opacity: "50%" }
    : { bgcolor: "#ffffff", color: "#707070", opacity: "50%" };

  return (
    <Menu
      anchorEl={anchor.current}
      keepMounted
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      open={open}
      onClose={() => {
          let lastNotificationId = notifications[0]?.id
          openHandler(false); 
          localStorage.setItem("lastNotificationSeen", lastNotificationId);
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
          ...theme.listItemColor,
          "& .MuiListItem-root:hover": {}
        }, 
      }}
    >
    <Typography variant="h6" gutterBottom component="div" sx={{ p: 2, pb: 0 }}> Inbox </Typography>
    <Divider />
    {!notifications.length ? <Typography variant="p" component="div" sx={{ p: 2, pb: 0, mb: 1 }}> No notifications available. </Typography> : notifications.map(({ id, title, content, type, timestamp, seen }) => (
      <ListItem key={id} sx={(!seen && seen !== undefined) ? unreadStyles : readStyles}>
        {handleIcon(type)}
        <ListItemText sx={{marginLeft: "15px"}} primary={title} secondary={
          <div>
            <div>{content}</div>
            <div style={{fontSize: "0.7rem", marginTop: "5px", float: "left"}}>{dayjs.unix(timestamp).format("dddd, D MMMM | HH:mm")}</div>
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
      console.error("Browser does not support desktop notification.");
    } else {
      Notification.requestPermission();
    }
    this.connectWebsocket();
  }

  connectWebsocket() {
    this.websocket = new WebSocket(process.env.REACT_APP_BASE_WS_URL);

    this.websocket.onopen = (event) => {
      console.info("%cEstablished websocket connection to " + `%c${event.currentTarget.url}.`, "", "background-color: purple;");
      event.target.send(JSON.stringify({s: 1}))
    };

    this.websocket.onmessage = (event) => {
      this.notifications = JSON.parse(event.data)
      if (this.notifications[0]){
        new Notification({title: this.notifications[0].title, body: this.notifications[0].content})
        this.props.messagesCountHandler(handleUnseenNotifications(this.notifications, localStorage.getItem("lastNotificationSeen")).length);  
      }
    };
  }

  render() {
    return(
      <RenderNotification anchor={this.props.anchor} open={this.props.open} messagesCountHandler={this.props.messagesCountHandler} openHandler={this.props.openHandler} notifications={this.notifications}/>
    )
  }
}

export default DesktopNotification;