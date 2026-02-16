<script lang="ts">
  import {
    reactorStore,
    triggerFault,
    fixFault,
    setMaintenanceLevel,
    clearAllFaults,
  } from '../../lib/stores/reactorStore';

  // 订阅状态
  let faultSimulation: any;
  let alarms: any;

  reactorStore.subscribe((state) => {
    faultSimulation = state.faultSimulation;
    alarms = state.alarms;
  });

  // 故障类型选项
  const faultTypes = [
    { value: 'pump', label: '泵' },
    { value: 'valve', label: '阀门' },
    { value: 'sensor', label: '传感器' },
    { value: 'controller', label: '控制器' },
    { value: 'pipe', label: '管道' },
    { value: 'electrical', label: '电气系统' },
    { value: 'cooling', label: '冷却系统' },
    { value: 'steam', label: '蒸汽系统' },
  ];

  // 组件ID选项
  const componentIds = {
    pump: ['pump1', 'pump2', 'feedpump1', 'feedpump2'],
    valve: ['valve1', 'valve2', 'valve3', 'valve4'],
    sensor: [
      'temperatureSensor',
      'pressureSensor',
      'levelSensor',
      'flowSensor',
    ],
    controller: [
      'reactorController',
      'turbineController',
      'feedwaterController',
    ],
    pipe: ['coolingPipe', 'steamPipe', 'feedwaterPipe'],
    electrical: ['mainPower', 'backupPower', 'controlPower'],
    cooling: ['primaryCooling', 'secondaryCooling', 'emergencyCooling'],
    steam: ['mainSteam', 'feedwaterHeaterSteam', 'deaeratorSteam'],
  };

  // 严重程度选项
  const severityLevels = [
    { value: 'minor', label: '轻微' },
    { value: 'major', label: '重大' },
    { value: 'critical', label: '灾难性' },
  ];

  // 表单状态
  let selectedFaultType = 'pump';
  let selectedComponentId = 'pump1';
  let selectedSeverity = 'minor';

  // 处理故障类型变化
  function handleFaultTypeChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    selectedFaultType = target.value as any;
    selectedComponentId = componentIds[selectedFaultType][0];
  }

  // 处理组件ID变化
  function handleComponentIdChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    selectedComponentId = target.value;
  }

  // 处理严重程度变化
  function handleSeverityChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    selectedSeverity = target.value as any;
  }

  // 触发故障
  function handleTriggerFault() {
    triggerFault(selectedFaultType, selectedComponentId, selectedSeverity);
  }

  // 修复故障
  function handleFixFault(faultId: string) {
    fixFault(faultId);
  }

  // 处理维护水平变化
  function handleMaintenanceLevelChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const level = parseFloat(target.value);
    setMaintenanceLevel(level);
  }

  // 清除所有故障
  function handleClearAllFaults() {
    clearAllFaults();
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

  .status-section {
    margin-bottom: 3rem;
  }

  .status-card {
    background-color: #121212;
    border-radius: 6px;
    padding: 1.5rem;
    border: 1px solid #333;
    margin-bottom: 1.5rem;
  }

  .status-title {
    color: #00bcd4;
    font-size: 1.2rem;
    margin-top: 0;
    margin-bottom: 1rem;
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .status-item {
    display: flex;
    flex-direction: column;
  }

  .status-label {
    font-size: 0.9rem;
    color: #aaa;
    margin-bottom: 0.5rem;
  }

  .status-value {
    font-size: 1.2rem;
    font-weight: 600;
    color: #e0e0e0;
  }

  .risk-level {
    font-size: 1.5rem;
    font-weight: 600;
  }

  .risk-low {
    color: #4caf50;
  }

  .risk-medium {
    color: #ff9800;
  }

  .risk-high {
    color: #f44336;
  }

  .risk-critical {
    color: #9c27b0;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  .fault-section {
    margin-bottom: 3rem;
  }

  .fault-form {
    background-color: #121212;
    border-radius: 6px;
    padding: 1.5rem;
    border: 1px solid #333;
    margin-bottom: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-label {
    display: block;
    font-size: 1rem;
    font-weight: 600;
    color: #e0e0e0;
    margin-bottom: 0.5rem;
  }

  .form-select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #333;
    border-radius: 4px;
    background-color: #2d2d2d;
    color: #e0e0e0;
    font-size: 1rem;
  }

  .form-select:focus {
    outline: none;
    border-color: #00bcd4;
  }

  .form-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.2s;
    margin-right: 1rem;
  }

  .btn-primary {
    background-color: #00bcd4;
    color: white;
  }

  .btn-primary:hover {
    background-color: #00acc1;
  }

  .btn-secondary {
    background-color: #333;
    color: white;
  }

  .btn-secondary:hover {
    background-color: #444;
  }

  .btn-danger {
    background-color: #f44336;
    color: white;
  }

  .btn-danger:hover {
    background-color: #e53935;
  }

  .fault-list {
    margin-top: 2rem;
  }

  .fault-item {
    background-color: #121212;
    border-radius: 6px;
    padding: 1.5rem;
    border: 1px solid #333;
    margin-bottom: 1rem;
  }

  .fault-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .fault-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #e0e0e0;
  }

  .fault-severity {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .severity-minor {
    background-color: rgba(76, 175, 80, 0.2);
    color: #4caf50;
  }

  .severity-major {
    background-color: rgba(255, 152, 0, 0.2);
    color: #ff9800;
  }

  .severity-critical {
    background-color: rgba(244, 67, 54, 0.2);
    color: #f44336;
  }

  .fault-details {
    margin-bottom: 1rem;
  }

  .fault-detail {
    font-size: 0.9rem;
    color: #aaa;
    margin-bottom: 0.5rem;
  }

  .fault-impact {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  .impact-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #e0e0e0;
    margin-bottom: 0.5rem;
  }

  .impact-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .impact-item {
    font-size: 0.8rem;
    color: #aaa;
    margin-bottom: 0.25rem;
    padding-left: 1rem;
    position: relative;
  }

  .impact-item::before {
    content: '•';
    position: absolute;
    left: 0;
    color: #00bcd4;
  }

  .emergency-procedure {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  .procedure-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #e0e0e0;
    margin-bottom: 0.5rem;
  }

  .procedure-text {
    font-size: 0.9rem;
    color: #ff9800;
    background-color: rgba(255, 152, 0, 0.1);
    padding: 0.75rem;
    border-radius: 4px;
    border-left: 3px solid #ff9800;
  }

  .maintenance-section {
    margin-top: 3rem;
  }

  .maintenance-control {
    background-color: #121212;
    border-radius: 6px;
    padding: 1.5rem;
    border: 1px solid #333;
  }

  .slider-container {
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

  .recommended-actions {
    margin-top: 2rem;
  }

  .actions-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .action-item {
    font-size: 0.9rem;
    color: #e0e0e0;
    margin-bottom: 0.5rem;
    padding-left: 1.5rem;
    position: relative;
  }

  .action-item::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #00bcd4;
    font-weight: 600;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #aaa;
  }
</style>

<div class="panel-container">
  <h1 class="panel-title">故障模拟和应急程序</h1>

  <!-- 系统状态 -->
  <div class="status-section">
    <div class="status-card">
      <h2 class="status-title">系统状态</h2>
      <div class="status-grid">
        <div class="status-item">
          <div class="status-label">系统可靠性</div>
          <div class="status-value">
            {(faultSimulation.systemReliability * 100).toFixed(1)}%
          </div>
        </div>
        <div class="status-item">
          <div class="status-label">风险级别</div>
          <div
            class={`status-value risk-level risk-${faultSimulation.riskLevel}`}
          >
            {faultSimulation.riskLevel === 'low'
              ? '低'
              : faultSimulation.riskLevel === 'medium'
                ? '中等'
                : faultSimulation.riskLevel === 'high'
                  ? '高'
                  : '灾难性'}
          </div>
        </div>
        <div class="status-item">
          <div class="status-label">活跃故障</div>
          <div class="status-value">{faultSimulation.activeFaults.length}</div>
        </div>
        <div class="status-item">
          <div class="status-label">维护水平</div>
          <div class="status-value">{faultSimulation.maintenanceLevel}%</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 推荐操作 -->
  {#if faultSimulation.recommendedActions && faultSimulation.recommendedActions.length > 0}
    <div class="status-section">
      <div class="status-card">
        <h2 class="status-title">推荐操作</h2>
        <ul class="actions-list">
          {#each faultSimulation.recommendedActions as action}
            <li class="action-item">{action}</li>
          {/each}
        </ul>
      </div>
    </div>
  {/if}

  <!-- 触发故障 -->
  <div class="fault-section">
    <h2 class="status-title">触发故障</h2>
    <div class="fault-form">
      <div class="form-group">
        <label class="form-label" for="faultType">故障类型</label>
        <select
          id="faultType"
          class="form-select"
          value={selectedFaultType}
          on:change={handleFaultTypeChange}
        >
          {#each faultTypes as type}
            <option value={type.value}>{type.label}</option>
          {/each}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label" for="componentId">组件ID</label>
        <select
          id="componentId"
          class="form-select"
          value={selectedComponentId}
          on:change={handleComponentIdChange}
        >
          {#each componentIds[selectedFaultType as keyof typeof componentIds] as component}
            <option value={component}>{component}</option>
          {/each}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label" for="severity">严重程度</label>
        <select
          id="severity"
          class="form-select"
          value={selectedSeverity}
          on:change={handleSeverityChange}
        >
          {#each severityLevels as level}
            <option value={level.value}>{level.label}</option>
          {/each}
        </select>
      </div>

      <div class="form-actions">
        <button class="form-button btn-primary" on:click={handleTriggerFault}>
          触发故障
        </button>
        <button class="form-button btn-danger" on:click={handleClearAllFaults}>
          清除所有故障
        </button>
      </div>
    </div>
  </div>

  <!-- 活跃故障列表 -->
  <div class="fault-list">
    <h2 class="status-title">活跃故障</h2>
    {#if faultSimulation.activeFaults.length > 0}
      {#each faultSimulation.activeFaults as fault}
        {#if fault.status === 'active'}
          <div class="fault-item">
            <div class="fault-header">
              <div class="fault-title">{fault.description}</div>
              <div class={`fault-severity severity-${fault.severity}`}>
                {fault.severity === 'minor'
                  ? '轻微'
                  : fault.severity === 'major'
                    ? '重大'
                    : '灾难性'}
              </div>
            </div>
            <div class="fault-details">
              <div class="fault-detail">
                <strong>故障类型:</strong>
                {fault.type}
              </div>
              <div class="fault-detail">
                <strong>组件:</strong>
                {fault.componentId}
              </div>
              <div class="fault-detail">
                <strong>开始时间:</strong>
                {new Date((fault.startTime || 0) * 1000).toLocaleString()}
              </div>
              <div class="fault-detail">
                <strong>预计恢复时间:</strong>
                {fault.recoveryTime}秒
              </div>
            </div>
            {#if fault.impact && fault.impact.length > 0}
              <div class="fault-impact">
                <div class="impact-label">影响范围:</div>
                <ul class="impact-list">
                  {#each fault.impact as item}
                    <li class="impact-item">{item}</li>
                  {/each}
                </ul>
              </div>
            {/if}
            {#if fault.emergencyProcedure}
              <div class="emergency-procedure">
                <div class="procedure-label">推荐应急程序:</div>
                <div class="procedure-text">{fault.emergencyProcedure}</div>
              </div>
            {/if}
            <div class="fault-actions">
              <button
                class="form-button btn-secondary"
                on:click={() => fixFault(fault.id)}
              >
                修复故障
              </button>
            </div>
          </div>
        {/if}
      {/each}
    {:else}
      <div class="empty-state">无活跃故障</div>
    {/if}
  </div>

  <!-- 维护水平控制 -->
  <div class="maintenance-section">
    <div class="maintenance-control">
      <h2 class="status-title">维护水平控制</h2>
      <div class="form-group">
        <label class="form-label" for="maintenanceLevel">
          维护水平: {faultSimulation.maintenanceLevel}%
        </label>
        <div class="slider-container">
          <input
            id="maintenanceLevel"
            type="range"
            min="0"
            max="100"
            step="1"
            value={faultSimulation.maintenanceLevel}
            on:input={handleMaintenanceLevelChange}
          />
        </div>
        <div class="status-label">维护水平越高，故障发生概率越低</div>
      </div>
    </div>
  </div>
</div>
