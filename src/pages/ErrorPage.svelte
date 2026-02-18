<script lang="ts">
import type { Page } from '~/types';
import log from '../lib/utils/logger';

export let page: Page;

// Component initialization logging
log.error('ErrorPage component initialized');
log.debug('Error page data:', { errorMessage: page.errorMessage });
</script>

<style lang="scss">
.error-page {
  padding: 24px;
  text-align: center;
}

h1 {
  font-size: 24px;
  margin-bottom: 16px;
  color: #ff3b30;
}
</style>

<div class="error-page">
  <h1>Error</h1>
  <p>{page.errorMessage || 'An error occurred'}</p>
</div>
