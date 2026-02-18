<script lang="ts">
// 导入生命周期钩子
import { onMount, onDestroy } from 'svelte';
// 导入反应堆状态管理
import { reactorStore } from '../../lib/stores/reactorStore';
// 导入UI组件
import { Button } from '../../lib/components/ui/button';
import { Card, CardContent } from '../../lib/components/ui/card';
import log from '@/lib/utils/logger';

// Component initialization logs
log.info('DataTrendPanel component initialized');

// 趋势数据
let trends: {
  timePoints: number[];
  powerData: number[];
  temperatureData: number[];
  pressureData: number[];
};

// 订阅状态变化
reactorStore.subscribe((state) => {
  log.trace('DataTrendPanel state updated', { trends: state.trends });
  trends = state.trends;
  updateChartData();
});

// 图表相关变量
let chart: any = null;
let chartCanvas: HTMLCanvasElement | null = null;
let ChartJS: any = null;
let isChartLoaded: boolean = false;
let isLoading: boolean = false;

// 图表配置选项
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: '#e0e0e0',
      },
    },
    title: {
      display: true,
      text: '反应堆参数趋势',
      color: '#00bcd4',
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#aaa',
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
    },
    y: {
      beginAtZero: false,
      ticks: {
        color: '#aaa',
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
};

// 懒加载Chart.js库
async function loadChartJS() {
  if (isChartLoaded) return;

  log.info('Loading Chart.js library');
  isLoading = true;
  try {
    const chartModule = await import('chart.js');
    const { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } =
      chartModule;

    // 注册Chart.js必要组件
    Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

    ChartJS = Chart;
    isChartLoaded = true;
    log.success('Chart.js library loaded successfully');
  } catch (error) {
    log.error('Failed to load Chart.js:', error);
  } finally {
    isLoading = false;
    log.debug('Chart.js loading process completed');
  }
}

// 更新图表数据
async function updateChartData() {
  log.debug('Updating chart data', { hasCanvas: !!chartCanvas, hasTrends: !!trends });

  if (!chartCanvas || !trends) return;

  if (!isChartLoaded) {
    await loadChartJS();
  }

  if (!ChartJS) {
    log.warning('ChartJS not available, cannot update chart');
    return;
  }

  const chartData = {
    labels: trends.timePoints.map((t) => `t=${t}`),
    datasets: [
      {
        label: '功率水平 (%)',
        data: trends.powerData,
        borderColor: '#00bcd4',
        backgroundColor: 'rgba(0, 188, 212, 0.5)',
        tension: 0.1,
      },
      {
        label: '堆芯温度 (°C)',
        data: trends.temperatureData,
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.5)',
        tension: 0.1,
      },
      {
        label: '堆芯压力 (MPa)',
        data: trends.pressureData,
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.5)',
        tension: 0.1,
      },
    ],
  };

  if (chart) {
    chart.data = chartData;
    chart.update('none');
    log.debug('Chart updated successfully');
  } else {
    const ctx = chartCanvas.getContext('2d');
    if (ctx) {
      try {
        chart = new ChartJS(ctx, {
          type: 'line',
          data: chartData,
          options: chartOptions,
        });
        log.success('Chart created successfully');
      } catch (error) {
        log.error('Failed to create chart:', error);
      }
    } else {
      log.warning('Canvas context not available, cannot create chart');
    }
  }
}

// 组件挂载时加载图表
onMount(async () => {
  log.debug('DataTrendPanel mounting');
  await loadChartJS();
  updateChartData();
  log.debug('DataTrendPanel mounted successfully');
});

// 组件销毁时清理图表
onDestroy(() => {
  log.debug('DataTrendPanel destroying, cleaning up chart');
  if (chart) {
    try {
      chart.destroy();
      chart = null;
      log.success('Chart destroyed successfully');
    } catch (error) {
      log.error('Failed to destroy chart:', error);
    }
  }
});
</script>

<!--
  数据趋势图面板组件

  功能：
  - 显示反应堆关键参数的时间趋势
  - 提供实时数据可视化
  - 支持数据刷新和图表更新
  - 展示参数摘要和说明

  界面元素：
  - 趋势图表（功率、温度、压力）
  - 刷新按钮
  - 参数摘要卡片
  - 图表说明卡片
  - 加载状态指示器

  技术实现：
  - 使用Chart.js进行数据可视化
  - 懒加载Chart.js库以优化性能
  - 响应式设计
  - 实时数据更新
  - 错误处理和边界情况管理
-->

<div class="bg-background border border-border rounded-lg p-8 shadow-md">
  <h1 class="text-2xl font-bold text-primary mb-8">18. 数据趋势图</h1>

  <div class="flex gap-4 mb-8 flex-wrap">
    <Button
      variant="secondary"
      onclick={() => updateChartData()}
      class="bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-300"
    >
      刷新数据
    </Button>
  </div>

  <div
    class="h-[500px] mb-8 relative bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-all duration-300"
  >
    {#if isLoading}
      <div
        class="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-lg z-10"
      >
        <div
          class="w-10 h-10 border-3 border-muted border-t-primary rounded-full animate-spin mb-4"
        ></div>
        <p class="text-primary">加载图表库中...</p>
      </div>
    {/if}
    <canvas bind:this={chartCanvas} class="w-full h-full"></canvas>
  </div>

  <Card class="bg-card border-border mt-8 hover:border-primary/50 transition-all duration-300">
    <CardContent class="p-6">
      <h2 class="text-lg font-semibold text-primary mb-4">参数摘要</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div class="flex justify-between items-center">
          <span class="text-sm text-muted-foreground">最新功率水平</span>
          <span class="text-lg font-bold text-foreground">
            {trends.powerData.length > 0
              ? trends.powerData[trends.powerData.length - 1].toFixed(1)
              : '0.0'}%
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-muted-foreground">最新堆芯温度</span>
          <span class="text-lg font-bold text-foreground">
            {trends.temperatureData.length > 0
              ? trends.temperatureData[trends.temperatureData.length - 1].toFixed(1)
              : '0.0'}°C
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-muted-foreground">最新堆芯压力</span>
          <span class="text-lg font-bold text-foreground">
            {trends.pressureData.length > 0
              ? trends.pressureData[trends.pressureData.length - 1].toFixed(2)
              : '0.00'} MPa
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-muted-foreground">数据点数量</span>
          <span class="text-lg font-bold text-foreground">{trends.timePoints.length}</span>
        </div>
      </div>
    </CardContent>
  </Card>

  <Card class="bg-card border-border mt-8 hover:border-primary/50 transition-all duration-300">
    <CardContent class="p-6">
      <h2 class="text-lg font-semibold text-primary mb-4">图表说明</h2>
      <div class="text-foreground leading-relaxed">
        <p class="mb-4">此图表显示了反应堆关键参数随时间的变化趋势，包括：</p>
        <ul class="list-disc pl-6 mb-4 space-y-2">
          <li>功率水平 (%) - 显示反应堆的当前功率输出</li>
          <li>堆芯温度 (°C) - 显示反应堆堆芯的温度</li>
          <li>堆芯压力 (MPa) - 显示反应堆堆芯的压力</li>
        </ul>
        <p>
          数据每5秒更新一次，图表会自动调整以显示最新的数据点。通过观察这些趋势，可以更好地了解反应堆的运行状态和变化趋势。
        </p>
      </div>
    </CardContent>
  </Card>
</div>
