<script lang="ts">
import type { TodayCardMedia as TodayCardMediaType } from '~/types';

export const media: TodayCardMediaType = {} as TodayCardMediaType;

export function isTodayCardMediaList (media: TodayCardMediaType): media is TodayCardMediaType {
  return media.kind === 'list';
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
