<script lang="ts" module>
export interface HistoryData {
  timestamp: number;
  parameters: Record<string, number>;
}

export interface ChartConfig {
  id: string;
  name: string;
  color: string;
  unit: string;
  visible: boolean;
}

export interface HistoryViewerProps {
  historyData?: HistoryData[];
  chartConfigs?: ChartConfig[];
  timeRange?: '1h' | '6h' | '24h' | '7d';
}
</script>

<script lang="ts">
/**
 * History data viewer component
 * Used to display and analyze reactor historical operation data
 */
import { Chart, registerables } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { Button } from '../button';
import { logger } from '../../../utils/logger';

// Register Chart.js components
Chart.register(...registerables);

/**
 * History data interface
 * @property timestamp Timestamp
 * @property parameters Parameter records
 */
interface HistoryData {
  timestamp: number;
  parameters: Record<string, number>;
}

/**
 * Chart configuration interface
 * @property id Parameter ID
 * @property name Parameter name
 * @property color Chart color
 * @property unit Unit
 * @property visible Whether visible
 */
interface ChartConfig {
  id: string;
  name: string;
  color: string;
  unit: string;
  visible: boolean;
}

// Component properties
export let historyData: HistoryData[] = []; // History data array
export let chartConfigs: ChartConfig[] = []; // Chart configuration array
export let timeRange: '1h' | '6h' | '24h' | '7d' = '6h'; // Time range
export const refreshInterval: number = 5000; // Refresh interval

// Component state
let chart: any = null; // Chart.js instance
let chartCanvas: HTMLCanvasElement | null = null; // Chart canvas element
let isLoading = false; // Loading state

logger.debug('HistoryViewer', 'Component initialized');
logger.debug('HistoryViewer', `Initial time range: ${timeRange}`);
logger.debug('HistoryViewer', `Initial chart configs: ${chartConfigs.length}`);
logger.debug('HistoryViewer', `Initial history data: ${historyData.length} records`);

/**
 * Initialize chart
 * Create or update Chart.js instance
 */
function initChart() {
  if (!chartCanvas) return;

  logger.debug('HistoryViewer', 'Initializing chart');

  // Destroy existing chart instance
  if (chart) {
    try {
      chart.destroy();
      chart = null;
      logger.debug('HistoryViewer', 'Chart instance destroyed');
    } catch (error) {
      logger.error('HistoryViewer', 'Failed to destroy chart:', error);
    }
  }

  // Prepare chart labels
  const labels = historyData.map((data) => {
    const date = new Date(data.timestamp);
    return date.toLocaleTimeString();
  });

  // Prepare datasets
  const datasets = chartConfigs
    .filter((config) => config.visible)
    .map((config) => {
      return {
        label: `${config.name} (${config.unit})`,
        data: historyData.map((data) => data.parameters[config.id] || 0),
        borderColor: config.color,
        backgroundColor: `${config.color}20`,
        borderWidth: 2,
        tension: 0.1,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 5,
      };
    });

  logger.debug('HistoryViewer', `Chart prepared with ${datasets.length} datasets`);

  // Create chart instance
  try {
    chart = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top' as const,
            labels: {
              color: '#ffffff',
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#333333',
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time',
              color: '#ffffff',
            },
            ticks: {
              color: '#cccccc',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Value',
              color: '#ffffff',
            },
            ticks: {
              color: '#cccccc',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
        },
      },
    });
    logger.debug('HistoryViewer', 'Chart instance created successfully');
  } catch (error) {
    logger.error('HistoryViewer', 'Failed to create chart:', error);
  }
}

/**
 * Update time range
 * @param range New time range
 */
function updateTimeRange(range: '1h' | '6h' | '24h' | '7d') {
  logger.info('HistoryViewer', `Updating time range to ${range}`);
  timeRange = range;
  initChart(); // Reinitialize chart
}

/**
 * Toggle parameter visibility
 * @param configId Parameter configuration ID
 */
function toggleParameterVisibility(configId: string) {
  const config = chartConfigs.find((c) => c.id === configId);
  if (config) {
    config.visible = !config.visible;
    logger.info(
      'HistoryViewer',
      `Toggled parameter visibility: ${config.name} ${config.visible ? 'visible' : 'hidden'}`
    );
    initChart(); // Reinitialize chart
  }
}

/**
 * Export data to CSV format
 */
function exportData() {
  logger.info('HistoryViewer', 'Exporting data to CSV');
  try {
    // Prepare CSV headers
    const headers = ['Timestamp', ...chartConfigs.map((c) => `${c.name} (${c.unit})`)];

    // Prepare CSV row data
    const rows = historyData.map((data) => {
      const row = [new Date(data.timestamp).toISOString()];
      chartConfigs.forEach((config) => {
        row.push((data.parameters[config.id] || 0).toString());
      });
      return row.join(',');
    });

    // Generate CSV content
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reactor-history-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logger.success('HistoryViewer', 'Data exported successfully as CSV');
  } catch (error) {
    logger.error('HistoryViewer', 'Failed to export data:', error);
  }
}

/**
 * Refresh data
 */
function refreshData() {
  logger.info('HistoryViewer', 'Refreshing data');
  isLoading = true;
  setTimeout(() => {
    initChart();
    isLoading = false;
    logger.debug('HistoryViewer', 'Data refreshed');
  }, 1000);
}

/**
 * Calculate parameter change
 * @param parameterId Parameter ID
 * @returns Change percentage
 */
function calculateChange(parameterId: string) {
  if (historyData.length < 2) return 'No change';
  const firstValue = historyData[0].parameters[parameterId] || 0;
  const lastValue = historyData[historyData.length - 1].parameters[parameterId] || 0;
  const change = lastValue - firstValue;
  const changePercent = firstValue !== 0 ? (change / firstValue) * 100 : 0;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)} (${sign}${changePercent.toFixed(1)}%)`;
}
</script>

<!--
  History Data Viewer Component

  Features:
  - Displays reactor historical operation data
  - Supports multiple time range selections
  - Can switch between different parameters
  - Provides data export functionality
  - Real-time data refresh
  - Data change trend analysis

  UI Elements:
  - Time range selection buttons
  - Parameter selection buttons
  - Refresh and export buttons
  - Data trend chart
  - Data statistics cards

  Technical Implementation:
  - Uses Chart.js for data visualization
  - Responsive design
  - CSV data export
  - Real-time data updates
  - Dynamic chart configuration
-->

<div class="history-viewer">
  <Card>
    <CardHeader>
      <CardTitle class="text-xl font-semibold text-white">History Data Viewer</CardTitle>
    </CardHeader>
    <CardContent>
      <!-- Control Panel -->
      <div class="flex flex-wrap items-center gap-4 mb-6">
        <!-- Time Range Selection -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-300">Time Range:</span>
          <div class="flex gap-1">
            <Button
              variant={timeRange === '1h' ? 'default' : 'secondary'}
              size="sm"
              on:click={() => updateTimeRange('1h')}
            >
              1h
            </Button>
            <Button
              variant={timeRange === '6h' ? 'default' : 'secondary'}
              size="sm"
              on:click={() => updateTimeRange('6h')}
            >
              6h
            </Button>
            <Button
              variant={timeRange === '24h' ? 'default' : 'secondary'}
              size="sm"
              on:click={() => updateTimeRange('24h')}
            >
              24h
            </Button>
            <Button
              variant={timeRange === '7d' ? 'default' : 'secondary'}
              size="sm"
              on:click={() => updateTimeRange('7d')}
            >
              7d
            </Button>
          </div>
        </div>

        <!-- Parameter Selection -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-300">Parameters:</span>
          <div class="flex flex-wrap gap-2">
            {#each chartConfigs as config (config.id)}
              <Button
                variant={config.visible ? 'default' : 'secondary'}
                size="sm"
                on:click={() => toggleParameterVisibility(config.id)}
                style={`--tw-bg-opacity: 1; --tw-text-opacity: 1; background-color: ${config.visible ? config.color : ''}; color: ${config.visible ? '#ffffff' : ''}`}
              >
                {config.name}
              </Button>
            {/each}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 ml-auto">
          <Button variant="secondary" size="sm" on:click={refreshData} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="default" size="sm" on:click={exportData}>Export CSV</Button>
        </div>
      </div>

      <!-- Chart Container -->
      <div class="h-96 w-full">
        <canvas bind:this={chartCanvas}></canvas>
      </div>

      <!-- Data Statistics -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {#each chartConfigs.filter((c) => c.visible) as config (config.id)}
          <div class="bg-gray-800 rounded-lg p-3">
            <div class="text-sm text-gray-400">{config.name}</div>
            <div class="text-xl font-semibold text-white">
              {historyData.length > 0
                ? (historyData[historyData.length - 1].parameters[config.id] || 0).toFixed(1)
                : '0.0'}
              <span class="text-sm font-normal text-gray-400"> {config.unit}</span>
            </div>
            <div class="text-xs text-gray-400 mt-1">
              {historyData.length > 0 ? calculateChange(config.id) : 'No data'}
            </div>
          </div>
        {/each}
      </div>
    </CardContent>
  </Card>
</div>
