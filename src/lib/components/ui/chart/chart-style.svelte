<script lang="ts">
/**
 * Chart Style Component
 * Used to generate CSS styles for charts
 */
import { THEMES, type ChartConfig } from './chart-utils.js';
import { logger } from '@/lib/utils/logger';

// Component properties
let { id, config }: { id: string; config: ChartConfig } = $props();

// Derived color configuration
const colorConfig = $derived(
  config ? Object.entries(config).filter(([, config]) => config.theme || config.color) : null
);

// Derived theme content
const themeContents = $derived.by(() => {
  if (!colorConfig || !colorConfig.length) return;

  const themeContents = [];
  for (let [_theme, prefix] of Object.entries(THEMES)) {
    let content = `${prefix} [data-chart=${id}] {\n`;
    const color = colorConfig.map(([key, itemConfig]) => {
      const theme = _theme as keyof typeof itemConfig.theme;
      const color = itemConfig.theme?.[theme] || itemConfig.color;
      return color ? `\t--color-${key}: ${color};` : null;
    });

    content += color.join('\n') + '\n}';

    themeContents.push(content);
  }

  return themeContents.join('\n');
});

logger.debug('ChartStyle', `Initialized for chart ID: ${id}`);
</script>

<!--
  Chart Style Component

  Features:
  - Generates CSS styles based on chart configuration
  - Supports color configuration for different themes
  - Sets CSS variables for chart elements
  - Dynamically generates style tags

  Technical Implementation:
  - Uses Svelte 5 new syntax ($props, $derived)
  - Uses Object.entries to process configuration objects
  - Generates CSS variables
  - Conditionally renders style tags
  - Uses {#key} directive to ensure style updates
-->

{#if themeContents}
  {#key id}
    <svelte:element this={'style'}>
      {themeContents}
    </svelte:element>
  {/key}
{/if}
