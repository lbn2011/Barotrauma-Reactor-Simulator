<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    reactorStore,
    startSimulation,
    stopSimulation,
    resetSimulation,
    saveState,
    loadState,
  } from '../lib/stores/reactorStore';
  import Chart from 'chart.js/auto';
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '../lib/components/ui/card';
  import { Button } from '../lib/components/ui/button';
  import { Input } from '../lib/components/ui/input';

  // 订阅状态
  let isRunning: boolean;
  let logs: { timestamp: number; message: string }[];
  let powerData: number[];
  let temperatureData: number[];
  let pressureData: number[];
  let timePoints: number[];
  let alarms: { active: boolean; messages: string[] };
  let crtDiagram: {
    reactorStatus: string;
    systemStatus: Record<string, string>;
  };
  let core: { temperature: number; pressure: number; waterLevel: number };
  let powerRegulation: {
    powerLevel: number;
    targetPower: number;
    reactivity: number;
  };
  let controlRods: { position: number; insertionSpeed: number };
  let physics: {
    masses: {
      M_reactor: number;
      M_condenser: number;
      M_deaerator: number;
    };
    neutron: {
      Xe: number;
      I: number;
      φ: number;
      Σ_f: number;
    };
    reactivity: {
      void: number;
      xenon: number;
      controlRod: number;
      total: number;
    };
  };

  const unsubscribe = reactorStore.subscribe((state) => {
    isRunning = state.isRunning;
    logs = state.logs;
    powerData = state.trends.powerData;
    temperatureData = state.trends.temperatureData;
    pressureData = state.trends.pressureData;
    timePoints = state.trends.timePoints;
    alarms = state.alarms;
    crtDiagram = state.crtDiagram;
    core = state.core;
    powerRegulation = state.powerRegulation;
    controlRods = state.controlRods;
    physics = state.physics;
  });

  // 图表相关
  let chart: Chart | null = null;
  let chartCanvas: HTMLCanvasElement | null = null;
  let controlRodChart: Chart | null = null;
  let controlRodChartCanvas: HTMLCanvasElement | null = null;

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
    if (!chart) return;

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

    chart.update();
  }

  // 每2秒更新一次图表
  let chartUpdateInterval: number;

  // 更新控制棒图表数据
  function updateControlRodChart() {
    if (!controlRodChart) return;

    const position = controlRods?.position || 50;
    const remaining = 100 - position;

    // 更新数据集
    controlRodChart.data.datasets[0].data = [position, remaining];
    controlRodChart.data.datasets[0].backgroundColor = [
      position > 75
        ? 'rgba(255, 99, 132, 0.8)' // 高插入深度时红色
        : position > 50
          ? 'rgba(255, 165, 0, 0.8)' // 中等插入深度时橙色
          : 'rgba(54, 162, 235, 0.8)', // 低插入深度时蓝色
      'rgba(200, 200, 200, 0.2)', // 剩余部分灰色
    ];

    if (
      controlRodChart.options.plugins &&
      controlRodChart.options.plugins.title
    ) {
      controlRodChart.options.plugins.title.text = `控制棒状态 - 位置: ${position.toFixed(1)}%`;
    }
    controlRodChart.update();
  }

  onMount(() => {
    if (chartCanvas) {
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
    }

    // 初始化控制棒状态图表
    if (controlRodChartCanvas) {
      controlRodChart = new Chart(controlRodChartCanvas, {
        type: 'doughnut',
        data: {
          labels: ['插入深度', '剩余'],
          datasets: [
            {
              data: [50, 50], // 默认50%插入
              backgroundColor: [
                'rgba(255, 99, 132, 0.8)', // 插入部分红色
                'rgba(200, 200, 200, 0.2)', // 剩余部分灰色
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(200, 200, 200, 0.5)',
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%', // 创建甜甜圈效果
          plugins: {
            title: {
              display: true,
              text: '控制棒状态 - 位置: 50.0%',
            },
            legend: {
              position: 'bottom' as const,
            },
          } as any,
          circumference: 180, // 半圆仪表盘
          rotation: 270,
        },
      });
    }

    chartUpdateInterval = window.setInterval(updateChartData, 2000);
    // 每秒更新控制棒图表
    setInterval(updateControlRodChart, 1000);
  });

  // 清理订阅
  onDestroy(() => {
    unsubscribe();
    clearInterval(chartUpdateInterval);
    if (chart) {
      chart.destroy();
    }
    if (controlRodChart) {
      controlRodChart.destroy();
    }
  });
</script>

<style>
  .chart-container {
    height: 400px;
    margin-top: 1rem;
  }

  .chart-container-sm {
    height: 300px;
    margin-top: 1rem;
  }

  .logs-container {
    max-height: 300px;
    overflow-y: auto;
    font-family: monospace;
    font-size: 0.9rem;
  }

  .log-entry {
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #333;
  }

  .log-entry:last-child {
    border-bottom: none;
  }

  .system-status {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
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
    color: #aaa;
  }

  .param-value {
    font-size: 1.5rem;
    font-weight: 600;
  }

  .status-online {
    color: #4caf50;
  }

  .status-offline {
    color: #f44336;
  }

  .status-value {
    font-weight: 600;
  }

  .alarm-message {
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    border-radius: 4px;
  }

  .load-message {
    margin-top: 1rem;
    padding: 0.75rem;
    border-radius: 4px;
    font-weight: 600;
  }
</style>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
  <!-- 模拟控制 -->
  <Card class="lg:col-span-3">
    <CardHeader>
      <CardTitle class="text-cyan-400">模拟控制</CardTitle>
      <CardDescription>控制模拟的启动、停止和重置</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex flex-wrap gap-4 mb-6">
        {#if !isRunning}
          <Button
            class="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold"
            on:click={startSimulation}
          >
            启动模拟
          </Button>
        {:else}
          <Button
            class="bg-gray-700 hover:bg-gray-600 text-white"
            on:click={stopSimulation}
          >
            停止模拟
          </Button>
        {/if}
        <Button
          class="bg-red-600 hover:bg-red-700 text-white"
          on:click={resetSimulation}
        >
          重置模拟
        </Button>
      </div>

      <!-- 核心参数 -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="text-center p-4 bg-gray-800 rounded-lg">
          <div class="text-sm text-gray-400">功率水平</div>
          <div class="text-2xl font-bold text-cyan-400">
            {powerRegulation?.powerLevel?.toFixed(1)}%
          </div>
        </div>
        <div class="text-center p-4 bg-gray-800 rounded-lg">
          <div class="text-sm text-gray-400">堆芯温度</div>
          <div class="text-2xl font-bold text-red-400">
            {core?.temperature?.toFixed(1)}°C
          </div>
        </div>
        <div class="text-center p-4 bg-gray-800 rounded-lg">
          <div class="text-sm text-gray-400">堆芯压力</div>
          <div class="text-2xl font-bold text-blue-400">
            {core?.pressure?.toFixed(2)} MPa
          </div>
        </div>
      </div>

      <!-- 反应性参数 -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="text-center p-4 bg-gray-800 rounded-lg">
          <div class="text-sm text-gray-400">总反应性</div>
          <div class="text-xl font-bold text-purple-400">
            {physics?.reactivity?.total?.toFixed(4)}
          </div>
        </div>
        <div class="text-center p-4 bg-gray-800 rounded-lg">
          <div class="text-sm text-gray-400">水位</div>
          <div class="text-xl font-bold text-green-400">
            {core?.waterLevel?.toFixed(1)}%
          </div>
        </div>
      </div>

      <!-- 存档功能 -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-300">存档管理</h3>
        <div class="flex gap-4">
          <Button
            class="bg-gray-700 hover:bg-gray-600 text-white"
            on:click={handleSave}
          >
            保存状态
          </Button>
          <Button
            class="bg-gray-700 hover:bg-gray-600 text-white"
            on:click={handleLoad}
          >
            加载状态
          </Button>
        </div>
        <div class="space-y-2">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1"
              >存档码</label
            >
            <Input
              type="text"
              bind:value={saveCode}
              readonly
              class="bg-gray-900 border-gray-700 text-gray-300 font-mono"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1"
              >加载存档</label
            >
            <Input
              type="text"
              bind:value={loadCode}
              placeholder="输入存档码"
              class="bg-gray-900 border-gray-700 text-gray-300 font-mono"
            />
          </div>
        </div>
        {#if loadMessage}
          <div
            class={`${loadMessage.includes('成功') ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'} p-3 rounded-lg font-semibold`}
          >
            {loadMessage}
          </div>
        {/if}
      </div>
    </CardContent>
  </Card>

  <!-- 数据趋势图 -->
  <Card class="lg:col-span-3">
    <CardHeader>
      <CardTitle class="text-cyan-400">数据趋势图</CardTitle>
      <CardDescription>实时监控反应堆关键参数的变化趋势</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="chart-container">
        <canvas bind:this={chartCanvas}></canvas>
      </div>
    </CardContent>
  </Card>

  <!-- 控制棒状态图表 -->
  <Card>
    <CardHeader>
      <CardTitle class="text-cyan-400">控制棒状态</CardTitle>
      <CardDescription>监控控制棒的位置和状态</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="chart-container-sm">
        <canvas bind:this={controlRodChartCanvas}></canvas>
      </div>
      <div class="text-center mt-4">
        <div class="text-sm text-gray-400">插入速度</div>
        <div class="text-xl font-bold text-cyan-400">
          {controlRods?.insertionSpeed?.toFixed(2) || 0} %/s
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- 物理模型参数 -->
  <Card>
    <CardHeader>
      <CardTitle class="text-cyan-400">物理模型参数</CardTitle>
      <CardDescription>监控反应堆的物理状态</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-gray-400">氙-135浓度:</span>
          <span class="font-mono text-purple-400"
            >{physics?.neutron?.Xe?.toFixed(6)}</span
          >
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-400">碘-135浓度:</span>
          <span class="font-mono text-purple-400"
            >{physics?.neutron?.I?.toFixed(6)}</span
          >
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-400">中子通量:</span>
          <span class="font-mono text-yellow-400"
            >{physics?.neutron?.φ?.toExponential(2)}</span
          >
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-400">空泡反应性:</span>
          <span class="font-mono text-blue-400"
            >{physics?.reactivity?.void?.toFixed(6)}</span
          >
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-400">氙中毒反应性:</span>
          <span class="font-mono text-blue-400"
            >{physics?.reactivity?.xenon?.toFixed(6)}</span
          >
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-400">控制棒反应性:</span>
          <span class="font-mono text-blue-400"
            >{physics?.reactivity?.controlRod?.toFixed(6)}</span
          >
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- 操作日志 -->
  <Card>
    <CardHeader>
      <CardTitle class="text-cyan-400">操作日志</CardTitle>
      <CardDescription>查看系统的操作历史</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="logs-container bg-gray-900 p-4 rounded-lg">
        {#if logs && logs.length > 0}
          {#each logs.slice().reverse() as log}
            <div class="log-entry">
              [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
            </div>
          {/each}
        {:else}
          <div class="log-entry">无操作日志</div>
        {/if}
      </div>
    </CardContent>
  </Card>

  <!-- 警报CRT -->
  <Card>
    <CardHeader>
      <CardTitle class="text-cyan-400">警报CRT</CardTitle>
      <CardDescription>监控系统的警报状态</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-2">
        {#if alarms && alarms.active && alarms.messages && alarms.messages.length > 0}
          {#each alarms.messages as message}
            <div class="alarm-message bg-red-900/30 border-l-4 border-red-500">
              {message}
            </div>
          {/each}
        {:else}
          <div
            class="alarm-message bg-green-900/30 border-l-4 border-green-500"
          >
            无活动警报
          </div>
        {/if}
      </div>
    </CardContent>
  </Card>

  <!-- CRT示意图 -->
  <Card>
    <CardHeader>
      <CardTitle class="text-cyan-400">系统状态概览</CardTitle>
      <CardDescription>查看各系统的运行状态</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <span class="text-gray-400">反应堆状态:</span>
          <span
            class={`font-semibold ${crtDiagram?.reactorStatus === 'NORMAL' ? 'text-green-400' : 'text-red-400'}`}
          >
            {crtDiagram?.reactorStatus}
          </span>
        </div>
        <div class="system-status">
          {#if crtDiagram?.systemStatus}
            {#each Object.entries(crtDiagram.systemStatus) as [system, status]}
              <div class="flex justify-between items-center">
                <span class="text-gray-400">{system}:</span>
                <span
                  class={`font-semibold ${status === 'ONLINE' ? 'text-green-400' : 'text-red-400'}`}
                >
                  {status}
                </span>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- 功率调节状态 -->
  <Card>
    <CardHeader>
      <CardTitle class="text-cyan-400">功率调节状态</CardTitle>
      <CardDescription>监控功率调节系统的运行状态</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-gray-400">当前功率:</span>
          <span class="font-bold text-yellow-400"
            >{powerRegulation?.powerLevel?.toFixed(1)}%</span
          >
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-400">目标功率:</span>
          <span class="font-bold text-blue-400"
            >{powerRegulation?.targetPower?.toFixed(1)}%</span
          >
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-400">功率偏差:</span>
          <span class="font-bold text-purple-400"
            >{(
              powerRegulation?.targetPower - powerRegulation?.powerLevel
            )?.toFixed(1)}%</span
          >
        </div>
      </div>
    </CardContent>
  </Card>
</div>
