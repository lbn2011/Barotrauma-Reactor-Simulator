<script lang="ts">
import type { Action } from '~/types';
import { getJetPerform } from '~/jet';

export let destination: Action;

const perform = getJetPerform();

function handleClick () {
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
