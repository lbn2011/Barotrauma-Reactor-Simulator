<script lang="ts">
import { onMount, onDestroy, tick } from 'svelte';

export let items: any[];
export let itemHeight: number = 50;
export let containerHeight: number = 500;
export let overscan: number = 5;

let container: HTMLElement | null = null;
let startIndex = 0;
let endIndex = 0;
let scrollTop = 0;

function calculateVisibleRange () {
  if (!container) return;

  scrollTop = container.scrollTop;
  startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
}

function handleScroll () {
  calculateVisibleRange();
}

function getVisibleItems () {
  return items.slice(startIndex, endIndex);
}

function getItemStyle (index: number) {
  return {
    position: 'absolute' as const,
    top: `${index * itemHeight}px`,
    height: `${itemHeight}px`,
    width: '100%',
  };
}

onMount(async () => {
  await tick();
  calculateVisibleRange();
  if (container) {
    container.addEventListener('scroll', handleScroll);
  }
});

onDestroy(() => {
  if (container) {
    container.removeEventListener('scroll', handleScroll);
  }
});
</script>

<style>
.container {
  position: relative;
  overflow-y: auto;
  width: 100%;
}

.list {
  position: relative;
  width: 100%;
}

.item {
  box-sizing: border-box;
}
</style>

<div bind:this={container} class="container" style="height: ${containerHeight}px">
  <div class="list" style="height: ${items.length * itemHeight}px">
    {#each getVisibleItems() as item, index (startIndex + index)}
      <div class="item" style={getItemStyle(startIndex + index)} data-index={startIndex + index}>
        <slot {item} index={startIndex + index} />
      </div>
    {/each}
  </div>
</div>
