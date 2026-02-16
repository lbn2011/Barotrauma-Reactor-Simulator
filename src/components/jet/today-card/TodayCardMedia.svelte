<script lang="ts">
  import type { TodayCardMedia as TodayCardMediaType } from '~/types';
  import type { Profile } from '~/components/Artwork.svelte';
  import Artwork from '~/components/Artwork.svelte';
  import TodayCardMediaList from './media/TodayCardMediaList.svelte';

  export let media: TodayCardMediaType;
  export let artworkProfile: Profile | undefined = undefined;
</script>

{#if media.kind === 'list'}
  <TodayCardMediaList {media} />
{:else}
  <Artwork artwork={media} profile={artworkProfile} />
{/if}
