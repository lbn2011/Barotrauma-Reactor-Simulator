<script lang="ts">
export let name: string;
import { logger } from '../lib/utils/logger';

// Log SFSymbol usage for debugging
logger.debug('SFSymbol rendered', { name });
</script>

<style lang="scss">
.sf-symbol {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

<div class="sf-symbol">
  <span>{name}</span>
</div>
