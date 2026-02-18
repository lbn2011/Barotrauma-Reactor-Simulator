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
  info: (...args: any[]) => {
    if (args.length > 0) {
      consolaLogger.info(args[0], ...args.slice(1));
    }
  },

  /**
   * Success information
   */
  success: (...args: any[]) => {
    if (args.length > 0) {
      consolaLogger.success(args[0], ...args.slice(1));
    }
  },

  /**
   * Warning information
   */
  warn: (...args: any[]) => {
    if (args.length > 0) {
      consolaLogger.warn(args[0], ...args.slice(1));
    }
  },

  /**
   * Error information
   */
  error: (...args: any[]) => {
    if (args.length > 0) {
      consolaLogger.error(args[0], ...args.slice(1));
    }
  },

  /**
   * Debug information
   */
  debug: (...args: any[]) => {
    if (args.length > 0) {
      consolaLogger.debug(args[0], ...args.slice(1));
    }
  },

  /**
   * Trace information
   */
  trace: (...args: any[]) => {
    if (args.length > 0) {
      consolaLogger.trace(args[0], ...args.slice(1));
    }
  },

  /**
   * Fatal information
   */
  fatal: (...args: any[]) => {
    if (args.length > 0) {
      consolaLogger.fatal(args[0], ...args.slice(1));
    }
  },

  /**
   * Clear console
   */
  clear: () => {
    // eslint-disable-next-line no-console
    if (typeof console !== 'undefined' && console.clear) {
      // eslint-disable-next-line no-console
      console.clear();
    }
  },

  /**
   * Statistics information
   */
  stats: (obj: Record<string, any>) => consolaLogger.info(obj),

  /**
   * Time information
   */
  time: (label: string) => {
    // eslint-disable-next-line no-console
    if (typeof console !== 'undefined' && console.time) {
      // eslint-disable-next-line no-console
      console.time(label);
    }
  },

  /**
   * Time end information
   */
  timeEnd: (label: string) => {
    // eslint-disable-next-line no-console
    if (typeof console !== 'undefined' && console.timeEnd) {
      // eslint-disable-next-line no-console
      console.timeEnd(label);
    }
  },
};

export default log;
export const logger = log;
