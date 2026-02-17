<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    reactorStore,
    saveState,
    loadState,
  } from '../lib/stores/reactorStore';
  import Chart from 'chart.js/auto';
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '../lib/components/ui/card';
  import { Button } from '../lib/components/ui/button';
  import { Input } from '../lib/components/ui/input';

  // 订阅状态
  let core: { temperature: number; pressure: number; waterLevel: number };
  let powerRegulation: {
    powerLevel: number;
    targetPower: number;
    reactivity: number;
  };
  let powerData: number[];
  let temperatureData: number[];
  let pressureData: number[];
  let timePoints: number[];

  const unsubscribe = reactorStore.subscribe((state) => {
    core = state.core;
    powerRegulation = state.powerRegulation;
    powerData = state.trends.powerData;
    temperatureData = state.trends.temperatureData;
    pressureData = state.trends.pressureData;
    timePoints = state.trends.timePoints;
  });

  // 图表相关
  let chart: Chart | null = null;
  let chartCanvas: HTMLCanvasElement | null = null;

  // 存档功能
  let saveCode: string = '';
  let loadCode: string = '';
  let loadMessage: string = '';

  function handleSave() {
    saveCode = saveState();
  }

  function handleLoad() {
    const success = loadState(loadCode);
    loadMessage = success ? '加载成功！' : '加载失败，请检查存档码是否正确。';

    // 3秒后清除消息
    setTimeout(() => {
      loadMessage = '';
    }, 3000);
  }

  // 更新图表数据
  function updateChartData() {
    if (!chart || !chartCanvas) return;

    chart.data.labels = timePoints.map((t) => `t=${t}`);
    chart.data.datasets = [
      {
        label: '功率水平 (%)',
        data: powerData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
      {
        label: '堆芯温度 (°C)',
        data: temperatureData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
      },
      {
        label: '堆芯压力 (MPa)',
        data: pressureData,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1,
      },
    ];

    chart.update('none');
  }

  // 每2秒更新一次图表
  let chartUpdateInterval: number;

  onMount(() => {
    if (chartCanvas) {
      try {
        chart = new Chart(chartCanvas, {
          type: 'line',
          data: {
            labels: [],
            datasets: [],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: true,
                text: '反应堆参数趋势',
              },
            },
            scales: {
              y: {
                beginAtZero: false,
              },
            },
          },
        });
      } catch (error) {
        console.error('Failed to initialize chart:', error);
      }
    }

    chartUpdateInterval = window.setInterval(updateChartData, 2000);
  });

  // 清理订阅
  onDestroy(() => {
    unsubscribe();
    clearInterval(chartUpdateInterval);
    if (chart) {
      try {
        chart.destroy();
        chart = null;
      } catch (error) {
        console.error('Failed to destroy chart:', error);
      }
    }
  });
</script>

<style>
  .chart-container {
    height: 400px;
    margin-top: 1rem;
  }

  .core-params {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-top: 1rem;
  }

  .param-item {
    text-align: center;
  }

  .param-label {
    font-size: 0.9rem;
    color: var(--text-color);
    opacity: 0.7;
  }

  .param-value {
    font-size: 1.5rem;
    font-weight: 600;
  }

  .load-message {
    margin-top: 1rem;
    padding: 0.75rem;
    border-radius: 4px;
    font-weight: 600;
  }
</style>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
  <!-- 反应堆核心参数 -->
  <Card class="lg:col-span-3">
    <CardHeader>
      <CardTitle class="text-light-primary dark:text-dark-primary">反应堆核心参数</CardTitle>
      <CardDescription>实时监控反应堆关键运行参数</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="text-center p-4 bg-light-card dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border">
          <div class="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">功率水平</div>
          <div class="text-2xl font-bold text-light-primary dark:text-dark-primary">
            {powerRegulation?.powerLevel?.toFixed(1)}%
          </div>
        </div>
        <div class="text-center p-4 bg-light-card dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border">
          <div class="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">堆芯温度</div>
          <div class="text-2xl font-bold text-light-destructive dark:text-dark-destructive">
            {core?.temperature?.toFixed(1)}°C
          </div>
        </div>
        <div class="text-center p-4 bg-light-card dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border">
          <div class="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">堆芯压力</div>
          <div class="text-2xl font-bold text-light-accent-foreground dark:text-dark-accent-foreground">
            {core?.pressure?.toFixed(2)} MPa
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="text-center p-4 bg-light-card dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border">
          <div class="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">反应性</div>
          <div class="text-xl font-bold text-light-primary dark:text-dark-primary">
            {powerRegulation?.reactivity?.toFixed(4)}
          </div>
        </div>
        <div class="text-center p-4 bg-light-card dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border">
          <div class="text-sm text-light-muted-foreground dark:text-dark-muted-foreground">水位</div>
          <div class="text-xl font-bold text-light-primary dark:text-dark-primary">
            {core?.waterLevel?.toFixed(1)}%
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- 数据趋势图 -->
  <Card class="lg:col-span-3">
    <CardHeader>
      <CardTitle class="text-light-primary dark:text-dark-primary">数据趋势图</CardTitle>
      <CardDescription>实时监控反应堆关键参数的变化趋势</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="chart-container">
        <canvas bind:this={chartCanvas}></canvas>
      </div>
    </CardContent>
  </Card>

  <!-- 存档管理 -->
  <Card class="lg:col-span-3">
    <CardHeader>
      <CardTitle class="text-light-primary dark:text-dark-primary">存档管理</CardTitle>
      <CardDescription>保存和加载模拟器状态</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex flex-wrap gap-4 mb-6">
        <Button
          class="bg-light-primary dark:bg-dark-primary hover:bg-light-primary/90 dark:hover:bg-dark-primary/90 text-light-primary-foreground dark:text-dark-primary-foreground"
          on:click={handleSave}
        >
          保存状态
        </Button>
        <Button
          class="bg-light-secondary dark:bg-dark-secondary hover:bg-light-secondary/90 dark:hover:bg-dark-secondary/90 text-light-secondary-foreground dark:text-dark-secondary-foreground"
          on:click={handleLoad}
        >
          加载状态
        </Button>
      </div>
      <div class="space-y-4">
        <div>
          <label
            for="save-code"
            class="block text-sm font-medium text-light-foreground dark:text-dark-foreground mb-1">存档码</label
          >
          <Input
            id="save-code"
            type="text"
            bind:value={saveCode}
            readonly
            class="bg-light-background dark:bg-dark-background border-light-border dark:border-dark-border text-light-foreground dark:text-dark-foreground"
          />
        </div>
        <div>
          <label
            for="load-code"
            class="block text-sm font-medium text-light-foreground dark:text-dark-foreground mb-1"
            >加载存档</label
          >
          <Input
            id="load-code"
            type="text"
            bind:value={loadCode}
            placeholder="输入存档码"
            class="bg-light-background dark:bg-dark-background border-light-border dark:border-dark-border text-light-foreground dark:text-dark-foreground"
          />
        </div>
        {#if loadMessage}
          <div
            class={`${loadMessage.includes('成功') ? 'bg-light-primary/20 dark:bg-dark-primary/20 text-light-primary dark:text-dark-primary' : 'bg-light-destructive/20 dark:bg-dark-destructive/20 text-light-destructive dark:text-dark-destructive'} p-3 rounded-lg font-semibold`}
          >
            {loadMessage}
          </div>
        {/if}
      </div>
    </CardContent>
  </Card>
</div>
