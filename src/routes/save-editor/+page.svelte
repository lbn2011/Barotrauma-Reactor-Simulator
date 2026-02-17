<script lang="ts">
  import { onMount } from 'svelte';
  import { Page, Navigation, AmbientBackgroundArtwork, GradientOverlay, Hero, TodayCard, ResponsiveContainer } from '@/components/shared';
  import type { ReactorState } from '@/lib/stores/reactorStore';
  import { defaultComponentConfig } from '@/config/components';
  import i18nStore from '@/stores/i18n';

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
      const saveData = JSON.parse(decoded);
      
      // 验证存档数据结构
      if (typeof saveData === 'object' && saveData !== null) {
        // 检查是否为新版本格式
        if (saveData.version) {
          // 验证校验和
          const calculatedChecksum = calculateChecksum(saveData.data);
          if (saveData.checksum === calculatedChecksum) {
            parsedState = saveData.data;
            errorMessage = '';
            successMessage = `存档码解析成功！版本: ${saveData.version}`;
          } else {
            throw new Error('存档码校验失败，数据可能已损坏');
          }
        } else {
          // 旧版本格式，直接使用数据
          parsedState = saveData;
          errorMessage = '';
          successMessage = '存档码解析成功！(旧版本格式)';
        }
        
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
      // 构建新的存档数据结构
      const saveData = {
        version: '1.0',
        metadata: {
          createdAt: new Date().toISOString(),
          description: 'RBMK-1000 反应堆存档'
        },
        data: parsedState,
        checksum: calculateChecksum(parsedState)
      };
      
      const encoded = btoa(JSON.stringify(saveData));
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

  // 计算校验和
  function calculateChecksum(data: any): string {
    const jsonString = JSON.stringify(data);
    let checksum = 0;
    for (let i = 0; i < jsonString.length; i++) {
      checksum += jsonString.charCodeAt(i);
    }
    return checksum.toString(16);
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
      if (
        current === null ||
        current === undefined ||
        typeof current !== 'object'
      ) {
        return defaultValue;
      }
      current = current[part];
    }

    return current !== undefined ? current : defaultValue;
  }

  // 生成示例存档码
  function generateExampleSaveCode() {
    const exampleState = {
      powerRegulation: {
        powerLevel: 50,
        targetPower: 50,
        reactivity: 0,
        automaticControl: true
      },
      controlRods: {
        position: 50,
        autoMode: true
      },
      core: {
        temperature: 280,
        pressure: 7.0,
        waterLevel: 70
      },
      turbine: {
        status: true,
        load: 50,
        speed: 3000
      }
    } as Partial<ReactorState>;

    // 构建新的存档数据结构
    const saveData = {
      version: '1.0',
      metadata: {
        createdAt: new Date().toISOString(),
        description: '示例 RBMK-1000 反应堆存档'
      },
      data: exampleState,
      checksum: calculateChecksum(exampleState)
    };

    // 转换为 JSON 字符串并编码为 Base64
    const jsonString = JSON.stringify(saveData);
    const encoded = btoa(jsonString);
    saveCodeInput = encoded;
    successMessage = '已生成示例存档码！';

    // 3秒后清除成功消息
    setTimeout(() => {
      successMessage = '';
    }, 3000);
  }

  // Mock data for TodayCard
  const mockCard = {
    heading: '存档编辑器',
    title: 'Save Editor',
    inlineDescription: '使用存档码编辑器导入、编辑和导出反应堆模拟器的存档状态。',
    media: {
      kind: 'image',
      url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=save%20code%20editor%20interface%20with%20code%20snippets%20and%20buttons%2C%20modern%20design%2C%20blue%20lighting%2C%20high%20detail&image_size=landscape_16_9',
    },
    style: 'dark',
    clickAction: {
      kind: 'navigate',
      destination: '/save-editor',
    },
  };
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

  .hero-content {
    padding: 24px;
    color: white;
  }

  .hero-content h1 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 16px;
  }

  .hero-content p {
    font-size: 16px;
    margin-bottom: 0;
  }

  @media (min-width: 768px) {
    .hero-content {
      padding: 48px;
    }

    .hero-content h1 {
      font-size: 48px;
    }

    .hero-content p {
      font-size: 18px;
    }
  }
</style>

<Page config={defaultComponentConfig}>
  <Navigation slot="navigation" />
  <AmbientBackgroundArtwork slot="background" />
  <GradientOverlay slot="overlay" />
  
  <div class="container">
    <Hero
      color="#0066ff"
      profile="large-hero"
      config={defaultComponentConfig}
    >
      <div class="hero-content">
        <h1>{$i18nStore.t('SaveEditor')}</h1>
        <p>使用存档码编辑器导入、编辑和导出反应堆模拟器的存档状态。</p>
      </div>
    </Hero>
    
    <ResponsiveContainer>
      <div class="card-section">
        <TodayCard card={mockCard} config={defaultComponentConfig} />
      </div>

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
          <button class="btn btn-primary" on:click={parseSaveCode}
            >解析存档码</button
          >
          <button class="btn btn-secondary" on:click={encodeSaveCode}
            >编码存档码</button
          >
          <button class="btn btn-secondary" on:click={copyToClipboard}
            >复制存档码</button
          >
          <button class="btn btn-secondary" on:click={generateExampleSaveCode}
            >生成示例存档码</button
          >
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
              <div class="info-value">
                {getValue('isRunning') ? '运行中' : '已停止'}
              </div>
            </div>

            <div class="info-item">
              <div class="info-label">模拟时间</div>
              <div class="info-value">{getValue('simulationTime', 0)} 秒</div>
            </div>

            <div class="info-item">
              <div class="info-label">功率水平</div>
              <div class="info-value">
                {getValue('powerRegulation.powerLevel', 0)?.toFixed(1) || 0}%
              </div>
            </div>

            <div class="info-item">
              <div class="info-label">堆芯温度</div>
              <div class="info-value">
                {getValue('core.temperature', 0)?.toFixed(1) || 0}°C
              </div>
            </div>

            <div class="info-item">
              <div class="info-label">堆芯压力</div>
              <div class="info-value">
                {getValue('core.pressure', 0)?.toFixed(2) || 0} MPa
              </div>
            </div>

            <div class="info-item">
              <div class="info-label">控制棒位置</div>
              <div class="info-value">
                {getValue('controlRods.position', 0)?.toFixed(1) || 0}%
              </div>
            </div>
          </div>
        </div>

        <div class="save-editor-card">
          <h2>存档信息</h2>

          <div class="simulation-info">
            <div class="info-item">
              <div class="info-label">存档版本</div>
              <div class="info-value">1.0</div>
            </div>

            <div class="info-item">
              <div class="info-label">创建时间</div>
              <div class="info-value">{new Date().toLocaleString()}</div>
            </div>

            <div class="info-item">
              <div class="info-label">数据格式</div>
              <div class="info-value">新版本 (带校验和)</div>
            </div>

            <div class="info-item">
              <div class="info-label">兼容性</div>
              <div class="info-value">支持旧版本格式</div>
            </div>
          </div>
        </div>

        <div class="save-editor-card">
          <h2>编辑参数</h2>

          <div class="parameter-grid">
            <!-- 基本模拟参数 -->
            <div class="parameter-item">
              <label for="isRunning" class="parameter-label"
                >运行状态 (isRunning)</label
              >
              <select
                id="isRunning"
                class="parameter-value"
                on:change={(e) =>
                  updateValue('isRunning', (e.target as HTMLSelectElement).value)}
                value={getValue('isRunning', false)}
              >
                <option
                  value="true"
                  selected={getValue('isRunning', false) === true}>运行中</option
                >
                <option
                  value="false"
                  selected={getValue('isRunning', false) === false}>已停止</option
                >
              </select>
            </div>

            <div class="parameter-item">
              <label for="simulationTime" class="parameter-label"
                >模拟时间 (simulationTime)</label
              >
              <input
                id="simulationTime"
                type="number"
                class="parameter-value"
                on:input={(e) =>
                  updateValue(
                    'simulationTime',
                    (e.target as HTMLInputElement).value
                  )}
                value={getValue('simulationTime', 0)}
              />
            </div>

            <!-- 控制棒参数 -->
            <div class="parameter-item">
              <label for="controlRodsPosition" class="parameter-label"
                >控制棒位置 (0-100%)</label
              >
              <input
                id="controlRodsPosition"
                type="range"
                min="0"
                max="100"
                class="parameter-value"
                on:input={(e) =>
                  updateValue(
                    'controlRods.position',
                    (e.target as HTMLInputElement).value
                  )}
                value={getValue('controlRods.position', 50)}
              />
              <div>{getValue('controlRods.position', 50)?.toFixed(1) || 0}%</div>
            </div>

            <!-- 功率调节参数 -->
            <div class="parameter-item">
              <label for="powerLevel" class="parameter-label"
                >当前功率 (0-100%)</label
              >
              <input
                id="powerLevel"
                type="range"
                min="0"
                max="100"
                class="parameter-value"
                on:input={(e) =>
                  updateValue(
                    'powerRegulation.powerLevel',
                    (e.target as HTMLInputElement).value
                  )}
                value={getValue('powerRegulation.powerLevel', 50)}
              />
              <div>
                {getValue('powerRegulation.powerLevel', 50)?.toFixed(1) || 0}%
              </div>
            </div>

            <div class="parameter-item">
              <label for="targetPower" class="parameter-label"
                >目标功率 (0-100%)</label
              >
              <input
                id="targetPower"
                type="range"
                min="0"
                max="100"
                class="parameter-value"
                on:input={(e) =>
                  updateValue(
                    'powerRegulation.targetPower',
                    (e.target as HTMLInputElement).value
                  )}
                value={getValue('powerRegulation.targetPower', 50)}
              />
              <div>
                {getValue('powerRegulation.targetPower', 50)?.toFixed(1) || 0}%
              </div>
            </div>

            <!-- 核心参数 -->
            <div class="parameter-item">
              <label for="coreTemperature" class="parameter-label"
                >堆芯温度 (°C)</label
              >
              <input
                id="coreTemperature"
                type="number"
                class="parameter-value"
                on:input={(e) =>
                  updateValue(
                    'core.temperature',
                    (e.target as HTMLInputElement).value
                  )}
                value={getValue('core.temperature', 280)}
              />
            </div>

            <div class="parameter-item">
              <label for="corePressure" class="parameter-label"
                >堆芯压力 (MPa)</label
              >
              <input
                id="corePressure"
                type="number"
                step="0.01"
                class="parameter-value"
                on:input={(e) =>
                  updateValue(
                    'core.pressure',
                    (e.target as HTMLInputElement).value
                  )}
                value={getValue('core.pressure', 7.0)}
              />
            </div>

            <div class="parameter-item">
              <label for="coreWaterLevel" class="parameter-label"
                >堆芯水位 (0-100%)</label
              >
              <input
                id="coreWaterLevel"
                type="range"
                min="0"
                max="100"
                class="parameter-value"
                on:input={(e) =>
                  updateValue(
                    'core.waterLevel',
                    (e.target as HTMLInputElement).value
                  )}
                value={getValue('core.waterLevel', 70)}
              />
              <div>{getValue('core.waterLevel', 70)?.toFixed(1) || 0}%</div>
            </div>

            <!-- 再循环泵参数 -->
            <div class="parameter-item">
              <label for="recircPump1Status" class="parameter-label"
                >再循环泵1状态</label
              >
              <select
                id="recircPump1Status"
                class="parameter-value"
                on:change={(e) =>
                  updateValue(
                    'recirculationPumps.pump1.status',
                    (e.target as HTMLSelectElement).value
                  )}
                value={getValue('recirculationPumps.pump1.status', true)}
              >
                <option
                  value="true"
                  selected={getValue('recirculationPumps.pump1.status', true) ===
                    true}>开启</option
                >
                <option
                  value="false"
                  selected={getValue('recirculationPumps.pump1.status', true) ===
                    false}>关闭</option
                >
              </select>
            </div>

            <div class="parameter-item">
              <label for="recircPump1Speed" class="parameter-label"
                >再循环泵1转速 (0-100%)</label
              >
              <input
                id="recircPump1Speed"
                type="range"
                min="0"
                max="100"
                class="parameter-value"
                on:input={(e) =>
                  updateValue(
                    'recirculationPumps.pump1.speed',
                    (e.target as HTMLInputElement).value
                  )}
                value={getValue('recirculationPumps.pump1.speed', 70)}
              />
              <div>
                {getValue('recirculationPumps.pump1.speed', 70)?.toFixed(1) || 0}%
              </div>
            </div>

            <div class="parameter-item">
              <label for="recircPump2Status" class="parameter-label"
                >再循环泵2状态</label
              >
              <select
                id="recircPump2Status"
                class="parameter-value"
                on:change={(e) =>
                  updateValue(
                    'recirculationPumps.pump2.status',
                    (e.target as HTMLSelectElement).value
                  )}
                value={getValue('recirculationPumps.pump2.status', true)}
              >
                <option
                  value="true"
                  selected={getValue('recirculationPumps.pump2.status', true) ===
                    true}>开启</option
                >
                <option
                  value="false"
                  selected={getValue('recirculationPumps.pump2.status', true) ===
                    false}>关闭</option
                >
              </select>
            </div>

            <div class="parameter-item">
              <label for="recircPump2Speed" class="parameter-label"
                >再循环泵2转速 (0-100%)</label
              >
              <input
                id="recircPump2Speed"
                type="range"
                min="0"
                max="100"
                class="parameter-value"
                on:input={(e) =>
                  updateValue(
                    'recirculationPumps.pump2.speed',
                    (e.target as HTMLInputElement).value
                  )}
                value={getValue('recirculationPumps.pump2.speed', 70)}
              />
              <div>
                {getValue('recirculationPumps.pump2.speed', 70)?.toFixed(1) || 0}%
              </div>
            </div>

            <!-- 应急冷却泵参数 -->
            <div class="parameter-item">
              <label for="emergCoolPump1Status" class="parameter-label"
                >应急冷却泵1状态</label
              >
              <select
                id="emergCoolPump1Status"
                class="parameter-value"
                on:change={(e) =>
                  updateValue(
                    'emergencyCoolingPumps.pump1.status',
                    (e.target as HTMLSelectElement).value
                  )}
                value={getValue('emergencyCoolingPumps.pump1.status', false)}
              >
                <option
                  value="true"
                  selected={getValue(
                    'emergencyCoolingPumps.pump1.status',
                    false
                  ) === true}>开启</option
                >
                <option
                  value="false"
                  selected={getValue(
                    'emergencyCoolingPumps.pump1.status',
                    false
                  ) === false}>关闭</option
                >
              </select>
            </div>

            <div class="parameter-item">
              <label for="emergCoolPump1Flow" class="parameter-label"
                >应急冷却泵1流量 (0-100%)</label
              >
              <input
                id="emergCoolPump1Flow"
                type="range"
                min="0"
                max="100"
                class="parameter-value"
                on:input={(e) =>
                  updateValue(
                    'emergencyCoolingPumps.pump1.flowRate',
                    (e.target as HTMLInputElement).value
                  )}
                value={getValue('emergencyCoolingPumps.pump1.flowRate', 0)}
              />
              <div>
                {getValue('emergencyCoolingPumps.pump1.flowRate', 0)?.toFixed(1) ||
                  0}%
              </div>
            </div>

            <div class="parameter-item">
              <label for="emergCoolPump2Status" class="parameter-label"
                >应急冷却泵2状态</label
              >
              <select
                id="emergCoolPump2Status"
                class="parameter-value"
                on:change={(e) =>
                  updateValue(
                    'emergencyCoolingPumps.pump2.status',
                    (e.target as HTMLSelectElement).value
                  )}
                value={getValue('emergencyCoolingPumps.pump2.status', false)}
              >
                <option
                  value="true"
                  selected={getValue(
                    'emergencyCoolingPumps.pump2.status',
                    false
                  ) === true}>开启</option
                >
                <option
                  value="false"
                  selected={getValue(
                    'emergencyCoolingPumps.pump2.status',
                    false
                  ) === false}>关闭</option
                >
              </select>
            </div>

            <div class="parameter-item">
              <label for="emergCoolPump2Flow" class="parameter-label"
                >应急冷却泵2流量 (0-100%)</label
              >
              <input
                id="emergCoolPump2Flow"
                type="range"
                min="0"
                max="100"
                class="parameter-value"
                on:input={(e) =>
                  updateValue(
                    'emergencyCoolingPumps.pump2.flowRate',
                    (e.target as HTMLInputElement).value
                  )}
                value={getValue('emergencyCoolingPumps.pump2.flowRate', 0)}
              />
              <div>
                {getValue('emergencyCoolingPumps.pump2.flowRate', 0)?.toFixed(1) ||
                  0}%
              </div>
            </div>

            <!-- 汽轮机参数 -->
            <div class="parameter-item">
              <label for="turbineStatus" class="parameter-label">汽轮机状态</label>
              <select
                id="turbineStatus"
                class="parameter-value"
                on:change={(e) =>
                  updateValue(
                    'turbine.status',
                    (e.target as HTMLSelectElement).value
                  )}
                value={getValue('turbine.status', true)}
              >
                <option
                  value="true"
                  selected={getValue('turbine.status', true) === true}>开启</option
                >
                <option
                  value="false"
                  selected={getValue('turbine.status', true) === false}>关闭</option
                >
              </select>
            </div>

            <div class="parameter-item">
              <label for="turbineLoad" class="parameter-label"
                >汽轮机负载 (0-100%)</label
              >
              <input
                id="turbineLoad"
                type="range"
                min="0"
                max="100"
                class="parameter-value"
                on:input={(e) =>
                  updateValue('turbine.load', (e.target as HTMLInputElement).value)}
                value={getValue('turbine.load', 50)}
              />
              <div>{getValue('turbine.load', 50)?.toFixed(1) || 0}%</div>
            </div>
          </div>
        </div>

        <div class="save-editor-card">
          <h2>操作</h2>

          <div class="button-group">
            <button class="btn btn-primary" on:click={encodeSaveCode}
              >生成新存档码</button
            >
            <button class="btn btn-secondary" on:click={copyToClipboard}
              >复制存档码</button
            >
          </div>
        </div>
      {/if}
    </ResponsiveContainer>
  </div>
</Page>