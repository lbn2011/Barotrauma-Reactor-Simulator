<script lang="ts">
import type { Page } from '../types';
import { logger } from '../lib/utils/logger';

import PageComponent from './Page.svelte';
import ErrorComponent from './Error.svelte';
import { defaultComponentConfig } from '../config/components';

export let page: Promise<Page> | Page;
export let isFirstPage: boolean;
export let config = defaultComponentConfig;

// Log page loading start
logger.info('Page loading started', { isFirstPage });

// Function to log page load success
function handlePageLoadSuccess (loadedPage: Page) {
  logger.info('Page loaded successfully', {
    pageType: loadedPage.type,
    isFirstPage,
  });
}

// Function to log page load error
function handlePageLoadError (error: any) {
  logger.error('Page failed to load', {
    error: error instanceof Error ? error.message : error,
    isFirstPage,
  });
}
</script>

<style lang="scss">
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  font-size: 16px;
  color: #666;
}
</style>

{#await page}
  <div data-testid="page-loading">
    <!--
            Delay showing the spinner on initial page load after app boot.
            After that, the FlowAction handler already waits 500ms before
            it changes DOM, so we only need to wait 1000ms.
        -->
    <div class="loading-spinner">Loading...</div>
  </div>
{:then page}
  {handlePageLoadSuccess(page)}
  <PageComponent {page} {config} />
{:catch error}
  {handlePageLoadError(error)}
  <ErrorComponent {error} />
{/await}
