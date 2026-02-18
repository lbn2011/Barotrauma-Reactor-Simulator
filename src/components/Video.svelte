<script lang="ts">
import type { Video as VideoModel } from '~/types';
import { logger } from '../lib/utils/logger';

export let video: VideoModel;
export let loop: boolean = false;
export let autoplay: boolean = false;
export let useControls: boolean = true;
export let profile: string = 'large-hero';

let videoElement: HTMLVideoElement;
let isLoaded: boolean = false;
let loadError: boolean = false;

function handleVideoLoad () {
  isLoaded = true;
  loadError = false;
  logger.info('Video loaded successfully', { url: video.url, profile });
}

function handleVideoError () {
  isLoaded = false;
  loadError = true;
  logger.error('Video failed to load', { url: video.url, error: 'Video loading error' });
}
</script>

<style lang="scss">
.video-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}
</style>

<div class="video-container">
  {#if video.url}
    {#if !isLoaded}
      <div class="video-loading">
        <span>Loading video...</span>
      </div>
    {/if}
    <video
      bind:this={videoElement}
      class="video-element"
      {loop}
      {autoplay}
      controls={useControls}
      muted={autoplay}
      playsinline
      on:load={handleVideoLoad}
      on:error={handleVideoError}
    >
      <source src={video.url} type={video.mimeType || 'video/mp4'} />
      Your browser does not support the video tag.
    </video>
    {#if loadError}
      <div class="video-error">
        <span>Video failed to load</span>
      </div>
    {/if}
  {/if}
</div>
