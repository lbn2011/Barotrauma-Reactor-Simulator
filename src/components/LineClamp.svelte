<script lang="ts">
export let clamp: number = 2;
import { logger } from '../lib/utils/logger';

// Log LineClamp usage for debugging
logger.debug('LineClamp component rendered', { clamp });
</script>

<style lang="scss">
.line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: var(--clamp);
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

<div class="line-clamp" style:--clamp={clamp}>
  <slot />
</div>
