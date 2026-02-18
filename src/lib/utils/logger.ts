import consola from 'consola';

// Create a custom logger instance
const consolaLogger = consola.create({
  defaults: {
    tag: 'Barotrauma Reactor Simulator',
  },
});

// Set default log level to info (3) and above to reduce noise in production
// Levels: 0=fatal, 1=error, 2=warn, 3=info, 4=debug, 5=trace
consolaLogger.level = 3;

// Export logger methods
const log = {
  /**
   * General log information
   */
  info: (...args: any[]) => consolaLogger.info(...args),

  /**
   * Success information
   */
  success: (...args: any[]) => consolaLogger.success(...args),

  /**
   * Warning information
   */
  warn: (...args: any[]) => consolaLogger.warn(...args),

  /**
   * Error information
   */
  error: (...args: any[]) => consolaLogger.error(...args),

  /**
   * Debug information
   */
  debug: (...args: any[]) => consolaLogger.debug(...args),

  /**
   * Trace information
   */
  trace: (...args: any[]) => consolaLogger.trace(...args),

  /**
   * Fatal information
   */
  fatal: (...args: any[]) => consolaLogger.fatal(...args),

  /**
   * Clear console
   */
  clear: () => consolaLogger.clear(),

  /**
   * Statistics information
   */
  stats: (obj: Record<string, any>) => consolaLogger.stats(obj),

  /**
   * Time information
   */
  time: (label: string) => consolaLogger.time(label),

  /**
   * Time end information
   */
  timeEnd: (label: string) => consolaLogger.timeEnd(label),
};

export default log;
export const logger = log;
