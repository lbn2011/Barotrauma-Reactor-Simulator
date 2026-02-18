<script lang="ts">
import { breakpoints, getResponsiveValue } from '@/utils/responsive';
import { logger } from '../../lib/utils/logger';

interface Props {
  /** Container max width for different breakpoints */
  maxWidth?: Partial<Record<keyof typeof breakpoints, string>>;
  /** Container padding for different breakpoints */
  padding?: Partial<Record<keyof typeof breakpoints, string>>;
  /** Container margin for different breakpoints */
  margin?: Partial<Record<keyof typeof breakpoints, string>>;
  /** Whether the container should be centered */
  centered?: boolean;
  /** Additional CSS classes */
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: () => ({
    sm: '100%',
    md: '720px',
    lg: '960px',
    xl: '1280px',
  }),
  padding: () => ({
    sm: '16px',
    md: '24px',
    lg: '32px',
  }),
  margin: () => ({
    sm: '0',
    md: '0',
    lg: '0',
  }),
  centered: true,
  class: '',
});

// Log ResponsiveContainer initialization
logger.debug('ResponsiveContainer initialized', {
  centered: props.centered,
  hasCustomClass: !!props.class,
  maxWidth: props.maxWidth,
  padding: props.padding,
  margin: props.margin,
});

// Generate inline styles
let containerStyles = {
  maxWidth: getResponsiveValue(props.maxWidth, '100%'),
  padding: getResponsiveValue(props.padding, '0'),
  margin: props.centered ? '0 auto' : getResponsiveValue(props.margin, '0'),
  width: '100%',
};
</script>

<style scoped>
.responsive-container {
  box-sizing: border-box;
}
</style>

<div class={`responsive-container ${props.class}`} style={containerStyles}>
  <slot />
</div>
