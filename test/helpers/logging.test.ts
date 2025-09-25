import { logMessage, LogLevel, LoggingCallback } from '../../src/helpers/logging';

describe('logMessage', () => {
  let mockCallback: jest.Mock<LoggingCallback>;

  beforeEach(() => {
    mockCallback = jest.fn();
    jest.spyOn(console, 'info').mockImplementation(() => { });
    jest.spyOn(console, 'warn').mockImplementation(() => { });
    jest.spyOn(console, 'error').mockImplementation(() => { });
    jest.spyOn(console, 'debug').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe.each([
    { level: LogLevel.INFO, consoleMethod: 'info', message: 'Info message' },
    { level: LogLevel.WARN, consoleMethod: 'warn', message: 'Warning message' },
    { level: LogLevel.ERROR, consoleMethod: 'error', message: 'Error message' },
    { level: LogLevel.DEBUG, consoleMethod: 'debug', message: 'Debug message' },
  ])('Given a message and log level', ({ level, consoleMethod, message }) => {
    it(`When the log level is ${level}, Then it should log the message using console.${consoleMethod}`, () => {
      logMessage(message, level);

      expect(console[consoleMethod as keyof Console]).toHaveBeenCalledWith(message);
    });
  });

  describe('Given no log level is provided', () => {
    it('When no log level is provided, Then it should default to DEBUG and log the message using console.debug', () => {
      logMessage('Default debug message');

      expect(console.debug).toHaveBeenCalledWith('Default debug message');
    });
  });

  describe('Given a logging callback', () => {
    it('When a log level and message are provided, Then it should invoke the callback with the message and log level', () => {
      logMessage('Callback message', LogLevel.INFO, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith('Callback message', LogLevel.INFO);
    });

    it('When no log level is provided, Then it should invoke the callback with the default log level (DEBUG)', () => {
      logMessage('Callback default message', undefined, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith('Callback default message', LogLevel.DEBUG);
    });
  });
});