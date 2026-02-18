<script lang="ts">
import type { TodayCardOverlay as TodayCardOverlayType } from '@/types';
import Button from '@/lib/components/ui/button/button.svelte';
type ButtonVariant = 'default' | 'ghost' | 'outline';
import LinkWrapper from '@/components/LinkWrapper.svelte';
import { logger } from '@/lib/utils/logger';

export let overlay: TodayCardOverlayType;
export let buttonVariant: ButtonVariant = 'default';

// Overlay properties
let title: string | undefined;
let action: any | undefined;

$: {
  ({ title, action } = overlay);
  logger.debug('TodayCardOverlay initialized', {
    title,
    hasAction: !!action,
    buttonVariant,
  });
}
</script>

<LinkWrapper {action}>
  <Button variant={buttonVariant}>
    {title}
  </Button>
</LinkWrapper>
