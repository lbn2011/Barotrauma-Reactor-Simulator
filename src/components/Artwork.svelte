<script context="module" lang="ts">
  import type { Artwork } from '~/types';

  export type Profile = {
    width: number;
    height: number;
  };

  export function getNaturalProfile(artwork: Artwork): Profile {
    return {
      width: artwork.width || 100,
      height: artwork.height || 100,
    };
  }
</script>

<script lang="ts">
  import type { Artwork as ArtworkType } from '~/types';

  export let artwork: ArtworkType;
  export const profile: any = {};
  export let alt: string = '';
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
