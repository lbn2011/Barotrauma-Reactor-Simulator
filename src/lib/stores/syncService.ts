import { autorun } from 'mobx';
import { uiStore } from './uiStore';
import { rootStore } from './mobx/rootStore';
import log from '@/lib/utils/logger';

/**
 * 状态同步服务
 * 负责在MobX和Svelte stores之间传递数据
 */
export class SyncService {
  private isInitialized = false;

  /**
   * 初始化同步服务
   */
  initialize() {
    if (this.isInitialized) {
      log.warn('SyncService already initialized');
      return;
    }

    log.info('Initializing SyncService');

    // 初始化MobX → Svelte stores同步
    this.initializeMobXToSvelteSync();

    // 初始化Svelte stores → MobX同步
    this.initializeSvelteToMobXSync();

    this.isInitialized = true;
    log.success('SyncService initialized successfully');
  }

  /**
   * 初始化MobX → Svelte stores同步
   */
  private initializeMobXToSvelteSync() {
    log.trace('Initializing MobX → Svelte stores sync');

    // 同步中子物理状态
    autorun(() => {
      const neutronState = rootStore.neutron.state;
      log.debug('Neutron state changed:', {
        xenon: neutronState.xenon.Xe,
        reactivity: neutronState.reactivity.total,
        controlRodPosition: neutronState.controlRod.position,
      });

      // 这里可以添加具体的同步逻辑，例如更新UI状态
    });

    // 同步热工水力状态
    autorun(() => {
      const thermalState = rootStore.thermal.state;
      log.debug('Thermal state changed:', {
        power: thermalState.thermal.power,
        coolantTemperature: thermalState.coolant.temperature,
        pressure: thermalState.coolant.pressure,
      });

      // 这里可以添加具体的同步逻辑，例如更新UI状态
    });

    // 同步系统状态
    autorun(() => {
      const systemsState = rootStore.systems.state;
      log.debug('Systems state changed:', {
        waterLevel: systemsState.levelControl.waterLevel,
        purificationStatus: systemsState.purification.status,
        steamBypassStatus: systemsState.steamBypass.status,
      });

      // 这里可以添加具体的同步逻辑，例如更新UI状态
    });

    // 同步物理计算状态
    autorun(() => {
      const physicsState = rootStore.physics.state;
      log.debug('Physics state changed:', {
        power: physicsState.thermal.power,
        temperature: physicsState.thermal.temperature,
        simulationTime: physicsState.time.simulationTime,
      });

      // 这里可以添加具体的同步逻辑，例如更新UI状态
    });

    log.success('MobX → Svelte stores sync initialized');
  }

  /**
   * 初始化Svelte stores → MobX同步
   */
  private initializeSvelteToMobXSync() {
    log.trace('Initializing Svelte stores → MobX sync');

    // 订阅UI状态变化
    const unsubscribe = uiStore.subscribe((state) => {
      log.debug('UI state changed:', {
        activePanel: state.ui.activePanel,
        showControlPanel: state.ui.showControlPanel,
        showDataTrend: state.ui.showDataTrend,
      });

      // 这里可以添加具体的同步逻辑，例如根据UI操作更新MobX状态
    });

    // 存储取消订阅函数，以便在需要时清理
    this.unsubscribeFromUIStore = unsubscribe;

    log.success('Svelte stores → MobX sync initialized');
  }

  /**
   * 从UI状态更新MobX状态
   * @param type 更新类型
   * @param data 更新数据
   */
  updateMobXFromUI(type: string, data: any) {
    log.trace('Updating MobX from UI:', { type, data });

    switch (type) {
      case 'controlRodPosition':
        rootStore.neutron.setControlRodPosition(data.position);
        break;
      case 'powerSetpoint':
        rootStore.physics.updatePower(data.power);
        break;
      case 'coolantFlow':
        rootStore.physics.updateCoolingFlowRate(data.flowRate);
        break;
      case 'waterLevelSetpoint':
        rootStore.systems.setWaterLevelSetpoint(data.setpoint);
        break;
      case 'turbineLoad':
        rootStore.systems.setTurbineLoad(data.load);
        break;
      default:
        log.warn('Unknown update type:', type);
    }
  }

  /**
   * 从MobX状态更新UI状态
   * @param type 更新类型
   * @param data 更新数据
   */
  updateUIFromMobX(type: string, data: any) {
    log.trace('Updating UI from MobX:', { type, data });

    switch (type) {
      case 'physicsStatus':
        uiStore.update(state => ({
          ...state,
          systemStatus: {
            ...state.systemStatus,
            showSystemStatus: true,
            statusMessage: `Power: ${data.power.toFixed(1)}%, Temp: ${data.temperature.toFixed(1)}°C`,
            statusLevel: 'info',
          },
        }));
        break;
      case 'alarm':
        uiStore.update(state => ({
          ...state,
          systemStatus: {
            ...state.systemStatus,
            showSystemStatus: true,
            statusMessage: data.message,
            statusLevel: data.level,
          },
        }));
        break;
      default:
        log.warn('Unknown update type:', type);
    }
  }

  /**
   * 清理同步服务
   */
  dispose() {
    if (this.unsubscribeFromUIStore) {
      this.unsubscribeFromUIStore();
    }
    this.isInitialized = false;
    log.info('SyncService disposed');
  }

  // 私有属性
  private unsubscribeFromUIStore?: () => void;
}

// 导出单例
export const syncService = new SyncService();
