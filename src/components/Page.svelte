<script lang="ts">
import type { Page } from '~/types';
import { logger } from '../lib/utils/logger';

import MetaTags from '~/components/structure/MetaTags.svelte';
import PageModal from '~/components/PageModal.svelte';

// Import all page components
import DefaultPage from '~/pages/DefaultPage.svelte';
import ErrorPage from '~/pages/ErrorPage.svelte';
import { defaultComponentConfig } from '~/config/components';

export let page: Page;
export let config = defaultComponentConfig;

// Log page rendering
logger.info('Page component rendered', { pageType: page.type });

// Page type guards
function isAppEventDetailPage(page: Page): boolean {
  return page.type === 'appEventDetail';
}

function isArticlePage(page: Page): boolean {
  return page.type === 'article';
}

function isChartsHubPage(page: Page): boolean {
  return page.type === 'chartsHub';
}

function isGenericPage(page: Page): boolean {
  return page.type === 'generic';
}

function isSearchLandingPage(page: Page): boolean {
  return page.type === 'searchLanding';
}

function isShelfBasedProductPage(page: Page): boolean {
  return page.type === 'shelfBasedProduct';
}

function isTopChartsPage(page: Page): boolean {
  return page.type === 'topCharts';
}

function isTodayPage(page: Page): boolean {
  return page.type === 'today';
}

function isSearchResultsPage(page: Page): boolean {
  return page.type === 'searchResults';
}

function isStaticMessagePage(page: Page): boolean {
  return page.type === 'staticMessage';
}

function isSeeAllPage(page: Page): boolean {
  return page.type === 'seeAll';
}

function isErrorPage(page: Page): boolean {
  return page.type === 'error';
}

function hasVisionProUrl(page: Page): boolean {
  return page.visionProUrl !== undefined;
}
</script>

<MetaTags {page} />

<PageModal />

{#if isAppEventDetailPage(page)}
  <DefaultPage {page} />
{:else if isArticlePage(page)}
  <DefaultPage {page} />
{:else if isChartsHubPage(page)}
  <DefaultPage {page} />
{:else if isSearchLandingPage(page)}
  <DefaultPage {page} />
{:else if isSearchResultsPage(page)}
  <DefaultPage {page} />
{:else if isShelfBasedProductPage(page)}
  <DefaultPage {page} />
{:else if isTopChartsPage(page)}
  <DefaultPage {page} />
{:else if isGenericPage(page) && hasVisionProUrl(page)}
  <DefaultPage {page} />
{:else if isTodayPage(page)}
  <DefaultPage {page} />
{:else if isStaticMessagePage(page)}
  <DefaultPage {page} />
{:else if isSeeAllPage(page)}
  <DefaultPage {page} />
{:else if isErrorPage(page)}
  <ErrorPage {page} />
{:else}
  <DefaultPage {page} />
{/if}
