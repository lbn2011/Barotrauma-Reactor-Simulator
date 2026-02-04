<script lang="ts">
  import {
    reactorStore,
    toggleTurbine,
    setTurbineLoad,
  } from '../../lib/stores/reactorStore';

  // 订阅状态
  let turbine: { status: boolean; load: number; speed: number };
  let powerLevel: number;

  reactorStore.subscribe((state) => {
    turbine = state.turbine;
    powerLevel = state.powerRegulation.powerLevel;
  });

  // 处理汽轮机状态切换
  function handleTurbineToggle() {
    toggleTurbine();
  }

  // 处理负载变化
  function handleLoadChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const load = parseFloat(target.value);
    setTurbineLoad(load);
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

  <div class="turbine-control">
    <h2 class="section-title">汽轮机状态</h2>

    <div class="status-control">
      <span class="status-label">状态:</span>
      <div
        class={`status-indicator ${turbine.status ? 'running' : 'stopped'}`}
      ></div>
      <span class="status-label">{turbine.status ? '运行中' : '已停止'}</span>
      <button
        class={`toggle-btn ${turbine.status ? 'stop' : 'start'}`}
        on:click={handleTurbineToggle}
      >
        {turbine.status ? '停止' : '启动'}
      </button>
    </div>

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
          disabled={!turbine.status}
        />
      </div>
      <div class="load-display">
        当前负载: {turbine.load}%
      </div>
    </div>
  </div>

  <div class="turbine-diagram">
    <h3 class="diagram-title">汽轮机运行状态</h3>
    <div class="diagram-content">
      <div class={`turbine-symbol ${turbine.status ? 'running' : ''}`}></div>
    </div>
  </div>

  <div class="status-indicators">
    <div class="indicator-card">
      <div class="indicator-label">汽轮机转速</div>
      <div class="indicator-value">{turbine.speed} RPM</div>
    </div>

    <div class="indicator-card">
      <div class="indicator-label">当前功率水平</div>
      <div class="indicator-value">{powerLevel.toFixed(1)}%</div>
    </div>

    <div class="indicator-card">
      <div class="indicator-label">汽轮机负载</div>
      <div class="indicator-value">{turbine.load}%</div>
    </div>
  </div>

  <div style="margin-top: 3rem;">
    <h2 class="section-title">操作说明</h2>
    <div
      style="background-color: #121212; padding: 1.5rem; border-radius: 6px; border: 1px solid #333;"
    >
      <ul style="margin: 0; padding-left: 1.5rem; color: #e0e0e0;">
        <li style="margin-bottom: 0.5rem;">
          汽轮机用于将反应堆产生的热能转换为机械能，进而发电
        </li>
        <li style="margin-bottom: 0.5rem;">负载调节可以控制汽轮机的输出功率</li>
        <li style="margin-bottom: 0.5rem;">
          汽轮机状态应与反应堆功率水平相匹配
        </li>
        <li style="margin-bottom: 0.5rem;">
          启动汽轮机前，确保反应堆功率水平在适当范围
        </li>
        <li>停止汽轮机时，应先降低负载至零，再执行停止操作</li>
      </ul>
    </div>
  </div>
</div>
