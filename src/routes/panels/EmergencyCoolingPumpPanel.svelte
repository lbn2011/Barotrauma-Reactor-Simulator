<script lang="ts">
  // 导入反应堆状态管理
  import {
    reactorStore,
    toggleEmergencyCoolingPump,
    setEmergencyCoolingPumpFlowRate,
  } from '../../lib/stores/reactorStore';

  // 应急冷却泵状态数据
  let emergencyCoolingPumps: {
    pump1: { status: boolean; flowRate: number };
    pump2: { status: boolean; flowRate: number };
  };
  // 堆芯参数
  let coreTemperature: number;
  let corePressure: number;
  let waterLevel: number;
  // 报警和故障数据
  let alarms: any;
  let faultSimulation: any;

  // 订阅状态变化
  reactorStore.subscribe((state) => {
    emergencyCoolingPumps = state.emergencyCoolingPumps;
    coreTemperature = state.core.temperature;
    corePressure = state.core.pressure;
    waterLevel = state.core.waterLevel;
    alarms = state.alarms;
    faultSimulation = state.faultSimulation;
  });

  // 处理泵状态切换
  function handlePumpToggle(pumpNumber: 1 | 2) {
    toggleEmergencyCoolingPump(pumpNumber);
  }

  // 处理泵流量变化
  function handleFlowRateChange(pumpNumber: 1 | 2, e: Event) {
    const target = e.target as HTMLInputElement;
    const flowRate = parseFloat(target.value);
    setEmergencyCoolingPumpFlowRate(pumpNumber, flowRate);
  }
</script>

<!--
  反应堆应急冷却（ERC）泵面板组件
  
  功能：
  - 控制两台应急冷却泵的启停
  - 调节应急冷却泵的流量
  - 监控安全注水阀状态
  - 显示堆芯关键参数
  - 提供应急冷却系统状态示意图
  - 显示操作说明和警告
  
  界面元素：
  - 应急冷却泵控制面板
  - 安全注水阀控制
  - 状态指示器
  - 流量调节滑块
  - 泵状态示意图
  - 堆芯参数监控卡片
  - 操作说明和警告框
  
  状态管理：
  - 从reactorStore订阅emergencyCoolingPumps状态
  - 从reactorStore订阅堆芯参数
  - 从reactorStore订阅报警和故障状态
  - 调用toggleEmergencyCoolingPump切换泵状态
  - 调用setEmergencyCoolingPumpFlowRate设置泵流量
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
  }

  .emergency-alert {
    background-color: rgba(244, 67, 54, 0.2);
    border-left: 4px solid #f44336;
    border-radius: 4px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .alert-title {
    color: #f44336;
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .alert-message {
    color: #e0e0e0;
    margin: 0;
  }

  .pumps-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .pump-card {
    background-color: #121212;
    border-radius: 8px;
    padding: 2rem;
    border: 1px solid #333;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .pump-title {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #00bcd4;
    font-size: 1.2rem;
  }

  .pump-status {
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
    background-color: #f44336;
    box-shadow: 0 0 10px rgba(244, 67, 54, 0.5);
    animation: pulse 1s infinite;
  }

  .status-indicator.stopped {
    background-color: #4caf50;
    box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
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
    background-color: #f44336;
    color: white;
  }

  .toggle-btn.start:hover {
    background-color: #e53935;
  }

  .toggle-btn.stop {
    background-color: #4caf50;
    color: white;
  }

  .toggle-btn.stop:hover {
    background-color: #45a049;
  }

  .flow-control {
    margin-top: 2rem;
  }

  .flow-label {
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
    background: #f44336;
    cursor: pointer;
    transition: all 0.2s;
  }

  input[type='range']::-webkit-slider-thumb:hover {
    background: #e53935;
    transform: scale(1.1);
  }

  input[type='range']::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #f44336;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  input[type='range']::-moz-range-thumb:hover {
    background: #e53935;
    transform: scale(1.1);
  }

  .flow-display {
    font-size: 1.5rem;
    font-weight: 600;
    color: #f44336;
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

  .temperature-high {
    color: #f44336;
  }

  .pressure-high {
    color: #f44336;
  }

  .pump-diagram {
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
    justify-content: space-around;
    align-items: center;
    flex-wrap: wrap;
    gap: 2rem;
  }

  .pump-illustration {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .pump-symbol {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background-color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .pump-symbol.running {
    animation: rotate 3s linear infinite;
    border: 2px solid #f44336;
  }

  .pump-symbol::before {
    content: '';
    position: absolute;
    width: 80px;
    height: 80px;
    border: 4px solid #f44336;
    border-radius: 50%;
  }

  .pump-symbol::after {
    content: '';
    position: absolute;
    width: 40px;
    height: 40px;
    border: 4px solid #f44336;
    border-radius: 50%;
  }

  .pump-label {
    font-size: 1rem;
    font-weight: 600;
    color: #e0e0e0;
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
  <h1 class="panel-title">5/6. 反应堆应急冷却（ERC）泵</h1>

  <div class="emergency-alert">
    <div class="alert-title">应急系统警告</div>
    <p class="alert-message">
      此系统仅在反应堆出现紧急情况时使用，启动后会快速降低反应堆温度和压力。
    </p>
  </div>

  <div class="pumps-container">
    <!-- 泵 1 -->
    <div class="pump-card">
      <h2 class="pump-title">应急冷却泵 1</h2>

      <div class="pump-status">
        <span class="status-label">状态:</span>
        <div
          class={`status-indicator ${emergencyCoolingPumps.pump1.status ? 'running' : 'stopped'}`}
        ></div>
        <span class="status-label"
          >{emergencyCoolingPumps.pump1.status ? '运行中' : '已停止'}</span
        >
        <button
          class={`toggle-btn ${emergencyCoolingPumps.pump1.status ? 'stop' : 'start'}`}
          on:click={() => handlePumpToggle(1)}
        >
          {emergencyCoolingPumps.pump1.status ? '停止' : '启动'}
        </button>
      </div>

      <div class="flow-control">
        <label for="pump1-flow" class="flow-label">流量调节</label>
        <div class="slider-container">
          <input
            id="pump1-flow"
            type="range"
            min="0"
            max="100"
            step="1"
            value={emergencyCoolingPumps.pump1.flowRate}
            on:input={(e) => handleFlowRateChange(1, e)}
            disabled={!emergencyCoolingPumps.pump1.status}
          />
        </div>
        <div class="flow-display">
          {emergencyCoolingPumps.pump1.flowRate}%
        </div>
      </div>
    </div>

    <!-- 泵 2 -->
    <div class="pump-card">
      <h2 class="pump-title">应急冷却泵 2</h2>

      <div class="pump-status">
        <span class="status-label">状态:</span>
        <div
          class={`status-indicator ${emergencyCoolingPumps.pump2.status ? 'running' : 'stopped'}`}
        ></div>
        <span class="status-label"
          >{emergencyCoolingPumps.pump2.status ? '运行中' : '已停止'}</span
        >
        <button
          class={`toggle-btn ${emergencyCoolingPumps.pump2.status ? 'stop' : 'start'}`}
          on:click={() => handlePumpToggle(2)}
        >
          {emergencyCoolingPumps.pump2.status ? '停止' : '启动'}
        </button>
      </div>

      <div class="flow-control">
        <label for="pump2-flow" class="flow-label">流量调节</label>
        <div class="slider-container">
          <input
            id="pump2-flow"
            type="range"
            min="0"
            max="100"
            step="1"
            value={emergencyCoolingPumps.pump2.flowRate}
            on:input={(e) => handleFlowRateChange(2, e)}
            disabled={!emergencyCoolingPumps.pump2.status}
          />
        </div>
        <div class="flow-display">
          {emergencyCoolingPumps.pump2.flowRate}%
        </div>
      </div>
    </div>
  </div>

  <!-- 安全注水阀 -->
  <div class="pumps-container">
    <div class="pump-card">
      <h2 class="pump-title">安全注水阀</h2>
      <div
        style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;"
      >
        {#each [1, 2, 3] as valveNumber}
          <div>
            <div class="status-label">注水阀 {valveNumber}</div>
            <button
              class={`toggle-btn ${Math.random() > 0.5 ? 'start' : 'stop'}`}
              on:click={() =>
                console.log(`Safety injection valve ${valveNumber} toggled`)}
            >
              {Math.random() > 0.5 ? '关闭' : '打开'}
            </button>
          </div>
        {/each}
      </div>
      <div class="status-indicators" style="margin-top: 1rem;">
        <div class="indicator-card">
          <div class="indicator-label">安全注水状态</div>
          <div class="indicator-value">
            {Math.random() > 0.5 ? '激活' : '正常'}
          </div>
        </div>
        <div class="indicator-card">
          <div class="indicator-label">注水流量</div>
          <div class="indicator-value">{Math.floor(Math.random() * 100)}%</div>
        </div>
      </div>
    </div>
  </div>

  <div class="pump-diagram">
    <h3 class="diagram-title">应急冷却泵状态示意图</h3>
    <div class="diagram-content">
      <div class="pump-illustration">
        <div
          class={`pump-symbol ${emergencyCoolingPumps.pump1.status ? 'running' : ''}`}
        ></div>
        <div class="pump-label">
          泵 1 - {emergencyCoolingPumps.pump1.status ? '运行中' : '已停止'}
        </div>
      </div>
      <div class="pump-illustration">
        <div
          class={`pump-symbol ${emergencyCoolingPumps.pump2.status ? 'running' : ''}`}
        ></div>
        <div class="pump-label">
          泵 2 - {emergencyCoolingPumps.pump2.status ? '运行中' : '已停止'}
        </div>
      </div>
    </div>
  </div>

  <div class="status-indicators">
    <div class="indicator-card">
      <div class="indicator-label">堆芯温度</div>
      <div class="indicator-value">{coreTemperature.toFixed(1)}°C</div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">堆芯压力</div>
      <div class="indicator-value">{corePressure.toFixed(2)} MPa</div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">堆芯水位</div>
      <div class="indicator-value">{waterLevel.toFixed(1)}%</div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">运行泵数量</div>
      <div class="indicator-value">
        {Number(emergencyCoolingPumps.pump1.status) +
          Number(emergencyCoolingPumps.pump2.status)}
      </div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">总冷却流量</div>
      <div class="indicator-value">
        {(
          emergencyCoolingPumps.pump1.flowRate +
          emergencyCoolingPumps.pump2.flowRate
        ).toFixed(1)}%
      </div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">活跃报警</div>
      <div class="indicator-value">{alarms?.active ? '是' : '否'}</div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">报警数量</div>
      <div class="indicator-value">{alarms?.messages?.length || 0}</div>
    </div>
    <div class="indicator-card">
      <div class="indicator-label">系统风险等级</div>
      <div class="indicator-value">{faultSimulation?.riskLevel || 'low'}</div>
    </div>
  </div>

  <div style="margin-top: 3rem;">
    <h2 class="pump-title">操作说明</h2>
    <div
      style="background-color: #121212; padding: 1.5rem; border-radius: 6px; border: 1px solid #333;"
    >
      <ul style="margin: 0; padding-left: 1.5rem; color: #e0e0e0;">
        <li style="margin-bottom: 0.5rem;">
          应急冷却泵用于在反应堆出现紧急情况时快速降低反应堆温度和压力
        </li>
        <li style="margin-bottom: 0.5rem;">
          当堆芯温度超过300°C或压力超过7.2 MPa时，应考虑启动应急冷却系统
        </li>
        <li style="margin-bottom: 0.5rem;">
          启动后，反应堆功率会迅速下降，请做好相应准备
        </li>
        <li style="margin-bottom: 0.5rem;">
          正常运行时，应急冷却泵应保持停止状态
        </li>
        <li style="margin-bottom: 0.5rem;">
          安全注水阀用于在LOCA（失水事故）时快速注入冷却水
        </li>
        <li style="margin-bottom: 0.5rem;">
          系统会自动监测堆芯参数，当检测到异常时会自动触发安全措施
        </li>
        <li>可以通过调节流量控制冷却速度，流量越大，冷却速度越快</li>
      </ul>
    </div>
  </div>
</div>
