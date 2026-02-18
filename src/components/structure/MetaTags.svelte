<script lang="ts">
import type { Page } from '~/types';
import { logger } from '../../lib/utils/logger';

export let page: Page;

// Log MetaTags component initialization
logger.info('MetaTags component rendered', {
  pageType: page.type
});
</script>

<!-- Implement meta tags here -->
