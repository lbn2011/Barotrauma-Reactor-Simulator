import { rootStore } from '../stores/mobx/rootStore';
import { syncService } from '../stores/syncService';
import { showSystemStatus } from '../stores/uiStore';
import { workerManager } from '../workers/workerManager';
import log from '../utils/logger';

// 精度级别类型
export type PrecisionLevel = 'low' | 'medium' | 'high' | 'very-high';

// 精度配置接口
export interface PrecisionConfig {
  level: PrecisionLevel;
  iterationCount: number;
  timeStep: number;
  samplingRate: number;
  performanceImpact: string;
  description: string;
}

// 模拟控制接口
interface ISimulationController {
  startSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  isRunning: boolean;
  simulationTime: number;
  timeStep: number;
  precisionLevel: PrecisionLevel;
  precisionConfig: PrecisionConfig;
  setPrecisionLevel: (level: PrecisionLevel) => void;
  getPrecisionConfigs: () => PrecisionConfig[];
}

// 模拟控制器类
export class SimulationController implements ISimulationController {
  // 模拟状态
  private _isRunning: boolean = false;
  private _simulationTime: number = 0;
  private _timeStep: number = 0.1;
  private _intervalId: number | null = null;
  private _precisionLevel: PrecisionLevel = 'medium';

  // 精度配置
  private _precisionConfigs: PrecisionConfig[] = [
    {
      level: 'low',
      iterationCount: 10,
      timeStep: 0.5,
      samplingRate: 10,
      performanceImpact: '极低',
      description: '低精度，计算速度快，适合快速预览',
    },
    {
      level: 'medium',
      iterationCount: 50,
      timeStep: 0.1,
      samplingRate: 50,
      performanceImpact: '中等',
      description: '中等精度，平衡计算速度和准确性',
    },
    {
      level: 'high',
      iterationCount: 200,
      timeStep: 0.05,
      samplingRate: 100,
      performanceImpact: '较高',
      description: '高精度，计算结果准确',
    },
    {
      level: 'very-high',
      iterationCount: 500,
      timeStep: 0.01,
      samplingRate: 200,
      performanceImpact: '很高',
      description: '极高精度，计算结果非常准确，但速度较慢',
    },
  ];

  // 构造函数
  constructor () {
    // 初始化模拟时间
    this._simulationTime = 0;
    // 初始化时间步长为当前精度级别的时间步长
    this._timeStep = this.precisionConfig.timeStep;
    // 初始化同步服务
    syncService.initialize();
    log.info('SyncService initialized in SimulationController');
    // 初始化Worker管理器
    workerManager.initialize();
    log.info('WorkerManager initialized in SimulationController');
  }

  // 启动模拟
  startSimulation () {
    if (this._isRunning) {
      return;
    }

    log.info('Starting simulation...');
    showSystemStatus('模拟正在启动...', 'info');

    // 设置运行状态
    this._isRunning = true;

    // 启动异步模拟循环
    this.startAsyncSimulationLoop();

    log.success('Simulation started successfully');
    showSystemStatus('模拟已成功启动', 'success');
  }

  // 启动异步模拟循环
  private startAsyncSimulationLoop () {
    const loop = async () => {
      if (!this._isRunning) {
        return;
      }

      try {
        await this.updateSimulation();
      } catch (error) {
        log.error('Error in simulation loop:', error);
      }

      // 继续下一次循环
      setTimeout(loop, this._timeStep * 1000);
    };

    // 启动循环
    loop();
  }

  // 停止模拟
  stopSimulation () {
    if (!this._isRunning) {
      return;
    }

    log.info('Stopping simulation...');
    showSystemStatus('模拟正在停止...', 'info');

    // 清除模拟循环
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }

    // 设置运行状态
    this._isRunning = false;

    log.success('Simulation stopped successfully');
    showSystemStatus('模拟已成功停止', 'success');
  }

  // 重置模拟
  resetSimulation () {
    log.info('Resetting simulation...');
    showSystemStatus('模拟正在重置...', 'info');

    // 停止模拟
    this.stopSimulation();

    // 重置模拟时间
    this._simulationTime = 0;
    rootStore.physics.updateSimulationTime(0);

    // 重置所有状态
    rootStore.reset();

    log.success('Simulation reset successfully');
    showSystemStatus('模拟已成功重置', 'success');
  }

  // 更新模拟
  private async updateSimulation () {
    if (!this._isRunning) {
      return;
    }

    // 增加模拟时间
    this._simulationTime += this._timeStep;
    rootStore.physics.updateSimulationTime(this._simulationTime);

    // 使用rootStore更新所有物理计算
    rootStore.updatePhysics(this._timeStep);

    // 模拟物理模型计算（异步）
    await this.simulatePhysics();

    // 模拟系统状态更新
    this.simulateSystemStatus();
  }

  // 模拟物理模型计算
  private async simulatePhysics () {
    log.trace('Entering simulatePhysics method');
    log.time('Physics simulation');

    // 获取当前精度配置
    const precisionConfig = this.precisionConfig;
    const iterationCount = precisionConfig.iterationCount;
    log.debug('Physics simulation parameters:', {
      iterationCount,
      timeStep: this._timeStep,
    });

    try {
      // 使用Worker进行中子物理计算
      const neutronParams = {
        xenon: rootStore.neutron.state.xenon,
        neutron: {
          flux: rootStore.neutron.state.neutron.flux.thermal,
          Σ_f: rootStore.neutron.state.neutron.Σ_f,
          ν: rootStore.neutron.state.neutron.ν,
          generationTime: rootStore.neutron.state.neutron.generationTime,
          lifetime: rootStore.neutron.state.neutron.lifetime,
        },
        deltaTime: this._timeStep,
      };

      const xenonResult = await workerManager.sendMessage<any>(
        'neutron',
        'calculateXenonPoisoning',
        neutronParams
      );
      log.debug('Xenon poisoning calculation result:', xenonResult);

      // 使用Worker进行热工水力计算
      const thermalParams = {
        fuel: rootStore.thermal.state.fuel,
        thermal: rootStore.thermal.state.thermal,
        deltaTime: this._timeStep,
      };

      const fuelResult = await workerManager.sendMessage<any>(
        'thermal',
        'calculateFuelHeatConduction',
        thermalParams
      );
      log.debug('Fuel heat conduction calculation result:', fuelResult);

      // 更新功率（基于Worker计算结果）
      let currentPower = rootStore.physics.state.thermal.power;
      let newPower = currentPower;

      // 根据迭代次数进行计算
      for (let i = 0; i < iterationCount; i++) {
        // 更复杂的功率计算模型
        const timeFactor = Math.sin(this._simulationTime + i * 0.1);
        const precisionFactor = iterationCount / 50; // 基于迭代次数的精度因子
        const powerChange = timeFactor * 10 * precisionFactor;
        newPower += powerChange * 0.01; // 每次迭代的步长
      }

      // 更新功率
      const updatedPower = Math.max(0, newPower);
      rootStore.physics.updatePower(updatedPower);
      log.debug('Updated power:', {
        oldPower: currentPower,
        newPower: updatedPower,
      });

      // 示例：简单的温度计算
      const currentTemperature = rootStore.physics.state.thermal.temperature;
      const temperatureChange =
        (newPower - currentPower) * 0.01 * (iterationCount / 50);
      const newTemperature = currentTemperature + temperatureChange;
      const updatedTemperature = Math.max(20, newTemperature);
      rootStore.physics.updateTemperature(updatedTemperature);
      log.debug('Updated temperature:', {
        oldTemperature: currentTemperature,
        newTemperature: updatedTemperature,
      });
    } catch (error) {
      log.error('Error in physics simulation:', error);
      // 降级到主线程计算
      this.fallbackPhysicsCalculation();
    }

    log.timeEnd('Physics simulation');
    log.trace('Exiting simulatePhysics method');
  }

  // 降级物理计算（当Worker不可用时）
  private fallbackPhysicsCalculation () {
    log.warn('Falling back to main thread physics calculation');

    // 简单的功率计算
    let currentPower = rootStore.physics.state.thermal.power;
    let newPower = currentPower;

    // 简单的温度计算
    const currentTemperature = rootStore.physics.state.thermal.temperature;
    const temperatureChange = (newPower - currentPower) * 0.01;
    const newTemperature = currentTemperature + temperatureChange;
    const updatedTemperature = Math.max(20, newTemperature);

    // 更新状态
    rootStore.physics.updatePower(Math.max(0, newPower));
    rootStore.physics.updateTemperature(updatedTemperature);
  }

  // 模拟系统状态更新
  private simulateSystemStatus () {
    // 这里可以添加系统状态更新的逻辑
    // 例如：泵系统状态、汽轮机状态、蒸汽系统状态等

    // 示例：根据功率更新蒸汽系统压力
    const power = rootStore.physics.state.thermal.power;
    const newPressure = 5.0 + (power / 1000) * 2.0;
    rootStore.systems.setSteamPressure(newPressure);

    // 示例：根据蒸汽压力更新汽轮机功率输出
    if (rootStore.systems.state.turbine.status) {
      const load = Math.min(100, (newPressure - 5.0) * 20);
      rootStore.systems.setTurbineLoad(load);
    }
  }

  // 获取模拟状态
  get isRunning (): boolean {
    return this._isRunning;
  }

  get simulationTime (): number {
    return this._simulationTime;
  }

  get timeStep (): number {
    return this._timeStep;
  }

  // 精度控制相关
  get precisionLevel (): PrecisionLevel {
    return this._precisionLevel;
  }

  get precisionConfig (): PrecisionConfig {
    return (
      this._precisionConfigs.find(
        (config) => config.level === this._precisionLevel
      ) || this._precisionConfigs[1]
    );
  }

  // 设置精度级别
  setPrecisionLevel (level: PrecisionLevel) {
    // 验证精度级别
    const validLevel = this._precisionConfigs.some(
      (config) => config.level === level
    );
    if (!validLevel) {
      log.warn(`Invalid precision level: ${level}, using medium instead`);
      this._precisionLevel = 'medium';
    } else {
      this._precisionLevel = level;
    }

    // 更新时间步长
    const config = this.precisionConfig;
    this._timeStep = config.timeStep;

    // 如果模拟正在运行，重新启动模拟循环
    if (this._isRunning) {
      this.stopSimulation();
      this.startSimulation();
    }

    log.info(`Precision level set to ${level}, time step: ${this._timeStep}`);
    showSystemStatus(`模拟精度已设置为 ${level}`, 'info');
  }

  // 获取所有精度配置
  getPrecisionConfigs (): PrecisionConfig[] {
    return this._precisionConfigs;
  }

  // 设置时间步长
  setTimeStep (timeStep: number) {
    this._timeStep = Math.max(0.01, Math.min(1.0, timeStep));

    // 如果模拟正在运行，重新启动模拟循环
    if (this._isRunning) {
      this.stopSimulation();
      this.startSimulation();
    }
  }
}

// 导出单例
export const simulationController = new SimulationController();
