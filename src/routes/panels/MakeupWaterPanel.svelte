<script lang="ts">
  import {
    reactorStore,
    toggleMakeUpWater,
    setMakeUpWaterFlowRate,
  } from '../../lib/stores/reactorStore';
  import { onMount } from 'svelte';

  let makeUpWater: any;

  // 订阅状态
  onMount(() => {
    const unsubscribe = reactorStore.subscribe((state) => {
      makeUpWater = state.makeUpWater;
    });

    return unsubscribe;
  });

  // 切换补水系统状态
  function handleToggle() {
    toggleMakeUpWater();
  }

  // 调整补水流量
  function handleFlowRateChange(e: Event) {
    const target = e.target as HTMLInputElement;
    setMakeUpWaterFlowRate(parseFloat(target.value));
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
</style>

<div class="panel">
  <h1 class="panel-title">16. 补水系统</h1>

  <div class="control-group">
    <h2 class="control-label">补水系统状态</h2>
    <div class="status-toggle">
      <button
        class="toggle-button"
        class:active={makeUpWater?.status}
        class:inactive={!makeUpWater?.status}
        on:click={handleToggle}
      >
        {makeUpWater?.status ? '禁用' : '启用'}
      </button>
      <span
        class="status-indicator"
        class:active={makeUpWater?.status}
        class:inactive={!makeUpWater?.status}
      >
        {makeUpWater?.status ? '运行中' : '已停止'}
      </span>
    </div>
  </div>

  <div class="control-group">
    <h2 class="control-label">补水流量调节 (%)</h2>
    <div class="slider-container">
      <input
        type="range"
        class="slider"
        min="0"
        max="100"
        step="1"
        value={makeUpWater?.flowRate || 0}
        on:input={handleFlowRateChange}
        disabled={!makeUpWater?.status}
      />
    </div>
    <div class="value-display">
      {makeUpWater?.flowRate.toFixed(0)}%
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <div class="info-card-title">系统状态</div>
      <div class="info-card-value">
        {makeUpWater?.status ? '在线' : '离线'}
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">补水流量</div>
      <div class="info-card-value">
        {makeUpWater?.flowRate.toFixed(0)}%
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">状态指示</div>
      <div
        class="info-card-value"
        style="color: {makeUpWater?.status ? '#4caf50' : '#f44336'}"
      >
        {makeUpWater?.status ? '正常' : '关闭'}
      </div>
    </div>
  </div>
</div>
