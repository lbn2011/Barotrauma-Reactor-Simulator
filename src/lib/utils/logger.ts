import consola from 'consola';

// Create a custom logger instance
const logger = consola.create({
  defaults: {
    tag: 'Barotrauma Reactor Simulator',
  },
});

// Set default log level to info (3) and above to reduce noise in production
// Levels: 0=fatal, 1=error, 2=warn, 3=info, 4=debug, 5=trace
logger.level = 3;

// Export logger methods
const log = {
  /**
   * General log information
   */
  info: (...args: any[]) => logger.info(...args),

  /**
   * Success information
   */
  success: (...args: any[]) => logger.success(...args),

  /**
   * Warning information
   */
  warn: (...args: any[]) => logger.warn(...args),

  /**
   * Error information
   */
  error: (...args: any[]) => logger.error(...args),

  /**
   * Debug information
   */
  debug: (...args: any[]) => logger.debug(...args),

  /**
   * Trace information
   */
  trace: (...args: any[]) => logger.trace(...args),

  /**
   * Fatal information
   */
  fatal: (...args: any[]) => logger.fatal(...args),

  /**
   * Clear console
   */
  clear: () => logger.clear(),

  /**
   * Statistics information
   */
  stats: (obj: Record<string, any>) => logger.stats(obj),

  /**
   * Time information
   */
  time: (label: string) => logger.time(label),

  /**
   * Time end information
   */
  timeEnd: (label: string) => logger.timeEnd(label),
};

export const logger = log;
