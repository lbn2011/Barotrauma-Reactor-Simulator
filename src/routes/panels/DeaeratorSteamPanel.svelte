<script lang="ts">
// 导入反应堆状态管理
import {
  reactorStore,
  setDeaeratorPressure,
  setDeaeratorLevel,
} from '../../lib/stores/reactorStore';
import { onMount } from 'svelte';

// 除氧器数据
let deaerator: any;

// 组件挂载时订阅状态
onMount(() => {
  const unsubscribe = reactorStore.subscribe((state) => {
    deaerator = state.deaerator;
  });

  return unsubscribe;
});

// 调整除氧器压力
function handlePressureChange (e: Event) {
  const target = e.target as HTMLInputElement;
  setDeaeratorPressure(parseFloat(target.value));
}

// 调整除氧器液位
function handleLevelChange (e: Event) {
  const target = e.target as HTMLInputElement;
  setDeaeratorLevel(parseFloat(target.value));
}
</script>

<!--
  除氧器蒸汽控制面板组件

  功能：
  - 调节除氧器压力
  - 调节除氧器液位
  - 实时显示除氧器状态
  - 监控压力和液位水平

  界面元素：
  - 压力调节滑块
  - 液位调节滑块
  - 压力和液位仪表
  - 系统状态信息卡片
  - 压力和液位状态指示

  状态管理：
  - 从reactorStore订阅deaerator状态
  - 调用setDeaeratorPressure设置压力
  - 调用setDeaeratorLevel设置液位
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
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
  font-size: 2.5rem;
  font-weight: 600;
  color: #00bcd4;
  margin-bottom: 0.5rem;
}

.gauge-unit {
  font-size: 1rem;
  color: #9e9e9e;
}
</style>

<div class="panel">
  <h1 class="panel-title">10. 除氧器蒸汽控制</h1>

  <div class="control-group">
    <h2 class="control-label">除氧器压力调节 (MPa)</h2>
    <div class="slider-container">
      <input
        type="range"
        class="slider"
        min="0"
        max="1"
        step="0.01"
        value={deaerator?.pressure || 0}
        on:input={handlePressureChange}
      />
    </div>
    <div class="value-display">
      {deaerator?.pressure.toFixed(2)} MPa
    </div>
  </div>

  <div class="control-group">
    <h2 class="control-label">除氧器液位调节 (%)</h2>
    <div class="slider-container">
      <input
        type="range"
        class="slider"
        min="0"
        max="100"
        step="1"
        value={deaerator?.level || 0}
        on:input={handleLevelChange}
      />
    </div>
    <div class="value-display">
      {deaerator?.level.toFixed(1)}%
    </div>
  </div>

  <div class="gauge-container">
    <div class="gauge">
      <h3 class="gauge-title">当前压力</h3>
      <div class="gauge-value">{deaerator?.pressure.toFixed(2)}</div>
      <div class="gauge-unit">MPa</div>
    </div>

    <div class="gauge">
      <h3 class="gauge-title">当前液位</h3>
      <div class="gauge-value">{deaerator?.level.toFixed(0)}</div>
      <div class="gauge-unit">%</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <div class="info-card-title">运行状态</div>
      <div class="info-card-value">正常</div>
    </div>
    <div class="info-card">
      <div class="info-card-title">压力状态</div>
      <div
        class="info-card-value"
        style="color: {deaerator?.pressure > 0.8
          ? '#f44336'
          : deaerator?.pressure < 0.05
            ? '#ff9800'
            : '#4caf50'}"
      >
        {deaerator?.pressure > 0.8 ? '过高' : deaerator?.pressure < 0.05 ? '过低' : '正常'}
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">液位状态</div>
      <div
        class="info-card-value"
        style="color: {deaerator?.level > 90
          ? '#f44336'
          : deaerator?.level < 20
            ? '#ff9800'
            : '#4caf50'}"
      >
        {deaerator?.level > 90 ? '过高' : deaerator?.level < 20 ? '过低' : '正常'}
      </div>
    </div>
  </div>
</div>
