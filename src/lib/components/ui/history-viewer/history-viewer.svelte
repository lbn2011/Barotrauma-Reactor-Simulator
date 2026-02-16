<script lang="ts">
  /**
   * 历史数据查看器组件
   * 用于显示和分析反应堆历史运行数据
   */
  import { Chart, registerables } from 'chart.js';
  import { Card, CardContent, CardHeader, CardTitle } from '../card';
  import { Button } from '../button';
  import { Input } from '../input';

  // 注册Chart.js组件
  Chart.register(...registerables);

  /**
   * 历史数据接口
   * @property timestamp 时间戳
   * @property parameters 参数记录
   */
  interface HistoryData {
    timestamp: number;
    parameters: Record<string, number>;
  }

  /**
   * 图表配置接口
   * @property id 参数ID
   * @property name 参数名称
   * @property color 图表颜色
   * @property unit 单位
   * @property visible 是否可见
   */
  interface ChartConfig {
    id: string;
    name: string;
    color: string;
    unit: string;
    visible: boolean;
  }

  // 组件属性
  export let historyData: HistoryData[] = []; // 历史数据数组
  export let chartConfigs: ChartConfig[] = []; // 图表配置数组
  export let timeRange: '1h' | '6h' | '24h' | '7d' = '6h'; // 时间范围
  export const refreshInterval: number = 5000; // 刷新间隔

  // 组件状态
  let chart: any = null; // Chart.js实例
  let chartCanvas: HTMLCanvasElement | null = null; // 图表画布元素
  let isLoading = false; // 加载状态
  let selectedParameters: string[] = chartConfigs
    .filter((c) => c.visible)
    .map((c) => c.id); // 选中的参数

  /**
   * 初始化图表
   * 创建或更新Chart.js实例
   */
  function initChart() {
    if (!chartCanvas) return;

    // 销毁现有图表实例
    if (chart) {
      try {
        chart.destroy();
        chart = null;
      } catch (error) {
        console.error('Failed to destroy chart:', error);
      }
    }

    // 准备图表标签
    const labels = historyData.map((data) => {
      const date = new Date(data.timestamp);
      return date.toLocaleTimeString();
    });

    // 准备数据集
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

    // 创建图表实例
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
                text: '时间',
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
                text: '数值',
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
    } catch (error) {
      console.error('Failed to create chart:', error);
    }
  }

  /**
   * 更新时间范围
   * @param range 新的时间范围
   */
  function updateTimeRange(range: '1h' | '6h' | '24h' | '7d') {
    timeRange = range;
    initChart(); // 重新初始化图表
  }

  /**
   * 切换参数可见性
   * @param configId 参数配置ID
   */
  function toggleParameterVisibility(configId: string) {
    const config = chartConfigs.find((c) => c.id === configId);
    if (config) {
      config.visible = !config.visible;
      initChart(); // 重新初始化图表
    }
  }

  /**
   * 导出数据为CSV格式
   */
  function exportData() {
    // 准备CSV表头
    const headers = [
      'Timestamp',
      ...chartConfigs.map((c) => `${c.name} (${c.unit})`),
    ];
    
    // 准备CSV行数据
    const rows = historyData.map((data) => {
      const row = [new Date(data.timestamp).toISOString()];
      chartConfigs.forEach((config) => {
        row.push((data.parameters[config.id] || 0).toString());
      });
      return row.join(',');
    });

    // 生成CSV内容
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // 创建下载链接
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reactor-history-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * 刷新数据
   */
  function refreshData() {
    isLoading = true;
    setTimeout(() => {
      initChart();
      isLoading = false;
    }, 1000);
  }

  /**
   * 组件挂载时初始化图表
   */
  function onMount() {
    initChart();
  }

  /**
   * 组件更新时重新初始化图表
   */
  function onUpdate() {
    initChart();
  }

  /**
   * 计算参数变化
   * @param parameterId 参数ID
   * @returns 变化百分比
   */
  function calculateChange(parameterId: string) {
    if (historyData.length < 2) return '无变化';
    const firstValue = historyData[0].parameters[parameterId] || 0;
    const lastValue =
      historyData[historyData.length - 1].parameters[parameterId] || 0;
    const change = lastValue - firstValue;
    const changePercent = firstValue !== 0 ? (change / firstValue) * 100 : 0;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)} (${sign}${changePercent.toFixed(1)}%)`;
  }
</script>

<!--
  历史数据查看器组件
  
  功能：
  - 显示反应堆历史运行数据
  - 支持多种时间范围选择
  - 可切换显示不同参数
  - 提供数据导出功能
  - 实时数据刷新
  - 数据变化趋势分析
  
  界面元素：
  - 时间范围选择按钮
  - 参数选择按钮
  - 刷新和导出按钮
  - 数据趋势图表
  - 数据统计卡片
  
  技术实现：
  - 使用Chart.js进行数据可视化
  - 响应式设计
  - CSV数据导出
  - 实时数据更新
  - 动态图表配置
-->

<div class="history-viewer">
  <Card>
    <CardHeader>
      <CardTitle class="text-xl font-semibold text-white"
        >历史数据查看</CardTitle
      >
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
          <Button
            variant="secondary"
            size="sm"
            on:click={refreshData}
            disabled={isLoading}
          >
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
        {#each chartConfigs.filter((c) => c.visible) as config}
          <div class="bg-gray-800 rounded-lg p-3">
            <div class="text-sm text-gray-400">{config.name}</div>
            <div class="text-xl font-semibold text-white">
              {historyData.length > 0
                ? (
                    historyData[historyData.length - 1].parameters[config.id] ||
                    0
                  ).toFixed(1)
                : '0.0'}
              <span class="text-sm font-normal text-gray-400">
                {config.unit}</span
              >
            </div>
            <div class="text-xs text-gray-400 mt-1">
              {historyData.length > 0 ? calculateChange(config.id) : '无数据'}
            </div>
          </div>
        {/each}
      </div>
    </CardContent>
  </Card>
</div>
