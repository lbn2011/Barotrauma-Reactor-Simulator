<script lang="ts">
  /**
   * 控制棒面板组件
   * 模拟RBMK-1000反应堆的控制棒系统
   */
  
  // 导入反应堆状态管理相关函数
  import {
    reactorStore,
    setControlRodPosition,
    setSingleControlRodPosition,
    emergencyRodInsertion,
    toggleControlRodAutoMode,
  } from '../../lib/stores/reactorStore';

  // 订阅状态变量
  let controlRods: any; // 控制棒系统状态
  let reactivity: number; // 反应堆反应性
  let powerLevel: number; // 反应堆功率水平

  /**
   * 订阅反应堆状态变化
   * 实时更新控制棒状态、反应性和功率水平
   */
  reactorStore.subscribe((state) => {
    controlRods = state.controlRods;
    reactivity = state.powerRegulation.reactivity;
    powerLevel = state.powerRegulation.powerLevel;
  });

  /**
   * 处理控制棒位置变化
   * @param e 事件对象
   */
  function handlePositionChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const position = parseFloat(target.value);
    setControlRodPosition(position);
  }

  /**
   * 处理控制棒移动速度变化
   * @param e 事件对象
   */
  function handleInsertionSpeedChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const speed = parseFloat(target.value);
    // 这里需要在reactorStore中添加相应的函数
    console.log(`Insertion speed changed to: ${speed}`);
  }

  /**
   * 快速设置控制棒位置
   * @param position 目标位置（%）
   */
  function setPositionQuickly(position: number) {
    setControlRodPosition(position);
  }

  /**
   * 处理单根控制棒位置变化
   * @param row 行索引
   * @param col 列索引
   * @param e 事件对象
   */
  function handleSingleRodChange(row: number, col: number, e: Event) {
    const target = e.target as HTMLInputElement;
    const position = parseFloat(target.value);
    setSingleControlRodPosition(row, col, position);
  }

  /**
   * 触发紧急插入（AZ-5）
   * 模拟切尔诺贝利事故中的紧急停堆操作
   */
  function handleEmergencyInsertion() {
    emergencyRodInsertion();
  }

  /**
   * 切换控制棒自动模式
   */
  function handleAutoModeToggle() {
    toggleControlRodAutoMode();
  }

  /**
   * 获取控制棒状态颜色
   * @param status 控制棒状态
   * @returns 状态对应的颜色
   */
  function getRodStatusColor(status: string) {
    switch (status) {
      case 'normal':
        return '#4caf50'; // 正常 - 绿色
      case 'fault':
        return '#f44336'; // 故障 - 红色
      case 'maintenance':
        return '#ff9800'; // 维护 - 橙色
      default:
        return '#4caf50';
    }
  }

  /**
   * 获取控制棒类型标签
   * @param type 控制棒类型
   * @returns 类型对应的标签
   */
  function getRodTypeLabel(type: string) {
    switch (type) {
      case 'control':
        return '控制'; // 控制棒
      case 'shutdown':
        return '停堆'; // 停堆棒
      case 'automatic':
        return '自动'; // 自动棒
      default:
        return '控制';
    }
  }

  /**
   * 获取控制棒类型颜色
   * @param type 控制棒类型
   * @returns 类型对应的颜色
   */
  function getRodTypeColor(type: string) {
    switch (type) {
      case 'control':
        return '#2196f3'; // 控制棒 - 蓝色
      case 'shutdown':
        return '#f44336'; // 停堆棒 - 红色
      case 'automatic':
        return '#4caf50'; // 自动棒 - 绿色
      default:
        return '#2196f3';
    }
  }

  /**
   * 模拟燃料更换
   * @param row 行索引
   * @param col 列索引
   */
  function handleFuelReload(row: number, col: number) {
    // 这里可以实现燃料更换的逻辑
    console.log(`Fuel reload initiated for rod at ${row}, ${col}`);
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

  .emergency-btn {
    background-color: #f44336 !important;
  }

  .emergency-btn:hover {
    background-color: #d32f2f !important;
  }

  .auto-mode-btn {
    background-color: #2196f3 !important;
  }

  .auto-mode-btn:hover {
    background-color: #1976d2 !important;
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

  /* 控制棒网格样式 */
  .control-rod-grid {
    margin: 3rem 0;
    padding: 2rem;
    background-color: #121212;
    border-radius: 6px;
    border: 1px solid #333;
  }

  .grid-title {
    text-align: center;
    margin-bottom: 2rem;
    color: #00bcd4;
    font-size: 1.2rem;
  }

  .rod-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .rod-cell {
    background-color: #1e1e1e;
    border-radius: 4px;
    padding: 1rem;
    border: 1px solid #333;
    text-align: center;
    position: relative;
  }

  .rod-cell:hover {
    border-color: #00bcd4;
  }

  .rod-id {
    font-size: 0.8rem;
    color: #aaa;
    margin-bottom: 0.5rem;
  }

  .rod-position {
    font-size: 1rem;
    font-weight: 600;
    color: #e0e0e0;
    margin-bottom: 0.5rem;
  }

  .rod-status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin: 0 auto 0.5rem;
  }

  .rod-type-tag {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    border-radius: 10px;
    background-color: #333;
    color: #e0e0e0;
    display: inline-block;
    margin-bottom: 0.5rem;
  }

  .rod-slider {
    width: 100%;
    margin-top: 0.5rem;
  }

  .fuel-reload-btn {
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    background-color: #ff9800;
    color: white;
    cursor: pointer;
    font-size: 0.7rem;
    font-weight: 600;
    transition: all 0.2s;
    margin-top: 0.5rem;
    width: 100%;
  }

  .fuel-reload-btn:hover {
    background-color: #f57c00;
    transform: translateY(-1px);
  }

  .fuel-reload-btn:active {
    transform: translateY(0);
  }

  /* 操作按钮区域 */
  .operation-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin: 2rem 0;
  }

  /* 模式指示器 */
  .mode-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .mode-badge {
    padding: 0.3rem 0.8rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .mode-auto {
    background-color: #2196f3;
    color: white;
  }

  .mode-manual {
    background-color: #666;
    color: white;
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

      <!-- 控制棒移动速度控制 -->
      <div class="slider-container">
        <label for="insertion-speed">移动速度</label>
        <input
          id="insertion-speed"
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={controlRods.insertionSpeed}
          on:input={handleInsertionSpeedChange}
          class="position-slider"
        />
        <div class="position-value">
          当前速度: {controlRods.insertionSpeed} %/s
        </div>
      </div>
    </div>
  </div>

  <!-- 操作按钮区域 -->
  <div class="operation-buttons">
    <button class="quick-btn emergency-btn" on:click={handleEmergencyInsertion}>
      紧急插入 (AZ-5)
    </button>
    <button class="quick-btn auto-mode-btn" on:click={handleAutoModeToggle}>
      {controlRods.autoMode ? '手动模式' : '自动模式'}
    </button>
  </div>

  <!-- 模式指示器 -->
  <div class="mode-indicator">
    <span class="indicator-label">当前模式:</span>
    <span
      class={`mode-badge ${controlRods.autoMode ? 'mode-auto' : 'mode-manual'}`}
    >
      {controlRods.autoMode ? '自动控制' : '手动控制'}
    </span>
    {#if controlRods.emergencyInsertion}
      <span class="mode-badge" style="background-color: #f44336; color: white;">
        紧急插入状态
      </span>
    {/if}
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

  <!-- 控制棒5x5网格 -->
  <div class="control-rod-grid">
    <h3 class="grid-title">控制棒组 (5×5)</h3>
    <div class="rod-grid">
      {#if controlRods.rods}
        {#each controlRods.rods as row, rowIndex}
          {#each row as rod, colIndex}
            <div class="rod-cell">
              <div class="rod-id">#{rowIndex * 5 + colIndex + 1}</div>
              <div
                class="rod-status-indicator"
                style="background-color: {getRodStatusColor(rod.status)}"
              ></div>
              <div
                class="rod-type-tag"
                style="background-color: {getRodTypeColor(rod.type)}"
              >
                {getRodTypeLabel(rod.type)}
              </div>
              <div class="rod-position">{rod.position}%</div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={rod.position}
                on:input={(e) => handleSingleRodChange(rowIndex, colIndex, e)}
                class="rod-slider"
              />
              <button
                class="fuel-reload-btn"
                on:click={() => handleFuelReload(rowIndex, colIndex)}
              >
                燃料更换
              </button>
            </div>
          {/each}
        {/each}
      {/if}
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
        {reactivity.toFixed(4)}
      </div>
    </div>

    <div class="indicator-card">
      <div class="indicator-label">插入速度</div>
      <div class="indicator-value">{controlRods.insertionSpeed} %/s</div>
    </div>

    <div class="indicator-card">
      <div class="indicator-label">反应堆功率</div>
      <div class="indicator-value">{powerLevel.toFixed(1)}%</div>
    </div>

    <div class="indicator-card">
      <div class="indicator-label">紧急插入状态</div>
      <div class="indicator-value">
        {controlRods.emergencyInsertion ? '激活' : '正常'}
      </div>
    </div>

    <div class="indicator-card">
      <div class="indicator-label">自动模式</div>
      <div class="indicator-value">
        {controlRods.autoMode ? '开启' : '关闭'}
      </div>
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
        <li style="margin-bottom: 0.5rem;">
          紧急插入 (AZ-5) 会将所有控制棒快速插入，立即降低反应堆功率
        </li>
        <li style="margin-bottom: 0.5rem;">
          自动模式下，系统会根据功率设定点自动调整控制棒位置
        </li>
        <li>可以通过下方网格单独调整每根控制棒的位置</li>
      </ul>
    </div>
  </div>
</div>
