export default function handleError(error, countdownHandler, unexpectedNotificationMetadata){
  try{
    if(error.response.status === 400){
      if (countdownHandler){
        countdownHandler()
      }
    }
  } catch (error){
    if (unexpectedNotificationMetadata){
      unexpectedNotificationMetadata.setMessage(error);
      unexpectedNotificationMetadata.handler(true);
    }
  }
}