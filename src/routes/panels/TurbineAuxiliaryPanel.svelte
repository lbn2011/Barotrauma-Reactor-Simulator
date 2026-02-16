<script lang="ts">
  // 导入反应堆状态管理
  import {
    reactorStore,
    setLubricationOilPressure,
    setLubricationOilTemperature,
    setSealOilPressure,
  } from '../../lib/stores/reactorStore';
  import { onMount } from 'svelte';

  // 汽轮机辅助系统数据
  let turbineAuxiliary: any;

  // 组件挂载时订阅状态
  onMount(() => {
    const unsubscribe = reactorStore.subscribe((state) => {
      turbineAuxiliary = state.turbineAuxiliary;
    });

    return unsubscribe;
  });

  // 调整润滑油压力
  function handleLubricationOilPressureChange(e: Event) {
    const target = e.target as HTMLInputElement;
    setLubricationOilPressure(parseFloat(target.value));
  }

  // 调整润滑油温度
  function handleLubricationOilTemperatureChange(e: Event) {
    const target = e.target as HTMLInputElement;
    setLubricationOilTemperature(parseFloat(target.value));
  }

  // 调整密封油压力
  function handleSealOilPressureChange(e: Event) {
    const target = e.target as HTMLInputElement;
    setSealOilPressure(parseFloat(target.value));
  }
</script>

<!--
  汽轮机辅助系统面板组件
  
  功能：
  - 调节汽轮机润滑油压力
  - 调节汽轮机润滑油温度
  - 调节汽轮机密封油压力
  - 实时显示辅助系统状态
  - 监控油系统参数
  
  界面元素：
  - 润滑油压力调节滑块
  - 润滑油温度调节滑块
  - 密封油压力调节滑块
  - 系统参数信息卡片
  - 操作警告框
  
  状态管理：
  - 从reactorStore订阅turbineAuxiliary状态
  - 调用相关函数设置油系统参数
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
  <h1 class="panel-title">13. 汽轮机辅助系统</h1>

  <div class="control-group">
    <h2 class="control-label">润滑油压力调节 (MPa)</h2>
    <div class="slider-container">
      <input
        type="range"
        class="slider"
        min="0"
        max="1"
        step="0.01"
        value={turbineAuxiliary?.lubricationOil?.pressure || 0}
        on:input={handleLubricationOilPressureChange}
      />
    </div>
    <div class="value-display">
      {turbineAuxiliary?.lubricationOil?.pressure.toFixed(2)} MPa
    </div>
  </div>

  <div class="control-group">
    <h2 class="control-label">润滑油温度调节 (°C)</h2>
    <div class="slider-container">
      <input
        type="range"
        class="slider"
        min="30"
        max="70"
        step="1"
        value={turbineAuxiliary?.lubricationOil?.temperature || 0}
        on:input={handleLubricationOilTemperatureChange}
      />
    </div>
    <div class="value-display">
      {turbineAuxiliary?.lubricationOil?.temperature.toFixed(0)} °C
    </div>
  </div>

  <div class="control-group">
    <h2 class="control-label">密封油压力调节 (MPa)</h2>
    <div class="slider-container">
      <input
        type="range"
        class="slider"
        min="0"
        max="1"
        step="0.01"
        value={turbineAuxiliary?.sealOil?.pressure || 0}
        on:input={handleSealOilPressureChange}
      />
    </div>
    <div class="value-display">
      {turbineAuxiliary?.sealOil?.pressure.toFixed(2)} MPa
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <div class="info-card-title">润滑油压力</div>
      <div class="info-card-value">
        {turbineAuxiliary?.lubricationOil?.pressure.toFixed(2)} MPa
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">润滑油温度</div>
      <div class="info-card-value">
        {turbineAuxiliary?.lubricationOil?.temperature.toFixed(0)} °C
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">密封油压力</div>
      <div class="info-card-value">
        {turbineAuxiliary?.sealOil?.pressure.toFixed(2)} MPa
      </div>
    </div>
  </div>

  <div class="warning-box">
    <h3 class="warning-title">操作警告</h3>
    <p class="warning-text">
      汽轮机辅助系统对汽轮机的安全运行至关重要。请确保润滑油压力维持在0.2-0.4
      MPa之间， 润滑油温度维持在40-55°C之间，密封油压力维持在0.3-0.5
      MPa之间，以确保汽轮机正常运行。
    </p>
  </div>
</div>
