<script lang="ts">
/**
 * 汽轮机控制面板组件
 * 用于控制和监控汽轮机的运行状态
 */
import {
  reactorStore,
  toggleTurbine,
  setTurbineLoad,
  setTurbineSpeedSetpoint,
  setTurbineLoadSetpoint,
  toggleTurbineAutomaticControl,
  adjustTurbineSpeed,
  resetTurbineTrip,
} from '../../lib/stores/reactorStore';

// 订阅状态
let turbine: any; // 汽轮机系统状态
let turbineAuxiliary: any; // 汽轮机辅助系统状态
let steamBypass: any; // 蒸汽旁路系统状态
let condenserVacuum: any; // 凝汽器真空系统状态

/**
 * 订阅反应堆状态变化
 * 实时更新汽轮机相关参数
 */
reactorStore.subscribe((state) => {
  turbine = state.turbine;
  turbineAuxiliary = state.turbineAuxiliary;
  steamBypass = state.steamBypass;
  condenserVacuum = state.condenserVacuum;
});

/**
 * 处理汽轮机状态切换
 * 启动或停止汽轮机
 */
function handleTurbineToggle () {
  toggleTurbine();
}

/**
 * 处理负载变化
 * @param e 事件对象
 */
function handleLoadChange (e: Event) {
  const target = e.target as HTMLInputElement;
  const load = parseFloat(target.value);
  setTurbineLoad(load);
}

/**
 * 处理转速设定点变化
 * @param e 事件对象
 */
function handleSpeedSetpointChange (e: Event) {
  const target = e.target as HTMLInputElement;
  const speed = parseFloat(target.value);
  setTurbineSpeedSetpoint(speed);
}

/**
 * 处理负荷设定点变化
 * @param e 事件对象
 */
function handleLoadSetpointChange (e: Event) {
  const target = e.target as HTMLInputElement;
  const load = parseFloat(target.value);
  setTurbineLoadSetpoint(load);
}

/**
 * 切换自动控制模式
 * 在自动和手动控制模式之间切换
 */
function handleAutomaticControlToggle () {
  toggleTurbineAutomaticControl();
}

/**
 * 手动调整转速
 * @param adjustment 调整值
 */
function handleSpeedAdjustment (adjustment: number) {
  adjustTurbineSpeed(adjustment);
}

/**
 * 复位汽轮机跳闸
 * 清除汽轮机跳闸状态，允许重新启动
 */
function handleResetTrip () {
  resetTurbineTrip();
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

.turbine-control {
  background-color: #121212;
  border-radius: 6px;
  padding: 2rem;
  border: 1px solid #333;
  margin-bottom: 2rem;
}

.control-section {
  margin-bottom: 2rem;
}

.section-title {
  margin-bottom: 1rem;
  color: #00bcd4;
  font-size: 1.2rem;
}

.status-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.status-label {
  font-size: 1rem;
  font-weight: 600;
  color: #e0e0e0;
}

.status-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.status-indicator.running {
  background-color: #4caf50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.status-indicator.stopped {
  background-color: #f44336;
  box-shadow: 0 0 10px rgba(244, 67, 54, 0.5);
}

.toggle-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
}

.toggle-btn.start {
  background-color: #4caf50;
  color: white;
}

.toggle-btn.start:hover {
  background-color: #45a049;
}

.toggle-btn.stop {
  background-color: #f44336;
  color: white;
}

.toggle-btn.stop:hover {
  background-color: #e53935;
}

.load-control {
  margin-top: 2rem;
}

.load-label {
  font-size: 1rem;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 1rem;
  display: block;
}

.slider-container {
  position: relative;
  margin: 1.5rem 0;
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

.load-display {
  font-size: 1.5rem;
  font-weight: 600;
  color: #00bcd4;
  text-align: center;
  margin-top: 1rem;
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

.turbine-diagram {
  margin: 3rem 0;
  padding: 2rem;
  background-color: #121212;
  border-radius: 6px;
  border: 1px solid #333;
}

.diagram-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #00bcd4;
}

.diagram-content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.turbine-symbol {
  width: 200px;
  height: 100px;
  background-color: #333;
  border-radius: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.turbine-symbol.running {
  animation: rotate 5s linear infinite;
}

.turbine-symbol::before {
  content: '';
  position: absolute;
  width: 160px;
  height: 60px;
  border: 4px solid #00bcd4;
  border-radius: 30px;
}

.turbine-symbol::after {
  content: '';
  position: absolute;
  width: 120px;
  height: 40px;
  border: 4px solid #00bcd4;
  border-radius: 20px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

<div class="panel-container">
  <h1 class="panel-title">9. 汽轮机控制</h1>

  <!-- 系统概览 -->
  <div class="status-indicators">
    <div class="indicator-card">
      <div class="indicator-label">汽轮机状态</div>
      <div class="indicator-value">
        {turbine.status ? '运行中' : '已停止'}
      </div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">汽轮机转速</div>
      <div class="indicator-value">{turbine.speed} RPM</div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">当前负载</div>
      <div class="indicator-value">{turbine.load}%</div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">控制模式</div>
      <div class="indicator-value">
        {turbine.automaticControl ? '自动' : '手动'}
      </div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">润滑油压力</div>
      <div class="indicator-value">
        {turbineAuxiliary?.lubricationOil?.pressure.toFixed(2)} MPa
      </div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">密封油压力</div>
      <div class="indicator-value">
        {turbineAuxiliary?.sealOil?.pressure.toFixed(2)} MPa
      </div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">凝汽器真空</div>
      <div class="indicator-value">
        {condenserVacuum?.vacuumLevel.toFixed(2)}
      </div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">蒸汽旁路状态</div>
      <div class="indicator-value">{steamBypass?.status ? '激活' : '关闭'}</div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">旁路位置</div>
      <div class="indicator-value">
        {steamBypass?.bypassPosition.toFixed(0)}%
      </div>
    </div>
  </div>

  <!-- 跳闸状态 -->
  {#if turbine.tripStatus}
    <div style="margin: 1rem 0; padding: 1rem; background-color: #b71c1c; border-radius: 6px;">
      <div style="color: white; font-weight: 600;">
        汽轮机已跳闸: {turbine.tripReason}
      </div>
      <button class="toggle-btn start" on:click={handleResetTrip} style="margin-top: 1rem;">
        复位跳闸
      </button>
    </div>
  {/if}

  <div class="turbine-control">
    <h2 class="section-title">汽轮机状态控制</h2>

    <div class="status-control">
      <span class="status-label">状态:</span>
      <div class={`status-indicator ${turbine.status ? 'running' : 'stopped'}`}></div>
      <span class="status-label">{turbine.status ? '运行中' : '已停止'}</span>
      <button
        class={`toggle-btn ${turbine.status ? 'stop' : 'start'}`}
        on:click={handleTurbineToggle}
        disabled={turbine.tripStatus}
      >
        {turbine.status ? '停止' : '启动'}
      </button>
      <button
        class={`toggle-btn ${turbine.automaticControl ? 'stop' : 'start'}`}
        on:click={handleAutomaticControlToggle}
        style="margin-left: 1rem;"
      >
        {turbine.automaticControl ? '手动模式' : '自动模式'}
      </button>
    </div>
  </div>

  <div class="turbine-control">
    <h2 class="section-title">负载控制</h2>

    <div class="load-control">
      <label for="turbine-load" class="load-label">负载调节</label>
      <div class="slider-container">
        <input
          id="turbine-load"
          type="range"
          min="0"
          max="100"
          step="1"
          value={turbine.load}
          on:input={handleLoadChange}
          disabled={!turbine.status || turbine.automaticControl}
        />
      </div>
      <div class="load-display">
        当前负载: {turbine.load}%
      </div>
    </div>

    <div class="load-control">
      <label for="turbine-load-setpoint" class="load-label">负载设定点</label>
      <div class="slider-container">
        <input
          id="turbine-load-setpoint"
          type="range"
          min="0"
          max="100"
          step="1"
          value={turbine.loadSetpoint}
          on:input={handleLoadSetpointChange}
        />
      </div>
      <div class="load-display">
        负载设定点: {turbine.loadSetpoint}%
      </div>
    </div>
  </div>

  <div class="turbine-control">
    <h2 class="section-title">转速控制</h2>

    <div class="load-control">
      <label for="turbine-speed-setpoint" class="load-label">转速设定点 (RPM)</label>
      <div class="slider-container">
        <input
          id="turbine-speed-setpoint"
          type="range"
          min="2500"
          max="3500"
          step="10"
          value={turbine.speedSetpoint}
          on:input={handleSpeedSetpointChange}
        />
      </div>
      <div class="load-display">
        转速设定点: {turbine.speedSetpoint} RPM
      </div>
    </div>

    <!-- 手动转速调整 -->
    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
      <button
        class="toggle-btn start"
        on:click={() => handleSpeedAdjustment(50)}
        disabled={!turbine.status || turbine.automaticControl}
      >
        增加转速
      </button>
      <button
        class="toggle-btn stop"
        on:click={() => handleSpeedAdjustment(-50)}
        disabled={!turbine.status || turbine.automaticControl}
      >
        减少转速
      </button>
    </div>
  </div>

  <div class="turbine-diagram">
    <h3 class="diagram-title">汽轮机运行状态</h3>
    <div class="diagram-content">
      <div class={`turbine-symbol ${turbine.status ? 'running' : ''}`}></div>
    </div>
  </div>

  <div class="turbine-control">
    <h2 class="section-title">蒸汽参数</h2>
    <div class="status-indicators">
      <div class="indicator-card">
        <div class="indicator-label">蒸汽压力</div>
        <div class="indicator-value">
          {turbine.steamPressure.toFixed(2)} MPa
        </div>
      </div>
      <div class="indicator-card">
        <div class="indicator-label">蒸汽温度</div>
        <div class="indicator-value">
          {turbine.steamTemperature.toFixed(0)} °C
        </div>
      </div>
      <div class="indicator-card">
        <div class="indicator-label">排汽压力</div>
        <div class="indicator-value">
          {turbine.exhaustPressure.toFixed(3)} MPa
        </div>
      </div>
      <div class="indicator-card">
        <div class="indicator-label">排汽温度</div>
        <div class="indicator-value">
          {turbine.exhaustTemperature.toFixed(0)} °C
        </div>
      </div>
    </div>
  </div>

  <div class="turbine-control">
    <h2 class="section-title">阀门控制</h2>
    <div class="load-control">
      <label class="load-label" for="valvePosition">阀门位置</label>
      <div class="slider-container">
        <input
          id="valvePosition"
          type="range"
          min="0"
          max="100"
          step="1"
          value={turbine.valvePosition}
          disabled={true}
        />
      </div>
      <div class="load-display">
        阀门位置: {turbine.valvePosition}%
      </div>
    </div>
  </div>

  <!-- 蒸汽旁路系统 -->
  <div class="turbine-control">
    <h2 class="section-title">蒸汽旁路系统</h2>
    <div class="status-indicators">
      <div class="indicator-card">
        <div class="indicator-label">旁路流量</div>
        <div class="indicator-value">
          {steamBypass?.bypassFlow.toFixed(0)} kg/s
        </div>
      </div>
      <div class="indicator-card">
        <div class="indicator-label">旁路容量</div>
        <div class="indicator-value">
          {steamBypass?.bypassCapacity.toFixed(0)}%
        </div>
      </div>
      <div class="indicator-card">
        <div class="indicator-label">压力设定点</div>
        <div class="indicator-value">
          {steamBypass?.pressureSetpoint.toFixed(2)} MPa
        </div>
      </div>
    </div>
    <div class="load-control">
      <label class="load-label" for="pressureSetpoint">压力设定点调节</label>
      <div class="slider-container">
        <input
          id="pressureSetpoint"
          type="range"
          min="6.0"
          max="8.0"
          step="0.1"
          value={steamBypass?.pressureSetpoint || 7.0}
          on:input={(e) => {
            // 这里需要在reactorStore中添加相应的函数
            console.log(
              `Steam bypass pressure setpoint changed to: ${parseFloat((e.target as HTMLInputElement).value)}`
            );
          }}
        />
      </div>
      <div class="load-display">
        压力设定点: {steamBypass?.pressureSetpoint.toFixed(2)} MPa
      </div>
    </div>
  </div>

  <!-- 汽轮机辅助系统 -->
  <div class="turbine-control">
    <h2 class="section-title">汽轮机辅助系统</h2>
    <div class="status-indicators">
      <div class="indicator-card">
        <div class="indicator-label">润滑油压力</div>
        <div class="indicator-value">
          {turbineAuxiliary?.lubricationOil?.pressure.toFixed(2)} MPa
        </div>
      </div>
      <div class="indicator-card">
        <div class="indicator-label">润滑油温度</div>
        <div class="indicator-value">
          {turbineAuxiliary?.lubricationOil?.temperature.toFixed(0)} °C
        </div>
      </div>
      <div class="indicator-card">
        <div class="indicator-label">密封油压力</div>
        <div class="indicator-value">
          {turbineAuxiliary?.sealOil?.pressure.toFixed(2)} MPa
        </div>
      </div>
      <div class="indicator-card">
        <div class="indicator-label">凝汽器真空状态</div>
        <div class="indicator-value">
          {condenserVacuum?.status ? '正常' : '异常'}
        </div>
      </div>
    </div>
  </div>

  <div style="margin-top: 3rem;">
    <h2 class="section-title">操作说明</h2>
    <div
      style="background-color: #121212; padding: 1.5rem; border-radius: 6px; border: 1px solid #333;"
    >
      <ul style="margin: 0; padding-left: 1.5rem; color: #e0e0e0;">
        <li style="margin-bottom: 0.5rem;">汽轮机用于将反应堆产生的热能转换为机械能，进而发电</li>
        <li style="margin-bottom: 0.5rem;">负载调节可以控制汽轮机的输出功率</li>
        <li style="margin-bottom: 0.5rem;">汽轮机状态应与反应堆功率水平相匹配</li>
        <li style="margin-bottom: 0.5rem;">启动汽轮机前，确保反应堆功率水平在适当范围</li>
        <li style="margin-bottom: 0.5rem;">自动模式下，系统会根据设定点自动调整汽轮机运行状态</li>
        <li style="margin-bottom: 0.5rem;">汽轮机设有超速、超压等保护机制，触发时会自动跳闸</li>
        <li>停止汽轮机时，应先降低负载至零，再执行停止操作</li>
      </ul>
    </div>
  </div>
</div>
