<script lang="ts">
  import { breakpoints, getResponsiveValue } from '@/utils/responsive';

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

  // Calculate responsive styles
  $: currentMaxWidth = getResponsiveValue(props.maxWidth, '100%');
  $: currentPadding = getResponsiveValue(props.padding, '0');
  $: currentMargin = getResponsiveValue(props.margin, '0');

  // Generate inline styles
  $: containerStyles = {
    maxWidth: currentMaxWidth,
    padding: currentPadding,
    margin: props.centered ? `0 auto` : currentMargin,
    width: '100%',
  };
</script>

<div class={`responsive-container ${props.class}`} style={containerStyles}>
  <slot />
</div>

<style scoped>
  .responsive-container {
    box-sizing: border-box;
  }
</style>
