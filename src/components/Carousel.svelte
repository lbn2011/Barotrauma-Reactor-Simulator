<script lang="ts">
  import type { Item } from '~/types';
  import AmbientBackgroundArtwork from './AmbientBackgroundArtwork.svelte';
  import { portal } from '~/actions/portal';

  export let items: Item[];
  export let activeIndex: number = 0;

  function deriveBackgroundArtworkFromItem(item: Item) {
    // Implement background artwork derivation logic here
    return item.artwork;
  }
</script>

<style lang="scss">
  .carousel {
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .carousel-item {
    position: relative;
    width: 100%;
    min-height: 400px;
  }
</style>

<div class="carousel">
  {#each items as item, index}
    <div class="carousel-item" class:active={activeIndex === index}>
      {#if !import.meta.env.SSR}
        {@const backgroundArtwork = deriveBackgroundArtworkFromItem(item)}

        {#if backgroundArtwork}
          <div use:portal={'carousel-background'}>
            <AmbientBackgroundArtwork
              artwork={backgroundArtwork}
              active={activeIndex === index}
            />
          </div>
        {/if}
      {/if}
      <slot name="item" {item} {index} active={activeIndex === index} />
    </div>
  {/each}
</div>
