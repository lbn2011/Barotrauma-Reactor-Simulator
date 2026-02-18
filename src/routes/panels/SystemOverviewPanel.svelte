<script lang="ts">
// 导入反应堆状态管理
import {
  reactorStore,
  startSimulation,
  stopSimulation,
  resetSimulation,
  emergencyRodInsertion,
  tripReactor,
} from '../../lib/stores/reactorStore';
import log from '../../lib/utils/logger';
import { onMount, onDestroy } from 'svelte';

// Component initialization logs
log.info('System Overview Panel component initialized');
log.debug('Starting to load component dependencies and state');

onMount(() => {
  log.success('System Overview Panel component mounted successfully');
  log.info('Component ready, starting to monitor system status');
});

onDestroy(() => {
  log.info('System Overview Panel component destroying');
  log.debug('Cleaning up component resources');
});

// 模拟状态数据
let isRunning: boolean;
let simulationTime: number;
// 核心系统数据
let core: any;
let powerRegulation: any;
let controlRods: any;
// 辅助系统数据
let turbine: any;
let feedwaterSystem: any;
let emergencyCoolingPumps: any;
// 安全和故障数据
let faultSimulation: any;
let alarms: any;

// Subscribe to state changes
reactorStore.subscribe((state) => {
  log.trace('Reactor state updated, synchronizing system overview parameters');
  isRunning = state.isRunning;
  simulationTime = state.simulationTime;
  core = state.core;
  powerRegulation = state.powerRegulation;
  controlRods = state.controlRods;
  turbine = state.turbine;
  feedwaterSystem = state.feedwaterSystem;
  emergencyCoolingPumps = state.emergencyCoolingPumps;
  faultSimulation = state.faultSimulation;
  alarms = state.alarms;
  log.trace('System overview parameters synchronized successfully', {
    isRunning,
    simulationTime,
    powerLevel: powerRegulation?.powerLevel,
    coreTemperature: core?.temperature,
    corePressure: core?.pressure,
  });
});

// Handle simulation control
function handleStartSimulation() {
  log.info('Starting simulation');
  startSimulation();
  log.success('Simulation start command executed');
}

function handleStopSimulation() {
  log.info('Stopping simulation');
  stopSimulation();
  log.success('Simulation stop command executed');
}

function handleResetSimulation() {
  log.info('Resetting simulation');
  resetSimulation();
  log.success('Simulation reset command executed');
}

// Handle emergency operations
function handleEmergencyRodInsertion() {
  log.info('Starting emergency shutdown operation (AZ-5)');
  emergencyRodInsertion();
  log.success('Emergency shutdown command executed');
}

function handleTripReactor() {
  log.info('Starting reactor trip operation');
  tripReactor();
  log.success('Reactor trip command executed');
}

// Format time
function formatTime(seconds: number): string {
  log.trace('Starting to format time', { seconds });
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  log.trace('Time formatting completed', { seconds, formattedTime });
  return formattedTime;
}
</script>

<!--
  系统概览面板组件

  功能：
  - 提供模拟控制功能（启动、停止、重置）
  - 执行紧急操作（紧急停堆、触发停堆）
  - 显示核心状态（功率、温度、压力、水位）
  - 监控各系统状态（控制棒、汽轮机、给水、安全系统）
  - 显示故障模拟系统状态
  - 实时更新模拟时间

  界面元素：
  - 模拟控制按钮
  - 紧急操作按钮
  - 核心状态卡片
  - 系统状态卡片
  - 模拟时间显示
  - 状态指示器

  状态管理：
  - 从reactorStore订阅多个状态
  - 调用相关函数控制模拟和执行紧急操作
-->

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
  text-align: center;
}

.control-section {
  margin-bottom: 3rem;
}

.control-card {
  background-color: #121212;
  border-radius: 6px;
  padding: 1.5rem;
  border: 1px solid #333;
  margin-bottom: 1.5rem;
}

.control-title {
  color: #00bcd4;
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 1rem;
}

.control-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.control-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
  flex: 1;
}

.btn-start {
  background-color: #4caf50;
  color: white;
}

.btn-start:hover {
  background-color: #45a049;
}

.btn-stop {
  background-color: #f44336;
  color: white;
}

.btn-stop:hover {
  background-color: #e53935;
}

.btn-reset {
  background-color: #ff9800;
  color: white;
}

.btn-reset:hover {
  background-color: #f57c00;
}

.btn-emergency {
  background-color: #9c27b0;
  color: white;
  animation: pulse 2s infinite;
}

.btn-emergency:hover {
  background-color: #7b1fa2;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(156, 39, 176, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(156, 39, 176, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(156, 39, 176, 0);
  }
}

.status-section {
  margin-bottom: 3rem;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.status-card {
  background-color: #121212;
  border-radius: 6px;
  padding: 1.5rem;
  border: 1px solid #333;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 188, 212, 0.2);
}

.status-card.critical {
  border-left: 4px solid #f44336;
}

.status-card.warning {
  border-left: 4px solid #ff9800;
}

.status-card.normal {
  border-left: 4px solid #4caf50;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.status-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #00bcd4;
  margin: 0;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.normal {
  background-color: #4caf50;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.6);
}

.status-indicator.warning {
  background-color: #ff9800;
  box-shadow: 0 0 8px rgba(255, 152, 0, 0.6);
}

.status-indicator.critical {
  background-color: #f44336;
  box-shadow: 0 0 8px rgba(244, 67, 54, 0.6);
}

.status-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #e0e0e0;
  margin: 0.5rem 0;
}

.status-unit {
  font-size: 0.9rem;
  color: #aaa;
}

.status-detail {
  font-size: 0.9rem;
  color: #aaa;
  margin-top: 1rem;
}

.system-section {
  margin-bottom: 3rem;
}

.system-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.system-card {
  background-color: #121212;
  border-radius: 6px;
  padding: 1.5rem;
  border: 1px solid #333;
}

.system-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #00bcd4;
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.parameter-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.parameter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #333;
}

.parameter-item:last-child {
  border-bottom: none;
}

.parameter-label {
  font-size: 0.9rem;
  color: #aaa;
}

.parameter-value {
  font-size: 1rem;
  font-weight: 600;
  color: #e0e0e0;
}

.parameter-value.critical {
  color: #f44336;
}

.parameter-value.warning {
  color: #ff9800;
}

.parameter-value.normal {
  color: #4caf50;
}

.emergency-section {
  margin-top: 3rem;
}

.emergency-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.time-display {
  font-size: 1.5rem;
  font-weight: 600;
  color: #00bcd4;
  text-align: center;
  margin: 1rem 0;
}

.simulation-status {
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1.5rem;
}

.simulation-status.running {
  color: #4caf50;
}

.simulation-status.stopped {
  color: #f44336;
}
</style>

<div class="panel-container">
  <h1 class="panel-title">系统概览</h1>

  <!-- 模拟控制 -->
  <div class="control-section">
    <div class="control-card">
      <h2 class="control-title">模拟控制</h2>
      <div class="time-display">
        模拟时间: {formatTime(simulationTime)}
      </div>
      <div class="simulation-status {isRunning ? 'running' : 'stopped'}">
        {isRunning ? '运行中' : '已停止'}
      </div>
      <div class="control-buttons">
        <button
          class="control-button btn-start"
          on:click={handleStartSimulation}
          disabled={isRunning}
        >
          启动模拟
        </button>
        <button
          class="control-button btn-stop"
          on:click={handleStopSimulation}
          disabled={!isRunning}
        >
          停止模拟
        </button>
        <button class="control-button btn-reset" on:click={handleResetSimulation}>
          重置模拟
        </button>
      </div>
    </div>
  </div>

  <!-- 紧急操作 -->
  <div class="emergency-section">
    <div class="control-card">
      <h2 class="control-title">紧急操作</h2>
      <div class="emergency-buttons">
        <button class="control-button btn-emergency" on:click={handleEmergencyRodInsertion}>
          紧急停堆 (AZ-5)
        </button>
        <button class="control-button btn-emergency" on:click={handleTripReactor}>
          触发停堆
        </button>
      </div>
    </div>
  </div>

  <!-- 核心状态 -->
  <div class="status-section">
    <h2 class="control-title">核心状态</h2>
    <div class="status-grid">
      <!-- 功率状态 -->
      <div
        class={`status-card ${powerRegulation.powerLevel > 90 ? 'warning' : powerRegulation.powerLevel > 95 ? 'critical' : 'normal'}`}
      >
        <div class="status-header">
          <h3 class="status-title">反应堆功率</h3>
          <div
            class={`status-indicator ${powerRegulation.powerLevel > 90 ? 'warning' : powerRegulation.powerLevel > 95 ? 'critical' : 'normal'}`}
          ></div>
        </div>
        <div class="status-value">{powerRegulation.powerLevel.toFixed(1)}%</div>
        <div class="status-unit">功率水平</div>
        <div class="status-detail">
          <div>目标功率: {powerRegulation.targetPower.toFixed(1)}%</div>
          <div>功率变化率: {powerRegulation.powerRate.toFixed(2)}%/s</div>
          <div>反应性: {powerRegulation.reactivity.toFixed(4)}</div>
        </div>
      </div>

      <!-- 堆芯温度 -->
      <div
        class={`status-card ${core.temperature > 300 ? 'warning' : core.temperature > 320 ? 'critical' : 'normal'}`}
      >
        <div class="status-header">
          <h3 class="status-title">堆芯温度</h3>
          <div
            class={`status-indicator ${core.temperature > 300 ? 'warning' : core.temperature > 320 ? 'critical' : 'normal'}`}
          ></div>
        </div>
        <div class="status-value">{core.temperature.toFixed(1)}°C</div>
        <div class="status-unit">温度</div>
        <div class="status-detail">
          <div>中子通量: {powerRegulation.neutronFlux.toExponential(2)}</div>
          <div>中子通量对数: {powerRegulation.neutronFluxLog.toFixed(2)}</div>
        </div>
      </div>

      <!-- 堆芯压力 -->
      <div
        class={`status-card ${core.pressure > 7.0 ? 'warning' : core.pressure > 7.5 ? 'critical' : 'normal'}`}
      >
        <div class="status-header">
          <h3 class="status-title">堆芯压力</h3>
          <div
            class={`status-indicator ${core.pressure > 7.0 ? 'warning' : core.pressure > 7.5 ? 'critical' : 'normal'}`}
          ></div>
        </div>
        <div class="status-value">{core.pressure.toFixed(2)} MPa</div>
        <div class="status-unit">压力</div>
        <div class="status-detail">
          <div>控制误差: {powerRegulation.controlError.toFixed(2)}%</div>
        </div>
      </div>

      <!-- 堆芯水位 -->
      <div
        class={`status-card ${core.waterLevel < 30 ? 'critical' : core.waterLevel < 50 ? 'warning' : 'normal'}`}
      >
        <div class="status-header">
          <h3 class="status-title">堆芯水位</h3>
          <div
            class={`status-indicator ${core.waterLevel < 30 ? 'critical' : core.waterLevel < 50 ? 'warning' : 'normal'}`}
          ></div>
        </div>
        <div class="status-value">{core.waterLevel.toFixed(1)}%</div>
        <div class="status-unit">水位</div>
        <div class="status-detail">
          <div>
            给水流量: {feedwaterSystem.system.totalFlowRate.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 系统状态 -->
  <div class="system-section">
    <div class="system-grid">
      <!-- 控制棒系统 -->
      <div class="system-card">
        <h3 class="system-title">控制棒系统</h3>
        <ul class="parameter-list">
          <li class="parameter-item">
            <span class="parameter-label">控制棒位置</span>
            <span class="parameter-value">{controlRods.position.toFixed(1)}%</span>
          </li>
          <li class="parameter-item">
            <span class="parameter-label">紧急插入状态</span>
            <span class="parameter-value {controlRods.emergencyInsertion ? 'critical' : 'normal'}">
              {controlRods.emergencyInsertion ? '已触发' : '正常'}
            </span>
          </li>
          <li class="parameter-item">
            <span class="parameter-label">自动模式</span>
            <span class="parameter-value">{controlRods.autoMode ? '开启' : '关闭'}</span>
          </li>
          <li class="parameter-item">
            <span class="parameter-label">活跃控制棒</span>
            <span class="parameter-value">25</span>
          </li>
        </ul>
      </div>

      <!-- 汽轮机系统 -->
      <div class="system-card">
        <h3 class="system-title">汽轮机系统</h3>
        <ul class="parameter-list">
          <li class="parameter-item">
            <span class="parameter-label">汽轮机状态</span>
            <span class="parameter-value {!turbine.status ? 'critical' : 'normal'}">
              {turbine.status ? '运行中' : '已停止'}
            </span>
          </li>
          <li class="parameter-item">
            <span class="parameter-label">汽轮机负载</span>
            <span class="parameter-value">{turbine.load.toFixed(1)}%</span>
          </li>
          <li class="parameter-item">
            <span class="parameter-label">汽轮机转速</span>
            <span class="parameter-value">{turbine.speed.toFixed(0)} RPM</span>
          </li>
          <li class="parameter-item">
            <span class="parameter-label">蒸汽压力</span>
            <span class="parameter-value">{turbine.steamPressure.toFixed(2)} MPa</span>
          </li>
          <li class="parameter-item">
            <span class="parameter-label">跳闸状态</span>
            <span class="parameter-value {turbine.tripStatus ? 'critical' : 'normal'}">
              {turbine.tripStatus ? '已跳闸' : '正常'}
            </span>
          </li>
        </ul>
      </div>

      <!-- 给水系统 -->
      <div class="system-card">
        <h3 class="system-title">给水系统</h3>
        <ul class="parameter-list">
          <li class="parameter-item">
            <span class="parameter-label">总给水流量</span>
            <span class="parameter-value">{feedwaterSystem.system.totalFlowRate.toFixed(1)}%</span>
          </li>
          <li class="parameter-item">
            <span class="parameter-label">给水压力</span>
            <span class="parameter-value"
              >{feedwaterSystem.system.headerPressure.toFixed(2)} MPa</span
            >
          </li>
          <li class="parameter-item">
            <span class="parameter-label">给水温度</span>
            <span class="parameter-value"
              >{feedwaterSystem.system.headerTemperature.toFixed(1)}°C</span
            >
          </li>
          <li class="parameter-item">
            <span class="parameter-label">系统状态</span>
            <span class="parameter-value">{feedwaterSystem.system.status}</span>
          </li>
        </ul>
      </div>

      <!-- 安全系统 -->
      <div class="system-card">
        <h3 class="system-title">安全系统</h3>
        <ul class="parameter-list">
          <li class="parameter-item">
            <span class="parameter-label">应急冷却泵1</span>
            <span
              class="parameter-value {emergencyCoolingPumps.pump1.status ? 'warning' : 'normal'}"
            >
              {emergencyCoolingPumps.pump1.status ? '运行中' : '已停止'}
            </span>
          </li>
          <li class="parameter-item">
            <span class="parameter-label">应急冷却泵2</span>
            <span
              class="parameter-value {emergencyCoolingPumps.pump2.status ? 'warning' : 'normal'}"
            >
              {emergencyCoolingPumps.pump2.status ? '运行中' : '已停止'}
            </span>
          </li>
          <li class="parameter-item">
            <span class="parameter-label">总冷却流量</span>
            <span class="parameter-value"
              >{(
                emergencyCoolingPumps.pump1.flowRate + emergencyCoolingPumps.pump2.flowRate
              ).toFixed(1)}%</span
            >
          </li>
          <li class="parameter-item">
            <span class="parameter-label">活跃报警</span>
            <span class="parameter-value {alarms.active ? 'critical' : 'normal'}">
              {alarms.active ? '是' : '否'}
            </span>
          </li>
          <li class="parameter-item">
            <span class="parameter-label">报警数量</span>
            <span class="parameter-value {alarms.messages?.length > 0 ? 'warning' : 'normal'}">
              {alarms.messages?.length || 0}
            </span>
          </li>
        </ul>
      </div>

      <!-- 故障模拟系统 -->
      <div class="system-card">
        <h3 class="system-title">故障模拟系统</h3>
        <ul class="parameter-list">
          <li class="parameter-item">
            <span class="parameter-label">系统可靠性</span>
            <span class="parameter-value"
              >{(faultSimulation.systemReliability * 100).toFixed(1)}%</span
            >
          </li>
          <li class="parameter-item">
            <span class="parameter-label">风险级别</span>
            <span
              class="parameter-value {faultSimulation.riskLevel === 'critical'
                ? 'critical'
                : faultSimulation.riskLevel === 'high'
                  ? 'warning'
                  : 'normal'}"
            >
              {faultSimulation.riskLevel === 'low'
                ? '低'
                : faultSimulation.riskLevel === 'medium'
                  ? '中等'
                  : faultSimulation.riskLevel === 'high'
                    ? '高'
                    : '灾难性'}
            </span>
          </li>
          <li class="parameter-item">
            <span class="parameter-label">活跃故障</span>
            <span
              class="parameter-value {faultSimulation.activeFaults.length > 0
                ? 'warning'
                : 'normal'}"
            >
              {faultSimulation.activeFaults.length}
            </span>
          </li>
          <li class="parameter-item">
            <span class="parameter-label">维护水平</span>
            <span class="parameter-value">{faultSimulation.maintenanceLevel}%</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>
