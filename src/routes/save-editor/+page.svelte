<script lang="ts">
import {
  Navigation,
  AmbientBackgroundArtwork,
  GradientOverlay,
  Hero,
  TodayCard,
  ResponsiveContainer,
} from '@/components/shared';
import type { ReactorState } from '@/lib/stores/reactorStore';
import { defaultComponentConfig } from '@/config/components';
import i18nStore from '@/stores/i18n';
import log from '@/lib/utils/logger';
import { onMount } from 'svelte';

// Component initialization logs
log.info('Save Editor page component initialized');
log.debug('Starting to load page dependencies and state');

onMount(() => {
  log.success('Save Editor page component mounted successfully');
  log.info('Page loaded successfully, ready to receive user operations');
});

// 输入和输出
let saveCodeInput: string = '';
let parsedState: Partial<ReactorState> | null = null;
let errorMessage: string = '';
let successMessage: string = '';

// Parse save code
function parseSaveCode () {
  log.info('Starting to parse save code');

  if (!saveCodeInput.trim()) {
    log.warn('Save code input is empty');
    errorMessage = 'Please enter save code';
    parsedState = null;
    return;
  }

  try {
    // Try to decode Base64 and parse JSON
    log.debug('Starting to decode Base64 save code');
    const decoded = atob(saveCodeInput.trim());
    log.trace('Base64 decoding successful, starting to parse JSON');
    const saveData = JSON.parse(decoded);

    // Validate save data structure
    if (typeof saveData === 'object' && saveData !== null) {
      // Check if it's a new version format
      if (saveData.version) {
        log.debug('Detected new version save format', { version: saveData.version });
        // Validate checksum
        const calculatedChecksum = calculateChecksum(saveData.data);
        log.trace('Checksum calculation completed', { calculatedChecksum });

        if (saveData.checksum === calculatedChecksum) {
          log.success('Save code verification successful, parsing completed');
          parsedState = saveData.data;
          errorMessage = '';
          successMessage = `Save code parsed successfully! Version: ${saveData.version}`;
        } else {
          log.error('Save code verification failed, data may be corrupted', {
            expectedChecksum: saveData.checksum,
            calculatedChecksum,
          });
          throw new Error('Save code verification failed, data may be corrupted');
        }
      } else {
        // Old version format, use data directly
        log.info('Detected old version save format, using data directly');
        parsedState = saveData;
        errorMessage = '';
        successMessage = 'Save code parsed successfully! (Old version format)';
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage = '';
        log.trace('Success message cleared');
      }, 3000);
    } else {
      log.error('Invalid save code format, not a valid object');
      throw new Error('Invalid save code format');
    }
  } catch (error) {
    log.error('Error parsing save code:', error);
    errorMessage = 'Save code format error, please check your input';
    parsedState = null;
    successMessage = '';
  }
}

// Re-encode save code
function encodeSaveCode () {
  log.info('Starting to encode save code');

  if (!parsedState) {
    log.warn('No data to encode');
    errorMessage = 'No data to encode';
    return;
  }

  try {
    // Build new save data structure
    log.debug('Starting to build save data structure');
    const saveData = {
      version: '1.0',
      metadata: {
        createdAt: new Date().toISOString(),
        description: 'RBMK-1000 reactor save',
      },
      data: parsedState,
      checksum: calculateChecksum(parsedState),
    };
    log.trace('Save data structure built, checksum calculated');

    log.debug('Starting to serialize and encode save data');
    const encoded = btoa(JSON.stringify(saveData));
    log.trace('Base64 encoding successful');
    saveCodeInput = encoded;
    errorMessage = '';
    successMessage = 'Save code encoded successfully!';
    log.success('Save code encoded successfully');

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage = '';
      log.trace('Success message cleared');
    }, 3000);
  } catch (error) {
    log.error('Error encoding save code:', error);
    errorMessage = 'Error encoding save code';
    successMessage = '';
  }
}

// Calculate checksum
function calculateChecksum (data: any): string {
  log.debug('Starting to calculate data checksum');
  const jsonString = JSON.stringify(data);
  log.trace('Data serialization completed, starting checksum calculation');
  let checksum = 0;
  for (let i = 0; i < jsonString.length; i++) {
    checksum += jsonString.charCodeAt(i);
  }
  const hexChecksum = checksum.toString(16);
  log.trace('Checksum calculation completed', { checksum: hexChecksum });
  return hexChecksum;
}

// Copy save code to clipboard
async function copyToClipboard () {
  log.info('Starting to copy save code to clipboard');

  if (saveCodeInput) {
    try {
      log.debug('Executing clipboard write operation');
      await navigator.clipboard.writeText(saveCodeInput);
      log.success('Save code copied to clipboard successfully');
      successMessage = 'Save code copied to clipboard!';

      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage = '';
        log.trace('Success message cleared');
      }, 3000);
    } catch (error) {
      log.error('Error copying to clipboard:', error);
      errorMessage = 'Cannot copy to clipboard';
    }
  } else {
    log.warn('No save code to copy');
  }
}

// Reset form
function resetForm () {
  log.info('Starting to reset form');
  saveCodeInput = '';
  parsedState = null;
  errorMessage = '';
  successMessage = '';
  log.success('Form reset successfully');
}

// Safe function to update numeric parameters
function updateValue (path: string, value: any) {
  log.debug('Starting to update parameter value', { path, value });

  if (!parsedState) {
    log.warn('Cannot update value: parsedState is null');
    return;
  }

  const parts = path.split('.');
  let current: any = parsedState;

  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      log.trace('Creating nested object path', { path: parts[i] });
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }

  const lastPart = parts[parts.length - 1];
  let convertedValue: any = value;

  if (typeof value === 'string') {
    // If string, try to convert to appropriate type
    if (value === 'true') {
      convertedValue = true;
      log.trace('Converting string value to boolean', {
        original: value,
        converted: convertedValue,
      });
    } else if (value === 'false') {
      convertedValue = false;
      log.trace('Converting string value to boolean', {
        original: value,
        converted: convertedValue,
      });
    } else if (!isNaN(Number(value))) {
      // If numeric string, convert to number
      convertedValue = parseFloat(value);
      log.trace('Converting string value to number', {
        original: value,
        converted: convertedValue,
      });
    } else {
      // Otherwise keep as string
      log.trace('Keeping string value unchanged', { value });
    }
  }

  current[lastPart] = convertedValue;
  log.success('Parameter value updated successfully', { path, value: convertedValue });
}

// Safe function to get nested values
function getValue (path: string, defaultValue: any = '') {
  log.debug('Starting to get parameter value', { path, defaultValue });

  if (!parsedState) {
    log.trace('parsedState is null, returning default value', { defaultValue });
    return defaultValue;
  }

  const parts = path.split('.');
  let current: any = parsedState;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      log.trace('Path does not exist, returning default value', { path, part, defaultValue });
      return defaultValue;
    }
    current = current[part];
  }

  const result = current !== undefined ? current : defaultValue;
  log.trace('Parameter value retrieved successfully', { path, result });
  return result;
}

// Generate example save code
function generateExampleSaveCode () {
  log.info('Starting to generate example save code');

  log.debug('Creating example reactor state data');
  const exampleState = {
    powerRegulation: {
      powerLevel: 50,
      targetPower: 50,
      reactivity: 0,
      automaticControl: true,
    },
    controlRods: {
      position: 50,
      autoMode: true,
    },
    core: {
      temperature: 280,
      pressure: 7.0,
      waterLevel: 70,
    },
    turbine: {
      status: true,
      load: 50,
      speed: 3000,
    },
  } as Partial<ReactorState>;

  // Build new save data structure
  log.debug('Building save data structure');
  const saveData = {
    version: '1.0',
    metadata: {
      createdAt: new Date().toISOString(),
      description: 'Example RBMK-1000 reactor save',
    },
    data: exampleState,
    checksum: calculateChecksum(exampleState),
  };

  // Convert to JSON string and encode as Base64
  log.debug('Serializing and encoding example save data');
  const jsonString = JSON.stringify(saveData);
  const encoded = btoa(jsonString);
  saveCodeInput = encoded;
  successMessage = 'Example save code generated!';
  log.success('Example save code generated successfully');

  // Clear success message after 3 seconds
  setTimeout(() => {
    successMessage = '';
    log.trace('Success message cleared');
  }, 3000);
}

// Web navigation data
const webNavigation = {
  tabs: [],
  platforms: [
    {
      action: {
        title: 'Overview',
        destination: {
          url: '/',
        },
      },
      isActive: false,
    },
    {
      action: {
        title: 'Save Editor',
        destination: {
          url: '/save-editor',
        },
      },
      isActive: true,
    },
  ],
  searchAction: {
    type: 'webSearch',
  },
};

// Artwork data for AmbientBackgroundArtwork
const artwork = {
  url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=reactor%20control%20room%20with%20blue%20lighting%2C%20modern%20design%2C%20high%20detail%2C%20futuristic&image_size=landscape_16_9',
};

// Mock data for TodayCard
const mockCard = {
  heading: '存档编辑器',
  title: 'Save Editor',
  inlineDescription: '使用存档码编辑器导入、编辑和导出反应堆模拟器的存档状态。',
  media: {
    kind: 'image' as const,
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=save%20code%20editor%20interface%20with%20code%20snippets%20and%20buttons%2C%20modern%20design%2C%20blue%20lighting%2C%20high%20detail&image_size=landscape_16_9',
  },
  style: 'dark' as const,
  clickAction: {
    title: '打开编辑器',
    destination: {
      url: '/save-editor',
    },
  },
};
</script>

<style>
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

<Navigation {webNavigation} />
<AmbientBackgroundArtwork {artwork} active={true} />
<GradientOverlay />

<div class="container">
  <Hero color="#0066ff" profile="large-hero" config={defaultComponentConfig}>
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
        <textarea id="saveCodeInput" bind:value={saveCodeInput} placeholder="在此粘贴您的存档码..."
        ></textarea>
      </div>

      <div class="button-group">
        <button class="btn btn-primary" on:click={parseSaveCode}>解析存档码</button>
        <button class="btn btn-secondary" on:click={encodeSaveCode}>编码存档码</button>
        <button class="btn btn-secondary" on:click={copyToClipboard}>复制存档码</button>
        <button class="btn btn-secondary" on:click={generateExampleSaveCode}>生成示例存档码</button>
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
            <label for="isRunning" class="parameter-label">运行状态 (isRunning)</label>
            <select
              id="isRunning"
              class="parameter-value"
              on:change={(e) => updateValue('isRunning', (e.target as HTMLSelectElement).value)}
              value={getValue('isRunning', false)}
            >
              <option value="true" selected={getValue('isRunning', false) === true}>运行中</option>
              <option value="false" selected={getValue('isRunning', false) === false}>已停止</option
              >
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
            />
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
              on:input={(e) =>
                updateValue('controlRods.position', (e.target as HTMLInputElement).value)}
              value={getValue('controlRods.position', 50)}
            />
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
              on:input={(e) =>
                updateValue('powerRegulation.powerLevel', (e.target as HTMLInputElement).value)}
              value={getValue('powerRegulation.powerLevel', 50)}
            />
            <div>
              {getValue('powerRegulation.powerLevel', 50)?.toFixed(1) || 0}%
            </div>
          </div>

          <div class="parameter-item">
            <label for="targetPower" class="parameter-label">目标功率 (0-100%)</label>
            <input
              id="targetPower"
              type="range"
              min="0"
              max="100"
              class="parameter-value"
              on:input={(e) =>
                updateValue('powerRegulation.targetPower', (e.target as HTMLInputElement).value)}
              value={getValue('powerRegulation.targetPower', 50)}
            />
            <div>
              {getValue('powerRegulation.targetPower', 50)?.toFixed(1) || 0}%
            </div>
          </div>

          <!-- 核心参数 -->
          <div class="parameter-item">
            <label for="coreTemperature" class="parameter-label">堆芯温度 (°C)</label>
            <input
              id="coreTemperature"
              type="number"
              class="parameter-value"
              on:input={(e) =>
                updateValue('core.temperature', (e.target as HTMLInputElement).value)}
              value={getValue('core.temperature', 280)}
            />
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
            />
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
            />
            <div>{getValue('core.waterLevel', 70)?.toFixed(1) || 0}%</div>
          </div>

          <!-- 再循环泵参数 -->
          <div class="parameter-item">
            <label for="recircPump1Status" class="parameter-label">再循环泵1状态</label>
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
                selected={getValue('recirculationPumps.pump1.status', true) === true}>开启</option
              >
              <option
                value="false"
                selected={getValue('recirculationPumps.pump1.status', true) === false}>关闭</option
              >
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
              on:input={(e) =>
                updateValue('recirculationPumps.pump1.speed', (e.target as HTMLInputElement).value)}
              value={getValue('recirculationPumps.pump1.speed', 70)}
            />
            <div>
              {getValue('recirculationPumps.pump1.speed', 70)?.toFixed(1) || 0}%
            </div>
          </div>

          <div class="parameter-item">
            <label for="recircPump2Status" class="parameter-label">再循环泵2状态</label>
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
                selected={getValue('recirculationPumps.pump2.status', true) === true}>开启</option
              >
              <option
                value="false"
                selected={getValue('recirculationPumps.pump2.status', true) === false}>关闭</option
              >
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
              on:input={(e) =>
                updateValue('recirculationPumps.pump2.speed', (e.target as HTMLInputElement).value)}
              value={getValue('recirculationPumps.pump2.speed', 70)}
            />
            <div>
              {getValue('recirculationPumps.pump2.speed', 70)?.toFixed(1) || 0}%
            </div>
          </div>

          <!-- 应急冷却泵参数 -->
          <div class="parameter-item">
            <label for="emergCoolPump1Status" class="parameter-label">应急冷却泵1状态</label>
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
                selected={getValue('emergencyCoolingPumps.pump1.status', false) === true}
                >开启</option
              >
              <option
                value="false"
                selected={getValue('emergencyCoolingPumps.pump1.status', false) === false}
                >关闭</option
              >
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
              on:input={(e) =>
                updateValue(
                  'emergencyCoolingPumps.pump1.flowRate',
                  (e.target as HTMLInputElement).value
                )}
              value={getValue('emergencyCoolingPumps.pump1.flowRate', 0)}
            />
            <div>
              {getValue('emergencyCoolingPumps.pump1.flowRate', 0)?.toFixed(1) || 0}%
            </div>
          </div>

          <div class="parameter-item">
            <label for="emergCoolPump2Status" class="parameter-label">应急冷却泵2状态</label>
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
                selected={getValue('emergencyCoolingPumps.pump2.status', false) === true}
                >开启</option
              >
              <option
                value="false"
                selected={getValue('emergencyCoolingPumps.pump2.status', false) === false}
                >关闭</option
              >
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
              on:input={(e) =>
                updateValue(
                  'emergencyCoolingPumps.pump2.flowRate',
                  (e.target as HTMLInputElement).value
                )}
              value={getValue('emergencyCoolingPumps.pump2.flowRate', 0)}
            />
            <div>
              {getValue('emergencyCoolingPumps.pump2.flowRate', 0)?.toFixed(1) || 0}%
            </div>
          </div>

          <!-- 汽轮机参数 -->
          <div class="parameter-item">
            <label for="turbineStatus" class="parameter-label">汽轮机状态</label>
            <select
              id="turbineStatus"
              class="parameter-value"
              on:change={(e) =>
                updateValue('turbine.status', (e.target as HTMLSelectElement).value)}
              value={getValue('turbine.status', true)}
            >
              <option value="true" selected={getValue('turbine.status', true) === true}>开启</option
              >
              <option value="false" selected={getValue('turbine.status', true) === false}
                >关闭</option
              >
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
            />
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
  </ResponsiveContainer>
</div>
