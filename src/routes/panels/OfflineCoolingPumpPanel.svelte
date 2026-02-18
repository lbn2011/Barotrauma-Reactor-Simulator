<script lang="ts">
// 导入反应堆状态管理
import {
  reactorStore,
  toggleCoreCoolingPump,
  setCoreCoolingPumpFlowRate,
} from '../../lib/stores/reactorStore';
import { onMount } from 'svelte';
import log from '@/lib/utils/logger';

// Component initialization logs
log.info('OfflineCoolingPumpPanel component initialized');

// 堆芯离线冷却泵数据
let coreCoolingPump: any;

// 组件挂载时订阅状态
onMount(() => {
  log.debug('OfflineCoolingPumpPanel mounting, subscribing to reactor store');

  const unsubscribe = reactorStore.subscribe((state) => {
    log.trace('OfflineCoolingPumpPanel state updated', { coreCoolingPump: state.coreCoolingPump });
    coreCoolingPump = state.coreCoolingPump;
  });

  log.debug('OfflineCoolingPumpPanel mounted successfully');
  return unsubscribe;
});

// 切换冷却泵状态
function handleToggle() {
  log.info('Toggling core cooling pump status', { currentStatus: coreCoolingPump?.status });
  toggleCoreCoolingPump();
  log.success('Core cooling pump status toggled successfully');
}

// 调整冷却流量
function handleFlowRateChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const value = parseFloat(target.value);
  log.debug('Changing core cooling pump flow rate', { value });
  setCoreCoolingPumpFlowRate(value);
  log.success('Core cooling pump flow rate updated successfully', { value });
}
</script>

<!--
  堆芯离线冷却泵控制面板组件

  功能：
  - 控制堆芯离线冷却泵的启停
  - 调节冷却泵流量
  - 实时显示冷却泵状态
  - 监控冷却参数

  界面元素：
  - 泵状态切换按钮
  - 状态指示器
  - 冷却流量调节滑块
  - 系统参数信息卡片
  - 操作警告框

  状态管理：
  - 从reactorStore订阅coreCoolingPump状态
  - 调用toggleCoreCoolingPump切换泵状态
  - 调用setCoreCoolingPumpFlowRate设置冷却流量
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

.flow-control {
  margin-top: 1rem;
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
  <h1 class="panel-title">8. 堆芯离线冷却泵</h1>

  <div class="control-group">
    <h2 class="control-label">冷却泵状态</h2>
    <div class="status-toggle">
      <button
        class="toggle-button"
        class:active={coreCoolingPump?.status}
        class:inactive={!coreCoolingPump?.status}
        on:click={handleToggle}
      >
        {coreCoolingPump?.status ? '启用' : '禁用'}
      </button>
      <span
        class="status-indicator"
        class:active={coreCoolingPump?.status}
        class:inactive={!coreCoolingPump?.status}
      >
        {coreCoolingPump?.status ? '运行中' : '已停止'}
      </span>
    </div>
  </div>

  <div class="control-group">
    <h2 class="control-label">冷却流量调节</h2>
    <div class="flow-control">
      <div class="slider-container">
        <input
          type="range"
          class="slider"
          min="0"
          max="100"
          step="1"
          value={coreCoolingPump?.flowRate || 0}
          on:input={handleFlowRateChange}
          disabled={!coreCoolingPump?.status}
        />
      </div>
      <div class="value-display">
        {coreCoolingPump?.flowRate.toFixed(1)}%
      </div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <div class="info-card-title">泵状态</div>
      <div class="info-card-value">
        {coreCoolingPump?.status ? '在线' : '离线'}
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">冷却流量</div>
      <div class="info-card-value">
        {coreCoolingPump?.flowRate.toFixed(1)}%
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">状态指示</div>
      <div class="info-card-value" style="color: {coreCoolingPump?.status ? '#4caf50' : '#f44336'}">
        {coreCoolingPump?.status ? '正常' : '关闭'}
      </div>
    </div>
  </div>

  <div class="warning-box">
    <h3 class="warning-title">操作警告</h3>
    <p class="warning-text">
      堆芯离线冷却泵仅在反应堆停机时使用。启用此系统前，请确保反应堆已完全停堆，
      控制棒已完全插入，并且其他冷却系统已正常运行。
    </p>
  </div>
</div>
