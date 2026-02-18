<script lang="ts" module>
// Types and variants are exported from the types.ts file
</script>

<script lang="ts">
/* eslint-disable svelte/no-navigation-without-resolve */
import { cn } from '@/lib/utils';
import { resolve } from '$app/paths';
import { buttonVariants, type ButtonProps } from './types';

let {
  class: className,
  variant = 'default',
  size = 'default',
  ref = $bindable(null),
  href = undefined,
  type = 'button',
  disabled,
  children,
  ...restProps
}: ButtonProps = $props();
</script>

{#if href}
  <a
    bind:this={ref}
    data-slot="button"
    class={cn(buttonVariants({ variant, size }), className)}
    href={disabled ? undefined : resolve(href as any)}
    aria-disabled={disabled}
    role={disabled ? 'link' : undefined}
    tabindex={disabled ? -1 : undefined}
    {...restProps}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    bind:this={ref}
    data-slot="button"
    class={cn(buttonVariants({ variant, size }), className)}
    {type}
    {disabled}
    {...restProps}
  >
    {@render children?.()}
  </button>
{/if}
