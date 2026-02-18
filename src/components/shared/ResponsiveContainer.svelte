<script lang="ts">
import { breakpoints, getResponsiveValue } from '@/utils/responsive';
import { logger } from '../../lib/utils/logger';

export let maxWidth: Partial<Record<keyof typeof breakpoints, string>> = {
  sm: '100%',
  md: '720px',
  lg: '960px',
  xl: '1280px',
};

export let padding: Partial<Record<keyof typeof breakpoints, string>> = {
  sm: '16px',
  md: '24px',
  lg: '32px',
};

export let margin: Partial<Record<keyof typeof breakpoints, string>> = {
  sm: '0',
  md: '0',
  lg: '0',
};

export let centered: boolean = true;
export let className: string = '';

// Log ResponsiveContainer initialization
logger.debug('ResponsiveContainer initialized', {
  centered,
  hasCustomClass: !!className,
  maxWidth,
  padding,
  margin,
});

// Generate inline styles
function getContainerStyle () {
  const maxWidthValue = getResponsiveValue(maxWidth, '100%');
  const paddingValue = getResponsiveValue(padding, '0');
  const marginValue = centered ? '0 auto' : getResponsiveValue(margin, '0');

  return `max-width: ${maxWidthValue}; padding: ${paddingValue}; margin: ${marginValue}; width: 100%;`;
}
</script>

<style scoped>
.responsive-container {
  box-sizing: border-box;
}
</style>

<div class={`responsive-container ${className}`} style={getContainerStyle()}>
  <slot />
</div>
