import { LogLevel, ModuleType, LogEntry } from './loggerConfig';

class WorkerLogger {
  private isWorker: boolean;
  private enabled: boolean = true;

  constructor () {
    this.isWorker =
      typeof self !== 'undefined' && typeof self.postMessage === 'function';
  }

  setEnabled (enabled: boolean): void {
    this.enabled = enabled;
  }

  private log (
    level: LogLevel,
    module: ModuleType,
    message: string,
    data?: any,
    context?: string
  ): void {
    if (!this.enabled) {
      return;
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      module,
      message,
      data,
      context,
    };

    if (this.isWorker) {
      try {
        (self as any).postMessage({
          type: 'worker-log',
          entry,
        });
      } catch (error) {
        console.error('Failed to send log to main thread:', error); // eslint-disable-line no-console
      }
    } else {
      console.log(`[${module.toUpperCase()}]`, message, data); // eslint-disable-line no-console
    }
  }

  fatal (
    module: ModuleType,
    message: string,
    data?: any,
    context?: string
  ): void {
    this.log(LogLevel.FATAL, module, message, data, context);
  }

  error (
    module: ModuleType,
    message: string,
    data?: any,
    context?: string
  ): void {
    this.log(LogLevel.ERROR, module, message, data, context);
  }

  warn (
    module: ModuleType,
    message: string,
    data?: any,
    context?: string
  ): void {
    this.log(LogLevel.WARN, module, message, data, context);
  }

  info (
    module: ModuleType,
    message: string,
    data?: any,
    context?: string
  ): void {
    this.log(LogLevel.INFO, module, message, data, context);
  }

  debug (
    module: ModuleType,
    message: string,
    data?: any,
    context?: string
  ): void {
    this.log(LogLevel.DEBUG, module, message, data, context);
  }

  trace (
    module: ModuleType,
    message: string,
    data?: any,
    context?: string
  ): void {
    this.log(LogLevel.TRACE, module, message, data, context);
  }

  time (label: string, module: ModuleType = ModuleType.WORKER): void {
    if (!this.enabled) return;
    const startTime = performance.now();
    (self as any).__workerTimers = (self as any).__workerTimers || {};
    (self as any).__workerTimers[label] = startTime;
    this.trace(module, `Timer started: ${label}`);
  }

  timeEnd (label: string, module: ModuleType = ModuleType.WORKER): number {
    if (!this.enabled) return 0;

    const timers = (self as any).__workerTimers || {};
    const startTime = timers[label];

    if (startTime === undefined) {
      this.warn(module, `Timer not found: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    delete timers[label];

    this.info(module, `Timer ended: ${label}`, {
      duration: `${duration.toFixed(2)}ms`,
    });

    return duration;
  }
}

const workerLogger = new WorkerLogger();

export default workerLogger;
export { workerLogger };
