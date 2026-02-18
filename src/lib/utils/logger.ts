import consola from 'consola';

// Create a custom logger instance
const logger = consola.create({
  defaults: {
    tag: 'Barotrauma Reactor Simulator',
  },
});

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
