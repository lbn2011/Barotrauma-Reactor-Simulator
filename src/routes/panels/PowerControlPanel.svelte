<script lang="ts">
  import { reactorStore, setTargetPower } from '../../lib/stores/reactorStore';

  // 订阅状态
  let powerRegulation: {
    powerLevel: number;
    targetPower: number;
    reactivity: number;
  };
  let core: { temperature: number; pressure: number; waterLevel: number };

  reactorStore.subscribe((state) => {
    powerRegulation = state.powerRegulation;
    core = state.core;
  });

  // 处理目标功率变化
  function handleTargetPowerChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const power = parseFloat(target.value);
    setTargetPower(power);
  }

  // 快速操作按钮
  function setPowerQuickly(power: number) {
    setTargetPower(power);
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

  .power-section {
    margin-bottom: 2rem;
  }

  .section-title {
    margin-bottom: 1rem;
    color: #e0e0e0;
    font-size: 1.1rem;
  }

  .power-control {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .slider-container {
    position: relative;
    margin: 2rem 0;
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

  .power-values {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .value-card {
    background-color: #121212;
    border-radius: 6px;
    padding: 1.5rem;
    border: 1px solid #333;
  }

  .value-label {
    font-size: 0.9rem;
    color: #aaa;
    margin-bottom: 0.5rem;
  }

  .value-display {
    font-size: 1.8rem;
    font-weight: 600;
    color: #e0e0e0;
  }

  .value-display.target {
    color: #00bcd4;
  }

  .quick-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
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

  .power-diagram {
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

  .power-gauge {
    position: relative;
    width: 300px;
    height: 150px;
    margin: 0 auto;
  }

  .gauge-background {
    position: absolute;
    width: 300px;
    height: 150px;
    border-radius: 150px 150px 0 0;
    background-color: #333;
    overflow: hidden;
  }

  .gauge-scale {
    position: absolute;
    width: 300px;
    height: 150px;
    border-radius: 150px 150px 0 0;
    background: conic-gradient(
      #4caf50 0deg 180deg,
      #ffeb3b 180deg 270deg,
      #f44336 270deg 360deg
    );
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    transform: rotate(180deg);
    transform-origin: center bottom;
  }

  .gauge-mask {
    position: absolute;
    bottom: 0;
    width: 260px;
    height: 130px;
    background-color: #121212;
    border-radius: 130px 130px 0 0;
    left: 50%;
    transform: translateX(-50%);
  }

  .gauge-needle {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 4px;
    height: 120px;
    background-color: #00bcd4;
    transform-origin: bottom center;
    transform: translateX(-50%) rotate(calc(var(--angle, 0) * 1deg));
    transition: transform 0.5s ease;
    border-radius: 4px 4px 0 0;
  }

  .gauge-center {
    position: absolute;
    bottom: 10px;
    left: 50%;
    width: 12px;
    height: 12px;
    background-color: #00bcd4;
    border-radius: 50%;
    transform: translateX(-50%);
  }

  .gauge-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    padding: 0 20px;
    font-size: 0.8rem;
    color: #aaa;
  }
</style>

<div class="panel-container">
  <h1 class="panel-title">2. 反应堆功率调节面板</h1>

  <div class="power-section">
    <h2 class="section-title">功率水平调节</h2>

    <div class="power-control">
      <div class="slider-container">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={powerRegulation.targetPower}
          on:input={handleTargetPowerChange}
        />
      </div>

      <div class="power-values">
        <div class="value-card">
          <div class="value-label">当前功率水平</div>
          <div class="value-display">
            {powerRegulation.powerLevel?.toFixed(1)}%
          </div>
        </div>

        <div class="value-card">
          <div class="value-label">目标功率水平</div>
          <div class="value-display target">
            {powerRegulation.targetPower?.toFixed(1)}%
          </div>
        </div>
      </div>

      <div class="quick-controls">
        <button class="quick-btn" on:click={() => setPowerQuickly(0)}>
          0%
        </button>
        <button class="quick-btn" on:click={() => setPowerQuickly(25)}>
          25%
        </button>
        <button class="quick-btn" on:click={() => setPowerQuickly(50)}>
          50%
        </button>
        <button class="quick-btn" on:click={() => setPowerQuickly(75)}>
          75%
        </button>
        <button class="quick-btn" on:click={() => setPowerQuickly(100)}>
          100%
        </button>
      </div>
    </div>
  </div>

  <div class="power-diagram">
    <h3 class="diagram-title">功率水平指示器</h3>
    <div class="power-gauge">
      <div class="gauge-background"></div>
      <div class="gauge-scale"></div>
      <div class="gauge-mask"></div>
      <div
        class="gauge-needle"
        style="--angle: {powerRegulation.powerLevel
          ? powerRegulation.powerLevel * 1.8
          : 0}"
      ></div>
      <div class="gauge-center"></div>
      <div class="gauge-labels">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  </div>

  <div class="status-indicators">
    <div class="indicator-card">
      <div class="indicator-label">反应性</div>
      <div
        class={`indicator-value ${powerRegulation.reactivity > 0 ? 'reactivity-positive' : 'reactivity-negative'}`}
      >
        {powerRegulation.reactivity?.toFixed(2)}
      </div>
    </div>

    <div class="indicator-card">
      <div class="indicator-label">堆芯温度</div>
      <div class="indicator-value">{core.temperature?.toFixed(1)}°C</div>
    </div>

    <div class="indicator-card">
      <div class="indicator-label">堆芯压力</div>
      <div class="indicator-value">{core.pressure?.toFixed(2)} MPa</div>
    </div>
  </div>

  <div class="power-section" style="margin-top: 3rem;">
    <h2 class="section-title">操作说明</h2>
    <div
      style="background-color: #121212; padding: 1.5rem; border-radius: 6px; border: 1px solid #333;"
    >
      <ul style="margin: 0; padding-left: 1.5rem; color: #e0e0e0;">
        <li style="margin-bottom: 0.5rem;">功率水平范围: 0% 到 100%</li>
        <li style="margin-bottom: 0.5rem;">
          调节目标功率后，反应堆会逐渐调整到该功率水平
        </li>
        <li style="margin-bottom: 0.5rem;">
          功率水平影响堆芯温度和压力，功率越高温度和压力越大
        </li>
        <li style="margin-bottom: 0.5rem;">
          正常运行时，功率水平通常保持在 30-70% 之间
        </li>
        <li>功率水平的变化会受到控制棒位置的影响</li>
      </ul>
    </div>
  </div>
</div>
