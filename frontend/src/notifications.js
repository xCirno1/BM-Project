import { Alert, Snackbar } from '@mui/material';


export function SessionExpiredNotification({open, openHandler, countdown=undefined}){
  return (
    <Snackbar open={open} sx={{position: "absolute", bottom: "10px", left: "10px"}}>
      <Alert severity="error" onClose={() => openHandler(false)}>{`Session has expired! Returning to the login page in ${countdown} seconds.`}</Alert>
    </Snackbar>
  )
}
export function UnexpectedErrorNotification({open, openHandler, message}){
  return (
    <Snackbar open={open}>
      <Alert severity="error" onClose={() => openHandler(false)}>{`Encountered unexpected error: ${message}.`} <p>Website might not function properly, please report this to the developers.</p></Alert>
    </Snackbar>
  )
}
export function ScheduleSuccessNotification({content, setContent}){
  return (
    <Snackbar open={content.length !== 0}>
      <Alert severity="success" onClose={() => setContent("")}>{content}</Alert>
    </Snackbar>
  )
}

