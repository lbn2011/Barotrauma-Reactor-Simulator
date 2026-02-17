<script context="module" lang="ts">
import type { Artwork } from '@/types';

export type Profile = [number[], number, string];

/**
 * Creates a Profile on-the-fly based on the properties of the artwork
 */
export function getNaturalProfile (
  artwork: Artwork,
  imageSizes: number[] = [artwork.width || 300]
): Profile {
  const aspectRatio = artwork.width && artwork.height ? artwork.width / artwork.height : 1;

  return [imageSizes, aspectRatio, artwork.crop || 'sr'];
}
</script>

<script lang="ts">
import type { Artwork as ArtworkType } from '@/types';
import { isNamedColor } from '@/utils/color';

export let artwork: ArtworkType;
export let profile: Profile;
export let alt: string = '';
export let topRoundedSecondary: boolean = false;
export let useContainerStyle: boolean = false;
export let forceFullWidth: boolean = true;
export let isDecorative: boolean = true;
export let lazyLoad: boolean = true;
export let disableAutoCenter: boolean = false;
export let noShelfChevronAnchor: boolean = false;
export let forceCropCode: boolean = false;
export let quality: number | undefined = undefined;
export let hasTransparentBackground: boolean =
  !!artwork.backgroundColor &&
  isNamedColor(artwork.backgroundColor) &&
  artwork.backgroundColor.name === 'clear';
export let useCropCodeFromArtwork: boolean = true;
export let withoutBorder: boolean = false;

let computedProfileAttributes: Profile | undefined;
let isLoading: boolean = true;
let loadError: boolean = false;
let imageUrl: string = '';

// Build image URL with dynamic parameters
function buildSrc (artwork: ArtworkType, profile: Profile): string {
  if (!artwork.template && !artwork.url) return '';

  if (artwork.url) return artwork.url;

  const [sizes, , crop] = profile;
  const width = sizes[0] || 300;
  const height = Math.round(width / (artwork.width / artwork.height)) || 200;

  // Simple template replacement for demonstration
  return artwork.template
    .replace('{w}', width.toString())
    .replace('{h}', height.toString())
    .replace('{c}', crop)
    .replace('{f}', 'webp');
}

$: {
  if (useCropCodeFromArtwork && artwork?.crop && profile) {
    computedProfileAttributes = [...profile] as Profile;
    computedProfileAttributes[2] = artwork.crop;
  } else {
    computedProfileAttributes = profile;
  }
}

$: {
  isLoading = true;
  loadError = false;
  imageUrl = buildSrc(artwork, computedProfileAttributes || profile);
}

function handleImageLoad () {
  isLoading = false;
  loadError = false;
}

function handleImageError () {
  isLoading = false;
  loadError = true;
}
</script>

<style lang="scss">
.artwork-component {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.artwork-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease-in-out;
}

.loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>

<div class="artwork-component">
  {#if imageUrl}
    {#if isLoading}
      <div class="loading"></div>
    {/if}
    <img
      src={imageUrl}
      {alt}
      class="artwork-image"
      on:load={handleImageLoad}
      on:error={handleImageError}
      style:opacity={isLoading ? 0 : 1}
    />
    {#if loadError}
      <div class="error">
        <span>Image failed to load</span>
      </div>
    {/if}
  {:else if loadError}
    <div class="error">
      <span>Image not available</span>
    </div>
  {/if}
</div>
