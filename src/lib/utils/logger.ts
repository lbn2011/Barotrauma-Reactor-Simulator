import consola from 'consola';

// 创建一个自定义的日志实例
const logger = consola.create({
  defaults: {
    tag: 'Barotrauma Reactor Simulator',
  },
});

// 导出日志方法
const log = {
  /**
   * 普通日志信息
   */
  info: (...args: any[]) => logger.info(...args),

  /**
   * 成功信息
   */
  success: (...args: any[]) => logger.success(...args),

  /**
   * 警告信息
   */
  warn: (...args: any[]) => logger.warn(...args),

  /**
   * 错误信息
   */
  error: (...args: any[]) => logger.error(...args),

  /**
   * 调试信息
   */
  debug: (...args: any[]) => logger.debug(...args),

  /**
   * 追踪信息
   */
  trace: (...args: any[]) => logger.trace(...args),

  /**
   *  fatal 信息
   */
  fatal: (...args: any[]) => logger.fatal(...args),

  /**
   * 清除控制台
   */
  clear: () => logger.clear(),

  /**
   * 统计信息
   */
  stats: (obj: Record<string, any>) => logger.stats(obj),

  /**
   * 时间信息
   */
  time: (label: string) => logger.time(label),

  /**
   * 时间结束信息
   */
  timeEnd: (label: string) => logger.timeEnd(label),
};

export default log;
