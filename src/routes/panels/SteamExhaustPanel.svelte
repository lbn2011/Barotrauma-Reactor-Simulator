<script lang="ts">
// 导入反应堆状态管理
import { reactorStore, toggleSteamDump, setSteamDumpCapacity } from '../../lib/stores/reactorStore';
import { onMount, onDestroy } from 'svelte';
import log from '../../lib/utils/logger';

// Component initialization logs
log.info('Steam Exhaust Control Panel component initialized');
log.debug('Starting to load component dependencies and state');


// 蒸汽排汽系统数据
let steamDump: any;

// Subscribe to state when component mounts
onMount(() => {
  log.info('Steam Exhaust Control Panel component mounting');
  log.debug('Starting to subscribe to reactor state changes');
  const unsubscribe = reactorStore.subscribe((state) => {
    log.trace('Reactor state updated, synchronizing steam exhaust system parameters');
    steamDump = state.steamDump;
    log.trace('Steam exhaust system parameters synchronized successfully', { 
      status: steamDump?.status, 
      capacity: steamDump?.capacity 
    });
  });
  log.success('Steam Exhaust Control Panel component mounted successfully');
  return unsubscribe;
});

// Clean up when component destroys
onDestroy(() => {
  log.info('Steam Exhaust Control Panel component destroying');
  log.debug('Cleaning up component resources');
});

// Toggle steam exhaust state
function handleToggle () {
  log.info('Starting to toggle steam exhaust system state', { currentStatus: steamDump?.status });
  toggleSteamDump();
  log.success('Steam exhaust system state toggle command executed');
}

// Adjust exhaust capacity
function handleCapacityChange (e: Event) {
  const target = e.target as HTMLInputElement;
  const capacity = parseFloat(target.value);
  log.info('Starting to adjust steam exhaust capacity', { capacity });
  setSteamDumpCapacity(capacity);
  log.success('Steam exhaust capacity adjustment command executed', { capacity });
}
</script>

<!--
  蒸汽排汽控制面板组件

  功能：
  - 控制蒸汽排汽系统的启停
  - 调节蒸汽排汽容量
  - 实时显示排汽系统状态
  - 监控排汽参数

  界面元素：
  - 系统状态切换按钮
  - 状态指示器
  - 排汽容量调节滑块
  - 系统参数信息卡片
  - 操作警告框

  状态管理：
  - 从reactorStore订阅steamDump状态
  - 调用toggleSteamDump切换系统状态
  - 调用setSteamDumpCapacity设置排汽容量
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
  <h1 class="panel-title">12. 蒸汽排汽控制面板</h1>

  <div class="control-group">
    <h2 class="control-label">蒸汽排汽系统状态</h2>
    <div class="status-toggle">
      <button
        class="toggle-button"
        class:active={steamDump?.status}
        class:inactive={!steamDump?.status}
        on:click={handleToggle}
      >
        {steamDump?.status ? '启用' : '禁用'}
      </button>
      <span
        class="status-indicator"
        class:active={steamDump?.status}
        class:inactive={!steamDump?.status}
      >
        {steamDump?.status ? '运行中' : '已停止'}
      </span>
    </div>
  </div>

  <div class="control-group">
    <h2 class="control-label">排汽容量调节</h2>
    <div class="slider-container">
      <input
        type="range"
        class="slider"
        min="0"
        max="100"
        step="1"
        value={steamDump?.capacity || 0}
        on:input={handleCapacityChange}
        disabled={!steamDump?.status}
      />
    </div>
    <div class="value-display">
      {steamDump?.capacity.toFixed(0)}%
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <div class="info-card-title">系统状态</div>
      <div class="info-card-value">
        {steamDump?.status ? '在线' : '离线'}
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">排汽容量</div>
      <div class="info-card-value">
        {steamDump?.capacity.toFixed(0)}%
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">状态指示</div>
      <div class="info-card-value" style="color: {steamDump?.status ? '#4caf50' : '#f44336'}">
        {steamDump?.status ? '正常' : '关闭'}
      </div>
    </div>
  </div>

  <div class="warning-box">
    <h3 class="warning-title">操作警告</h3>
    <p class="warning-text">
      蒸汽排汽系统用于在汽轮机突然停机时快速释放多余蒸汽，防止反应堆压力过高。
      请在汽轮机停机或负载急剧变化时及时启用此系统，以确保反应堆安全运行。
    </p>
  </div>
</div>
