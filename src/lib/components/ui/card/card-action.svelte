<script lang="ts" module>
import { cn, type WithElementRef } from '@/lib/utils';
import type { HTMLAttributes } from 'svelte/elements';

export type CardActionProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
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
  data-slot="card-action"
  class={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
  {...restProps}
>
  {@render children?.()}
</div>
