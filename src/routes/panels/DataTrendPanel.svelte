<script lang="ts">
// 导入生命周期钩子
import { onMount, onDestroy } from 'svelte';
// 导入反应堆状态管理
import { reactorStore } from '../../lib/stores/reactorStore';
// 导入UI组件
import { Button } from '../../lib/components/ui/button';
import { Card, CardContent } from '../../lib/components/ui/card';
import { EChartContainer } from '../../lib/components/ui/chart';
import log from '@/lib/utils/logger';

// Component initialization logs
log.info('DataTrendPanel component initialized');

// 趋势数据
let trends = $state({
  timePoints: [] as number[],
  powerData: [] as number[],
  temperatureData: [] as number[],
  pressureData: [] as number[],
});

// 订阅状态变化
reactorStore.subscribe((state) => {
  log.trace('DataTrendPanel state updated', { trends: state.trends });
  trends = state.trends;
});

// ECharts选项
const chartOption = $derived({
  title: {
    text: '反应堆参数趋势',
    textStyle: {
      color: '#00bcd4',
    },
    left: 'center',
  },
  tooltip: {
    trigger: 'axis' as const,
    axisPointer: {
      type: 'cross' as const,
      label: {
        backgroundColor: '#6a7985',
      },
    },
  },
  legend: {
    data: ['功率水平 (%)', '堆芯温度 (°C)', '堆芯压力 (MPa)'],
    textStyle: {
      color: '#e0e0e0',
    },
    top: 30,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: [
    {
      type: 'category' as const,
      boundaryGap: false,
      data: trends.timePoints.map((t) => `t=${t}`),
      axisLabel: {
        color: '#aaa',
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  ],
  yAxis: [
    {
      type: 'value' as const,
      axisLabel: {
        color: '#aaa',
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  ],
  series: [
    {
      name: '功率水平 (%)',
      type: 'line' as const,
      stack: 'Total',
      areaStyle: {
        color: 'rgba(0, 188, 212, 0.5)',
      },
      emphasis: {
        focus: 'series' as const,
      },
      lineStyle: {
        color: '#00bcd4',
      },
      data: trends.powerData,
    },
    {
      name: '堆芯温度 (°C)',
      type: 'line' as const,
      stack: 'Total',
      areaStyle: {
        color: 'rgba(244, 67, 54, 0.5)',
      },
      emphasis: {
        focus: 'series' as const,
      },
      lineStyle: {
        color: '#f44336',
      },
      data: trends.temperatureData,
    },
    {
      name: '堆芯压力 (MPa)',
      type: 'line' as const,
      stack: 'Total',
      areaStyle: {
        color: 'rgba(76, 175, 80, 0.5)',
      },
      emphasis: {
        focus: 'series' as const,
      },
      lineStyle: {
        color: '#4caf50',
      },
      data: trends.pressureData,
    },
  ],
});

// 组件挂载时初始化
onMount(() => {
  log.debug('DataTrendPanel mounted successfully');
});

// 组件销毁时清理
onDestroy(() => {
  log.debug('DataTrendPanel destroyed');
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
      class="bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-300"
    >
      刷新数据
    </Button>
  </div>

  <div
    class="h-[500px] mb-8 bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-all duration-300"
  >
    <EChartContainer
      option={chartOption}
      style="width: 100%; height: 100%;"
    />
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
