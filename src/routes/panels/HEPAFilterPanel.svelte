<script lang="ts">
  import {
  reactorStore,
  toggleHepaFilters,
  setHepaFilterEfficiency,
} from '../../lib/stores/reactorStore';
  import { onMount } from 'svelte';

  let hepaFilters: any;

  // 订阅状态
  onMount(() => {
    const unsubscribe = reactorStore.subscribe((state) => {
      hepaFilters = state.hepaFilters;
    });

    return unsubscribe;
  });

  // 切换过滤器状态
  function handleToggle() {
    toggleHepaFilters();
  }

  // 调整过滤器效率
  function handleEfficiencyChange(e: Event) {
    const target = e.target as HTMLInputElement;
    setHepaFilterEfficiency(parseFloat(target.value));
  }
</script>

<style>
  .panel {
    background-color: #1e1e1e;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }

  .panel-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #00bcd4;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #333;
  }

  .control-group {
    margin-bottom: 2rem;
  }

  .control-label {
    display: block;
    font-size: 1rem;
    font-weight: 500;
    color: #e0e0e0;
    margin-bottom: 0.75rem;
  }

  .status-toggle {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .toggle-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .toggle-button.active {
    background-color: #4caf50;
    color: white;
  }

  .toggle-button.inactive {
    background-color: #f44336;
    color: white;
  }

  .status-indicator {
    font-size: 0.9rem;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-weight: 500;
  }

  .status-indicator.active {
    background-color: rgba(76, 175, 80, 0.2);
    color: #4caf50;
  }

  .status-indicator.inactive {
    background-color: rgba(244, 67, 54, 0.2);
    color: #f44336;
  }

  .slider-container {
    position: relative;
    margin: 1rem 0;
  }

  .slider {
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: #333;
    outline: none;
    -webkit-appearance: none;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #00bcd4;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .slider::-webkit-slider-thumb:hover {
    background: #00acc1;
  }

  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #00bcd4;
    cursor: pointer;
    border: none;
    transition: background-color 0.2s;
  }

  .slider::-moz-range-thumb:hover {
    background: #00acc1;
  }

  .value-display {
    font-size: 1.1rem;
    font-weight: 500;
    color: #00bcd4;
    text-align: center;
    margin-top: 0.5rem;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 2rem;
  }

  .info-card {
    background-color: #2d2d2d;
    padding: 1.5rem;
    border-radius: 6px;
    border-left: 4px solid #00bcd4;
  }

  .info-card-title {
    font-size: 0.9rem;
    color: #9e9e9e;
    margin-bottom: 0.5rem;
  }

  .info-card-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #e0e0e0;
  }

  .warning-box {
    background-color: rgba(255, 152, 0, 0.1);
    border: 1px solid #ff9800;
    border-radius: 6px;
    padding: 1.5rem;
    margin-top: 2rem;
  }

  .warning-title {
    font-size: 1rem;
    font-weight: 600;
    color: #ff9800;
    margin-bottom: 0.5rem;
  }

  .warning-text {
    font-size: 0.9rem;
    color: #e0e0e0;
    line-height: 1.4;
  }
</style>

<div class="panel">
  <h1 class="panel-title">19. HEPA过滤器控制</h1>

  <div class="control-group">
    <h2 class="control-label">HEPA过滤器状态</h2>
    <div class="status-toggle">
      <button
        class="toggle-button"
        class:active={hepaFilters?.status}
        class:inactive={!hepaFilters?.status}
        on:click={handleToggle}
      >
        {hepaFilters?.status ? '禁用' : '启用'}
      </button>
      <span
        class="status-indicator"
        class:active={hepaFilters?.status}
        class:inactive={!hepaFilters?.status}
      >
        {hepaFilters?.status ? '运行中' : '已停止'}
      </span>
    </div>
  </div>

  <div class="control-group">
    <h2 class="control-label">过滤器效率调节 (%)</h2>
    <div class="slider-container">
      <input
        type="range"
        class="slider"
        min="0"
        max="100"
        step="0.01"
        value={hepaFilters?.efficiency || 0}
        on:input={handleEfficiencyChange}
        disabled={!hepaFilters?.status}
      />
    </div>
    <div class="value-display">
      {hepaFilters?.efficiency.toFixed(2)}%
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <div class="info-card-title">系统状态</div>
      <div class="info-card-value">
        {hepaFilters?.status ? '在线' : '离线'}
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">过滤效率</div>
      <div class="info-card-value">
        {hepaFilters?.efficiency.toFixed(2)}%
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">状态指示</div>
      <div
        class="info-card-value"
        style="color: {hepaFilters?.status ? '#4caf50' : '#f44336'}"
      >
        {hepaFilters?.status ? '正常' : '关闭'}
      </div>
    </div>
  </div>

  <div class="warning-box">
    <h3 class="warning-title">操作警告</h3>
    <p class="warning-text">
      HEPA过滤器对放射性物质的过滤至关重要。请确保过滤器始终处于启用状态，
      并定期检查过滤效率，以确保系统正常运行。过滤效率应保持在99.97%以上。
    </p>
  </div>
</div>
