<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn, type WithElementRef } from '@/lib/utils';

  export type CardContentProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
  bind:this={ref}
  data-slot="card-content"
  class={cn('px-6', className)}
  {...restProps}
>
  {@render children?.()}
</div>
