<script lang="ts">
  export let clamp: number = 2;
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
