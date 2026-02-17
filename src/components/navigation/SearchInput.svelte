<script lang="ts">
  import type { WebSearchFlowAction } from '@/types';
  import { getJetPerform } from '@/jet';

  export let searchAction: WebSearchFlowAction;

  let searchQuery: string = '';
  const perform = getJetPerform();

  function handleSubmit(event: Event) {
    event.preventDefault();
    if (searchQuery.trim() && searchAction) {
      perform(searchAction);
    }
  }
</script>

<style lang="scss">
  .search-input {
    display: flex;
    gap: 8px;
  }

  .search-input-field {
    flex-grow: 1;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }

  .search-input-button {
    padding: 8px 16px;
    background: var(--systemPrimary);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
</style>

<form class="search-input" on:submit={handleSubmit}>
  <input
    type="search"
    placeholder="Search"
    bind:value={searchQuery}
    class="search-input-field"
  />
  <button type="submit" class="search-input-button"> Search </button>
</form>
