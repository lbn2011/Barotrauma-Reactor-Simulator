<script lang="ts">
  import type { Artwork } from '~/types';

  export let artwork: Artwork;

  export function isSystemImageArtwork(artwork: Artwork): boolean {
    return artwork.type === 'system';
  }
</script>

<style lang="scss">
  .system-image {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .system-image-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
</style>

<div class="system-image">
  {#if artwork.url}
    <img src={artwork.url} alt="" class="system-image-img" />
  {/if}
</div>
