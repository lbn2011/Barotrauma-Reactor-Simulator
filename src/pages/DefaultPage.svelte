<script lang="ts">
  import type { Page } from '~/types';

  export let page: Page;
</script>

<style lang="scss">
  .default-page {
    padding: 24px;
  }

  h1 {
    font-size: 24px;
    margin-bottom: 16px;
  }
</style>

<div class="default-page">
  <h1>{page.title || 'Default Page'}</h1>
  <div class="content">
    <slot />
  </div>
</div>
