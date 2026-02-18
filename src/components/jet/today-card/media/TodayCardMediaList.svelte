<script lang="ts">
import type { TodayCardMedia as TodayCardMediaType } from '../../../../types';
import { logger } from '../../../../lib/utils/logger';

export let media: TodayCardMediaType;

$: {
  logger.debug('TodayCardMediaList initialized', {
    mediaKind: media?.kind,
    isList: media?.kind === 'list',
  });
}

export function isTodayCardMediaList (media: TodayCardMediaType): media is TodayCardMediaType {
  const result = media.kind === 'list';
  logger.debug('Checking if media is list', {
    mediaKind: media.kind,
    result,
  });
  return result;
}
</script>

<style lang="scss">
.media-list {
  display: flex;
  gap: 8px;
  padding: 16px;
}
</style>

<div class="media-list">
  <!-- Implement media list rendering here -->
</div>
