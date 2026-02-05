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
  let powerRegulation: { powerLevel: number; targetPower: number };
  let controlRods: { position: number; insertionSpeed: number };

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
      position > 75 ? 'rgba(255, 99, 132, 0.8)' :    // 高插入深度时红色
      position > 50 ? 'rgba(255, 165, 0, 0.8)' :     // 中等插入深度时橙色
                    'rgba(54, 162, 235, 0.8)',      // 低插入深度时蓝色
      'rgba(200, 200, 200, 0.2)'                     // 剩余部分灰色
    ];
    
    if (controlRodChart.options.plugins && controlRodChart.options.plugins.title) {
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
          datasets: [{
            data: [50, 50], // 默认50%插入
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',  // 插入部分红色
              'rgba(200, 200, 200, 0.2)'   // 剩余部分灰色
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(200, 200, 200, 0.5)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%', // 创建甜甜圈效果
          plugins: {
            title: {
              display: true,
              text: '控制棒状态 - 位置: 50.0%'
            },
            legend: {
              position: 'bottom' as const,
            }
          } as any,
          circumference: 180, // 半圆仪表盘
          rotation: 270
        }
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
  .overview-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .overview-card {
    background-color: #1e1e1e;
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid #333;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .overview-card h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #00bcd4;
    font-size: 1.2rem;
  }

  .control-buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.2s;
  }

  .btn-primary {
    background-color: #00bcd4;
    color: #121212;
  }

  .btn-primary:hover {
    background-color: #00acc1;
  }

  .btn-secondary {
    background-color: #333;
    color: #e0e0e0;
  }

  .btn-secondary:hover {
    background-color: #444;
  }

  .btn-danger {
    background-color: #f44336;
    color: white;
  }

  .btn-danger:hover {
    background-color: #e53935;
  }

  .logs-container {
    max-height: 300px;
    overflow-y: auto;
    background-color: #121212;
    border-radius: 4px;
    padding: 1rem;
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

  .chart-container {
    height: 400px;
    margin-top: 1rem;
  }

  .chart-container-sm {
    height: 300px;
    margin-top: 1rem;
  }

  .alarms-container {
    background-color: #121212;
    border-radius: 4px;
    padding: 1rem;
  }

  .alarm-message {
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    background-color: rgba(244, 67, 54, 0.2);
    border-left: 4px solid #f44336;
    border-radius: 4px;
  }

  .crt-diagram {
    background-color: #121212;
    border-radius: 4px;
    padding: 1rem;
  }

  .system-status {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-top: 1rem;
  }

  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .status-value {
    font-weight: 600;
  }

  .status-online {
    color: #4caf50;
  }

  .status-offline {
    color: #f44336;
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

  .param-value {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0.5rem 0;
  }

  .param-label {
    font-size: 0.9rem;
    color: #aaa;
  }

  .save-load-container {
    margin-top: 1rem;
  }

  .input-group {
    margin-bottom: 1rem;
  }

  .input-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .input-group input {
    width: 100%;
    padding: 0.75rem;
    background-color: #121212;
    border: 1px solid #333;
    border-radius: 4px;
    color: #e0e0e0;
    font-family: monospace;
  }

  .input-group input:focus {
    outline: none;
    border-color: #00bcd4;
  }

  .load-message {
    margin-top: 1rem;
    padding: 0.75rem;
    border-radius: 4px;
    font-weight: 600;
  }

  .load-message.success {
    background-color: rgba(76, 175, 80, 0.2);
    color: #4caf50;
  }

  .load-message.error {
    background-color: rgba(244, 67, 54, 0.2);
    color: #f44336;
  }
</style>

<div class="overview-container">
  <!-- 模拟控制 -->
  <div class="overview-card" style="grid-column: 1 / -1;">
    <h2>模拟控制</h2>
    <div class="control-buttons">
      {#if !isRunning}
        <button class="btn btn-primary" on:click={startSimulation}>
          启动模拟
        </button>
      {:else}
        <button class="btn btn-secondary" on:click={stopSimulation}>
          停止模拟
        </button>
      {/if}
      <button class="btn btn-danger" on:click={resetSimulation}>
        重置模拟
      </button>
    </div>

    <!-- 核心参数 -->
    <div class="core-params">
      <div class="param-item">
        <div class="param-label">功率水平</div>
        <div class="param-value">{powerRegulation.powerLevel?.toFixed(1)}%</div>
      </div>
      <div class="param-item">
        <div class="param-label">堆芯温度</div>
        <div class="param-value">{core.temperature?.toFixed(1)}°C</div>
      </div>
      <div class="param-item">
        <div class="param-label">堆芯压力</div>
        <div class="param-value">{core.pressure?.toFixed(2)} MPa</div>
      </div>
    </div>

    <!-- 存档功能 -->
    <div class="save-load-container">
      <h3>存档管理</h3>
      <div class="control-buttons">
        <button class="btn btn-secondary" on:click={handleSave}>
          保存状态
        </button>
      </div>
      <div class="input-group">
        <label for="saveCode">存档码</label>
        <input type="text" id="saveCode" bind:value={saveCode} readonly />
      </div>
      <div class="input-group">
        <label for="loadCode">加载存档</label>
        <input
          type="text"
          id="loadCode"
          bind:value={loadCode}
          placeholder="输入存档码"
        />
      </div>
      <div class="control-buttons">
        <button class="btn btn-secondary" on:click={handleLoad}>
          加载状态
        </button>
      </div>
      {#if loadMessage}
        <div
          class={`load-message ${loadMessage.includes('成功') ? 'success' : 'error'}`}
        >
          {loadMessage}
        </div>
      {/if}
    </div>
  </div>

  <!-- 数据趋势图 -->
  <div class="overview-card" style="grid-column: 1 / -1;">
    <h2>18. 数据趋势图</h2>
    <div class="chart-container">
      <canvas bind:this={chartCanvas}></canvas>
    </div>
  </div>

  <!-- 控制棒状态图表 -->
  <div class="overview-card">
    <h2>1. 控制棒状态</h2>
    <div class="chart-container-sm">
      <canvas bind:this={controlRodChartCanvas}></canvas>
    </div>
    <div class="param-item" style="margin-top: 1rem; text-align: center;">
      <div class="param-label">插入速度</div>
      <div class="param-value">{controlRods?.insertionSpeed?.toFixed(2) || 0} %/s</div>
    </div>
  </div>

  <!-- 操作日志 -->
  <div class="overview-card">
    <h2>操作日志</h2>
    <div class="logs-container">
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
  </div>

  <!-- 警报CRT -->
  <div class="overview-card">
    <h2>20. 警报CRT</h2>
    <div class="alarms-container">
      {#if alarms && alarms.active && alarms.messages && alarms.messages.length > 0}
        {#each alarms.messages as message}
          <div class="alarm-message">
            {message}
          </div>
        {/each}
      {:else}
        <div
          class="alarm-message"
          style="background-color: rgba(76, 175, 80, 0.2); border-left-color: #4caf50;"
        >
          无活动警报
        </div>
      {/if}
    </div>
  </div>

  <!-- CRT示意图 -->
  <div class="overview-card">
    <h2>21. CRT示意图</h2>
    <div class="crt-diagram">
      <div class="status-item">
        <span>反应堆状态:</span>
        <span
          class="status-value {crtDiagram?.reactorStatus === 'NORMAL'
            ? 'status-online'
            : 'status-offline'}"
        >
          {crtDiagram?.reactorStatus}
        </span>
      </div>
      <div class="system-status">
        {#if crtDiagram?.systemStatus}
          {#each Object.entries(crtDiagram.systemStatus) as [system, status]}
            <div class="status-item">
              <span>{system}:</span>
              <span
                class="status-value {status === 'ONLINE'
                  ? 'status-online'
                  : 'status-offline'}"
              >
                {status}
              </span>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>
