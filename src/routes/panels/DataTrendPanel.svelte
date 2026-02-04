<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { reactorStore } from '../../lib/stores/reactorStore';

  // 订阅状态
  let trends: {
    timePoints: number[];
    powerData: number[];
    temperatureData: number[];
    pressureData: number[];
  };

  reactorStore.subscribe((state) => {
    trends = state.trends;
    updateChartData();
  });

  let chart: any = null;
  let chartCanvas: HTMLCanvasElement | null = null;
  let ChartJS: any = null;
  let isChartLoaded: boolean = false;
  let isLoading: boolean = false;

  // 图表配置
  const chartOptions = {
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
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  // 懒加载Chart.js
  async function loadChartJS() {
    if (isChartLoaded) return;

    isLoading = true;
    try {
      const chartModule = await import('chart.js');
      const {
        Chart,
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend,
      } = chartModule;

      // 注册Chart.js组件
      Chart.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend
      );

      ChartJS = Chart;
      isChartLoaded = true;
    } catch (error) {
      console.error('Failed to load Chart.js:', error);
    } finally {
      isLoading = false;
    }
  }

  // 更新图表数据
  async function updateChartData() {
    if (!chartCanvas || !trends) return;

    // 确保Chart.js已加载
    if (!isChartLoaded) {
      await loadChartJS();
    }

    if (!ChartJS) return;

    const chartData = {
      labels: trends.timePoints.map((t) => `t=${t}`),
      datasets: [
        {
          label: '功率水平 (%)',
          data: trends.powerData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
        },
        {
          label: '堆芯温度 (°C)',
          data: trends.temperatureData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1,
        },
        {
          label: '堆芯压力 (MPa)',
          data: trends.pressureData,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          tension: 0.1,
        },
      ],
    };

    if (chart) {
      chart.data = chartData;
      chart.update();
    } else {
      const ctx = chartCanvas.getContext('2d');
      if (ctx) {
        chart = new ChartJS(ctx, {
          type: 'line',
          data: chartData,
          options: chartOptions,
        });
      }
    }
  }

  onMount(async () => {
    await loadChartJS();
    updateChartData();
  });

  onDestroy(() => {
    if (chart) {
      chart.destroy();
    }
  });
</script>

<style>
  .panel-container {
    background-color: #1e1e1e;
    border-radius: 8px;
    padding: 2rem;
    border: 1px solid #333;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .panel-title {
    margin-top: 0;
    margin-bottom: 2rem;
    color: #00bcd4;
    font-size: 1.5rem;
  }

  .chart-container {
    height: 500px;
    margin-bottom: 2rem;
    position: relative;
  }

  .chart-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
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

  .btn-secondary {
    background-color: #333;
    color: #e0e0e0;
  }

  .btn-secondary:hover {
    background-color: #444;
  }

  .status-summary {
    background-color: #121212;
    border-radius: 6px;
    padding: 1.5rem;
    border: 1px solid #333;
    margin-top: 2rem;
  }

  .summary-title {
    color: #00bcd4;
    margin-top: 0;
    margin-bottom: 1rem;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .summary-label {
    color: #aaa;
    font-size: 0.9rem;
  }

  .summary-value {
    color: #e0e0e0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .chart-info {
    background-color: #121212;
    border-radius: 6px;
    padding: 1.5rem;
    border: 1px solid #333;
    margin-top: 2rem;
  }

  .info-title {
    color: #00bcd4;
    margin-top: 0;
    margin-bottom: 1rem;
  }

  .info-content {
    color: #e0e0e0;
    line-height: 1.5;
  }

  .chart-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(30, 30, 30, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    z-index: 10;
  }

  .chart-loading .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #333;
    border-top: 3px solid #00bcd4;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  .chart-loading p {
    color: #00bcd4;
    font-size: 1rem;
    margin: 0;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>

<div class="panel-container">
  <h1 class="panel-title">18. 数据趋势图</h1>

  <div class="chart-controls">
    <button class="btn btn-secondary" on:click={updateChartData}>
      刷新数据
    </button>
  </div>

  <div class="chart-container">
    {#if isLoading}
      <div class="chart-loading">
        <div class="loading-spinner"></div>
        <p>加载图表库中...</p>
      </div>
    {/if}
    <canvas bind:this={chartCanvas}></canvas>
  </div>

  <div class="status-summary">
    <h2 class="summary-title">参数摘要</h2>
    <div class="summary-grid">
      <div class="summary-item">
        <span class="summary-label">最新功率水平</span>
        <span class="summary-value">
          {trends.powerData.length > 0
            ? trends.powerData[trends.powerData.length - 1].toFixed(1)
            : '0.0'}%
        </span>
      </div>
      <div class="summary-item">
        <span class="summary-label">最新堆芯温度</span>
        <span class="summary-value">
          {trends.temperatureData.length > 0
            ? trends.temperatureData[trends.temperatureData.length - 1].toFixed(
                1
              )
            : '0.0'}°C
        </span>
      </div>
      <div class="summary-item">
        <span class="summary-label">最新堆芯压力</span>
        <span class="summary-value">
          {trends.pressureData.length > 0
            ? trends.pressureData[trends.pressureData.length - 1].toFixed(2)
            : '0.00'} MPa
        </span>
      </div>
      <div class="summary-item">
        <span class="summary-label">数据点数量</span>
        <span class="summary-value">{trends.timePoints.length}</span>
      </div>
    </div>
  </div>

  <div class="chart-info">
    <h2 class="info-title">图表说明</h2>
    <div class="info-content">
      <p>此图表显示了反应堆关键参数随时间的变化趋势，包括：</p>
      <ul style="margin: 1rem 0; padding-left: 1.5rem;">
        <li>功率水平 (%) - 显示反应堆的当前功率输出</li>
        <li>堆芯温度 (°C) - 显示反应堆堆芯的温度</li>
        <li>堆芯压力 (MPa) - 显示反应堆堆芯的压力</li>
      </ul>
      <p>
        数据每5秒更新一次，图表会自动调整以显示最新的数据点。通过观察这些趋势，可以更好地了解反应堆的运行状态和变化趋势。
      </p>
    </div>
  </div>
</div>
