<script lang="ts">
  import type { Video as VideoModel } from '~/types';

  export let video: VideoModel;
  export let loop: boolean = false;
  export let autoplay: boolean = false;
  export let useControls: boolean = true;
  export let profile: string = 'large-hero';

  let videoElement: HTMLVideoElement;
  let isPlaying: boolean = false;
  let isLoaded: boolean = false;
  let loadError: boolean = false;

  function handleVideoLoad() {
    isLoaded = true;
    loadError = false;
  }

  function handleVideoError() {
    isLoaded = false;
    loadError = true;
  }

  function handleVideoPlay() {
    isPlaying = true;
  }

  function handleVideoPause() {
    isPlaying = false;
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
      {controls}={useControls}
      muted={autoplay}
      playsinline
      on:load={handleVideoLoad}
      on:error={handleVideoError}
      on:play={handleVideoPlay}
      on:pause={handleVideoPause}
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