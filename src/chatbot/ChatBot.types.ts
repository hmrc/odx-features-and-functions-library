
 /**
   * These are the configurations that needs to be passed to the Chatbot
   */
export interface ServerConfig {
  nuanceWebchat: string;
  nuanceJavascript: string;
  nuanceStylesheet: string;
}

 /**
   * These are the props for the Chatbot
   */
export interface ChatBotProps {
  config: () => {
    serverConfig: ServerConfig;
  };
  mdtpSessionID: string;
  nuanceID:string;
}
