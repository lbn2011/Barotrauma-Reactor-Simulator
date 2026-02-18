<script lang="ts">
/**
 * 功率控制面板组件
 * 模拟RBMK-1000反应堆的功率调节系统
 */

// 导入反应堆状态管理相关函数
import {
  reactorStore,
  setTargetPower,
  setPowerSetpoint,
  toggleAutomaticControl,
  toggleAxialOffsetControl,
} from '../../lib/stores/reactorStore';
import log from '@/lib/utils/logger';

// Component initialization logs
log.info('PowerControlPanel component initialized');

// 订阅状态变量
let powerRegulation: {
  powerLevel: number; // 当前功率水平
  targetPower: number; // 目标功率
  reactivity: number; // 反应性
  powerRate: number; // 功率变化率
  neutronFlux: number; // 中子通量
  neutronFluxLog: number; // 中子通量对数
  controlError: number; // 控制误差
  automaticControl: boolean; // 自动控制模式
  axialOffsetControl: boolean; // 轴向偏移控制
  powerSetpoint: number; // 功率设定点
};

let core: {
  temperature: number; // 堆芯温度
  pressure: number; // 堆芯压力
  waterLevel: number; // 堆芯水位
};

/**
 * 订阅反应堆状态变化
 * 实时更新功率调节系统状态和堆芯参数
 */
reactorStore.subscribe((state) => {
  log.trace('PowerControlPanel state updated', {
    powerRegulation: state.powerRegulation,
    core: state.core,
  });
  powerRegulation = state.powerRegulation;
  core = state.core;
});

/**
 * 处理目标功率变化
 * @param e 事件对象
 */
function handleTargetPowerChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const power = parseFloat(target.value);
  log.debug('Changing target power', { power });
  setTargetPower(power);
  log.success('Target power updated successfully', { power });
}

/**
 * 处理功率设定点变化
 * @param e 事件对象
 */
function handlePowerSetpointChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const setpoint = parseFloat(target.value);
  log.debug('Changing power setpoint', { setpoint });
  setPowerSetpoint(setpoint);
  log.success('Power setpoint updated successfully', { setpoint });
}

/**
 * 快速设置功率水平
 * @param power 目标功率（%）
 */
function setPowerQuickly(power: number) {
  log.info('Quick setting power level', { power });
  setTargetPower(power);
  log.success('Power level set quickly', { power });
}

/**
 * 切换自动控制模式
 */
function handleAutomaticControlToggle() {
  log.info('Toggling automatic control mode', { currentMode: powerRegulation.automaticControl });
  toggleAutomaticControl();
  const newMode = !powerRegulation.automaticControl;
  log.success('Automatic control mode toggled', { newMode });
}

/**
 * 切换轴向偏移控制
 * 轴向偏移控制可以优化堆芯功率分布
 */
function handleAxialOffsetControlToggle() {
  log.info('Toggling axial offset control', { currentMode: powerRegulation.axialOffsetControl });
  toggleAxialOffsetControl();
  const newMode = !powerRegulation.axialOffsetControl;
  log.success('Axial offset control toggled', { newMode });
}
</script>

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
}

.control-section {
  margin-bottom: 2rem;
}

.section-title {
  margin-bottom: 1rem;
  color: #e0e0e0;
  font-size: 1.1rem;
}

.position-control {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.position-slider {
  width: 100%;
}

.slider-container {
  position: relative;
  margin: 1rem 0;
}

.slider-container label {
  display: block;
  margin-bottom: 0.5rem;
  color: #aaa;
  font-size: 0.9rem;
}

input[type='range'] {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #333;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #00bcd4;
  cursor: pointer;
  transition: all 0.2s;
}

input[type='range']::-webkit-slider-thumb:hover {
  background: #00acc1;
  transform: scale(1.1);
}

input[type='range']::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #00bcd4;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

input[type='range']::-moz-range-thumb:hover {
  background: #00acc1;
  transform: scale(1.1);
}

.position-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #00bcd4;
  text-align: center;
  margin: 1rem 0;
}

.quick-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.quick-btn {
  padding: 1rem;
  border: none;
  border-radius: 4px;
  background-color: #333;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
}

.quick-btn:hover {
  background-color: #444;
  transform: translateY(-2px);
}

.quick-btn:active {
  transform: translateY(0);
}

.control-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 4px;
  background-color: #333;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
  margin-right: 1rem;
}

.control-btn:hover {
  background-color: #444;
}

.control-btn.active {
  background-color: #00bcd4;
  color: white;
}

.mode-controls {
  margin-bottom: 2rem;
}

.status-indicators {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 3rem;
}

.indicator-card {
  background-color: #121212;
  border-radius: 6px;
  padding: 1.5rem;
  border: 1px solid #333;
}

.indicator-label {
  font-size: 0.9rem;
  color: #aaa;
  margin-bottom: 0.5rem;
}

.indicator-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #e0e0e0;
}

.reactivity-positive {
  color: #f44336;
}

.reactivity-negative {
  color: #4caf50;
}

.control-rod-diagram {
  margin: 2rem 0;
  padding: 2rem;
  background-color: #121212;
  border-radius: 6px;
  border: 1px solid #333;
}

.diagram-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #00bcd4;
}

.bg-muted {
  background-color: #333;
}

.bg-card {
  background-color: #121212;
}

.bg-primary {
  background-color: #00bcd4;
}

.text-muted-foreground {
  color: #aaa;
}
</style>

<div class="panel-container">
  <h1 class="panel-title">2. 反应堆功率调节面板</h1>

  <!-- 控制模式切换 -->
  <div class="control-section">
    <h2 class="section-title">控制模式</h2>
    <div class="mode-controls">
      <button
        class={`control-btn ${powerRegulation.automaticControl ? 'active' : ''}`}
        on:click={handleAutomaticControlToggle}
      >
        {powerRegulation.automaticControl ? '自动控制' : '手动控制'}
      </button>
      <button
        class={`control-btn ${powerRegulation.axialOffsetControl ? 'active' : ''}`}
        on:click={handleAxialOffsetControlToggle}
      >
        {powerRegulation.axialOffsetControl ? '轴向偏移控制: 开启' : '轴向偏移控制: 关闭'}
      </button>
    </div>
  </div>

  <!-- 功率设定和调节 -->
  <div class="control-section">
    <h2 class="section-title">功率水平调节</h2>

    <div class="position-control">
      <div class="slider-container">
        <label for="power-target">目标功率</label>
        <input
          id="power-target"
          type="range"
          min="0"
          max="100"
          step="0.5"
          value={powerRegulation.targetPower}
          on:input={handleTargetPowerChange}
          class="position-slider"
        />
      </div>

      <div class="position-value">
        当前功率: {powerRegulation.powerLevel.toFixed(1)}% | 目标功率: {powerRegulation.targetPower.toFixed(
          1
        )}%
      </div>

      <div class="slider-container">
        <label for="power-setpoint">功率设定点</label>
        <input
          id="power-setpoint"
          type="range"
          min="0"
          max="100"
          step="0.5"
          value={powerRegulation.powerSetpoint}
          on:input={handlePowerSetpointChange}
          class="position-slider"
        />
      </div>

      <div class="position-value">
        功率设定点: {powerRegulation.powerSetpoint.toFixed(1)}%
      </div>

      <div class="quick-controls">
        <button class="quick-btn" on:click={() => setPowerQuickly(0)}> 0% </button>
        <button class="quick-btn" on:click={() => setPowerQuickly(25)}> 25% </button>
        <button class="quick-btn" on:click={() => setPowerQuickly(50)}> 50% </button>
        <button class="quick-btn" on:click={() => setPowerQuickly(75)}> 75% </button>
        <button class="quick-btn" on:click={() => setPowerQuickly(100)}> 100% </button>
      </div>
    </div>
  </div>

  <!-- 功率水平指示器 -->
  <div class="control-rod-diagram">
    <h3 class="diagram-title">功率水平指示器</h3>
    <div class="relative w-[300px] h-[150px] mx-auto">
      <div class="absolute inset-0 rounded-t-[150px] bg-muted overflow-hidden"></div>
      <div
        class="absolute inset-0 rounded-t-[150px] bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transform rotate-180"
      ></div>
      <div
        class="absolute bottom-0 left-1/2 w-[260px] h-[130px] bg-card rounded-t-[130px] -translate-x-1/2"
      ></div>
      <div
        class="absolute bottom-0 left-1/2 w-[4px] h-[120px] bg-primary transform -translate-x-1/2 transition-transform duration-500 ease"
        style="transform-origin: bottom center; transform: translateX(-50%) rotate(calc(var(--angle, 0) * 1deg));"
        style:--angle={powerRegulation.powerLevel * 1.8}
      ></div>
      <div
        class="absolute bottom-4 left-1/2 w-[12px] h-[12px] bg-primary rounded-full -translate-x-1/2"
      ></div>
      <div class="flex justify-between mt-4 px-5 text-xs text-muted-foreground">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  </div>

  <!-- 详细参数显示 -->
  <div class="status-indicators">
    <div class="indicator-card">
      <div class="indicator-label">功率变化率</div>
      <div class="indicator-value">
        {powerRegulation.powerRate.toFixed(2)}%/s
      </div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">中子通量</div>
      <div class="indicator-value">
        {powerRegulation.neutronFlux.toFixed(2)} × 10¹³
      </div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">中子通量对数</div>
      <div class="indicator-value">
        {powerRegulation.neutronFluxLog.toFixed(2)}
      </div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">控制误差</div>
      <div class="indicator-value">
        {powerRegulation.controlError.toFixed(2)}%
      </div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">反应性</div>
      <div
        class={`indicator-value ${powerRegulation.reactivity > 0 ? 'reactivity-positive' : 'reactivity-negative'}`}
      >
        {powerRegulation.reactivity.toFixed(4)}
      </div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">堆芯温度</div>
      <div class="indicator-value">{core.temperature.toFixed(1)}°C</div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">堆芯压力</div>
      <div class="indicator-value">{core.pressure.toFixed(2)} MPa</div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">堆芯水位</div>
      <div class="indicator-value">{core.waterLevel.toFixed(1)}%</div>
    </div>
  </div>

  <div class="control-section" style="margin-top: 3rem;">
    <h2 class="section-title">操作说明</h2>
    <div
      style="background-color: #121212; padding: 1.5rem; border-radius: 6px; border: 1px solid #333;"
    >
      <ul style="margin: 0; padding-left: 1.5rem; color: #e0e0e0;">
        <li style="margin-bottom: 0.5rem;">功率水平范围: 0% 到 100%</li>
        <li style="margin-bottom: 0.5rem;">调节目标功率后，反应堆会逐渐调整到该功率水平</li>
        <li style="margin-bottom: 0.5rem;">功率水平影响堆芯温度和压力，功率越高温度和压力越大</li>
        <li style="margin-bottom: 0.5rem;">正常运行时，功率水平通常保持在 30-70% 之间</li>
        <li style="margin-bottom: 0.5rem;">功率水平的变化会受到控制棒位置的影响</li>
        <li style="margin-bottom: 0.5rem;">自动控制模式下，系统会根据设定点自动调整功率</li>
        <li style="margin-bottom: 0.5rem;">轴向偏移控制可以优化功率分布，提高反应堆效率</li>
        <li>中子通量是反应堆活性的直接指标，应密切监控</li>
      </ul>
    </div>
  </div>
</div>
