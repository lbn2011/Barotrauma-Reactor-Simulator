<script lang="ts">
import type { WebNavigationLink } from '~/types';
import FlowAction from '../action/FlowAction.svelte';
import { logger } from '~/lib/utils/logger';

export let platformSelectors: WebNavigationLink[];

$: {
  logger.debug('PlatformSelectorDropdown initialized', {
    selectorCount: platformSelectors.length,
    selectors: platformSelectors.map(s => s.action.title)
  });
}
</script>

<style lang="scss">
.platform-selector-dropdown {
  display: flex;
  gap: 8px;
}
</style>

<div class="platform-selector-dropdown">
  {#each platformSelectors as selector, index (index)}
    <FlowAction destination={selector.action}>
      <span>{selector.action.title}</span>
    </FlowAction>
  {/each}
</div>
