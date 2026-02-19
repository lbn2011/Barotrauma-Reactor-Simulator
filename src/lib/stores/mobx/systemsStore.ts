import { makeAutoObservable, computed } from 'mobx';
import log from '@/lib/utils/logger';

// 三冲量水位控制状态
interface LevelControlState {
  waterLevel: number; // 水位（%）
  waterLevelSetpoint: number; // 水位设定值（%）
  steamFlow: number; // 蒸汽流量（kg/s）
  feedwaterFlow: number; // 给水流量（kg/s）
  adjustedFeedwaterFlow: number; // 调整后的给水流量（kg/s）
  levelError: number; // 水位误差（%）
  flowError: number; // 流量误差（kg/s）
  waterLevelStatus: 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high'; // 水位状态
  alarm: boolean; // 警报状态
  // PID 参数
  pid: {
    kp: number; // 比例系数
    ki: number; // 积分系数
    kd: number; // 微分系数
    integral: number; // 积分项
    derivative: number; // 微分项
    previousError: number; // 上一次误差
  };
}

// 堆芯净化系统状态
interface PurificationState {
  status: boolean; // 系统状态
  flowRate: number; // 净化流量（kg/h）
  efficiency: number; // 净化效率（%）
  impurityConcentration: number; // 杂质浓度（ppb）
  maxImpurityConcentration: number; // 最大杂质浓度（ppb）
  warningLevel: 'normal' | 'warning' | 'alarm'; // 警告级别
  filterEfficiency: number; // 过滤器效率
  purificationSystemStatus: boolean; // 系统状态
  isEffective: boolean; // 系统是否有效
}

// 蒸汽旁路系统状态
interface SteamBypassState {
  status: boolean; // 系统状态
  bypassPosition: number; // 旁路阀位置（%）
  bypassFlow: number; // 旁路流量（kg/s）
  bypassCapacity: number; // 旁路容量（%）
  pressureSetpoint: number; // 压力设定值（MPa）
  steamPressure: number; // 蒸汽压力（MPa）
  maxPressure: number; // 最大压力（MPa）
  steamFlowMax: number; // 最大蒸汽流量（kg/s）
}

// 汽轮机状态
interface TurbineState {
  status: boolean; // 系统状态
  load: number; // 负荷（%）
  speed: number; // 转速（RPM）
  powerOutput: number; // 功率输出（MW）
  steamPressure: number; // 蒸汽压力（MPa）
  steamTemperature: number; // 蒸汽温度（°C）
  exhaustPressure: number; // 排汽压力（MPa）
  exhaustTemperature: number; // 排汽温度（°C）
  valvePosition: number; // 阀门位置（%）
  automaticControl: boolean; // 自动控制模式
  tripStatus: boolean; // 跳闸状态
  tripReason: string; // 跳闸原因
}

// 系统模型状态接口
interface SystemsState {
  // 三冲量水位控制
  levelControl: LevelControlState;

  // 堆芯净化系统
  purification: PurificationState;

  // 蒸汽旁路系统
  steamBypass: SteamBypassState;

  // 汽轮机系统
  turbine: TurbineState;
}

// 初始状态
const initialState: SystemsState = {
  // 三冲量水位控制
  levelControl: {
    waterLevel: 70,
    waterLevelSetpoint: 70,
    steamFlow: 500,
    feedwaterFlow: 500,
    adjustedFeedwaterFlow: 500,
    levelError: 0,
    flowError: 0,
    waterLevelStatus: 'normal',
    alarm: false,
    pid: {
      kp: 0.5,
      ki: 0.1,
      kd: 0.05,
      integral: 0,
      derivative: 0,
      previousError: 0,
    },
  },

  // 堆芯净化系统
  purification: {
    status: true,
    flowRate: 50000,
    efficiency: 95,
    impurityConcentration: 10,
    maxImpurityConcentration: 100,
    warningLevel: 'normal',
    filterEfficiency: 0.95,
    purificationSystemStatus: true,
    isEffective: true,
  },

  // 蒸汽旁路系统
  steamBypass: {
    status: false,
    bypassPosition: 0,
    bypassFlow: 0,
    bypassCapacity: 0,
    pressureSetpoint: 7.0,
    steamPressure: 7.0,
    maxPressure: 8.5,
    steamFlowMax: 3000,
  },

  // 汽轮机系统
  turbine: {
    status: false,
    load: 0,
    speed: 0,
    powerOutput: 0,
    steamPressure: 7.0,
    steamTemperature: 280,
    exhaustPressure: 0.05,
    exhaustTemperature: 40,
    valvePosition: 0,
    automaticControl: false,
    tripStatus: false,
    tripReason: '',
  },
};

/**
 * SystemsStore
 * 处理辅助系统计算，包括三冲量水位控制、堆芯净化和蒸汽旁路
 */
export class SystemsStore {
  // 状态
  state: SystemsState;

  // 构造函数
  constructor() {
    this.state = { ...initialState };
    makeAutoObservable(this, {
      // 计算属性
      totalFeedwaterFlow: computed,
      bypassFlowRate: computed,
      turbineEfficiency: computed,
    });
  }

  // 总给水流量
  get totalFeedwaterFlow() {
    return this.state.levelControl.adjustedFeedwaterFlow;
  }

  // 旁路流量
  get bypassFlowRate() {
    return this.state.steamBypass.bypassFlow;
  }

  // 汽轮机效率
  get turbineEfficiency() {
    if (this.state.turbine.load === 0) return 0;
    return (this.state.turbine.powerOutput / (this.state.turbine.load * 10)) * 100;
  }

  /**
   * 计算三冲量水位控制
   * @param deltaTime 时间步长
   */
  calculateThreeImpulseLevelControl(deltaTime: number) {
    log.trace('Calculating three-impulse level control');
    
    const { levelControl } = this.state;
    const { waterLevel, waterLevelSetpoint, steamFlow, feedwaterFlow, pid } = levelControl;

    // 计算水位误差
    const levelError = waterLevelSetpoint - waterLevel;

    // 计算流量误差
    const flowError = feedwaterFlow - steamFlow;

    // PID 控制计算
    const proportional = pid.kp * levelError;
    const integral = pid.ki * (pid.integral + levelError * deltaTime);
    const derivative = pid.kd * (levelError - pid.previousError) / deltaTime;

    // 计算调整量
    const adjustment = proportional + integral + derivative;

    // 计算调整后的给水流量
    let adjustedFeedwaterFlow = feedwaterFlow + adjustment + flowError * 0.3;

    // 限制给水流量范围
    adjustedFeedwaterFlow = Math.max(0, Math.min(1000, adjustedFeedwaterFlow));

    // 确定水位状态
    let waterLevelStatus: 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high';
    let alarm = false;

    if (waterLevel < waterLevelSetpoint * 0.7) {
      waterLevelStatus = 'critical_low';
      alarm = true;
    } else if (waterLevel < waterLevelSetpoint * 0.85) {
      waterLevelStatus = 'low';
      alarm = true;
    } else if (waterLevel > waterLevelSetpoint * 1.3) {
      waterLevelStatus = 'critical_high';
      alarm = true;
    } else if (waterLevel > waterLevelSetpoint * 1.15) {
      waterLevelStatus = 'high';
      alarm = true;
    } else {
      waterLevelStatus = 'normal';
      alarm = false;
    }

    // 更新状态
    this.state.levelControl = {
      ...levelControl,
      levelError,
      flowError,
      adjustedFeedwaterFlow,
      waterLevelStatus,
      alarm,
      pid: {
        ...pid,
        integral,
        derivative,
        previousError: levelError,
      },
    };

    log.debug('Three-impulse level control calculated:', {
      levelError,
      flowError,
      adjustedFeedwaterFlow,
      waterLevelStatus,
      alarm,
    });
  }

  /**
   * 计算堆芯净化系统
   * @param deltaTime 时间步长
   */
  calculateCorePurification(deltaTime: number) {
    log.trace('Calculating core purification');
    
    const { purification } = this.state;

    if (!purification.status) {
      // 系统关闭时
      this.state.purification = {
        ...purification,
        efficiency: 0,
        warningLevel: 'alarm',
        isEffective: false,
      };
      log.debug('Core purification system is off');
      return;
    }

    // 计算净化效率
    const flowFactor = purification.flowRate / 100000; // 最大流量100000 kg/h
    const impurityFactor = 1 - purification.impurityConcentration / purification.maxImpurityConcentration;
    const purificationEfficiency = purification.filterEfficiency * flowFactor * impurityFactor * 100;

    // 计算过滤后的杂质浓度
    const filteredImpurityConcentration = purification.impurityConcentration * (1 - purification.filterEfficiency * flowFactor);

    // 计算警告级别
    let warningLevel: 'normal' | 'warning' | 'alarm';
    if (filteredImpurityConcentration > 0.8 * purification.maxImpurityConcentration) {
      warningLevel = 'alarm';
    } else if (filteredImpurityConcentration > 0.5 * purification.maxImpurityConcentration) {
      warningLevel = 'warning';
    } else {
      warningLevel = 'normal';
    }

    // 更新状态
    this.state.purification = {
      ...purification,
      efficiency: purificationEfficiency,
      impurityConcentration: filteredImpurityConcentration,
      warningLevel,
      isEffective: purificationEfficiency > 50,
    };

    log.debug('Core purification calculated:', {
      efficiency: purificationEfficiency,
      impurityConcentration: filteredImpurityConcentration,
      warningLevel,
      isEffective: purificationEfficiency > 50,
    });
  }

  /**
   * 计算蒸汽旁路系统
   * @param deltaTime 时间步长
   */
  calculateSteamBypass(deltaTime: number) {
    log.trace('Calculating steam bypass');
    
    const { steamBypass } = this.state;
    const { pressureSetpoint, steamPressure, maxPressure, steamFlowMax, currentBypassPosition = 0 } = steamBypass;

    // 计算压力误差
    const pressureError = steamPressure - pressureSetpoint;

    // 计算旁路阀位置调整
    let bypassPosition = currentBypassPosition;
    if (pressureError > 0) {
      // 压力高于设定值，打开旁路阀
      bypassPosition += pressureError * 10;
    } else {
      // 压力低于设定值，关闭旁路阀
      bypassPosition += pressureError * 5;
    }

    // 限制旁路阀位置范围
    bypassPosition = Math.max(0, Math.min(100, bypassPosition));

    // 计算旁路流量
    const bypassFlow = (bypassPosition / 100) * steamFlowMax * (steamPressure / maxPressure);

    // 计算旁路容量
    const bypassCapacity = bypassPosition;

    // 确定系统状态
    const status = bypassPosition > 0;

    // 更新状态
    this.state.steamBypass = {
      ...steamBypass,
      bypassPosition,
      bypassFlow,
      bypassCapacity,
      status,
    };

    log.debug('Steam bypass calculated:', {
      bypassPosition,
      bypassFlow,
      bypassCapacity,
      status,
    });
  }

  /**
   * 计算汽轮机系统
   * @param deltaTime 时间步长
   */
  calculateTurbine(deltaTime: number) {
    log.trace('Calculating turbine system');
    
    const { turbine } = this.state;
    const { status, load, speed, steamPressure, steamTemperature } = turbine;

    if (!status) {
      // 系统关闭时
      log.debug('Turbine system is off');
      return;
    }

    // 计算转速（简化）
    let newSpeed = speed;
    if (load > 0) {
      newSpeed = 3000 + (load - 50) * 10;
    } else {
      newSpeed = 1000;
    }

    // 计算功率输出
    const powerOutput = (load / 100) * 1000; // 假设最大功率1000 MW

    // 计算排汽温度
    const exhaustTemperature = 30 + (load / 100) * 50;

    // 检查跳闸条件
    let tripStatus = turbine.tripStatus;
    let tripReason = turbine.tripReason;
    let newStatus = status;

    if (!tripStatus) {
      // 超速保护
      if (newSpeed > 3300) {
        tripStatus = true;
        newStatus = false;
        tripReason = 'OVERSPEED';
        log.warn('Turbine trip: Overspeed');
      }

      // 蒸汽压力保护
      if (steamPressure > 8.5) {
        tripStatus = true;
        newStatus = false;
        tripReason = 'HIGH STEAM PRESSURE';
        log.warn('Turbine trip: High steam pressure');
      }

      // 蒸汽温度保护
      if (steamTemperature > 320) {
        tripStatus = true;
        newStatus = false;
        tripReason = 'HIGH STEAM TEMPERATURE';
        log.warn('Turbine trip: High steam temperature');
      }
    }

    // 更新状态
    this.state.turbine = {
      ...turbine,
      speed: newSpeed,
      powerOutput,
      exhaustTemperature,
      tripStatus,
      tripReason,
      status: newStatus,
    };

    log.debug('Turbine system calculated:', {
      speed: newSpeed,
      powerOutput,
      exhaustTemperature,
      tripStatus,
      status: newStatus,
    });
  }

  /**
   * 更新水位设定值
   * @param setpoint 水位设定值（%）
   */
  setWaterLevelSetpoint(setpoint: number) {
    this.state.levelControl.waterLevelSetpoint = Math.max(0, Math.min(100, setpoint));
    log.debug(`Water level setpoint set to ${setpoint}%`);
  }

  /**
   * 更新蒸汽流量
   * @param flow 蒸汽流量（kg/s）
   */
  setSteamFlow(flow: number) {
    this.state.levelControl.steamFlow = flow;
    log.debug(`Steam flow set to ${flow} kg/s`);
  }

  /**
   * 更新给水流量
   * @param flow 给水流量（kg/s）
   */
  setFeedwaterFlow(flow: number) {
    this.state.levelControl.feedwaterFlow = flow;
    log.debug(`Feedwater flow set to ${flow} kg/s`);
  }

  /**
   * 更新堆芯净化流量
   * @param flowRate 净化流量（kg/h）
   */
  setPurificationFlowRate(flowRate: number) {
    this.state.purification.flowRate = flowRate;
    log.debug(`Purification flow rate set to ${flowRate} kg/h`);
  }

  /**
   * 更新蒸汽压力
   * @param pressure 蒸汽压力（MPa）
   */
  setSteamPressure(pressure: number) {
    this.state.steamBypass.steamPressure = pressure;
    this.state.turbine.steamPressure = pressure;
    log.debug(`Steam pressure set to ${pressure} MPa`);
  }

  /**
   * 更新汽轮机负荷
   * @param load 负荷（%）
   */
  setTurbineLoad(load: number) {
    this.state.turbine.load = Math.max(0, Math.min(100, load));
    log.debug(`Turbine load set to ${load}%`);
  }

  /**
   * 切换汽轮机状态
   * @param status 状态
   */
  setTurbineStatus(status: boolean) {
    this.state.turbine.status = status;
    if (status) {
      this.state.turbine.tripStatus = false;
      this.state.turbine.tripReason = '';
      this.state.turbine.speed = 1000;
    } else {
      this.state.turbine.speed = 0;
      this.state.turbine.load = 0;
      this.state.turbine.powerOutput = 0;
    }
    log.debug(`Turbine status set to ${status}`);
  }

  /**
   * 更新系统模型计算
   * @param deltaTime 时间步长
   */
  update(deltaTime: number) {
    log.time('Systems update');
    
    // 计算三冲量水位控制
    this.calculateThreeImpulseLevelControl(deltaTime);
    
    // 计算堆芯净化系统
    this.calculateCorePurification(deltaTime);
    
    // 计算蒸汽旁路系统
    this.calculateSteamBypass(deltaTime);
    
    // 计算汽轮机系统
    this.calculateTurbine(deltaTime);
    
    log.timeEnd('Systems update');
  }

  /**
   * 重置状态
   */
  reset() {
    this.state = { ...initialState };
    log.info('Systems store reset');
  }
}

// 导出单例
export const systemsStore = new SystemsStore();
