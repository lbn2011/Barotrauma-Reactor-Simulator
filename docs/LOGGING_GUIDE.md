# 日志系统使用指南

## 概述

本项目实现了一个全面的日志记录系统，支持多模块日志、性能监控、Web Workers日志传输和灵活的配置管理。

## 核心组件

### 1. Logger (logger.ts)

主要的日志记录器，提供以下功能：

- 多级别日志记录（FATAL, ERROR, WARN, INFO, DEBUG, TRACE）
- 模块标识（UI, STORE, PHYSICS, WORKER, CONTROLLER, MODEL）
- 性能监控和时间测量
- 自动内存使用跟踪
- Web Workers日志传输

### 2. LogStorage (logStorage.ts)

日志存储管理器，提供：

- 内存中的日志存储
- 日志查询和过滤
- 日志统计
- 日志导入/导出

### 3. LogManager (logManager.ts)

高级日志管理功能：

- 日志查询和分析
- 日志导出（JSON/CSV）
- 性能指标管理
- 日志下载

### 4. WorkerLogger (workerLogger.ts)

Web Workers专用日志记录器：

- Worker环境日志记录
- 主线程日志传输

### 5. LoggerConfig (loggerConfig.ts)

日志配置类型定义：

- LogLevel: 日志级别枚举
- ModuleType: 模块类型枚举
- LogConfig: 日志配置接口
- LogEntry: 日志条目接口
- LogFilter: 日志过滤接口

## 使用方法

### 基本日志记录

```typescript
import logger, { ModuleType } from '@/lib/utils/logger';

// 记录不同级别的日志
logger.fatal(ModuleType.UI, 'Fatal error occurred', { error: 'details' });
logger.error(ModuleType.STORE, 'Error in store', { error });
logger.warn(ModuleType.MODEL, 'Warning condition', { value: 100 });
logger.info(ModuleType.CONTROLLER, 'Operation completed', { result });
logger.debug(ModuleType.PHYSICS, 'Debug information', { data });
logger.trace(ModuleType.WORKER, 'Trace execution', { step: 1 });
```

### 性能监控

```typescript
// 方法1: 使用time/timeEnd
logger.time('calculation', ModuleType.MODEL);
// 执行计算
logger.timeEnd('calculation', ModuleType.MODEL);

// 方法2: 手动跟踪性能
const startTime = performance.now();
// 执行操作
const duration = performance.now() - startTime;
logger.trackPerformance('operation', duration, ModuleType.MODEL);

// 获取性能指标
const metrics = logger.getPerformanceMetrics('calculation');
console.log(metrics); // { avg: 10.5, max: 15.2, min: 8.1, count: 100 }
```

### 日志配置

```typescript
import logger from '@/lib/utils/logger';
import { LogLevel } from '@/lib/utils/logger';

// 更新全局日志级别
logger.updateConfig({
  globalLevel: LogLevel.DEBUG,
  enableConsole: true,
  enableStorage: true,
  enableWorkerLogging: true,
  enablePerformanceTracking: true,
  maxStorageSize: 10000,
});

// 设置特定模块的日志级别
logger.setModuleLevel(ModuleType.MODEL, LogLevel.TRACE);
logger.setModuleLevel(ModuleType.UI, LogLevel.INFO);

// 获取当前配置
const config = logger.getConfig();
```

### 日志查询

```typescript
import logManager from '@/lib/utils/logManager';
import { LogLevel } from '@/lib/utils/logger';

// 获取所有日志
const allLogs = logManager.getLogs();

// 按模块过滤
const modelLogs = logManager.getLogsByModule(ModuleType.MODEL, LogLevel.DEBUG);

// 按级别过滤
const errorLogs = logManager.getLogsByLevel(LogLevel.ERROR);

// 按时间范围过滤
const recentLogs = logManager.getLogsByTimeRange(
  Date.now() - 3600000, // 1小时前
  Date.now()
);

// 搜索日志
const searchResults = logManager.searchLogs('error');

// 获取最近的日志
const recentLogs = logManager.getRecentLogs(100);

// 获取错误日志
const errorLogs = logManager.getErrorLogs();

// 获取警告日志
const warningLogs = logManager.getWarningLogs();
```

### 日志分析

```typescript
import logManager from '@/lib/utils/logManager';

// 获取日志统计
const stats = logManager.getLogStats();
console.log(stats);
// {
//   total: 1500,
//   byLevel: { 0: 5, 1: 20, 2: 50, 3: 500, 4: 800, 5: 125 },
//   byModule: { ui: 300, store: 400, model: 500, ... }
// }

// 分析日志
const analysis = logManager.analyzeLogs();
console.log(analysis);
// {
//   totalLogs: 1500,
//   errorCount: 25,
//   warningCount: 50,
//   infoCount: 500,
//   debugCount: 800,
//   traceCount: 125,
//   moduleDistribution: { ui: 300, store: 400, model: 500, ... },
//   timeRange: { earliest: 1234567890, latest: 1234567990 }
// }

// 获取性能指标
const perfMetrics = logManager.getPerformanceMetrics();
console.log(perfMetrics);
// {
//   calculation: { avg: 10.5, max: 15.2, min: 8.1, count: 100 },
//   update: { avg: 5.3, max: 8.7, min: 3.2, count: 200 }
// }
```

### 日志导出

```typescript
import logManager from '@/lib/utils/logManager';

// 设置导出格式
logManager.setExportFormat('json'); // 或 'csv'

// 导出日志
const jsonLogs = logManager.exportLogs();
const csvLogs = logManager.exportLogs();

// 下载日志
logManager.downloadLogs(); // 下载所有日志
logManager.downloadLogs({ level: LogLevel.ERROR }); // 下载错误日志

// 清除日志
logManager.clearLogs();
logManager.clearPerformanceMetrics();
```

### Web Workers中使用日志

```typescript
import workerLogger from '@/lib/utils/workerLogger';
import { ModuleType } from '@/lib/utils/logger';

// 在Worker中记录日志
workerLogger.info(ModuleType.WORKER, 'Worker started');
workerLogger.debug(ModuleType.WORKER, 'Processing data', { data });
workerLogger.error(ModuleType.WORKER, 'Worker error', { error });

// 性能监控
workerLogger.time('worker-task', ModuleType.WORKER);
// 执行任务
workerLogger.timeEnd('worker-task', ModuleType.WORKER);
```

## 日志级别说明

| 级别  | 值  | 使用场景                                 |
| ----- | --- | ---------------------------------------- |
| FATAL | 0   | 致命错误，导致应用程序无法继续运行       |
| ERROR | 1   | 错误事件，但不影响应用程序继续运行       |
| WARN  | 2   | 警告信息，可能导致问题但不会立即影响运行 |
| INFO  | 3   | 正常运行状态和重要事件                   |
| DEBUG | 4   | 调试信息，用于开发和调试                 |
| TRACE | 5   | 详细的执行路径和调用栈信息               |

## 模块类型说明

| 模块       | 说明                      |
| ---------- | ------------------------- |
| UI         | 用户界面层组件            |
| STORE      | 状态管理层（MobX stores） |
| PHYSICS    | 物理计算层                |
| WORKER     | Web Workers               |
| CONTROLLER | 控制器层                  |
| MODEL      | 模型层                    |

## 最佳实践

### 1. 选择合适的日志级别

```typescript
// ✅ 正确：使用INFO记录重要事件
logger.info(ModuleType.UI, 'User logged in', { userId });

// ✅ 正确：使用DEBUG记录调试信息
logger.debug(ModuleType.MODEL, 'Calculation parameters', { params });

// ✅ 正确：使用ERROR记录错误
logger.error(ModuleType.STORE, 'Failed to update state', { error });

// ❌ 错误：使用TRACE记录重要事件
logger.trace(ModuleType.UI, 'User logged in', { userId }); // 应该用INFO
```

### 2. 包含足够的上下文信息

```typescript
// ✅ 正确：包含详细的上下文
logger.error(ModuleType.MODEL, 'Calculation failed', {
  error: error.message,
  params: { temperature, pressure },
  stack: error.stack,
});

// ❌ 错误：缺少上下文
logger.error(ModuleType.MODEL, 'Calculation failed');
```

### 3. 使用结构化数据

```typescript
// ✅ 正确：使用对象传递结构化数据
logger.info(ModuleType.STORE, 'State updated', {
  oldState: { value: 100 },
  newState: { value: 150 },
  change: 50,
});

// ❌ 错误：使用字符串拼接
logger.info(ModuleType.STORE, `State updated from 100 to 150`);
```

### 4. 避免在性能关键路径上记录过多日志

```typescript
// ✅ 正确：在循环外记录
logger.debug(ModuleType.MODEL, 'Starting calculation');
for (let i = 0; i < 10000; i++) {
  // 执行计算
}
logger.debug(ModuleType.MODEL, 'Calculation completed', { iterations: 10000 });

// ❌ 错误：在循环内记录
for (let i = 0; i < 10000; i++) {
  logger.debug(ModuleType.MODEL, `Processing iteration ${i}`); // 性能影响严重
}
```

### 5. 使用性能监控

```typescript
// ✅ 正确：监控关键操作的性能
logger.time('critical-operation', ModuleType.MODEL);
// 执行关键操作
logger.timeEnd('critical-operation', ModuleType.MODEL);

// ✅ 正确：定期检查性能指标
const metrics = logger.getPerformanceMetrics('critical-operation');
if (metrics.avg > 100) {
  logger.warn(ModuleType.MODEL, 'Performance degradation detected', metrics);
}
```

## 配置建议

### 开发环境

```typescript
logger.updateConfig({
  globalLevel: LogLevel.DEBUG,
  enableConsole: true,
  enableStorage: true,
  enableWorkerLogging: true,
  enablePerformanceTracking: true,
  maxStorageSize: 10000,
});
```

### 生产环境

```typescript
logger.updateConfig({
  globalLevel: LogLevel.INFO,
  enableConsole: false, // 生产环境关闭控制台输出
  enableStorage: true,
  enableWorkerLogging: true,
  enablePerformanceTracking: false, // 生产环境关闭性能跟踪以减少开销
  maxStorageSize: 5000,
});
```

### 测试环境

```typescript
logger.updateConfig({
  globalLevel: LogLevel.WARN,
  enableConsole: true,
  enableStorage: true,
  enableWorkerLogging: true,
  enablePerformanceTracking: false,
  maxStorageSize: 1000,
});
```

## 性能考虑

1. **日志级别过滤**：在日志记录前就进行级别过滤，避免不必要的对象创建
2. **内存管理**：使用固定大小的日志存储，自动清理旧日志
3. **性能跟踪**：可选的性能跟踪功能，生产环境可关闭
4. **批量操作**：避免在循环中记录日志
5. **异步处理**：Web Workers日志通过消息传递异步处理

## 故障排除

### 日志未显示

1. 检查日志级别配置
2. 确认enableConsole设置为true
3. 检查模块级别的日志级别

### 性能问题

1. 降低日志级别（从TRACE降到DEBUG或INFO）
2. 关闭性能跟踪
3. 减少maxStorageSize
4. 检查是否有循环中的日志记录

### 内存泄漏

1. 定期调用logManager.clearLogs()
2. 定期调用logger.clearPerformanceMetrics()
3. 检查是否有未清理的定时器或事件监听器

## 示例

### 完整的组件日志示例

```svelte
<script lang="ts">
import { onMount } from 'svelte';
import logger, { ModuleType } from '@/lib/utils/logger';

let data: any[] = [];

onMount(() => {
  logger.trace(ModuleType.UI, 'Component mounted');

  logger.time('data-fetch', ModuleType.UI);
  fetchData()
    .then((result) => {
      data = result;
      logger.timeEnd('data-fetch', ModuleType.UI);
      logger.info(ModuleType.UI, 'Data fetched successfully', { count: result.length });
    })
    .catch((error) => {
      logger.error(ModuleType.UI, 'Failed to fetch data', { error });
    });

  return () => {
    logger.trace(ModuleType.UI, 'Component unmounted');
  };
});

function handleClick() {
  logger.info(ModuleType.UI, 'Button clicked', { button: 'submit' });
}
</script>
```

### 完整的Store日志示例

```typescript
import { makeAutoObservable } from 'mobx';
import logger, { ModuleType } from '@/lib/utils/logger';

class MyStore {
  data: any[] = [];

  constructor() {
    logger.trace(ModuleType.STORE, 'MyStore constructor called');
    makeAutoObservable(this);
  }

  updateData(newData: any[]) {
    logger.debug(ModuleType.STORE, 'Updating data', {
      oldLength: this.data.length,
      newLength: newData.length,
    });

    this.data = newData;

    logger.info(ModuleType.STORE, 'Data updated successfully');
  }
}
```

### 完整的模型日志示例

```typescript
import logger, { ModuleType } from '@/lib/utils/logger';

export class MyModel {
  static calculate(params: any): any {
    logger.trace(ModuleType.MODEL, 'Calculation started', { params });

    logger.time('calculation', ModuleType.MODEL);

    try {
      const result = this.performCalculation(params);

      logger.timeEnd('calculation', ModuleType.MODEL);
      logger.info(ModuleType.MODEL, 'Calculation completed', { result });

      return result;
    } catch (error) {
      logger.error(ModuleType.MODEL, 'Calculation failed', { error, params });
      throw error;
    }
  }

  private static performCalculation(params: any): any {
    // 实际计算逻辑
    return {};
  }
}
```

## 总结

本日志系统提供了全面的日志记录功能，支持：

- ✅ 多级别日志记录
- ✅ 模块化日志管理
- ✅ 性能监控和时间测量
- ✅ Web Workers日志传输
- ✅ 灵活的配置管理
- ✅ 日志查询和分析
- ✅ 日志导出和下载
- ✅ 内存管理和性能优化

通过合理使用日志系统，可以更好地理解应用程序的运行状态，快速定位问题，并优化性能。
