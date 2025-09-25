import { getChatbotSessionID,clearChatBotSession } from '../../src/chatbot/util/utils';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('Chatbot Session Utils', () => {
  const mockUUID = 'mocked-uuid-12345';
  const mockTimestamp = 1723456789012; 
  const expectedSessionID = `${mockUUID}-${mockTimestamp}`;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);
    (uuidv4 as jest.Mock).mockReturnValue(mockUUID);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return existing session ID from localStorage if available', () => {
    localStorage.setItem('ChatbotsessionID', 'existing-session-id');
    const sessionID = getChatbotSessionID();
    expect(sessionID).toBe('existing-session-id');
    expect(uuidv4).not.toHaveBeenCalled();
  });

  it('should generate a new session ID if none exists in localStorage', () => {
    const sessionID = getChatbotSessionID();
    expect(uuidv4).toHaveBeenCalled();
    expect(sessionID).toBe(expectedSessionID);
    expect(localStorage.getItem('ChatbotsessionID')).toBe(expectedSessionID);
  });

  it('should clear the session ID from localStorage', () => {
    localStorage.setItem('ChatbotsessionID', 'some-id');
    clearChatBotSession();
    expect(localStorage.getItem('ChatbotsessionID')).toBeNull();
  });
});
