export enum LogLevel {
  FATAL = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  TRACE = 5,
}

export enum ModuleType {
  UI = 'ui',
  STORE = 'store',
  PHYSICS = 'physics',
  WORKER = 'worker',
  CONTROLLER = 'controller',
  MODEL = 'model',
}

export interface LogConfig {
  globalLevel: LogLevel;
  moduleLevels: Partial<Record<ModuleType, LogLevel>>;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageSize: number;
  enableWorkerLogging: boolean;
  enablePerformanceTracking: boolean;
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  module: ModuleType;
  message: string;
  data?: any;
  context?: string;
  performance?: {
    duration?: number;
    memory?: number;
  };
}

export interface LogFilter {
  level?: LogLevel;
  module?: ModuleType;
  startTime?: number;
  endTime?: number;
  keyword?: string;
}

export const DEFAULT_LOG_CONFIG: LogConfig = {
  globalLevel: LogLevel.INFO,
  moduleLevels: {},
  enableConsole: true,
  enableStorage: true,
  maxStorageSize: 10000,
  enableWorkerLogging: true,
  enablePerformanceTracking: true,
};
