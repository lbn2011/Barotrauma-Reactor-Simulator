<script lang="ts">
  import type { Artwork as ArtworkModel } from '@/types';
  import type { Profile } from './Artwork.svelte';
  import Artwork from '@/components/Artwork.svelte';
  import Video from '@/components/Video.svelte';
  import { prefersReducedMotion } from '@/stores/prefers-reduced-motion';
  import { getBackgroundGradientCSSVarsFromArtworks, getLuminanceForRGB } from '@/utils/color';
  import { defaultComponentConfig } from '@/config/components';

  // Define VideoModel type locally since it's not exported from ~/types
  interface VideoModel {
    url: string;
    mimeType?: string;
  }

  // Define Opt type locally since it's not exported from ~/types
  type Opt<T> = T | undefined | null;

  export let color: string = '#000000';
  export let artwork: Opt<ArtworkModel> = undefined;
  export let video: Opt<VideoModel> = undefined;
  export let profile: string = 'large-hero';
  export let pinArtworkToHorizontalEnd: boolean = false;
  export let pinArtworkToVerticalMiddle: boolean = false;
  export let collectionIcons: ArtworkModel[] | undefined = undefined;
  export let config = defaultComponentConfig;

  // Convert string profile to Profile tuple for Artwork component
  function getArtworkProfile(profileName: string): Profile {
    // Default profile values
    const defaultSizes = [300];
    const defaultAspectRatio = 16/9;
    const defaultCrop = 'sr';

    // Return default profile for now
    return [defaultSizes, defaultAspectRatio, defaultCrop];
  }

  let collectionIconsBackgroundGradientCssVars: string | undefined = undefined;

  if (collectionIcons && collectionIcons.length > 1) {
    // If there are multiple app icons, we build a string of CSS variables from the icons
    // background colors to fill as many of the lockups quadrants as possible.
    collectionIconsBackgroundGradientCssVars =
      getBackgroundGradientCSSVarsFromArtworks(collectionIcons, {
        // sorts from darkest to lightest
        sortFn: (a, b) => getLuminanceForRGB(a) - getLuminanceForRGB(b),
        shouldRemoveGreys: true,
      });
  }
</script>

<style lang="scss">
  .hero {
    position: relative;
    overflow: hidden;
  }

  .image-container {
    position: absolute;
    z-index: -1;
    width: 100%;
    height: 100%;
    background-color: var(--color);
  }

  .image-container.pinned-to-vertical-middle {
    display: flex;
    align-items: center;
  }

  .image-container.pinned-to-vertical-middle :global(.video-container),
  .image-container.pinned-to-vertical-middle :global(.artwork-component) {
    width: 100%;
    height: auto;
  }

  .image-container.pinned-to-horizontal-end :global(.artwork-component) {
    height: 100%;
    display: flex;
  }

  .image-container.pinned-to-horizontal-end :global(.artwork-component img) {
    height: 100%;
    width: auto;
    position: absolute;
    inset-inline-end: 0;
  }

  .app-icons {
    display: grid;
    align-self: center;
    width: 90%;
    grid-template-rows: auto auto;
    grid-auto-flow: column;
    gap: 24px;
    margin-inline-start: -4%;
    position: absolute;
    inset-inline-end: 24px;

    @media (min-width: 768px) {
      width: 44%;
    }
  }

  .app-icons li:nth-child(even) {
    inset-inline-start: 44%;
  }

  .app-icon-container {
    position: relative;
    flex-shrink: 0;
    max-width: 200px;
  }

  @property --top-left-stop {
    syntax: '<percentage>';
    inherits: false;
    initial-value: 20%;
  }

  @property --bottom-left-stop {
    syntax: '<percentage>';
    inherits: false;
    initial-value: 40%;
  }

  @property --top-right-stop {
    syntax: '<percentage>';
    inherits: false;
    initial-value: 55%;
  }

  @property --bottom-right-stop {
    syntax: '<percentage>';
    inherits: false;
    initial-value: 50%;
  }

  .collection-icons-background-gradient {
    width: 100%;
    height: 100%;
    position: absolute;
    background: radial-gradient(
            circle at 3% -50%,
            var(--top-left, #000) var(--top-left-stop),
            transparent 70%
        ),
        radial-gradient(
            circle at -50% 120%,
            var(--bottom-left, #000) var(--bottom-left-stop),
            transparent 80%
        ),
        radial-gradient(
            circle at 66% -175%,
            var(--top-right, #000) var(--top-right-stop),
            transparent 80%
        ),
        radial-gradient(
            circle at 62% 100%,
            var(--bottom-right, #000) var(--bottom-right-stop),
            transparent 100%
        );
    animation: collection-icons-background-gradient-shift 16s infinite
        alternate-reverse;
    animation-play-state: paused;

    @media (min-width: 768px) {
      animation-play-state: running;
    }
  }

  @keyframes collection-icons-background-gradient-shift {
    0% {
      --top-left-stop: 20%;
      --bottom-left-stop: 40%;
      --top-right-stop: 55%;
      --bottom-right-stop: 50%;
      background-size: 100% 100%;
    }

    50% {
      --top-left-stop: 25%;
      --bottom-left-stop: 15%;
      --top-right-stop: 70%;
      --bottom-right-stop: 30%;
      background-size: 130% 130%;
    }

    100% {
      --top-left-stop: 15%;
      --bottom-left-stop: 20%;
      --top-right-stop: 55%;
      --bottom-right-stop: 20%;
      background-size: 110% 110%;
    }
  }

  .gradient {
    --rotation: 55deg;

    &:dir(rtl) {
      --rotation: -55deg;
      mask-image:
        radial-gradient(
          ellipse 127% 130% at 95% 100%,
          rgb(0, 0, 0) 18%,
          rgb(0, 0, 0.33) 24%,
          rgba(0, 0, 0, 0.66) 32%,
          transparent 40%
        ),
        linear-gradient(-129deg, rgb(0, 0, 0) 0%, rgba(255, 255, 255, 0) 55%);
    }
    position: absolute;
    z-index: -1;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      var(--rotation),
      rgb(from var(--color) r g b / 0.25) 0%,
      transparent 50%
    );
    filter: saturate(1.5) brightness(0.9);
    backdrop-filter: blur(40px);
    mask-image:
      radial-gradient(
        ellipse 127% 130% at 5% 100%,
        rgb(0, 0, 0) 18%,
        rgb(0, 0, 0.33) 24%,
        rgba(0, 0, 0, 0.66) 32%,
        transparent 40%
      ),
      linear-gradient(51deg, rgb(0, 0, 0) 0%, rgba(255, 255, 255, 0) 55%);

    @media (max-width: 768px) {
      --rotation: 0deg;
      mask-image: linear-gradient(
        var(--rotation),
        rgb(0, 0, 0) 28%,
        rgba(0, 0, 0, 0) 56%
      );
    }
  }
</style>

<div class="hero">
  {#if video || artwork}
    <div
      class={`image-container ${profile}`}
      class:pinned-to-horizontal-end={pinArtworkToHorizontalEnd}
      class:pinned-to-vertical-middle={pinArtworkToVerticalMiddle}
      style:--color={color}
    >
      {#if video && !$prefersReducedMotion && (config.hero?.enableVideoAutoplay || false)}
        <Video
          loop
          autoplay
          useControls={false}
          {video}
          {profile}
        />
      {:else if artwork}
        <Artwork
          {artwork}
          profile={profile}
          noShelfChevronAnchor={true}
          useCropCodeFromArtwork={false}
          withoutBorder={true}
        />
      {/if}
    </div>
  {:else if collectionIcons && (config.hero?.enableCollectionIcons || false)}
    <ul class="app-icons">
      {#each collectionIcons?.slice(0, 5) as collectionIcon}
        <li class="app-icon-container">
          <Artwork
            artwork={collectionIcon}
            profile="app-icon-large"
          />
        </li>
      {/each}
    </ul>

    <div
      class="collection-icons-background-gradient"
      style={collectionIconsBackgroundGradientCssVars}
    />
  {/if}
  <div class="gradient" style="--color: {color};" />
  <slot />
</div>
