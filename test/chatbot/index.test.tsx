import React from 'react';
import { render, waitFor } from '@testing-library/react';
import ChatBot from '../../src/chatbot/ChatBot';
import { logMessage } from '../../src/helpers';
import { v4 as uuidv4 } from 'uuid';


const nuanceWebchat = 'https://example.com/webchat.js';
const nuanceJavascript = 'https://example.com/sdk.js';
const nuanceStylesheet = 'https://example.com/style.css';
const webChatTag = 'webchat-tag';
const hmrcWebChatTag = 'hmrc-webchat-tag';
const hmrcChatStyle = 'hmrc-chat-style';

jest.mock('../../src/helpers', () => ({
  ...jest.requireActual('../../src/helpers'),
  logMessage: jest.fn(),
}));

describe('Given a ChatBot component with a valid configuration', () => {
  const mockConfig = () => ({
    serverConfig: {
      nuanceWebchat,
      nuanceJavascript,
      nuanceStylesheet,
    },
  });

  const mdtpSessionID = 'session-id';
  const nuanceID = 'JSnsbJ2l5E5OtOfgd6C7sA=ghhh=';

  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    delete window.nuanceData;
    localStorage.clear();
  });

  
  it('When rendered with session IDs, Then window.nuanceData is set and scripts/styles are injected', async () => {
    render(
      <ChatBot
        config={mockConfig}
        mdtpSessionID={mdtpSessionID}
        nuanceID={nuanceID}
      />
    );

    await waitFor(() => {
      const webchatScript = document.getElementById(webChatTag);
      const sdkScript = document.getElementById(hmrcWebChatTag);
      const stylesheet = document.getElementById(hmrcChatStyle);

      expect(webchatScript).not.toBeNull();
      expect(sdkScript).not.toBeNull();
      expect(stylesheet).not.toBeNull();

      expect((webchatScript as HTMLScriptElement).src).toContain(nuanceWebchat);
      expect((sdkScript as HTMLScriptElement).src).toContain(nuanceJavascript);
      expect((stylesheet as HTMLLinkElement).href).toContain(nuanceStylesheet);
    });
  });

  it('When script and link tags already exist, Then they are not reinjected', () => {
    const existingScript = document.createElement('script');
    existingScript.id = webChatTag;
    document.head.appendChild(existingScript);

    const existingStyle = document.createElement('link');
    existingStyle.id = hmrcChatStyle;
    document.head.appendChild(existingStyle);

    const createElementSpy = jest.spyOn(document, 'createElement');

    render(
      <ChatBot
        config={mockConfig}
        mdtpSessionID={mdtpSessionID}
        nuanceID={nuanceID}
      />
    );

    expect(document.getElementById(webChatTag)).toBe(existingScript);
    expect(document.getElementById(hmrcChatStyle)).toBe(existingStyle);

    const scriptCalls = createElementSpy.mock.calls.filter(([arg]) => arg === 'script');
    const linkCalls = createElementSpy.mock.calls.filter(([arg]) => arg === 'link');
    expect(scriptCalls.length).toBeLessThan(2);
    expect(linkCalls.length).toBeLessThan(2);

    createElementSpy.mockRestore();
  });

it('When mdtpdfSessionID is not in localStorage, Then a new one is generated using uuidv4', () => {
    const mockUUID = 'mocked-random-id-id-id';
    const uuidSpy = jest.spyOn(require('uuid'), 'v4').mockReturnValue(mockUUID);
  
    render(
      <ChatBot
        config={mockConfig}
        mdtpSessionID="abc-123"
        nuanceID={nuanceID}
      />
    );
  
    const sessionID = window.nuanceData?.mdtpdfSessionID;
    expect(sessionID).toMatch(new RegExp(`^${mockUUID}-\\d+$`));
  
    expect(window.nuanceData).toEqual({
      mdtpSessionID: 'abc-123',
      mdtpdfSessionID: sessionID,
      nuanceID,
    });
  
    uuidSpy.mockRestore();
  });
  




  it('When rendered, Then chat container placeholders are present in the DOM', () => {
    const { container } = render(
      <ChatBot
        config={mockConfig}
        mdtpSessionID={mdtpSessionID}
        nuanceID={nuanceID}
      />
    );

    expect(container.querySelector('#ciapiSkin')).not.toBeNull();
    expect(container.querySelector('#tc-nuance-chat-container')).not.toBeNull();
  });
});

describe('Given a ChatBot component with an invalid configuration', () => {
  const invalidConfig = () => ({
    key: {},
  });

  const mdtpSessionID = 'invalid-session-id';
  const nuanceID = 'invalid-nonce';

  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    delete window.nuanceData;
    localStorage.clear();
  });

  it('When config is invalid, Then no script or link elements are injected and no crash occurs', () => {
    expect(() => {
      render(
        <ChatBot
          config={invalidConfig as any}
          mdtpSessionID={mdtpSessionID}
          nuanceID={nuanceID}
        />
      );
    }).not.toThrow();
    expect(document.querySelectorAll('script').length).toBe(0);
    expect(document.querySelectorAll('link[rel="stylesheet"]').length).toBe(0);

    expect(window.nuanceData).toEqual({
      mdtpSessionID,
      mdtpdfSessionID: expect.any(String),
      nuanceID,
    });
  });

  it('It logs error when config is invalid and serverConfig is missing', () => {
    render(
      <ChatBot
        config={invalidConfig as any}
        mdtpSessionID={mdtpSessionID}
        nuanceID={nuanceID}
      />
    );

    expect(logMessage).toHaveBeenCalledWith('Invalid configuration or missing config');
  });
});
