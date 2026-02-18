<script lang="ts">
import type { Artwork as JetArtworkType } from '@/types';
import { colorAsString } from '@/utils/color';
import { defaultComponentConfig } from '@/config/components';
import { logger } from '../lib/utils/logger';

export let artwork: JetArtworkType;
export let active: boolean = false;
export let config = defaultComponentConfig;

// Log AmbientBackgroundArtwork component initialization
logger.info('AmbientBackgroundArtwork component rendered', {
  hasArtwork: !!artwork,
  hasTemplate: !!artwork?.template,
  isActive: active,
});

let isBackgroundImageLoaded = false;
let backgroundImage = buildSrc(artwork) || '';

function loadBackgroundImage () {
  if (backgroundImage) {
    // Preload strategy: create image object to load in background
    const img = new Image();
    img.onload = () => {
      // Progressive display: set loaded state to trigger transition
      isBackgroundImageLoaded = true;
      logger.info('Ambient background image loaded successfully', { url: backgroundImage });
    };
    img.onerror = () => {
      // Error fallback: handle image load failure
      isBackgroundImageLoaded = false;
      logger.error('Ambient background image failed to load', {
        url: backgroundImage,
        error: 'Image loading error',
      });
    };
    img.src = backgroundImage;
  } else {
    isBackgroundImageLoaded = false;
    logger.debug('No background image URL provided');
  }
}

// Call loadBackgroundImage when backgroundImage changes
$: {
  backgroundImage = buildSrc(artwork) || '';
  loadBackgroundImage();
}

let isOutOfView = true;
const handleIntersectionOberserverUpdate = (isIntersectingViewport: boolean) => {
  isOutOfView = !isIntersectingViewport;
  logger.debug('AmbientBackgroundArtwork visibility changed', {
    isIntersecting: isIntersectingViewport,
    isOutOfView,
  });
};

/**
 * Builds a source URL for an artwork based on its template and parameters
 */
function buildSrc (
  artwork: JetArtworkType,
  options: {
    crop?: string;
    width?: number;
    height?: number;
    fileType?: string;
  } = {}
): string {
  if (!artwork || !artwork.template) {
    logger.debug('No artwork template provided for ambient background');
    return '';
  }

  const {
    crop = 'sr',
    width = 400,
    height = Math.floor(width / 1.6667),
    fileType = 'webp',
  } = options;

  // Build the source URL by replacing placeholders in the template
  const imageUrl = artwork.template
    .replace('{w}', width.toString())
    .replace('{h}', height.toString())
    .replace('{c}', crop)
    .replace('{f}', fileType);

  logger.debug('Built ambient background image URL', {
    url: imageUrl,
    width,
    height,
    crop,
    fileType,
  });
  return imageUrl;
}

function intersectionObserver (node: HTMLElement, options: any) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (options.callback) {
          options.callback(entry.isIntersecting);
        }
      });
    },
    { threshold: options.threshold || 0 }
  );

  observer.observe(node);

  return {
    destroy () {
      observer.disconnect();
    },
  };
}
</script>

<style>
.container {
  --veil: rgb(240, 240, 240, 0.65);
  --speed: 0.66s;
  --aspect-ratio: 16/9;
  --scale: 1.2;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  aspect-ratio: var(--aspect-ratio);
  max-height: 900px;
  opacity: 0;

  background-image:
    linear-gradient(180deg, rgba(255, 255, 255, 0) 50%, var(--pageBg) 80%),
    linear-gradient(0deg, var(--veil) 0%, var(--veil) 80%),
    linear-gradient(0deg, var(--background-color) 0%, var(--background-color) 80%);
  background-position: center;
  background-size: 120%;

  filter: blur(20px) saturate(1.3);
  transform: scale(var(--scale));
  transition:
    opacity calc(var(--speed) * 2) ease-out,
    background-size var(--speed) ease-in;

  @media (prefers-color-scheme: dark) {
    --veil: rgba(0, 0, 0, 0.5);
  }
}

.container.loaded {
  background-image:
    linear-gradient(180deg, rgba(255, 255, 255, 0) 50%, var(--pageBg) 80%),
    linear-gradient(0deg, var(--veil) 0%, var(--veil) 80%), var(--background-image);
}

.container.active {
  opacity: 1;
  transition: opacity calc(var(--speed) / 2) ease-in;
  background-size: 100%;
}

.overlay {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  width: 100%;
  aspect-ratio: var(--aspect-ratio);
  max-height: 900px;
  opacity: 0;
  background-image: var(--background-image);
  background-position: 100% 100%;
  background-size: 250%;
  filter: brightness(1.3) saturate(0);
  mix-blend-mode: overlay;
  will-change: opacity, background-position;
  animation: shift-background 60s infinite linear alternate;
  animation-play-state: paused;
  transition: opacity var(--speed) ease-in;
}

.active .overlay {
  opacity: 0.3;
  animation-play-state: running;
  transition: opacity calc(var(--speed) * 2) ease-in calc(var(--speed) * 2);
}

.active.out-of-view .overlay,
.active.resizing .overlay {
  animation-play-state: paused;
  opacity: 0;
}

@keyframes shift-background {
  0% {
    background-position: 0% 50%;
    background-size: 250%;
  }

  25% {
    background-position: 60% 20%;
    background-size: 300%;
  }

  50% {
    background-position: 100% 50%;
    background-size: 320%;
  }

  75% {
    background-position: 40% 100%;
    background-size: 220%;
  }

  100% {
    background-position: 20% 50%;
    background-size: 300%;
  }
}
</style>

{#if backgroundImage}
  <div
    class="container"
    class:active
    class:loaded={isBackgroundImageLoaded}
    class:out-of-view={isOutOfView}
    style:--background-image={`url(${backgroundImage})`}
    style:--background-color={artwork.backgroundColor && colorAsString(artwork.backgroundColor)}
    use:intersectionObserver={{
      callback: handleIntersectionOberserverUpdate,
      threshold: 0,
    }}
  >
    <div class="overlay"></div>
  </div>
{/if}
