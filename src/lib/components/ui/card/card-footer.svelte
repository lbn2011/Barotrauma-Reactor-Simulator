<script lang="ts" module>
import { cn, type WithElementRef } from '@/lib/utils';
import type { HTMLAttributes } from 'svelte/elements';

export type CardFooterProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
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
  data-slot="card-footer"
  class={cn('flex items-center px-6 [.border-t]:pt-6', className)}
  {...restProps}
>
  {@render children?.()}
</div>
