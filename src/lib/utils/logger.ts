import consola from 'consola';
import type {
  LogConfig,
  LogEntry,
} from './loggerConfig';
import {
  LogLevel,
  ModuleType,
  DEFAULT_LOG_CONFIG,
} from './loggerConfig';
import { logStorage } from './logStorage';

class Logger {
  private config: LogConfig = { ...DEFAULT_LOG_CONFIG };
  private timers: Map<string, number> = new Map();
  private performanceMetrics: Map<string, number[]> = new Map();

  constructor () {
    this.loadConfig();
    this.setupWorkerListener();
  }

  private loadConfig (): void {
    try {
      const savedConfig = localStorage.getItem('logConfig');
      if (savedConfig) {
        this.config = { ...DEFAULT_LOG_CONFIG, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.error('Failed to load log config:', error); // eslint-disable-line no-console
    }
  }

  private saveConfig (): void {
    try {
      localStorage.setItem('logConfig', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save log config:', error); // eslint-disable-line no-console
    }
  }

  updateConfig (partialConfig: Partial<LogConfig>): void {
    this.config = { ...this.config, ...partialConfig };
    this.saveConfig();
    consola.level = this.config.globalLevel;
    logStorage.setMaxSize(this.config.maxStorageSize);
  }

  getConfig (): LogConfig {
    return { ...this.config };
  }

  setModuleLevel (module: ModuleType, level: LogLevel): void {
    this.config.moduleLevels[module] = level;
    this.saveConfig();
  }

  private shouldLog (level: LogLevel, module: ModuleType): boolean {
    const moduleLevel = this.config.moduleLevels[module];
    const effectiveLevel =
      moduleLevel !== undefined ? moduleLevel : this.config.globalLevel;
    return level <= effectiveLevel;
  }

  private createLogEntry (
    level: LogLevel,
    module: ModuleType,
    message: string,
    data?: any,
    context?: string
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      module,
      message,
      data,
      context,
    };

    if (this.config.enablePerformanceTracking) {
      entry.performance = {
        memory: this.getMemoryUsage(),
      };
    }

    return entry;
  }

  private getMemoryUsage (): number {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    }
    return 0;
  }

  private log (
    level: LogLevel,
    module: ModuleType,
    message: string,
    data?: any,
    context?: string
  ): void {
    if (!this.shouldLog(level, module)) {
      return;
    }

    const entry = this.createLogEntry(level, module, message, data, context);

    if (this.config.enableConsole) {
      this.logToConsole(level, module, message, data);
    }

    if (this.config.enableStorage) {
      logStorage.add(entry);
    }

    if (this.config.enableWorkerLogging) {
      this.sendToWorker(entry);
    }
  }

  private logToConsole (
    level: LogLevel,
    module: ModuleType,
    message: string,
    data?: any
  ): void {
    const prefix = `[${module.toUpperCase()}]`;

    switch (level) {
    case LogLevel.FATAL:
      if (data) {
        consola.fatal(prefix, message, data);
      } else {
        consola.fatal(prefix, message);
      }
      break;
    case LogLevel.ERROR:
      if (data) {
        consola.error(prefix, message, data);
      } else {
        consola.error(prefix, message);
      }
      break;
    case LogLevel.WARN:
      if (data) {
        consola.warn(prefix, message, data);
      } else {
        consola.warn(prefix, message);
      }
      break;
    case LogLevel.INFO:
      if (data) {
        consola.info(prefix, message, data);
      } else {
        consola.info(prefix, message);
      }
      break;
    case LogLevel.DEBUG:
      if (data) {
        consola.debug(prefix, message, data);
      } else {
        consola.debug(prefix, message);
      }
      break;
    case LogLevel.TRACE:
      if (data) {
        consola.trace(prefix, message, data);
      } else {
        consola.trace(prefix, message);
      }
      break;
    }
  }

  private sendToWorker (entry: LogEntry): void {
    if (typeof window !== 'undefined' && (window as any).workerLogger) {
      (window as any).workerLogger.postMessage({
        type: 'log',
        entry,
      });
    }
  }

  private setupWorkerListener (): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'worker-log') {
          const entry = event.data.entry as LogEntry;
          if (this.config.enableStorage) {
            logStorage.add(entry);
          }
        }
      });
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

  time (label: string, module?: ModuleType): void {
    this.timers.set(label, performance.now());
    this.trace(module || ModuleType.UI, `Timer started: ${label}`);
  }

  timeEnd (label: string, module?: ModuleType): number {
    const startTime = this.timers.get(label);
    if (startTime === undefined) {
      this.warn(module || ModuleType.UI, `Timer not found: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);

    this.info(module || ModuleType.UI, `Timer ended: ${label}`, {
      duration: `${duration.toFixed(2)}ms`,
    });

    if (this.config.enablePerformanceTracking) {
      const metrics = this.performanceMetrics.get(label) || [];
      metrics.push(duration);
      if (metrics.length > 100) {
        metrics.shift();
      }
      this.performanceMetrics.set(label, metrics);
    }

    return duration;
  }

  trackPerformance (
    label: string,
    duration: number,
    module: ModuleType = ModuleType.UI
  ): void {
    const metrics = this.performanceMetrics.get(label) || [];
    metrics.push(duration);
    if (metrics.length > 100) {
      metrics.shift();
    }
    this.performanceMetrics.set(label, metrics);

    const avg = metrics.reduce((a, b) => a + b, 0) / metrics.length;
    const max = Math.max(...metrics);
    const min = Math.min(...metrics);

    this.debug(module, `Performance metrics: ${label}`, {
      avg,
      max,
      min,
      samples: metrics.length,
    });
  }

  getPerformanceMetrics (
    label?: string
  ): Record<string, { avg: number; max: number; min: number; count: number }> {
    const result: Record<string, any> = {};

    if (label) {
      const metrics = this.performanceMetrics.get(label);
      if (metrics && metrics.length > 0) {
        result[label] = {
          avg: metrics.reduce((a, b) => a + b, 0) / metrics.length,
          max: Math.max(...metrics),
          min: Math.min(...metrics),
          count: metrics.length,
        };
      }
    } else {
      this.performanceMetrics.forEach((metrics, key) => {
        result[key] = {
          avg: metrics.reduce((a, b) => a + b, 0) / metrics.length,
          max: Math.max(...metrics),
          min: Math.min(...metrics),
          count: metrics.length,
        };
      });
    }

    return result;
  }

  clearPerformanceMetrics (): void {
    this.performanceMetrics.clear();
  }

  clear (): void {
    logStorage.clear();
    this.timers.clear();
    this.performanceMetrics.clear();
  }
}

const logger = new Logger();

export default logger;
export { logger };
export { LogLevel, ModuleType } from './loggerConfig';
export type { LogConfig } from './loggerConfig';
export type { LogEntry } from './loggerConfig';
export { logStorage } from './logStorage';
