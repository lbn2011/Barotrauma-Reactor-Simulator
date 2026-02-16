<script lang="ts">
  // 导入反应堆状态管理
  import {
    reactorStore,
    setCondenserHotwellLevel,
  } from '../../lib/stores/reactorStore';
  import { onMount } from 'svelte';

  // 凝汽器热井数据
  let condenserHotwell: any;

  // 组件挂载时订阅状态
  onMount(() => {
    const unsubscribe = reactorStore.subscribe((state) => {
      condenserHotwell = state.condenserHotwell;
    });

    return unsubscribe;
  });

  // 调整热井液位
  function handleLevelChange(e: Event) {
    const target = e.target as HTMLInputElement;
    setCondenserHotwellLevel(parseFloat(target.value));
  }
</script>

<!--
  凝汽器热井液位控制面板组件
  
  功能：
  - 调节凝汽器热井的液位
  - 实时显示热井液位状态
  - 提供液位状态指示
  - 给出操作建议
  
  界面元素：
  - 热井液位调节滑块
  - 液位仪表
  - 液位状态信息卡片
  - 操作建议信息卡片
  - 操作警告框
  
  状态管理：
  - 从reactorStore订阅condenserHotwell状态
  - 调用setCondenserHotwellLevel设置热井液位
-->

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

  .gauge-container {
    margin-top: 2rem;
  }

  .gauge {
    background-color: #2d2d2d;
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
  }

  .gauge-title {
    font-size: 1rem;
    color: #9e9e9e;
    margin-bottom: 1rem;
  }

  .gauge-value {
    font-size: 3rem;
    font-weight: 600;
    color: #00bcd4;
    margin-bottom: 0.5rem;
  }

  .gauge-unit {
    font-size: 1rem;
    color: #9e9e9e;
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
  <h1 class="panel-title">14. 凝汽器热井液位控制面板</h1>

  <div class="control-group">
    <h2 class="control-label">热井液位调节 (%)</h2>
    <div class="slider-container">
      <input
        type="range"
        class="slider"
        min="0"
        max="100"
        step="1"
        value={condenserHotwell?.level || 0}
        on:input={handleLevelChange}
      />
    </div>
    <div class="value-display">
      {condenserHotwell?.level.toFixed(0)}%
    </div>
  </div>

  <div class="gauge-container">
    <div class="gauge">
      <h3 class="gauge-title">当前热井液位</h3>
      <div class="gauge-value">{condenserHotwell?.level.toFixed(0)}</div>
      <div class="gauge-unit">%</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <div class="info-card-title">液位状态</div>
      <div
        class="info-card-value"
        style="color: {condenserHotwell?.level > 80
          ? '#f44336'
          : condenserHotwell?.level < 30
            ? '#ff9800'
            : '#4caf50'}"
      >
        {condenserHotwell?.level > 80
          ? '过高'
          : condenserHotwell?.level < 30
            ? '过低'
            : '正常'}
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">操作建议</div>
      <div
        class="info-card-value"
        style="color: {condenserHotwell?.level > 80
          ? '#f44336'
          : condenserHotwell?.level < 30
            ? '#ff9800'
            : '#4caf50'}"
      >
        {condenserHotwell?.level > 80
          ? '减少补水'
          : condenserHotwell?.level < 30
            ? '增加补水'
            : '维持当前'}
      </div>
    </div>
  </div>

  <div class="warning-box">
    <h3 class="warning-title">操作警告</h3>
    <p class="warning-text">
      凝汽器热井液位对汽轮机的安全运行有重要影响。液位过高可能导致汽轮机进水，
      液位过低可能导致给水泵汽蚀。请将液位维持在40-70%之间，以确保系统正常运行。
    </p>
  </div>
</div>
