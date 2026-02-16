<script lang="ts">
  import type { Artwork as ArtworkType } from '~/types';

  export type Profile = {
    width: number;
    height: number;
  };

  export let artwork: ArtworkType;
  export let profile: Profile | string;
  export let alt: string = '';

  export function getNaturalProfile(artwork: ArtworkType): Profile {
    return {
      width: artwork.width || 100,
      height: artwork.height || 100,
    };
  }
</script>

<style lang="scss">
  .artwork-component {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .artwork-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
  }
</style>

<div class="artwork-component">
  {#if artwork.url}
    <img src={artwork.url} {alt} class="artwork-image" />
  {/if}
</div>
