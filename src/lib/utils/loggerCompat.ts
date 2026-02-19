import logger, { LogLevel, ModuleType } from './logger';

const log = {
  info: (message: string, ...args: any[]) => {
    logger.info(ModuleType.UI, message, args.length > 0 ? args[0] : undefined);
  },

  success: (message: string, ...args: any[]) => {
    logger.info(ModuleType.UI, message, args.length > 0 ? args[0] : undefined);
  },

  warn: (message: string, ...args: any[]) => {
    logger.warn(ModuleType.UI, message, args.length > 0 ? args[0] : undefined);
  },

  error: (message: string, ...args: any[]) => {
    logger.error(ModuleType.UI, message, args.length > 0 ? args[0] : undefined);
  },

  debug: (message: string, ...args: any[]) => {
    logger.debug(ModuleType.UI, message, args.length > 0 ? args[0] : undefined);
  },

  trace: (message: string, ...args: any[]) => {
    logger.trace(ModuleType.UI, message, args.length > 0 ? args[0] : undefined);
  },

  fatal: (message: string, ...args: any[]) => {
    logger.fatal(ModuleType.UI, message, args.length > 0 ? args[0] : undefined);
  },

  clear: () => {
    logger.clear();
  },

  stats: (obj: Record<string, any>) => {
    logger.info(ModuleType.UI, 'Statistics', obj);
  },

  time: (label: string) => {
    logger.time(label, ModuleType.UI);
  },

  timeEnd: (label: string) => {
    logger.timeEnd(label, ModuleType.UI);
  },
};

export default log;
export const loggerInstance = logger;
export { LogLevel, ModuleType };
