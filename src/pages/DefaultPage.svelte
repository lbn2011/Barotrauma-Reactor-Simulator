<script lang="ts">
import type { Page } from '@/types';
import log from '../lib/utils/logger';

export let page: Page;

// Component initialization logging
log.info('DefaultPage component initialized');
log.debug('Page data received:', { title: page.title });
</script>

<style lang="scss">
.default-page {
  padding: 24px;
}

h1 {
  font-size: 24px;
  margin-bottom: 16px;
}
</style>

<div class="default-page">
  <h1>{page.title || 'Default Page'}</h1>
  <div class="content">
    <slot />
  </div>
</div>
