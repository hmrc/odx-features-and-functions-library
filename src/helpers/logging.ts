export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * @function logMessage
 * @description Logs a message to the console and a provided loggging callback with a specified log level.
 * @param {string} message - The message to log.
 * @param {LogLevel} [level=LogLevel.DEBUG] - The log level (default is LogLevel.DEBUG).
 * @param {LoggingCallback} [logCallback] - Optional callback function for custom logging behavior.
 */
export type LoggingCallback = (message: string, level: LogLevel) => void

/**
 * @function logMessage
 * @description Logs a message to the console and a provided loggging callback with a specified log level.
 * @param {string} message - The message to log.
 * @param {LogLevel} [level=LogLevel.DEBUG] - The log level (default is LogLevel.DEBUG).
 * @param {LoggingCallback} [logCallback] - Optional callback function for custom logging behavior.
 * @returns {void}
 * @throws {Error} Throws an error if the log level is invalid
 * @example
 * logMessage('This is a debug message', LogLevel.DEBUG);
 */
export function logMessage (
  message: string,
  level: LogLevel = LogLevel.DEBUG,
  logCallback?: LoggingCallback
): void {
  if (logCallback != null) {
    logCallback(message, level)
  }

  switch (level) {
    case LogLevel.INFO:
      console.info(message)
      break
    case LogLevel.WARN:
      console.warn(message)
      break
    case LogLevel.ERROR:
      console.error(message)
      break
    case LogLevel.DEBUG:
    default:
      console.debug(message)
      break
  }
}
