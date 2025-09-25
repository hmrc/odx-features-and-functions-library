
import React, {useEffect} from 'react';
import { ChatBotProps } from './ChatBot.types'; 
import {injectScript,injectLink} from '../helpers/utils'
import { logMessage } from '../helpers';
import { getChatbotSessionID } from './util/utils';

/**
 * payload for Chatbot.
 */
declare global {
  interface Window {
    nuanceData?: {
      mdtpSessionID: string;
      mdtpdfSessionID: string | null;
      nuanceID:string;
    };
  }
}

 /**
   * this is the chatbot component which accepts config, mdtpSessionID,nuanceID
  */
const ChatBot: React.FC<ChatBotProps> = ({ config, mdtpSessionID,nuanceID }) => {
  
  useEffect(() => {
    const sdkConfig = config();
    const serverConfig = sdkConfig.serverConfig
    window.nuanceData = {
      mdtpSessionID,
      mdtpdfSessionID : getChatbotSessionID(),
      nuanceID
    };
    if(serverConfig){
   const { nuanceWebchat, nuanceJavascript, nuanceStylesheet } = sdkConfig.serverConfig;
    injectScript(nuanceWebchat, 'webchat-tag', nuanceID);
    injectScript(nuanceJavascript, 'hmrc-webchat-tag', nuanceID);
    injectLink(nuanceStylesheet, 'hmrc-chat-style', nuanceID);
    }else{
          logMessage(`Invalid configuration or missing config`);
    }
  }, [config, mdtpSessionID, getChatbotSessionID,nuanceID]);

  return (
    <>
      <div id="ciapiSkin"></div>
      <div id="tc-nuance-chat-container"></div>
    </>
  );
};

export default ChatBot;
