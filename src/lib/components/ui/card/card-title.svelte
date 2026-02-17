<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn, type WithElementRef } from '@/lib/utils';

  export type CardTitleProps = WithElementRef<HTMLAttributes<HTMLHeadingElement>>;
</script>

<script lang="ts">
  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLHeadingElement>> = $props();
</script>

<div
  bind:this={ref}
  data-slot="card-title"
  class={cn('leading-none font-semibold', className)}
  {...restProps}
>
  {@render children?.()}
</div>
