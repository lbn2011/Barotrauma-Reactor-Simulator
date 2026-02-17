// 日志工具使用示例
import log from './logger';

// 普通信息日志
log.info('应用启动');
log.info('当前用户:', { name: '张三', role: 'admin' });

// 成功信息日志
log.success('数据加载成功');
log.success('操作完成', { result: 'success' });

// 警告信息日志
log.warn('内存使用过高');
log.warn('API 响应缓慢', { responseTime: 1500 });

// 错误信息日志
log.error('网络请求失败');
log.error('数据解析错误', { error: 'Invalid JSON' });

// 调试信息日志
log.debug('组件挂载');
log.debug('状态更新', { state: { count: 10 } });

// 追踪信息日志
log.trace('函数执行开始');
log.trace('循环执行', { iteration: 5 });

// 致命错误信息日志
log.fatal('数据库连接失败');
log.fatal('系统崩溃', { error: 'Out of memory' });

// 清除控制台
log.clear();

// 统计信息日志
log.stats({ memory: '512MB', cpu: '25%', uptime: '10m' });

// 时间记录
log.time('API 请求');
// 模拟 API 请求
setTimeout(() => {
  log.timeEnd('API 请求');
}, 1000);
