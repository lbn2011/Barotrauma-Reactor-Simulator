<script lang="ts">
  import type { TodayCardOverlay as TodayCardOverlayType } from '~/types';
  import Button from '~/lib/components/ui/button/button.svelte';
  type ButtonVariant = 'default' | 'ghost' | 'outline' | 'transparent' | 'dark-gray';
  import LinkWrapper from '~/components/LinkWrapper.svelte';

  export let overlay: TodayCardOverlayType;
  export let buttonVariant: ButtonVariant = 'default';

  $: ({ title, action } = overlay);
</script>

<LinkWrapper {action}>
  <Button variant={buttonVariant}>
    {title}
  </Button>
</LinkWrapper>
