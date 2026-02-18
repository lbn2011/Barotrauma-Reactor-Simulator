<script lang="ts">
import type { Action } from '~/types';
import { getJetPerform } from '~/jet';
import { logger } from '../../../lib/utils/logger';

export let destination: Action;

// Log FlowAction initialization
logger.debug('FlowAction initialized', {
  actionType: destination.type,
  hasTitle: !!destination.title
});

const perform = getJetPerform();

function handleClick () {
  logger.info('FlowAction clicked', {
    actionType: destination.type,
    title: destination.title,
    hasDestination: !!destination.destination
  });
  perform(destination);
}
</script>

<style lang="scss">
.flow-action {
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  font: inherit;
  padding: 0;
}
</style>

<button class="flow-action" on:click={handleClick}>
  <slot />
</button>
