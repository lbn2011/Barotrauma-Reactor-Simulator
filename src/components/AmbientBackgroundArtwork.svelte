<script lang="ts">
  import type { Artwork as JetArtworkType } from '~/types';
  import { intersectionObserver } from '@amp/web-app-components/src/actions/intersection-observer';
  import { buildSrc } from '@amp/web-app-components/src/components/Artwork/utils/srcset';
  import ResizeDetector from '@amp/web-app-components/src/components/helpers/ResizeDetector.svelte';
  import { colorAsString } from '~/utils/color';

  export let artwork: JetArtworkType;
  export let active: boolean = false;

  $: isBackgroundImageLoaded = false;
  $: backgroundImage = artwork
    ? buildSrc(
        artwork.template,
        {
          crop: 'sr',
          width: 400,
          height: Math.floor(400 / 1.6667),
          fileType: 'webp',
        },
        {}
      )
    : undefined;

  $: if (backgroundImage) {
    const img = new Image();
    img.onload = () => (isBackgroundImageLoaded = true);
    img.src = backgroundImage;
  }

  let resizing = false;
  const handleResizeUpdate = (e: CustomEvent<{ isResizing: boolean }>) =>
    (resizing = e.detail.isResizing);

  let isOutOfView = true;
  const handleIntersectionOberserverUpdate = (
    isIntersectingViewport: boolean
  ) => (isOutOfView = !isIntersectingViewport);
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
      linear-gradient(
        0deg,
        var(--background-color) 0%,
        var(--background-color) 80%
      );
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
      linear-gradient(0deg, var(--veil) 0%, var(--veil) 80%),
      var(--background-image);
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
  <ResizeDetector on:resizeUpdate={handleResizeUpdate} />

  <div
    class="container"
    class:active
    class:resizing
    class:loaded={isBackgroundImageLoaded}
    class:out-of-view={isOutOfView}
    style:--background-image={`url(${backgroundImage})`}
    style:--background-color={artwork.backgroundColor &&
      colorAsString(artwork.backgroundColor)}
    use:intersectionObserver={{
      callback: handleIntersectionOberserverUpdate,
      threshold: 0,
    }}
  >
    <div class="overlay" />
  </div>
{/if}
