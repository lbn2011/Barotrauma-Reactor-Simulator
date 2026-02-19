<script lang="ts">
/**
 * ECharts Container Component
 * Used to wrap and configure Apache ECharts
 */
import { cn, type WithElementRef } from '@/lib/utils';
import type { HTMLAttributes } from 'svelte/elements';
import * as echarts from 'echarts';
import { logger } from '@/lib/utils/logger';
import { onMount } from 'svelte';

// Unique identifier
const uid = $props.id();

// Component properties
let {
  ref = $bindable(null), // Element reference
  id = uid, // Component ID
  class: className, // Custom class name
  option, // ECharts option
  style,
  ...restProps // Other HTML attributes
}: WithElementRef<HTMLAttributes<HTMLElement>> & {
  option: echarts.EChartsOption;
  style?: string;
} = $props();

// Derived chart ID
const chartId = $derived(`echart-${id || uid.replace(/:/g, '')}`);

// Chart instance
let chartInstance: echarts.ECharts | null = null;
let chartElement: HTMLElement | null = null;

// Initialize chart
onMount(() => {
  if (!chartElement) return;

  try {
    // Create chart instance
    chartInstance = echarts.init(chartElement);

    // Set option if provided
    if (option) {
      chartInstance.setOption(option);
    }

    // Handle resize
    const handleResize = () => {
      chartInstance?.resize();
    };

    window.addEventListener('resize', handleResize);

    logger.debug('EChartContainer', `Initialized with chart ID: ${chartId}`);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance?.dispose();
      chartInstance = null;
    };
  } catch (error) {
    logger.error('EChartContainer', `Failed to initialize chart: ${error}`);
  }
});

// Update chart when option changes
$effect(() => {
  if (chartInstance && option) {
    try {
      chartInstance.setOption(option, true);
      logger.debug('EChartContainer', `Updated chart option for: ${chartId}`);
    } catch (error) {
      logger.error('EChartContainer', `Failed to update chart option: ${error}`);
    }
  }
});

// Handle element reference
function handleElementRef (el: HTMLElement | null) {
  ref = el;
  chartElement = el;
}

// Update chart size when element size changes
$effect(() => {
  chartInstance?.resize();
});
</script>

<!--
  ECharts Container Component

  Features:
  - Wraps Apache ECharts
  - Provides unified chart styling and configuration
  - Supports element references
  - Applies custom class names
  - Handles chart resize automatically
  - Updates chart when option changes

  Technical Implementation:
  - Uses Svelte 5 new syntax ($props, $bindable, $derived)
  - Uses cn function to merge class names
  - Initializes ECharts instance on mount
  - Disposes ECharts instance on destroy
  - Handles window resize events
  - Reacts to option changes
-->

<div
  bind:this={handleElementRef}
  data-chart={chartId}
  data-slot="chart"
  class={cn('flex aspect-video justify-center overflow-visible text-xs w-full h-full', className)}
  style={style || 'width: 100%; height: 100%;'}
  {...restProps}
></div>
