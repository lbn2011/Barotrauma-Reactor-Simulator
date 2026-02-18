<script lang="ts">
import type { Artwork } from '../types';
import { logger } from '../lib/utils/logger';

export let artwork: Artwork;

export function isSystemImageArtwork (artwork: Artwork): boolean {
  return artwork.type === 'system';
}

function handleImageLoad () {
  logger.info('System image loaded successfully', { url: artwork.url, type: artwork.type });
}

function handleImageError () {
  logger.error('System image failed to load', { url: artwork.url, error: 'Image loading error' });
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
    <img
      src={artwork.url}
      alt=""
      class="system-image-img"
      on:load={handleImageLoad}
      on:error={handleImageError}
    />
  {/if}
</div>
