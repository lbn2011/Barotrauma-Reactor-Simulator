<script lang="ts">
  import type { Page } from '~/types';

  import PageComponent from '~/components/Page.svelte';
  import ErrorComponent from '~/components/Error.svelte';

  export let page: Promise<Page> | Page;
  export let isFirstPage: boolean;
</script>

<style lang="scss">
  .loading-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    font-size: 16px;
    color: #666;
  }
</style>

{#await page}
  <div data-testid="page-loading">
    <!--
            Delay showing the spinner on initial page load after app boot.
            After that, the FlowAction handler already waits 500ms before
            it changes DOM, so we only need to wait 1000ms.
        -->
    <div class="loading-spinner">Loading...</div>
  </div>
{:then page}
  <PageComponent {page} />
{:catch error}
  <ErrorComponent {error} />
{/await}
