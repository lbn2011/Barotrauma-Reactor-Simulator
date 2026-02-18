<script lang="ts">
import type { TodayCardMedia as TodayCardMediaType } from '@/types';
import Artwork, { type Profile } from '@/components/Artwork.svelte';
import TodayCardMediaList from './media/TodayCardMediaList.svelte';
import { logger } from '@/lib/utils/logger';

export let media: TodayCardMediaType;
export let artworkProfile: Profile | undefined = undefined;

$: {
  logger.debug('TodayCardMedia initialized', {
    mediaKind: media.kind,
    hasArtworkProfile: !!artworkProfile,
  });
}
</script>

{#if media.kind === 'list'}
  <TodayCardMediaList {media} />
{:else}
  <Artwork artwork={media} profile={artworkProfile || [[300], 1, 'sr']} />
{/if}
