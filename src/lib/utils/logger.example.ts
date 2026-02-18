// Logger usage example
import { logger as log } from './logger';

// Info logs
log.info('Application started');
log.info('Current user:', { name: 'John Doe', role: 'admin' });

// Success logs
log.success('Data loaded successfully');
log.success('Operation completed', { result: 'success' });

// Warning logs
log.warn('Memory usage is high');
log.warn('API response is slow', { responseTime: 1500 });

// Error logs
log.error('Network request failed');
log.error('Data parsing error', { error: 'Invalid JSON' });

// Debug logs
log.debug('Component mounted');
log.debug('State updated', { state: { count: 10 } });

// Trace logs
log.trace('Function execution started');
log.trace('Loop execution', { iteration: 5 });

// Fatal logs
log.fatal('Database connection failed');
log.fatal('System crash', { error: 'Out of memory' });

// Clear console
log.clear();

// Stats logs
log.stats({ memory: '512MB', cpu: '25%', uptime: '10m' });

// Time logging
log.time('API request');
// Simulate API request
setTimeout(() => {
  log.timeEnd('API request');
}, 1000);
