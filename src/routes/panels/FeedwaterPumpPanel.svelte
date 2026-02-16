<script lang="ts">
  import {
    reactorStore,
    toggleReactorFeedPump,
    setReactorFeedPumpFlowRate,
    toggleIsolationValve,
    setIsolationValvePosition,
    toggleFeedwaterHeater,
    setFeedwaterHeaterParameter,
  } from '../../lib/stores/reactorStore';
  import { onMount } from 'svelte';

  let reactorFeedPumps: any;
  let feedwaterSystem: any;
  let threeImpulseLevelControl: any;
  let core: any;

  // 订阅状态
  onMount(() => {
    const unsubscribe = reactorStore.subscribe((state) => {
      reactorFeedPumps = state.reactorFeedPumps;
      feedwaterSystem = state.feedwaterSystem;
      threeImpulseLevelControl = state.threeImpulseLevelControl;
      core = state.core;
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

  // 切换隔离阀状态
  function handleToggleValve(
    valve: 'pump1Inlet' | 'pump1Outlet' | 'pump2Inlet' | 'pump2Outlet'
  ) {
    toggleIsolationValve(valve);
  }

  // 调整隔离阀位置
  function handleValvePositionChange(
    valve: 'pump1Inlet' | 'pump1Outlet' | 'pump2Inlet' | 'pump2Outlet',
    e: Event
  ) {
    const target = e.target as HTMLInputElement;
    setIsolationValvePosition(valve, parseFloat(target.value));
  }

  // 切换加热器状态
  function handleToggleHeater(heater: 'heater1' | 'heater2') {
    toggleFeedwaterHeater(heater);
  }

  // 调整加热器参数
  function handleHeaterParameterChange(
    heater: 'heater1' | 'heater2',
    parameter: 'steamPressure' | 'flowRate',
    value: number
  ) {
    setFeedwaterHeaterParameter(heater, parameter, value);
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

  <!-- 系统参数概览 -->
  <div class="info-grid">
    <div class="info-card">
      <div class="info-card-title">总给水流量</div>
      <div class="info-card-value">
        {feedwaterSystem?.system?.totalFlowRate.toFixed(0)}%
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">给水压力</div>
      <div class="info-card-value">
        {feedwaterSystem?.system?.headerPressure.toFixed(1)} MPa
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">给水温度</div>
      <div class="info-card-value">
        {feedwaterSystem?.system?.headerTemperature.toFixed(0)} °C
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">系统状态</div>
      <div class="info-card-value">
        {feedwaterSystem?.system?.status}
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">堆芯水位</div>
      <div class="info-card-value">
        {core?.waterLevel.toFixed(1)}%
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">水位设定点</div>
      <div class="info-card-value">
        {threeImpulseLevelControl?.waterLevelSetpoint.toFixed(1)}%
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">水位状态</div>
      <div class="info-card-value">
        {threeImpulseLevelControl?.waterLevelStatus}
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-title">水位警报</div>
      <div class="info-card-value">
        {threeImpulseLevelControl?.alarm ? '激活' : '正常'}
      </div>
    </div>
  </div>

  <div class="divider"></div>

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

    <!-- 泵 1 隔离阀 -->
    <div class="control-group">
      <h3 class="control-label">隔离阀控制</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div>
          <div
            class="control-label"
            style="font-size: 0.9rem; margin-bottom: 0.5rem;"
          >
            入口阀
          </div>
          <button
            class="toggle-button"
            class:active={feedwaterSystem?.isolationValves?.pump1Inlet?.status}
            class:inactive={!feedwaterSystem?.isolationValves?.pump1Inlet
              ?.status}
            on:click={() => handleToggleValve('pump1Inlet')}
          >
            {feedwaterSystem?.isolationValves?.pump1Inlet?.status
              ? '关闭'
              : '打开'}
          </button>
          <div class="slider-container" style="margin-top: 0.5rem;">
            <input
              type="range"
              class="slider"
              min="0"
              max="100"
              step="1"
              value={feedwaterSystem?.isolationValves?.pump1Inlet?.position ||
                0}
              on:input={(e) => handleValvePositionChange('pump1Inlet', e)}
            />
          </div>
          <div class="value-display" style="font-size: 0.8rem;">
            {feedwaterSystem?.isolationValves?.pump1Inlet?.position.toFixed(0)}%
          </div>
        </div>
        <div>
          <div
            class="control-label"
            style="font-size: 0.9rem; margin-bottom: 0.5rem;"
          >
            出口阀
          </div>
          <button
            class="toggle-button"
            class:active={feedwaterSystem?.isolationValves?.pump1Outlet?.status}
            class:inactive={!feedwaterSystem?.isolationValves?.pump1Outlet
              ?.status}
            on:click={() => handleToggleValve('pump1Outlet')}
          >
            {feedwaterSystem?.isolationValves?.pump1Outlet?.status
              ? '关闭'
              : '打开'}
          </button>
          <div class="slider-container" style="margin-top: 0.5rem;">
            <input
              type="range"
              class="slider"
              min="0"
              max="100"
              step="1"
              value={feedwaterSystem?.isolationValves?.pump1Outlet?.position ||
                0}
              on:input={(e) => handleValvePositionChange('pump1Outlet', e)}
            />
          </div>
          <div class="value-display" style="font-size: 0.8rem;">
            {feedwaterSystem?.isolationValves?.pump1Outlet?.position.toFixed(
              0
            )}%
          </div>
        </div>
      </div>
    </div>

    <!-- 泵 1 状态参数 -->
    <div class="info-grid" style="margin-top: 1rem;">
      <div class="info-card" style="padding: 1rem;">
        <div class="info-card-title">压力</div>
        <div class="info-card-value" style="font-size: 1.2rem;">
          {reactorFeedPumps?.pump1?.pressure.toFixed(1)} MPa
        </div>
      </div>
      <div class="info-card" style="padding: 1rem;">
        <div class="info-card-title">温度</div>
        <div class="info-card-value" style="font-size: 1.2rem;">
          {reactorFeedPumps?.pump1?.temperature.toFixed(0)} °C
        </div>
      </div>
      <div class="info-card" style="padding: 1rem;">
        <div class="info-card-title">振动</div>
        <div class="info-card-value" style="font-size: 1.2rem;">
          {reactorFeedPumps?.pump1?.vibration.toFixed(2)}
        </div>
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

    <!-- 泵 2 隔离阀 -->
    <div class="control-group">
      <h3 class="control-label">隔离阀控制</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div>
          <div
            class="control-label"
            style="font-size: 0.9rem; margin-bottom: 0.5rem;"
          >
            入口阀
          </div>
          <button
            class="toggle-button"
            class:active={feedwaterSystem?.isolationValves?.pump2Inlet?.status}
            class:inactive={!feedwaterSystem?.isolationValves?.pump2Inlet
              ?.status}
            on:click={() => handleToggleValve('pump2Inlet')}
          >
            {feedwaterSystem?.isolationValves?.pump2Inlet?.status
              ? '关闭'
              : '打开'}
          </button>
          <div class="slider-container" style="margin-top: 0.5rem;">
            <input
              type="range"
              class="slider"
              min="0"
              max="100"
              step="1"
              value={feedwaterSystem?.isolationValves?.pump2Inlet?.position ||
                0}
              on:input={(e) => handleValvePositionChange('pump2Inlet', e)}
            />
          </div>
          <div class="value-display" style="font-size: 0.8rem;">
            {feedwaterSystem?.isolationValves?.pump2Inlet?.position.toFixed(0)}%
          </div>
        </div>
        <div>
          <div
            class="control-label"
            style="font-size: 0.9rem; margin-bottom: 0.5rem;"
          >
            出口阀
          </div>
          <button
            class="toggle-button"
            class:active={feedwaterSystem?.isolationValves?.pump2Outlet?.status}
            class:inactive={!feedwaterSystem?.isolationValves?.pump2Outlet
              ?.status}
            on:click={() => handleToggleValve('pump2Outlet')}
          >
            {feedwaterSystem?.isolationValves?.pump2Outlet?.status
              ? '关闭'
              : '打开'}
          </button>
          <div class="slider-container" style="margin-top: 0.5rem;">
            <input
              type="range"
              class="slider"
              min="0"
              max="100"
              step="1"
              value={feedwaterSystem?.isolationValves?.pump2Outlet?.position ||
                0}
              on:input={(e) => handleValvePositionChange('pump2Outlet', e)}
            />
          </div>
          <div class="value-display" style="font-size: 0.8rem;">
            {feedwaterSystem?.isolationValves?.pump2Outlet?.position.toFixed(
              0
            )}%
          </div>
        </div>
      </div>
    </div>

    <!-- 泵 2 状态参数 -->
    <div class="info-grid" style="margin-top: 1rem;">
      <div class="info-card" style="padding: 1rem;">
        <div class="info-card-title">压力</div>
        <div class="info-card-value" style="font-size: 1.2rem;">
          {reactorFeedPumps?.pump2?.pressure.toFixed(1)} MPa
        </div>
      </div>
      <div class="info-card" style="padding: 1rem;">
        <div class="info-card-title">温度</div>
        <div class="info-card-value" style="font-size: 1.2rem;">
          {reactorFeedPumps?.pump2?.temperature.toFixed(0)} °C
        </div>
      </div>
      <div class="info-card" style="padding: 1rem;">
        <div class="info-card-title">振动</div>
        <div class="info-card-value" style="font-size: 1.2rem;">
          {reactorFeedPumps?.pump2?.vibration.toFixed(2)}
        </div>
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- 给水加热器 -->
  <div class="pump-container">
    <h2 class="pump-title">给水加热器</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
      <!-- 加热器 1 -->
      <div>
        <div class="pump-header" style="margin-bottom: 1rem;">
          <h3 class="control-label">加热器 1</h3>
          <span
            class="pump-status"
            class:active={feedwaterSystem?.heaters?.heater1?.status}
            class:inactive={!feedwaterSystem?.heaters?.heater1?.status}
          >
            {feedwaterSystem?.heaters?.heater1?.status ? '运行中' : '已停止'}
          </span>
        </div>
        <button
          class="toggle-button"
          class:active={feedwaterSystem?.heaters?.heater1?.status}
          class:inactive={!feedwaterSystem?.heaters?.heater1?.status}
          on:click={() => handleToggleHeater('heater1')}
          style="margin-bottom: 1rem;"
        >
          {feedwaterSystem?.heaters?.heater1?.status ? '停止' : '启动'}
        </button>
        <div class="control-group">
          <h3 class="control-label">蒸汽压力 (MPa)</h3>
          <div class="slider-container">
            <input
              type="range"
              class="slider"
              min="0"
              max="5"
              step="0.1"
              value={feedwaterSystem?.heaters?.heater1?.steamPressure || 0}
              on:input={(e) =>
                handleHeaterParameterChange(
                  'heater1',
                  'steamPressure',
                  parseFloat((e.target as HTMLInputElement).value)
                )}
              disabled={!feedwaterSystem?.heaters?.heater1?.status}
            />
          </div>
          <div class="value-display">
            {feedwaterSystem?.heaters?.heater1?.steamPressure.toFixed(1)} MPa
          </div>
        </div>
        <div class="info-grid" style="margin-top: 1rem;">
          <div class="info-card" style="padding: 1rem;">
            <div class="info-card-title">入口温度</div>
            <div class="info-card-value" style="font-size: 1.2rem;">
              {feedwaterSystem?.heaters?.heater1?.inletTemperature.toFixed(0)} °C
            </div>
          </div>
          <div class="info-card" style="padding: 1rem;">
            <div class="info-card-title">出口温度</div>
            <div class="info-card-value" style="font-size: 1.2rem;">
              {feedwaterSystem?.heaters?.heater1?.outletTemperature.toFixed(0)} °C
            </div>
          </div>
        </div>
      </div>

      <!-- 加热器 2 -->
      <div>
        <div class="pump-header" style="margin-bottom: 1rem;">
          <h3 class="control-label">加热器 2</h3>
          <span
            class="pump-status"
            class:active={feedwaterSystem?.heaters?.heater2?.status}
            class:inactive={!feedwaterSystem?.heaters?.heater2?.status}
          >
            {feedwaterSystem?.heaters?.heater2?.status ? '运行中' : '已停止'}
          </span>
        </div>
        <button
          class="toggle-button"
          class:active={feedwaterSystem?.heaters?.heater2?.status}
          class:inactive={!feedwaterSystem?.heaters?.heater2?.status}
          on:click={() => handleToggleHeater('heater2')}
          style="margin-bottom: 1rem;"
        >
          {feedwaterSystem?.heaters?.heater2?.status ? '停止' : '启动'}
        </button>
        <div class="control-group">
          <h3 class="control-label">蒸汽压力 (MPa)</h3>
          <div class="slider-container">
            <input
              type="range"
              class="slider"
              min="0"
              max="7"
              step="0.1"
              value={feedwaterSystem?.heaters?.heater2?.steamPressure || 0}
              on:input={(e) =>
                handleHeaterParameterChange(
                  'heater2',
                  'steamPressure',
                  parseFloat((e.target as HTMLInputElement).value)
                )}
              disabled={!feedwaterSystem?.heaters?.heater2?.status}
            />
          </div>
          <div class="value-display">
            {feedwaterSystem?.heaters?.heater2?.steamPressure.toFixed(1)} MPa
          </div>
        </div>
        <div class="info-grid" style="margin-top: 1rem;">
          <div class="info-card" style="padding: 1rem;">
            <div class="info-card-title">入口温度</div>
            <div class="info-card-value" style="font-size: 1.2rem;">
              {feedwaterSystem?.heaters?.heater2?.inletTemperature.toFixed(0)} °C
            </div>
          </div>
          <div class="info-card" style="padding: 1rem;">
            <div class="info-card-title">出口温度</div>
            <div class="info-card-value" style="font-size: 1.2rem;">
              {feedwaterSystem?.heaters?.heater2?.outletTemperature.toFixed(0)} °C
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- 三冲量水位控制系统 -->
  <div class="pump-container">
    <h2 class="pump-title">三冲量水位控制系统</h2>
    <div class="info-grid">
      <div class="info-card">
        <div class="info-card-title">调整后的给水流量</div>
        <div class="info-card-value">
          {threeImpulseLevelControl?.adjustedFeedwaterFlow.toFixed(0)} kg/h
        </div>
      </div>
      <div class="info-card">
        <div class="info-card-title">水位误差</div>
        <div class="info-card-value">
          {threeImpulseLevelControl?.levelError.toFixed(2)}%
        </div>
      </div>
      <div class="info-card">
        <div class="info-card-title">流量误差</div>
        <div class="info-card-value">
          {threeImpulseLevelControl?.flowError.toFixed(0)} kg/h
        </div>
      </div>
    </div>
    <div class="control-group">
      <h3 class="control-label">水位设定点调节</h3>
      <div class="slider-container">
        <input
          type="range"
          class="slider"
          min="45"
          max="90"
          step="1"
          value={threeImpulseLevelControl?.waterLevelSetpoint || 70}
          on:input={(e) => {
            // 这里需要在reactorStore中添加相应的函数
            console.log(
              `Water level setpoint changed to: ${parseFloat((e.target as HTMLInputElement).value)}`
            );
          }}
        />
      </div>
      <div class="value-display">
        {threeImpulseLevelControl?.waterLevelSetpoint.toFixed(1)}%
      </div>
    </div>
  </div>
</div>
