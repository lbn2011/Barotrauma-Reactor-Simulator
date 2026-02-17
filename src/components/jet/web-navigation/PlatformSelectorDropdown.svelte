<script lang="ts">
import type { WebNavigationLink } from '~/types';
import FlowAction from '../action/FlowAction.svelte';

export let platformSelectors: WebNavigationLink[];
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
