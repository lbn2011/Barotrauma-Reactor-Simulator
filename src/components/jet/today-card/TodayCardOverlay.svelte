<script lang="ts">
  import type { TodayCardOverlay as TodayCardOverlayType } from '~/types';
  import Button from '~/lib/components/ui/button/button.svelte';
  import LinkWrapper from '~/components/LinkWrapper.svelte';

  export let overlay: TodayCardOverlayType;
  export let buttonVariant: 'transparent' | 'dark-gray' = 'dark-gray';

  $: ({ title, action } = overlay);
</script>

<LinkWrapper {action}>
  <Button variant={buttonVariant}>
    {title}
  </Button>
</LinkWrapper>
