<script lang="ts">
  import { onMount } from 'svelte';
  import type { ReactorState } from '../lib/stores/reactorStore';

  // 输入和输出
  let saveCodeInput: string = '';
  let parsedState: Partial<ReactorState> | null = null;
  let errorMessage: string = '';
  let successMessage: string = '';

  // 解析存档码
  function parseSaveCode() {
    if (!saveCodeInput.trim()) {
      errorMessage = '请输入存档码';
      parsedState = null;
      return;
    }

    try {
      // 尝试解码 Base64 并解析 JSON
      const decoded = atob(saveCodeInput.trim());
      const state = JSON.parse(decoded);
      
      // 验证是否为有效的反应堆状态
      if (typeof state === 'object' && state !== null) {
        parsedState = state;
        errorMessage = '';
        successMessage = '存档码解析成功！';
        
        // 3秒后清除成功消息
        setTimeout(() => {
          successMessage = '';
        }, 3000);
      } else {
        throw new Error('无效的存档码格式');
      }
    } catch (error) {
      console.error('解析存档码时出错:', error);
      errorMessage = '存档码格式错误，请检查输入是否正确';
      parsedState = null;
      successMessage = '';
    }
  }

  // 重新编码存档码
  function encodeSaveCode() {
    if (!parsedState) {
      errorMessage = '没有可编码的数据';
      return;
    }

    try {
      const encoded = btoa(JSON.stringify(parsedState));
      saveCodeInput = encoded;
      errorMessage = '';
      successMessage = '存档码编码成功！';
      
      // 3秒后清除成功消息
      setTimeout(() => {
        successMessage = '';
      }, 3000);
    } catch (error) {
      console.error('编码存档码时出错:', error);
      errorMessage = '编码存档码时发生错误';
      successMessage = '';
    }
  }

  // 复制存档码到剪贴板
  async function copyToClipboard() {
    if (saveCodeInput) {
      try {
        await navigator.clipboard.writeText(saveCodeInput);
        successMessage = '存档码已复制到剪贴板！';
        
        // 3秒后清除成功消息
        setTimeout(() => {
          successMessage = '';
        }, 3000);
      } catch (error) {
        console.error('复制到剪贴板时出错:', error);
        errorMessage = '无法复制到剪贴板';
      }
    }
  }

  // 重置表单
  function resetForm() {
    saveCodeInput = '';
    parsedState = null;
    errorMessage = '';
    successMessage = '';
  }

  // 更新数值参数的安全函数
  function updateValue(path: string, value: any) {
    if (!parsedState) return;
    
    const parts = path.split('.');
    let current: any = parsedState;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    const lastPart = parts[parts.length - 1];
    if (typeof value === 'string') {
      // 如果是字符串，尝试转换为适当类型
      if (value === 'true') {
        current[lastPart] = true;
      } else if (value === 'false') {
        current[lastPart] = false;
      } else if (!isNaN(Number(value))) {
        // 如果是数字字符串，则转换为数字
        current[lastPart] = parseFloat(value);
      } else {
        // 否则保持为字符串
        current[lastPart] = value;
      }
    } else if (typeof value === 'number') {
      current[lastPart] = value;
    } else {
      current[lastPart] = value;
    }
  }

  // 获取嵌套值的安全函数
  function getValue(path: string, defaultValue: any = '') {
    if (!parsedState) return defaultValue;
    
    const parts = path.split('.');
    let current: any = parsedState;
    
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return defaultValue;
      }
      current = current[part];
    }
    
    return current !== undefined ? current : defaultValue;
  }
</script>

<style>
  .save-editor-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    color: #e0e0e0;
  }

  .save-editor-card {
    background-color: #1e1e1e;
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid #333;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    margin-bottom: 1.5rem;
  }

  .input-group {
    margin-bottom: 1rem;
  }

  .input-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #00bcd4;
  }

  .input-group textarea {
    width: 100%;
    padding: 0.75rem;
    background-color: #121212;
    border: 1px solid #333;
    border-radius: 4px;
    color: #e0e0e0;
    font-family: monospace;
    resize: vertical;
    min-height: 100px;
  }

  .input-group textarea:focus {
    outline: none;
    border-color: #00bcd4;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.2s;
  }

  .btn-primary {
    background-color: #00bcd4;
    color: #121212;
  }

  .btn-primary:hover {
    background-color: #00acc1;
  }

  .btn-secondary {
    background-color: #333;
    color: #e0e0e0;
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

  .message {
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  .message.success {
    background-color: rgba(76, 175, 80, 0.2);
    color: #4caf50;
    border: 1px solid #4caf50;
  }

  .message.error {
    background-color: rgba(244, 67, 54, 0.2);
    color: #f44336;
    border: 1px solid #f44336;
  }



  .parameter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .parameter-item {
    background-color: #252525;
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid #333;
  }

  .parameter-label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #aaa;
  }

  .parameter-value {
    width: 100%;
    padding: 0.5rem;
    background-color: #121212;
    border: 1px solid #333;
    border-radius: 4px;
    color: #e0e0e0;
  }

  .parameter-value:focus {
    outline: none;
    border-color: #00bcd4;
  }

  .simulation-info {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .info-item {
    background-color: #252525;
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid #333;
  }

  .info-label {
    font-size: 0.9rem;
    color: #aaa;
    margin-bottom: 0.5rem;
  }

  .info-value {
    font-weight: bold;
    color: #00bcd4;
  }
</style>

<div class="save-editor-container">
  <h1>存档码编辑器</h1>
  
  <div class="save-editor-card">
    <h2>导入存档码</h2>
    
    <div class="input-group">
      <label for="saveCodeInput">存档码</label>
      <textarea 
        id="saveCodeInput" 
        bind:value={saveCodeInput} 
        placeholder="在此粘贴您的存档码..."
      ></textarea>
    </div>
    
    <div class="button-group">
      <button class="btn btn-primary" on:click={parseSaveCode}>解析存档码</button>
      <button class="btn btn-secondary" on:click={encodeSaveCode}>编码存档码</button>
      <button class="btn btn-secondary" on:click={copyToClipboard}>复制存档码</button>
      <button class="btn btn-danger" on:click={resetForm}>重置</button>
    </div>
    
    {#if errorMessage}
      <div class="message error">{errorMessage}</div>
    {/if}
    
    {#if successMessage}
      <div class="message success">{successMessage}</div>
    {/if}
  </div>
  
  {#if parsedState}
    <div class="save-editor-card">
      <h2>模拟信息</h2>
      
      <div class="simulation-info">
        <div class="info-item">
          <div class="info-label">运行状态</div>
          <div class="info-value">{getValue('isRunning') ? '运行中' : '已停止'}</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">模拟时间</div>
          <div class="info-value">{getValue('simulationTime', 0)} 秒</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">功率水平</div>
          <div class="info-value">{getValue('powerRegulation.powerLevel', 0)?.toFixed(1) || 0}%</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">堆芯温度</div>
          <div class="info-value">{getValue('core.temperature', 0)?.toFixed(1) || 0}°C</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">堆芯压力</div>
          <div class="info-value">{getValue('core.pressure', 0)?.toFixed(2) || 0} MPa</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">控制棒位置</div>
          <div class="info-value">{getValue('controlRods.position', 0)?.toFixed(1) || 0}%</div>
        </div>
      </div>
    </div>
    
    <div class="save-editor-card">
      <h2>编辑参数</h2>
      
      <div class="parameter-grid">
        <!-- 基本模拟参数 -->
        <div class="parameter-item">
          <label for="isRunning" class="parameter-label">运行状态 (isRunning)</label>
          <select 
            id="isRunning"
            class="parameter-value" 
            on:change={(e) => updateValue('isRunning', (e.target as HTMLSelectElement).value)}
            value={getValue('isRunning', false)}
          >
            <option value="true" selected={getValue('isRunning', false) === true}>运行中</option>
            <option value="false" selected={getValue('isRunning', false) === false}>已停止</option>
          </select>
        </div>
        
        <div class="parameter-item">
          <label for="simulationTime" class="parameter-label">模拟时间 (simulationTime)</label>
          <input 
            id="simulationTime"
            type="number" 
            class="parameter-value" 
            on:input={(e) => updateValue('simulationTime', (e.target as HTMLInputElement).value)}
            value={getValue('simulationTime', 0)}
          >
        </div>
        
        <!-- 控制棒参数 -->
        <div class="parameter-item">
          <label for="controlRodsPosition" class="parameter-label">控制棒位置 (0-100%)</label>
          <input 
            id="controlRodsPosition"
            type="range" 
            min="0" 
            max="100" 
            class="parameter-value" 
            on:input={(e) => updateValue('controlRods.position', (e.target as HTMLInputElement).value)}
            value={getValue('controlRods.position', 50)}
          >
          <div>{getValue('controlRods.position', 50)?.toFixed(1) || 0}%</div>
        </div>
        
        <!-- 功率调节参数 -->
        <div class="parameter-item">
          <label for="powerLevel" class="parameter-label">当前功率 (0-100%)</label>
          <input 
            id="powerLevel"
            type="range" 
            min="0" 
            max="100" 
            class="parameter-value" 
            on:input={(e) => updateValue('powerRegulation.powerLevel', (e.target as HTMLInputElement).value)}
            value={getValue('powerRegulation.powerLevel', 50)}
          >
          <div>{getValue('powerRegulation.powerLevel', 50)?.toFixed(1) || 0}%</div>
        </div>
        
        <div class="parameter-item">
          <label for="targetPower" class="parameter-label">目标功率 (0-100%)</label>
          <input 
            id="targetPower"
            type="range" 
            min="0" 
            max="100" 
            class="parameter-value" 
            on:input={(e) => updateValue('powerRegulation.targetPower', (e.target as HTMLInputElement).value)}
            value={getValue('powerRegulation.targetPower', 50)}
          >
          <div>{getValue('powerRegulation.targetPower', 50)?.toFixed(1) || 0}%</div>
        </div>
        
        <!-- 核心参数 -->
        <div class="parameter-item">
          <label for="coreTemperature" class="parameter-label">堆芯温度 (°C)</label>
          <input 
            id="coreTemperature"
            type="number" 
            class="parameter-value" 
            on:input={(e) => updateValue('core.temperature', (e.target as HTMLInputElement).value)}
            value={getValue('core.temperature', 280)}
          >
        </div>
        
        <div class="parameter-item">
          <label for="corePressure" class="parameter-label">堆芯压力 (MPa)</label>
          <input 
            id="corePressure"
            type="number" 
            step="0.01" 
            class="parameter-value" 
            on:input={(e) => updateValue('core.pressure', (e.target as HTMLInputElement).value)}
            value={getValue('core.pressure', 7.0)}
          >
        </div>
        
        <div class="parameter-item">
          <label for="coreWaterLevel" class="parameter-label">堆芯水位 (0-100%)</label>
          <input 
            id="coreWaterLevel"
            type="range" 
            min="0" 
            max="100" 
            class="parameter-value" 
            on:input={(e) => updateValue('core.waterLevel', (e.target as HTMLInputElement).value)}
            value={getValue('core.waterLevel', 70)}
          >
          <div>{getValue('core.waterLevel', 70)?.toFixed(1) || 0}%</div>
        </div>
        
        <!-- 再循环泵参数 -->
        <div class="parameter-item">
          <label for="recircPump1Status" class="parameter-label">再循环泵1状态</label>
          <select 
            id="recircPump1Status"
            class="parameter-value" 
            on:change={(e) => updateValue('recirculationPumps.pump1.status', (e.target as HTMLSelectElement).value)}
            value={getValue('recirculationPumps.pump1.status', true)}
          >
            <option value="true" selected={getValue('recirculationPumps.pump1.status', true) === true}>开启</option>
            <option value="false" selected={getValue('recirculationPumps.pump1.status', true) === false}>关闭</option>
          </select>
        </div>
        
        <div class="parameter-item">
          <label for="recircPump1Speed" class="parameter-label">再循环泵1转速 (0-100%)</label>
          <input 
            id="recircPump1Speed"
            type="range" 
            min="0" 
            max="100" 
            class="parameter-value" 
            on:input={(e) => updateValue('recirculationPumps.pump1.speed', (e.target as HTMLInputElement).value)}
            value={getValue('recirculationPumps.pump1.speed', 70)}
          >
          <div>{getValue('recirculationPumps.pump1.speed', 70)?.toFixed(1) || 0}%</div>
        </div>
        
        <div class="parameter-item">
          <label for="recircPump2Status" class="parameter-label">再循环泵2状态</label>
          <select 
            id="recircPump2Status"
            class="parameter-value" 
            on:change={(e) => updateValue('recirculationPumps.pump2.status', (e.target as HTMLSelectElement).value)}
            value={getValue('recirculationPumps.pump2.status', true)}
          >
            <option value="true" selected={getValue('recirculationPumps.pump2.status', true) === true}>开启</option>
            <option value="false" selected={getValue('recirculationPumps.pump2.status', true) === false}>关闭</option>
          </select>
        </div>
        
        <div class="parameter-item">
          <label for="recircPump2Speed" class="parameter-label">再循环泵2转速 (0-100%)</label>
          <input 
            id="recircPump2Speed"
            type="range" 
            min="0" 
            max="100" 
            class="parameter-value" 
            on:input={(e) => updateValue('recirculationPumps.pump2.speed', (e.target as HTMLInputElement).value)}
            value={getValue('recirculationPumps.pump2.speed', 70)}
          >
          <div>{getValue('recirculationPumps.pump2.speed', 70)?.toFixed(1) || 0}%</div>
        </div>
        
        <!-- 应急冷却泵参数 -->
        <div class="parameter-item">
          <label for="emergCoolPump1Status" class="parameter-label">应急冷却泵1状态</label>
          <select 
            id="emergCoolPump1Status"
            class="parameter-value" 
            on:change={(e) => updateValue('emergencyCoolingPumps.pump1.status', (e.target as HTMLSelectElement).value)}
            value={getValue('emergencyCoolingPumps.pump1.status', false)}
          >
            <option value="true" selected={getValue('emergencyCoolingPumps.pump1.status', false) === true}>开启</option>
            <option value="false" selected={getValue('emergencyCoolingPumps.pump1.status', false) === false}>关闭</option>
          </select>
        </div>
        
        <div class="parameter-item">
          <label for="emergCoolPump1Flow" class="parameter-label">应急冷却泵1流量 (0-100%)</label>
          <input 
            id="emergCoolPump1Flow"
            type="range" 
            min="0" 
            max="100" 
            class="parameter-value" 
            on:input={(e) => updateValue('emergencyCoolingPumps.pump1.flowRate', (e.target as HTMLInputElement).value)}
            value={getValue('emergencyCoolingPumps.pump1.flowRate', 0)}
          >
          <div>{getValue('emergencyCoolingPumps.pump1.flowRate', 0)?.toFixed(1) || 0}%</div>
        </div>
        
        <div class="parameter-item">
          <label for="emergCoolPump2Status" class="parameter-label">应急冷却泵2状态</label>
          <select 
            id="emergCoolPump2Status"
            class="parameter-value" 
            on:change={(e) => updateValue('emergencyCoolingPumps.pump2.status', (e.target as HTMLSelectElement).value)}
            value={getValue('emergencyCoolingPumps.pump2.status', false)}
          >
            <option value="true" selected={getValue('emergencyCoolingPumps.pump2.status', false) === true}>开启</option>
            <option value="false" selected={getValue('emergencyCoolingPumps.pump2.status', false) === false}>关闭</option>
          </select>
        </div>
        
        <div class="parameter-item">
          <label for="emergCoolPump2Flow" class="parameter-label">应急冷却泵2流量 (0-100%)</label>
          <input 
            id="emergCoolPump2Flow"
            type="range" 
            min="0" 
            max="100" 
            class="parameter-value" 
            on:input={(e) => updateValue('emergencyCoolingPumps.pump2.flowRate', (e.target as HTMLInputElement).value)}
            value={getValue('emergencyCoolingPumps.pump2.flowRate', 0)}
          >
          <div>{getValue('emergencyCoolingPumps.pump2.flowRate', 0)?.toFixed(1) || 0}%</div>
        </div>
        
        <!-- 汽轮机参数 -->
        <div class="parameter-item">
          <label for="turbineStatus" class="parameter-label">汽轮机状态</label>
          <select 
            id="turbineStatus"
            class="parameter-value" 
            on:change={(e) => updateValue('turbine.status', (e.target as HTMLSelectElement).value)}
            value={getValue('turbine.status', true)}
          >
            <option value="true" selected={getValue('turbine.status', true) === true}>开启</option>
            <option value="false" selected={getValue('turbine.status', true) === false}>关闭</option>
          </select>
        </div>
        
        <div class="parameter-item">
          <label for="turbineLoad" class="parameter-label">汽轮机负载 (0-100%)</label>
          <input 
            id="turbineLoad"
            type="range" 
            min="0" 
            max="100" 
            class="parameter-value" 
            on:input={(e) => updateValue('turbine.load', (e.target as HTMLInputElement).value)}
            value={getValue('turbine.load', 50)}
          >
          <div>{getValue('turbine.load', 50)?.toFixed(1) || 0}%</div>
        </div>
      </div>
    </div>
    
    <div class="save-editor-card">
      <h2>操作</h2>
      
      <div class="button-group">
        <button class="btn btn-primary" on:click={encodeSaveCode}>生成新存档码</button>
        <button class="btn btn-secondary" on:click={copyToClipboard}>复制存档码</button>
      </div>
    </div>
  {/if}
</div>