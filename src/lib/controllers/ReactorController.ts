import { reactorSystemStore } from '../stores/mobx/reactorStore';
import { physicsStore } from '../stores/mobx/physicsStore';
import { showSystemStatus } from '../stores/uiStore';
import log from '../utils/logger';

// 反应堆控制接口
interface IReactorController {
  // 控制棒系统控制
  setControlRodPosition: (position: number) => void;
  emergencyRodInsertion: () => void;
  toggleControlRodAutoMode: (isAuto: boolean) => void;

  // 泵系统控制
  togglePump: (system: string, pump: string) => void;
  setPumpSpeed: (system: string, pump: string, speed: number) => void;

  // 汽轮机系统控制
  toggleTurbine: () => void;
  setTurbineLoad: (load: number) => void;

  // 蒸汽系统控制
  setSteamValvePosition: (position: number) => void;
  setSteamPressure: (pressure: number) => void;

  // 给水系统控制
  setFeedwaterFlowRate: (flowRate: number) => void;
  setFeedwaterValvePosition: (position: number) => void;

  // 应急系统控制
  activateEmergencyCooling: () => void;
  deactivateEmergencyCooling: () => void;

  // 系统状态检查
  checkSystemStatus: () => void;
}

// 反应堆控制器类
export class ReactorController implements IReactorController {
  // 控制棒自动模式状态
  private _controlRodAutoMode: boolean = false;

  // 构造函数
  constructor () {
    // 初始化控制器
    log.info('Reactor controller initialized');
  }

  // 设置控制棒位置
  setControlRodPosition (position: number) {
    const clampedPosition = Math.max(0, Math.min(100, position));
    reactorSystemStore.setControlRodPosition(clampedPosition);

    // 根据控制棒位置调整反应性
    const reactivity = (100 - clampedPosition) * 0.001;
    physicsStore.updateReactivity(reactivity);

    log.info(
      `Control rod position set to ${clampedPosition}%, reactivity: ${reactivity.toFixed(4)}`
    );
  }

  // 紧急插入控制棒
  emergencyRodInsertion () {
    log.warn('Emergency rod insertion activated!');
    showSystemStatus('紧急控制棒插入已激活！', 'error');

    // 设置控制棒位置为0（完全插入）
    this.setControlRodPosition(0);

    // 激活应急冷却系统
    this.activateEmergencyCooling();

    log.success('Emergency rod insertion completed');
    showSystemStatus('紧急控制棒插入已完成', 'warning');
  }

  // 切换控制棒自动模式
  toggleControlRodAutoMode (isAuto: boolean) {
    this._controlRodAutoMode = isAuto;
    log.info(`Control rod auto mode ${isAuto ? 'enabled' : 'disabled'}`);
    showSystemStatus(`控制棒自动模式已${isAuto ? '启用' : '禁用'}`, 'info');
  }

  // 切换泵状态
  togglePump (system: string, pump: string) {
    // 这里简化处理，直接调用setPumpStatus来切换状态
    // 实际应用中可能需要更复杂的逻辑来获取当前状态
    // 这里假设默认状态是off，切换到on
    const newStatus: 'on' | 'off' = 'on';
    reactorSystemStore.setPumpStatus(system, pump, newStatus);

    log.info(
      `Pump ${pump} in system ${system} ${newStatus === 'on' ? 'started' : 'stopped'}`
    );
    showSystemStatus(
      `${system}系统 ${pump} 已${newStatus === 'on' ? '启动' : '停止'}`,
      newStatus === 'on' ? 'success' : 'info'
    );
  }

  // 设置泵速度
  setPumpSpeed (system: string, pump: string, speed: number) {
    const clampedSpeed = Math.max(0, Math.min(100, speed));
    reactorSystemStore.setPumpSpeed(system, pump, clampedSpeed);

    log.info(`Pump ${pump} in system ${system} speed set to ${clampedSpeed}%`);
  }

  // 切换汽轮机状态
  toggleTurbine () {
    const currentStatus = reactorSystemStore.state.turbine.status;
    const newStatus = currentStatus === 'on' ? 'off' : 'on';
    reactorSystemStore.setTurbineStatus(newStatus);

    log.info(`Turbine ${newStatus === 'on' ? 'started' : 'stopped'}`);
    showSystemStatus(
      `汽轮机已${newStatus === 'on' ? '启动' : '停止'}`,
      newStatus === 'on' ? 'success' : 'info'
    );
  }

  // 设置汽轮机负载
  setTurbineLoad (load: number) {
    const clampedLoad = Math.max(0, Math.min(100, load));
    reactorSystemStore.setTurbineLoad(clampedLoad);

    log.info(`Turbine load set to ${clampedLoad}%`);
  }

  // 设置蒸汽阀位置
  setSteamValvePosition (position: number) {
    const clampedPosition = Math.max(0, Math.min(100, position));
    reactorSystemStore.setSteamValvePosition(clampedPosition);

    // 根据阀位置调整蒸汽流量
    const steamFlowRate = (clampedPosition / 100) * 1000;
    reactorSystemStore.setSteamFlowRate(steamFlowRate);

    log.info(
      `Steam valve position set to ${clampedPosition}%, flow rate: ${steamFlowRate.toFixed(1)} kg/s`
    );
  }

  // 设置蒸汽压力
  setSteamPressure (pressure: number) {
    reactorSystemStore.setSteamPressure(pressure);
    log.info(`Steam pressure set to ${pressure.toFixed(2)} MPa`);
  }

  // 设置给水流量
  setFeedwaterFlowRate (flowRate: number) {
    reactorSystemStore.setFeedwaterFlowRate(flowRate);
    log.info(`Feedwater flow rate set to ${flowRate.toFixed(1)} kg/s`);
  }

  // 设置给水阀位置
  setFeedwaterValvePosition (position: number) {
    const clampedPosition = Math.max(0, Math.min(100, position));
    reactorSystemStore.setFeedwaterValvePosition(clampedPosition);

    // 根据阀位置调整给水流量
    const feedwaterFlowRate = (clampedPosition / 100) * 1000;
    reactorSystemStore.setFeedwaterFlowRate(feedwaterFlowRate);

    log.info(
      `Feedwater valve position set to ${clampedPosition}%, flow rate: ${feedwaterFlowRate.toFixed(1)} kg/s`
    );
  }

  // 激活应急冷却系统
  activateEmergencyCooling () {
    log.warn('Activating emergency cooling system...');
    showSystemStatus('应急冷却系统正在激活...', 'warning');

    // 启动应急冷却泵
    this.togglePump('emergencyCoolingPumps', 'pump1');
    this.togglePump('emergencyCoolingPumps', 'pump2');

    // 设置应急冷却泵速度
    this.setPumpSpeed('emergencyCoolingPumps', 'pump1', 100);
    this.setPumpSpeed('emergencyCoolingPumps', 'pump2', 100);

    log.success('Emergency cooling system activated');
    showSystemStatus('应急冷却系统已激活', 'success');
  }

  // 停用应急冷却系统
  deactivateEmergencyCooling () {
    log.info('Deactivating emergency cooling system...');
    showSystemStatus('应急冷却系统正在停用...', 'info');

    // 停止应急冷却泵
    this.togglePump('emergencyCoolingPumps', 'pump1');
    this.togglePump('emergencyCoolingPumps', 'pump2');

    log.success('Emergency cooling system deactivated');
    showSystemStatus('应急冷却系统已停用', 'info');
  }

  // 检查系统状态
  checkSystemStatus () {
    log.trace('Checking system status...');

    // 获取系统状态
    const reactorState = reactorSystemStore.state;
    const physicsState = physicsStore.state;

    // 检查反应堆功率
    if (physicsState.thermal.power > 1200) {
      log.warn('Reactor power above safe limit!');
      showSystemStatus('反应堆功率超过安全限制！', 'warning');
    }

    // 检查反应堆温度
    if (physicsState.thermal.temperature > 700) {
      log.warn('Reactor temperature above safe limit!');
      showSystemStatus('反应堆温度超过安全限制！', 'warning');
    }

    // 检查蒸汽压力
    if (reactorState.steamSystem.pressure > 8.0) {
      log.warn('Steam pressure above safe limit!');
      showSystemStatus('蒸汽压力超过安全限制！', 'warning');
    }

    // 检查控制棒位置
    if (
      reactorState.controlRods.position < 10 &&
      physicsState.thermal.power > 1000
    ) {
      log.warn('Control rods too low with high power!');
      showSystemStatus('控制棒位置过低且功率过高！', 'warning');
    }

    log.trace('System status check completed');
  }
}

// 导出单例
export const reactorController = new ReactorController();
