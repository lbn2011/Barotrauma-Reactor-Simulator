<script lang="ts">
  import {
    reactorStore,
    setControlRodPosition,
  } from '../../lib/stores/reactorStore';

  // 订阅状态
  let controlRods: { position: number; insertionSpeed: number };
  let reactivity: number;

  reactorStore.subscribe((state) => {
    controlRods = state.controlRods;
    reactivity = state.powerRegulation.reactivity;
  });

  // 处理控制棒位置变化
  function handlePositionChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const position = parseFloat(target.value);
    setControlRodPosition(position);
  }

  // 快速操作按钮
  function setPositionQuickly(position: number) {
    setControlRodPosition(position);
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

  .control-rod-section {
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

  .position-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #00bcd4;
    text-align: center;
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

  .rod-container {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    height: 300px;
    margin-bottom: 1rem;
  }

  .rod {
    width: 40px;
    background-color: #795548;
    border-radius: 4px 4px 0 0;
    transition: height 0.5s ease;
    position: relative;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
  }

  .rod-inserted {
    background-color: #4caf50;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    transition: height 0.5s ease;
  }

  .rod-guide {
    width: 50px;
    height: 100%;
    background-color: #333;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
  }

  .rod-guide::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 45px;
    height: 100%;
    background-color: #121212;
    border-radius: 2px;
  }

  .scale {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #aaa;
  }
</style>

<div class="panel-container">
  <h1 class="panel-title">1. 反应堆控制（吸收）棒</h1>

  <div class="control-rod-section">
    <h2 class="section-title">控制棒位置调节</h2>

    <div class="position-control">
      <div class="slider-container">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={controlRods.position}
          on:input={handlePositionChange}
          class="position-slider"
        />
      </div>

      <div class="position-value">
        当前位置: {controlRods.position}%
      </div>

      <div class="quick-controls">
        <button class="quick-btn" on:click={() => setPositionQuickly(0)}>
          完全抽出
        </button>
        <button class="quick-btn" on:click={() => setPositionQuickly(25)}>
          25%
        </button>
        <button class="quick-btn" on:click={() => setPositionQuickly(50)}>
          50%
        </button>
        <button class="quick-btn" on:click={() => setPositionQuickly(75)}>
          75%
        </button>
        <button class="quick-btn" on:click={() => setPositionQuickly(100)}>
          完全插入
        </button>
      </div>
    </div>
  </div>

  <div class="control-rod-diagram">
    <h3 class="diagram-title">控制棒插入示意图</h3>
    <div class="rod-container">
      <div class="rod-guide">
        <div class="rod" style="height: ${100 - controlRods.position}%;">
          <div
            class="rod-inserted"
            style="height: ${controlRods.position}%;"
          ></div>
        </div>
      </div>
    </div>
    <div class="scale">
      <span>完全抽出 (0%)</span>
      <span>50%</span>
      <span>完全插入 (100%)</span>
    </div>
  </div>

  <div class="status-indicators">
    <div class="indicator-card">
      <div class="indicator-label">控制棒位置</div>
      <div class="indicator-value">{controlRods.position}%</div>
    </div>

    <div class="indicator-card">
      <div class="indicator-label">反应性</div>
      <div
        class={`indicator-value ${reactivity > 0 ? 'reactivity-positive' : 'reactivity-negative'}`}
      >
        {reactivity.toFixed(2)}
      </div>
    </div>

    <div class="indicator-card">
      <div class="indicator-label">插入速度</div>
      <div class="indicator-value">{controlRods.insertionSpeed} cm/s</div>
    </div>
  </div>

  <div class="control-rod-section" style="margin-top: 3rem;">
    <h2 class="section-title">操作说明</h2>
    <div
      style="background-color: #121212; padding: 1.5rem; border-radius: 6px; border: 1px solid #333;"
    >
      <ul style="margin: 0; padding-left: 1.5rem; color: #e0e0e0;">
        <li style="margin-bottom: 0.5rem;">
          控制棒位置范围: 0% (完全抽出) 到 100% (完全插入)
        </li>
        <li style="margin-bottom: 0.5rem;">
          控制棒插入越深，反应性越低，反应堆功率下降
        </li>
        <li style="margin-bottom: 0.5rem;">
          控制棒抽出越多，反应性越高，反应堆功率上升
        </li>
        <li style="margin-bottom: 0.5rem;">
          正常运行时，控制棒位置通常保持在 40-60% 之间
        </li>
        <li>紧急情况下，应将控制棒完全插入以快速降低反应堆功率</li>
      </ul>
    </div>
  </div>
</div>
