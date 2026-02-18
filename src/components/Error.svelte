<script lang="ts">
export let error: any;
import { logger } from '../lib/utils/logger';

// Log error information for debugging and monitoring
logger.error('Error component rendered', {
  message: error.message || 'An unknown error occurred',
  stack: error.stack || 'No stack trace available'
});
</script>

<style lang="scss">
.error-component {
  padding: 24px;
  text-align: center;
}

h1 {
  font-size: 24px;
  margin-bottom: 16px;
  color: #ff3b30;
}

pre {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
  overflow-x: auto;
  text-align: left;
  font-family: monospace;
  font-size: 14px;
  color: #333;
}
</style>

<div class="error-component">
  <h1>Error</h1>
  <p>{error.message || 'An unknown error occurred'}</p>
  <pre>{error.stack || ''}</pre>
</div>
