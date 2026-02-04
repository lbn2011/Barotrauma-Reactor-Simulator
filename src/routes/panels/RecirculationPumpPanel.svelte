<script lang="ts">
  import {
    reactorStore,
    toggleRecirculationPump,
    setRecirculationPumpSpeed,
  } from '../../lib/stores/reactorStore';

  // 订阅状态
  let recirculationPumps: {
    pump1: { status: boolean; speed: number };
    pump2: { status: boolean; speed: number };
  };
  let powerLevel: number;

  reactorStore.subscribe((state) => {
    recirculationPumps = state.recirculationPumps;
    powerLevel = state.powerRegulation.powerLevel;
  });

  // 处理泵状态切换
  function handlePumpToggle(pumpNumber: 1 | 2) {
    toggleRecirculationPump(pumpNumber);
  }

  // 处理泵转速变化
  function handleSpeedChange(pumpNumber: 1 | 2, e: Event) {
    const target = e.target as HTMLInputElement;
    const speed = parseFloat(target.value);
    setRecirculationPumpSpeed(pumpNumber, speed);
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

  .speed-control {
    margin-top: 2rem;
  }

  .speed-label {
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

  .speed-display {
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
  }

  .pump-symbol::before {
    content: '';
    position: absolute;
    width: 80px;
    height: 80px;
    border: 4px solid #00bcd4;
    border-radius: 50%;
  }

  .pump-symbol::after {
    content: '';
    position: absolute;
    width: 40px;
    height: 40px;
    border: 4px solid #00bcd4;
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
  <h1 class="panel-title">3/4. 反应堆再循环泵</h1>

  <div class="pumps-container">
    <!-- 泵 1 -->
    <div class="pump-card">
      <h2 class="pump-title">再循环泵 1</h2>

      <div class="pump-status">
        <span class="status-label">状态:</span>
        <div
          class={`status-indicator ${recirculationPumps.pump1.status ? 'running' : 'stopped'}`}
        ></div>
        <span class="status-label"
          >{recirculationPumps.pump1.status ? '运行中' : '已停止'}</span
        >
        <button
          class={`toggle-btn ${recirculationPumps.pump1.status ? 'stop' : 'start'}`}
          on:click={() => handlePumpToggle(1)}
        >
          {recirculationPumps.pump1.status ? '停止' : '启动'}
        </button>
      </div>

      <div class="speed-control">
        <label for="pump1-speed" class="speed-label">转速调节</label>
        <div class="slider-container">
          <input
            id="pump1-speed"
            type="range"
            min="0"
            max="100"
            step="1"
            value={recirculationPumps.pump1.speed}
            on:input={(e) => handleSpeedChange(1, e)}
            disabled={!recirculationPumps.pump1.status}
          />
        </div>
        <div class="speed-display">
          {recirculationPumps.pump1.speed}%
        </div>
      </div>
    </div>

    <!-- 泵 2 -->
    <div class="pump-card">
      <h2 class="pump-title">再循环泵 2</h2>

      <div class="pump-status">
        <span class="status-label">状态:</span>
        <div
          class={`status-indicator ${recirculationPumps.pump2.status ? 'running' : 'stopped'}`}
        ></div>
        <span class="status-label"
          >{recirculationPumps.pump2.status ? '运行中' : '已停止'}</span
        >
        <button
          class={`toggle-btn ${recirculationPumps.pump2.status ? 'stop' : 'start'}`}
          on:click={() => handlePumpToggle(2)}
        >
          {recirculationPumps.pump2.status ? '停止' : '启动'}
        </button>
      </div>

      <div class="speed-control">
        <label for="pump2-speed" class="speed-label">转速调节</label>
        <div class="slider-container">
          <input
            id="pump2-speed"
            type="range"
            min="0"
            max="100"
            step="1"
            value={recirculationPumps.pump2.speed}
            on:input={(e) => handleSpeedChange(2, e)}
            disabled={!recirculationPumps.pump2.status}
          />
        </div>
        <div class="speed-display">
          {recirculationPumps.pump2.speed}%
        </div>
      </div>
    </div>
  </div>

  <div class="pump-diagram">
    <h3 class="diagram-title">再循环泵状态示意图</h3>
    <div class="diagram-content">
      <div class="pump-illustration">
        <div
          class={`pump-symbol ${recirculationPumps.pump1.status ? 'running' : ''}`}
        ></div>
        <div class="pump-label">
          泵 1 - {recirculationPumps.pump1.status ? '运行中' : '已停止'}
        </div>
      </div>
      <div class="pump-illustration">
        <div
          class={`pump-symbol ${recirculationPumps.pump2.status ? 'running' : ''}`}
        ></div>
        <div class="pump-label">
          泵 2 - {recirculationPumps.pump2.status ? '运行中' : '已停止'}
        </div>
      </div>
    </div>
  </div>

  <div class="status-indicators">
    <div class="indicator-card">
      <div class="indicator-label">平均转速</div>
      <div class="indicator-value">
        {(
          (recirculationPumps.pump1.speed + recirculationPumps.pump2.speed) /
          2
        ).toFixed(1)}%
      </div>
    </div>

    <div class="indicator-card">
      <div class="indicator-label">当前功率水平</div>
      <div class="indicator-value">{powerLevel.toFixed(1)}%</div>
    </div>

    <div class="indicator-card">
      <div class="indicator-label">运行泵数量</div>
      <div class="indicator-value">
        {Number(recirculationPumps.pump1.status) +
          Number(recirculationPumps.pump2.status)}
      </div>
    </div>
  </div>

  <div style="margin-top: 3rem;">
    <h2 class="pump-title">操作说明</h2>
    <div
      style="background-color: #121212; padding: 1.5rem; border-radius: 6px; border: 1px solid #333;"
    >
      <ul style="margin: 0; padding-left: 1.5rem; color: #e0e0e0;">
        <li style="margin-bottom: 0.5rem;">
          再循环泵用于控制反应堆堆芯的冷却剂流量
        </li>
        <li style="margin-bottom: 0.5rem;">
          转速越高，冷却剂流量越大，反应堆功率潜力越大
        </li>
        <li style="margin-bottom: 0.5rem;">正常运行时，至少应保持一台泵运行</li>
        <li style="margin-bottom: 0.5rem;">
          泵的状态会影响反应堆的功率响应速度
        </li>
        <li>调整泵转速时应缓慢进行，避免功率波动过大</li>
      </ul>
    </div>
  </div>
</div>
