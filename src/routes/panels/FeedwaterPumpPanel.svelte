<script lang="ts">
  import {
    reactorStore,
    toggleReactorFeedPump,
    setReactorFeedPumpFlowRate,
  } from '../../lib/stores/reactorStore';
  import { onMount } from 'svelte';

  let reactorFeedPumps: any;

  // 订阅状态
  onMount(() => {
    const unsubscribe = reactorStore.subscribe((state) => {
      reactorFeedPumps = state.reactorFeedPumps;
    });

    return unsubscribe;
  });

  // 切换水泵状态
  function handleTogglePump(pumpNumber: 1 | 2) {
    toggleReactorFeedPump(pumpNumber);
  }

  // 调整水泵流量
  function handleFlowRateChange(pumpNumber: 1 | 2, e: Event) {
    const target = e.target as HTMLInputElement;
    setReactorFeedPumpFlowRate(pumpNumber, parseFloat(target.value));
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

  .pump-container {
    margin-bottom: 3rem;
  }

  .pump-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }

  .pump-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #e0e0e0;
  }

  .pump-status {
    font-size: 0.9rem;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-weight: 500;
  }

  .pump-status.active {
    background-color: rgba(76, 175, 80, 0.2);
    color: #4caf50;
  }

  .pump-status.inactive {
    background-color: rgba(244, 67, 54, 0.2);
    color: #f44336;
  }

  .control-group {
    margin-bottom: 1.5rem;
  }

  .control-label {
    display: block;
    font-size: 1rem;
    font-weight: 500;
    color: #e0e0e0;
    margin-bottom: 0.75rem;
  }

  .status-toggle {
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
    appearance: none;
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

  .divider {
    height: 1px;
    background-color: #333;
    margin: 2rem 0;
  }
</style>

<div class="panel">
  <h1 class="panel-title">17. 反应堆给水泵控制</h1>

  <!-- 泵 1 -->
  <div class="pump-container">
    <div class="pump-header">
      <h2 class="pump-title">给水泵 1</h2>
      <span
        class="pump-status"
        class:active={reactorFeedPumps?.pump1?.status}
        class:inactive={!reactorFeedPumps?.pump1?.status}
      >
        {reactorFeedPumps?.pump1?.status ? '运行中' : '已停止'}
      </span>
    </div>

    <div class="control-group">
      <h3 class="control-label">泵状态</h3>
      <div class="status-toggle">
        <button
          class="toggle-button"
          class:active={reactorFeedPumps?.pump1?.status}
          class:inactive={!reactorFeedPumps?.pump1?.status}
          on:click={() => handleTogglePump(1)}
        >
          {reactorFeedPumps?.pump1?.status ? '停止' : '启动'}
        </button>
      </div>
    </div>

    <div class="control-group">
      <h3 class="control-label">流量调节 (%)</h3>
      <div class="slider-container">
        <input
          type="range"
          class="slider"
          min="0"
          max="100"
          step="1"
          value={reactorFeedPumps?.pump1?.flowRate || 0}
          on:input={(e) => handleFlowRateChange(1, e)}
          disabled={!reactorFeedPumps?.pump1?.status}
        />
      </div>
      <div class="value-display">
        {reactorFeedPumps?.pump1?.flowRate.toFixed(0)}%
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- 泵 2 -->
  <div class="pump-container">
    <div class="pump-header">
      <h2 class="pump-title">给水泵 2</h2>
      <span
        class="pump-status"
        class:active={reactorFeedPumps?.pump2?.status}
        class:inactive={!reactorFeedPumps?.pump2?.status}
      >
        {reactorFeedPumps?.pump2?.status ? '运行中' : '已停止'}
      </span>
    </div>

    <div class="control-group">
      <h3 class="control-label">泵状态</h3>
      <div class="status-toggle">
        <button
          class="toggle-button"
          class:active={reactorFeedPumps?.pump2?.status}
          class:inactive={!reactorFeedPumps?.pump2?.status}
          on:click={() => handleTogglePump(2)}
        >
          {reactorFeedPumps?.pump2?.status ? '停止' : '启动'}
        </button>
      </div>
    </div>

    <div class="control-group">
      <h3 class="control-label">流量调节 (%)</h3>
      <div class="slider-container">
        <input
          type="range"
          class="slider"
          min="0"
          max="100"
          step="1"
          value={reactorFeedPumps?.pump2?.flowRate || 0}
          on:input={(e) => handleFlowRateChange(2, e)}
          disabled={!reactorFeedPumps?.pump2?.status}
        />
      </div>
      <div class="value-display">
        {reactorFeedPumps?.pump2?.flowRate.toFixed(0)}%
      </div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <div class="info-card-title">泵 1 状态</div>
      <div class="info-card-value">
        {reactorFeedPumps?.pump1?.status ? '在线' : '离线'}
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">泵 1 流量</div>
      <div class="info-card-value">
        {reactorFeedPumps?.pump1?.flowRate.toFixed(0)}%
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">泵 2 状态</div>
      <div class="info-card-value">
        {reactorFeedPumps?.pump2?.status ? '在线' : '离线'}
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">泵 2 流量</div>
      <div class="info-card-value">
        {reactorFeedPumps?.pump2?.flowRate.toFixed(0)}%
      </div>
    </div>
  </div>
</div>
