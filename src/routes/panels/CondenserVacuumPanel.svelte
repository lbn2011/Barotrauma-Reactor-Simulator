<script lang="ts">
// 导入反应堆状态管理
import {
  reactorStore,
  toggleCondenserVacuum,
  setCondenserVacuumLevel,
} from '../../lib/stores/reactorStore';
import { onMount } from 'svelte';
import log from '@/utils/logger';

// Component initialization logs
log.info('CondenserVacuumPanel component initialized');

// 凝汽器真空系统数据
let condenserVacuum: any;

// 组件挂载时订阅状态
onMount(() => {
  log.debug('CondenserVacuumPanel mounting, subscribing to reactor store');
  
  const unsubscribe = reactorStore.subscribe((state) => {
    log.trace('CondenserVacuumPanel state updated', { condenserVacuum: state.condenserVacuum });
    condenserVacuum = state.condenserVacuum;
  });

  log.debug('CondenserVacuumPanel mounted successfully');
  return unsubscribe;
});

// 切换真空系统状态
function handleToggle () {
  log.info('Toggling condenser vacuum system status', { currentStatus: condenserVacuum?.status });
  toggleCondenserVacuum();
  log.success('Condenser vacuum system status toggled successfully');
}

// 调整真空度
function handleVacuumLevelChange (e: Event) {
  const target = e.target as HTMLInputElement;
  const value = parseFloat(target.value);
  log.debug('Changing condenser vacuum level', { value });
  setCondenserVacuumLevel(value);
  log.success('Condenser vacuum level updated successfully', { value });
}
</script>

<!--
  凝汽器真空系统面板组件

  功能：
  - 控制凝汽器真空系统的启停
  - 调节凝汽器真空度
  - 实时显示真空系统状态
  - 监控真空度水平

  界面元素：
  - 系统状态切换按钮
  - 状态指示器
  - 真空度调节滑块
  - 真空度仪表
  - 系统参数信息卡片
  - 操作警告框

  状态管理：
  - 从reactorStore订阅condenserVacuum状态
  - 调用toggleCondenserVacuum切换系统状态
  - 调用setCondenserVacuumLevel设置真空度
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
  <h1 class="panel-title">11. 凝汽器真空系统</h1>

  <div class="control-group">
    <h2 class="control-label">真空系统状态</h2>
    <div class="status-toggle">
      <button
        class="toggle-button"
        class:active={condenserVacuum?.status}
        class:inactive={!condenserVacuum?.status}
        on:click={handleToggle}
      >
        {condenserVacuum?.status ? '启用' : '禁用'}
      </button>
      <span
        class="status-indicator"
        class:active={condenserVacuum?.status}
        class:inactive={!condenserVacuum?.status}
      >
        {condenserVacuum?.status ? '运行中' : '已停止'}
      </span>
    </div>
  </div>

  <div class="control-group">
    <h2 class="control-label">真空度调节</h2>
    <div class="slider-container">
      <input
        type="range"
        class="slider"
        min="0"
        max="1"
        step="0.01"
        value={condenserVacuum?.vacuumLevel || 0}
        on:input={handleVacuumLevelChange}
        disabled={!condenserVacuum?.status}
      />
    </div>
    <div class="value-display">
      {condenserVacuum?.vacuumLevel.toFixed(2)} (绝对真空)
    </div>
  </div>

  <div class="gauge-container">
    <div class="gauge">
      <h3 class="gauge-title">当前真空度</h3>
      <div class="gauge-value">
        {Math.round(condenserVacuum?.vacuumLevel * 100)}
      </div>
      <div class="gauge-unit">%</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <div class="info-card-title">系统状态</div>
      <div class="info-card-value">
        {condenserVacuum?.status ? '在线' : '离线'}
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">真空度</div>
      <div class="info-card-value">
        {condenserVacuum?.vacuumLevel.toFixed(2)}
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">状态指示</div>
      <div
        class="info-card-value"
        style="color: {condenserVacuum?.vacuumLevel > 0.9
          ? '#4caf50'
          : condenserVacuum?.vacuumLevel < 0.8
            ? '#f44336'
            : '#ff9800'}"
      >
        {condenserVacuum?.vacuumLevel > 0.9
          ? '良好'
          : condenserVacuum?.vacuumLevel < 0.8
            ? '不良'
            : '一般'}
      </div>
    </div>
  </div>

  <div class="warning-box">
    <h3 class="warning-title">操作警告</h3>
    <p class="warning-text">
      凝汽器真空度对汽轮机效率有重要影响。真空度过低会导致汽轮机效率下降，
      甚至可能造成设备损坏。请确保真空系统正常运行，维持真空度在0.9以上。
    </p>
  </div>
</div>
