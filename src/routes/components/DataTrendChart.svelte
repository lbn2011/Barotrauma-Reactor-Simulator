<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import * as echarts from 'echarts';

// 组件属性
export let type: 'temperature' | 'turbine';
export let title: string;

// 图表实例
let chartInstance: echarts.ECharts | null = null;
let chartDom: HTMLElement;

// 初始化图表
onMount(() => {
  chartInstance = echarts.init(chartDom);
  updateChart();

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
});

// 销毁图表
onDestroy(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener('resize', handleResize);
});

// 处理窗口大小变化
function handleResize () {
  chartInstance?.resize();
}

// 更新图表
function updateChart () {
  if (!chartInstance) return;

  if (type === 'temperature') {
    // 温度趋势图配置
    const option = {
      title: {
        text: title,
        left: 'center',
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 10000,
        splitLine: {
          show: true,
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true,
      },
      series: [
        {
          name: '温度',
          type: 'line',
          data: [
            5000, 5200, 5500, 5800, 6000, 6200, 6500, 6800, 7000, 7200, 7500, 7800, 8000, 8200,
            8500, 8800, 9000, 9200, 9500, 9800, 10000, 10200, 10500, 10800,
          ],
          itemStyle: {
            color: '#ff4500',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 69, 0, 0.8)' },
              { offset: 1, color: 'rgba(255, 69, 0, 0.1)' },
            ]),
          },
        },
        {
          name: '融毁温',
          type: 'line',
          data: Array.from({ length: 24 }, () => 9000),
          itemStyle: {
            color: '#ff0000',
          },
          lineStyle: {
            type: 'dashed',
          },
          symbol: 'none',
        },
        {
          name: '过热温',
          type: 'line',
          data: Array.from({ length: 24 }, () => 7500),
          itemStyle: {
            color: '#ff8c00',
          },
          lineStyle: {
            type: 'dashed',
          },
          symbol: 'none',
        },
        {
          name: '满载温',
          type: 'line',
          data: Array.from({ length: 24 }, () => 6000),
          itemStyle: {
            color: '#ffd700',
          },
          lineStyle: {
            type: 'dashed',
          },
          symbol: 'none',
        },
      ],
    };

    chartInstance.setOption(option);
  } else if (type === 'turbine') {
    // 涡轮输出趋势图配置
    const option = {
      title: {
        text: title,
        left: 'center',
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        splitLine: {
          show: true,
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true,
      },
      series: [
        {
          name: '信号值',
          type: 'line',
          data: [
            20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 95, 90, 85, 80, 75,
            70, 65,
          ],
          itemStyle: {
            color: '#0066cc',
          },
        },
        {
          name: '目标值',
          type: 'line',
          data: [
            15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 90, 85, 80, 75, 70,
            65, 60,
          ],
          itemStyle: {
            color: '#00cc66',
          },
        },
        {
          name: '实际值',
          type: 'line',
          data: [
            10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 85, 80, 75, 70, 65,
            60, 55,
          ],
          itemStyle: {
            color: '#ffcc00',
          },
        },
      ],
    };

    chartInstance.setOption(option);
  }
}
</script>

<div
  bind:this={chartDom}
  class="w-full h-64 sm:h-80 md:h-96 bg-white rounded-lg shadow-md p-4"
></div>
