import React from 'react';
import { render, waitFor } from '@testing-library/react';
import  ChatBot  from '../../src/chatbot/ChatBot';
import { v4 as uuidv4 } from 'uuid';

describe('ChatBot integration', () => {
  const mockConfig = () => ({
    serverConfig: {
      nuanceWebchat: 'https://example.com/webchat.js',
      nuanceJavascript: 'https://example.com/sdk.js',
      nuanceStylesheet: 'https://example.com/style.css',
    },
  });

  const mdtpSessionID = 'session-id';
  const mdtpdfSessionID = 'pdf-session-id-for-chatbot';
  const nuanceID = 'JSnsbJ2l5E5OtOfgd6C7sA==';

  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    delete window.nuanceData;
    localStorage.clear();
  });

  it('initializes window.nuanceData and dynamically injects scripts and styles', async () => {
    const mockUUID = mdtpdfSessionID;
    const uuidSpy = jest.spyOn(require('uuid'), 'v4').mockReturnValue(mockUUID);

    render(
      <ChatBot
        config={mockConfig}
        mdtpSessionID={mdtpSessionID}
        nuanceID={nuanceID}
      />
    );

    await waitFor(() => {
      const sessionID = window.nuanceData?.mdtpdfSessionID;
      expect(sessionID).toMatch(new RegExp(`^${mockUUID}-\\d+$`));

      expect(window.nuanceData).toEqual({
        mdtpSessionID,
        mdtpdfSessionID: sessionID,
        nuanceID,
      });

      const webchatScript = document.getElementById('webchat-tag') as HTMLScriptElement;
      const sdkScript = document.getElementById('hmrc-webchat-tag') as HTMLScriptElement;
      const stylesheet = document.getElementById('hmrc-chat-style') as HTMLLinkElement;

      expect(webchatScript).toBeTruthy();
      expect(webchatScript.src).toBe('https://example.com/webchat.js');

      expect(sdkScript).toBeTruthy();
      expect(sdkScript.src).toBe('https://example.com/sdk.js');

      expect(stylesheet).toBeTruthy();
      expect(stylesheet.href).toBe('https://example.com/style.css');
    });

    uuidSpy.mockRestore();
  });
});
