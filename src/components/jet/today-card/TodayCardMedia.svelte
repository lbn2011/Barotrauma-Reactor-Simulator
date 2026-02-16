<script lang="ts">
  import type { TodayCardMedia as TodayCardMediaType } from '~/types';
  import Artwork from '~/components/Artwork.svelte';
  import TodayCardMediaList from './media/TodayCardMediaList.svelte';

  // Define local Profile type
  type Profile = {
    width: number;
    height: number;
  };

  export let media: TodayCardMediaType;
  export let artworkProfile: Profile | undefined = undefined;
</script>

{#if media.kind === 'list'}
  <TodayCardMediaList {media} />
{:else}
  <Artwork artwork={media} profile={artworkProfile} />
{/if}
