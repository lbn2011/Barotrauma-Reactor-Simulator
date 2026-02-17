<script lang="ts">
import { onMount, onDestroy, createEventDispatcher } from 'svelte';

export let component: () => Promise<{ default: any }>;
export let props: Record<string, any> = {};
export let placeholder: string = 'Loading...';
export let threshold: number = 0.1;
export let rootMargin: string = '0px';
export let immediate: boolean = false;

let loadedComponent: any = null;
let isLoading = false;
let error: Error | null = null;
let container: HTMLElement | null = null;
let observer: IntersectionObserver | null = null;

const dispatch = createEventDispatcher();

async function loadComponent () {
  if (isLoading || loadedComponent) return;

  isLoading = true;
  dispatch('loading');

  try {
    const module = await component();
    loadedComponent = module.default;
    isLoading = false;
    dispatch('loaded');
  } catch (e) {
    error = e as Error;
    isLoading = false;
    dispatch('error', e);
  } finally {
    // Clean up observer once component is loaded
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }
}

onMount(() => {
  if (immediate) {
    loadComponent();
    return;
  }

  if ('IntersectionObserver' in window && container) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadComponent();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(container);
  } else {
    // Fallback if Intersection Observer is not supported
    loadComponent();
  }
});

onDestroy(() => {
  if (observer) {
    observer.disconnect();
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
