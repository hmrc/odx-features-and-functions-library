# HMRC ODX Features and Functions - Chatbot

This package provides a  chatbot integration for React applications.

> **Note:** This is third party Nuance chatbot that we are integrating into the component
for generating random session id we have used uuid package to generate random id along with that we have integrated timestamp as well to make it unique

## Note

Due to the use of local storage as part of this solution any consumer of this code will have to do the due diligence around the use of local storage in their app and ensure users are informed. Failure to do so could mean that your application is no longer passes governance.


## Features
- **ChatBot**: File for chatbot integration
- **Chatbot.types**: Type defined for the chatbot
- **utils**: utils function for the chatbot to get the sessionID and clear sessionID

## Installation

```bash
npm install hmrc-odx-features-and-functions
```

## Usage

```tsx
import React from 'react';
import { ChatBot } from 'hmrc-odx-features-and-functions';

const mdtpSessionID ='id';
const nuanceID = 'nuanceID';

const nuanceConfig = () => ({
    serverConfig: {
      nuanceWebchat: config && config?.serverConfig?.nuanceWebchat,
      nuanceJavascript: config.serverConfig.nuanceJavascript,
      nnuanceStylesheet: config.serverConfig.nnuanceStylesheet
    }
});

<ChatBot
 config={nuanceConfig}
 mdtpSessionID={mdtpSessionID}
 nuanceID={nuanceID}
/>
