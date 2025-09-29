import { v4 as uuidv4 } from 'uuid';
 /**
   * This is to get session id for the chatbot.
   * it will check if there is existing session id else generate new one with uuid package
   */
function getChatbotSessionID() {
  const existingSessionID = localStorage.getItem('ChatbotsessionID');
  if (existingSessionID) return existingSessionID;
  const timestamp = Date.now();
  const newSessionID = `${uuidv4()}-${timestamp}`;
  localStorage.setItem('ChatbotsessionID', newSessionID);
  return newSessionID;
}
 /**
   * this is to clear the ChatbotsessionID after use logged out
   */
 function clearChatBotSession() {
  localStorage.removeItem('ChatbotsessionID');
}

export {clearChatBotSession, getChatbotSessionID} 