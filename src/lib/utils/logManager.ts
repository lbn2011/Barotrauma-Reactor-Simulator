import logger, { LogLevel, ModuleType } from './logger';
import { logStorage } from './logStorage';
import type { LogEntry, LogFilter } from './loggerConfig';

class LogManager {
  private exportFormat: 'json' | 'csv' = 'json';

  setExportFormat (format: 'json' | 'csv'): void {
    this.exportFormat = format;
  }

  getLogs (filter?: LogFilter): LogEntry[] {
    return logStorage.query(filter);
  }

  getLogsByModule (
    module: ModuleType,
    minLevel: LogLevel = LogLevel.TRACE
  ): LogEntry[] {
    return logStorage.query({
      module,
      level: minLevel,
    });
  }

  getLogsByLevel (level: LogLevel): LogEntry[] {
    return logStorage.query({ level });
  }

  getLogsByTimeRange (startTime: number, endTime: number): LogEntry[] {
    return logStorage.query({
      startTime,
      endTime,
    });
  }

  searchLogs (keyword: string): LogEntry[] {
    return logStorage.query({ keyword });
  }

  getLogStats (): {
    total: number;
    byLevel: Record<number, number>;
    byModule: Record<string, number>;
    } {
    return logStorage.getStats();
  }

  exportLogs (filter?: LogFilter): string {
    const logs = logStorage.query(filter);

    if (this.exportFormat === 'json') {
      return JSON.stringify(logs, null, 2);
    } else {
      return this.convertToCSV(logs);
    }
  }

  private convertToCSV (logs: LogEntry[]): string {
    const headers = [
      'timestamp',
      'level',
      'module',
      'message',
      'data',
      'context',
    ];
    const rows = logs.map((log) => [
      log.timestamp,
      this.getLevelName(log.level),
      log.module,
      `"${log.message.replace(/"/g, '""')}"`,
      log.data ? `"${JSON.stringify(log.data).replace(/"/g, '""')}"` : '',
      log.context || '',
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  private getLevelName (level: LogLevel): string {
    const names = ['FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
    return names[level] || 'UNKNOWN';
  }

  downloadLogs (filter?: LogFilter): void {
    const content = this.exportLogs(filter);
    const blob = new Blob([content], {
      type: this.exportFormat === 'json' ? 'application/json' : 'text/csv',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${Date.now()}.${this.exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    logger.info(ModuleType.UI, 'Logs exported', {
      format: this.exportFormat,
      count: logStorage.query(filter).length,
    });
  }

  clearLogs (): void {
    logStorage.clear();
    logger.info(ModuleType.UI, 'Logs cleared');
  }

  getRecentLogs (count: number = 100): LogEntry[] {
    const allLogs = logStorage.query();
    return allLogs.slice(-count);
  }

  getErrorLogs (): LogEntry[] {
    return logStorage.query({ level: LogLevel.ERROR });
  }

  getWarningLogs (): LogEntry[] {
    return logStorage.query({ level: LogLevel.WARN });
  }

  getPerformanceMetrics (): Record<
    string,
    { avg: number; max: number; min: number; count: number }
    > {
    return logger.getPerformanceMetrics();
  }

  clearPerformanceMetrics (): void {
    logger.clearPerformanceMetrics();
    logger.info(ModuleType.UI, 'Performance metrics cleared');
  }

  analyzeLogs (): {
    totalLogs: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    debugCount: number;
    traceCount: number;
    moduleDistribution: Record<string, number>;
    timeRange: { earliest: number; latest: number };
    } {
    const logs = logStorage.query();
    const stats = {
      totalLogs: logs.length,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      debugCount: 0,
      traceCount: 0,
      moduleDistribution: {} as Record<string, number>,
      timeRange: { earliest: 0, latest: 0 },
    };

    if (logs.length === 0) {
      return stats;
    }

    stats.timeRange.earliest = logs[0].timestamp;
    stats.timeRange.latest = logs[logs.length - 1].timestamp;

    logs.forEach((log) => {
      switch (log.level) {
      case LogLevel.FATAL:
      case LogLevel.ERROR:
        stats.errorCount++;
        break;
      case LogLevel.WARN:
        stats.warningCount++;
        break;
      case LogLevel.INFO:
        stats.infoCount++;
        break;
      case LogLevel.DEBUG:
        stats.debugCount++;
        break;
      case LogLevel.TRACE:
        stats.traceCount++;
        break;
      }

      stats.moduleDistribution[log.module] =
        (stats.moduleDistribution[log.module] || 0) + 1;
    });

    return stats;
  }
}

const logManager = new LogManager();

export default logManager;
export { logManager };
