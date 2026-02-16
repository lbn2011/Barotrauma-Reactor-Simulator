<script lang="ts">
  import { Chart, registerables } from 'chart.js';
  import { Card, CardContent, CardHeader, CardTitle } from '../card';
  import { Button } from '../button';
  import { Input } from '../input';

  // 注册Chart.js组件
  Chart.register(...registerables);

  // 历史数据类型
  interface HistoryData {
    timestamp: number;
    parameters: Record<string, number>;
  }

  // 图表配置类型
  interface ChartConfig {
    id: string;
    name: string;
    color: string;
    unit: string;
    visible: boolean;
  }

  // 组件属性
  export let historyData: HistoryData[] = [];
  export let chartConfigs: ChartConfig[] = [];
  export let timeRange: '1h' | '6h' | '24h' | '7d' = '6h';
  export let refreshInterval: number = 5000; // 5秒

  // 内部状态
  let chart: Chart | null = null;
  let chartCanvas: HTMLCanvasElement | null = null;
  let isLoading = false;
  let selectedParameters: string[] = chartConfigs.filter(c => c.visible).map(c => c.id);

  // 初始化图表
  function initChart() {
    if (!chartCanvas) return;

    // 销毁现有图表
    if (chart) {
      chart.destroy();
    }

    // 准备图表数据
    const datasets = chartConfigs
      .filter(config => config.visible)
      .map(config => {
        return {
          label: `${config.name} (${config.unit})`,
          data: historyData.map(data => ({
            x: new Date(data.timestamp),
            y: data.parameters[config.id] || 0
          })),
          borderColor: config.color,
          backgroundColor: `${config.color}20`,
          borderWidth: 2,
          tension: 0.1,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 5
        };
      });

    // 创建图表
    chart = new Chart(chartCanvas, {
      type: 'line',
      data: {
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top' as const,
            labels: {
              color: '#ffffff'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#333333',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            type: 'time' as const,
            time: {
              unit: getTimeUnit(timeRange),
              displayFormats: {
                hour: 'HH:mm',
                minute: 'HH:mm',
                second: 'HH:mm:ss'
              }
            },
            title: {
              display: true,
              text: '时间',
              color: '#ffffff'
            },
            ticks: {
              color: '#cccccc'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            title: {
              display: true,
              text: '数值',
              color: '#ffffff'
            },
            ticks: {
              color: '#cccccc'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        }
      }
    });
  }

  // 获取时间单位
  function getTimeUnit(timeRange: string): string {
    switch (timeRange) {
      case '1h':
        return 'minute';
      case '6h':
        return 'hour';
      case '24h':
        return 'hour';
      case '7d':
        return 'day';
      default:
        return 'hour';
    }
  }

  // 更新时间范围
  function updateTimeRange(range: '1h' | '6h' | '24h' | '7d') {
    timeRange = range;
    initChart();
  }

  // 切换参数可见性
  function toggleParameterVisibility(configId: string) {
    const config = chartConfigs.find(c => c.id === configId);
    if (config) {
      config.visible = !config.visible;
      initChart();
    }
  }

  // 导出数据
  function exportData() {
    // 转换数据为CSV格式
    const headers = ['Timestamp', ...chartConfigs.map(c => `${c.name} (${c.unit})`)];
    const rows = historyData.map(data => {
      const row = [new Date(data.timestamp).toISOString()];
      chartConfigs.forEach(config => {
        row.push((data.parameters[config.id] || 0).toString());
      });
      return row.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reactor-history-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 刷新数据
  function refreshData() {
    isLoading = true;
    // 模拟数据刷新
    setTimeout(() => {
      initChart();
      isLoading = false;
    }, 1000);
  }

  // 组件挂载时初始化图表
  function onMount() {
    initChart();
  }

  // 组件更新时重新初始化图表
  function onUpdate() {
    initChart();
  }
</script>

<div class="history-viewer">
  <Card>
    <CardHeader>
      <CardTitle class="text-xl font-semibold text-white">历史数据查看</CardTitle>
    </CardHeader>
    <CardContent>
      <!-- 控制面板 -->
      <div class="flex flex-wrap items-center gap-4 mb-6">
        <!-- 时间范围选择 -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-300">时间范围:</span>
          <div class="flex gap-1">
            <Button
              variant={timeRange === '1h' ? 'default' : 'secondary'}
              size="sm"
              on:click={() => updateTimeRange('1h')}
            >
              1小时
            </Button>
            <Button
              variant={timeRange === '6h' ? 'default' : 'secondary'}
              size="sm"
              on:click={() => updateTimeRange('6h')}
            >
              6小时
            </Button>
            <Button
              variant={timeRange === '24h' ? 'default' : 'secondary'}
              size="sm"
              on:click={() => updateTimeRange('24h')}
            >
              24小时
            </Button>
            <Button
              variant={timeRange === '7d' ? 'default' : 'secondary'}
              size="sm"
              on:click={() => updateTimeRange('7d')}
            >
              7天
            </Button>
          </div>
        </div>

        <!-- 参数选择 -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-300">参数:</span>
          <div class="flex flex-wrap gap-2">
            {#each chartConfigs as config}
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

        <!-- 操作按钮 -->
        <div class="flex gap-2 ml-auto">
          <Button variant="secondary" size="sm" on:click={refreshData} disabled={isLoading}>
            {isLoading ? '刷新中...' : '刷新'}
          </Button>
          <Button variant="default" size="sm" on:click={exportData}>
            导出CSV
          </Button>
        </div>
      </div>

      <!-- 图表容器 -->
      <div class="h-96 w-full">
        <canvas bind:this={chartCanvas}></canvas>
      </div>

      <!-- 数据统计 -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {#each chartConfigs.filter(c => c.visible) as config}
          <div class="bg-gray-800 rounded-lg p-3">
            <div class="text-sm text-gray-400">{config.name}</div>
            <div class="text-xl font-semibold text-white">
              {historyData.length > 0
                ? (historyData[historyData.length - 1].parameters[config.id] || 0).toFixed(1)
                : '0.0'}
              <span class="text-sm font-normal text-gray-400"> {config.unit}</span>
            </div>
            <div class="text-xs text-gray-400 mt-1">
              {historyData.length > 0
                ? calculateChange(config.id)
                : '无数据'}
            </div>
          </div>
        {/each}
      </div>
    </CardContent>
  </Card>
</div>

<script>
  // 计算参数变化
  function calculateChange(parameterId: string) {
    if (historyData.length < 2) return '无变化';
    const firstValue = historyData[0].parameters[parameterId] || 0;
    const lastValue = historyData[historyData.length - 1].parameters[parameterId] || 0;
    const change = lastValue - firstValue;
    const changePercent = firstValue !== 0 ? (change / firstValue) * 100 : 0;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)} (${sign}${changePercent.toFixed(1)}%)`;
  }

  // 监听组件挂载和更新
  import { onMount, onUpdate } from 'svelte';
  onMount(onMount);
  onUpdate(onUpdate);
</script>
