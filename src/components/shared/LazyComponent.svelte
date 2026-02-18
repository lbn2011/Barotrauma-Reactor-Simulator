<script lang="ts">
import { onMount, onDestroy, createEventDispatcher } from 'svelte';
import { logger } from '../../lib/utils/logger';

export let component: () => Promise<{ default: any }>;
export let props: Record<string, any> = {};
export let placeholder: string = 'Loading...';
export let threshold: number = 0.1;
export let rootMargin: string = '0px';
export let immediate: boolean = false;

// Log LazyComponent initialization
logger.debug('LazyComponent initialized', {
  immediate,
  threshold,
  rootMargin,
});

let loadedComponent: any = null;
let isLoading = false;
let error: Error | null = null;
let container: HTMLElement | null = null;
let observer: IntersectionObserver | null = null;

const dispatch = createEventDispatcher();

async function loadComponent() {
  if (isLoading || loadedComponent) return;

  isLoading = true;
  dispatch('loading');
  logger.info('LazyComponent loading started');

  try {
    const module = await component();
    loadedComponent = module.default;
    isLoading = false;
    dispatch('loaded');
    logger.info('LazyComponent loaded successfully');
  } catch (e) {
    error = e as Error;
    isLoading = false;
    dispatch('error', e);
    logger.error('LazyComponent failed to load', {
      error: error?.message || 'Unknown error',
    });
  } finally {
    // Clean up observer once component is loaded
    if (observer) {
      observer.disconnect();
      observer = null;
      logger.debug('LazyComponent intersection observer disconnected');
    }
  }
}

onMount(() => {
  if (immediate) {
    logger.debug('LazyComponent immediate loading triggered');
    loadComponent();
    return;
  }

  if ('IntersectionObserver' in window && container) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          logger.debug('LazyComponent intersection observer triggered');
          loadComponent();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(container);
    logger.debug('LazyComponent intersection observer initialized');
  } else {
    // Fallback if Intersection Observer is not supported
    logger.debug('LazyComponent using fallback loading (IntersectionObserver not supported)');
    loadComponent();
  }
});

onDestroy(() => {
  if (observer) {
    observer.disconnect();
    logger.debug('LazyComponent destroyed - observer disconnected');
  }
});
</script>

<style>
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  font-size: 16px;
  color: #666;
}

.error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  font-size: 16px;
  color: #ff4d4f;
}

.container {
  min-height: 1px;
  width: 100%;
}
</style>

<div class="container" bind:this={container}>
  {#if isLoading}
    <div class="loading">{placeholder}</div>
  {:else if error}
    <div class="error">Error loading component: {error.message}</div>
  {:else if loadedComponent}
    <svelte:component this={loadedComponent} {...props} />
  {/if}
</div>
