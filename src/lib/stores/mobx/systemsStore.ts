import { makeAutoObservable, computed } from 'mobx';
import logger, { ModuleType } from '@/lib/utils/logger';

// 三冲量水位控制状态
interface LevelControlState {
  waterLevel: number; // 水位（%）
  waterLevelSetpoint: number; // 水位设定值（%）
  steamFlow: number; // 蒸汽流量（kg/s）
  feedwaterFlow: number; // 给水流量（kg/s）
  adjustedFeedwaterFlow: number; // 调整后的给水流量（kg/s）
  levelError: number; // 水位误差（%）
  flowError: number; // 流量误差（kg/s）
  waterLevelStatus:
    | 'normal'
    | 'low'
    | 'high'
    | 'critical_low'
    | 'critical_high'; // 水位状态
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
  status: boolean;
  bypassPosition: number;
  bypassFlow: number;
  bypassCapacity: number;
  pressureSetpoint: number;
  steamPressure: number;
  maxPressure: number;
  steamFlowMax: number;
  currentBypassPosition: number;
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
    currentBypassPosition: 0,
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
  constructor () {
    this.state = { ...initialState };
    makeAutoObservable(this, {
      // 计算属性
      totalFeedwaterFlow: computed,
      bypassFlowRate: computed,
      turbineEfficiency: computed,
    });
  }

  // 总给水流量
  get totalFeedwaterFlow () {
    return this.state.levelControl.adjustedFeedwaterFlow;
  }

  // 旁路流量
  get bypassFlowRate () {
    return this.state.steamBypass.bypassFlow;
  }

  // 汽轮机效率
  get turbineEfficiency () {
    if (this.state.turbine.load === 0) return 0;
    return (
      (this.state.turbine.powerOutput / (this.state.turbine.load * 10)) * 100
    );
  }

  /**
   * 计算三冲量水位控制
   * @param deltaTime 时间步长
   */
  calculateThreeImpulseLevelControl (deltaTime: number) {
    logger.trace(ModuleType.STORE, 'Calculating three-impulse level control');

    const { levelControl } = this.state;
    const { waterLevel, waterLevelSetpoint, steamFlow, feedwaterFlow, pid } =
      levelControl;

    // 计算水位误差
    const levelError = waterLevelSetpoint - waterLevel;

    // 计算流量误差
    const flowError = feedwaterFlow - steamFlow;

    // PID 控制计算
    const proportional = pid.kp * levelError;
    const integral = pid.ki * (pid.integral + levelError * deltaTime);
    const derivative = (pid.kd * (levelError - pid.previousError)) / deltaTime;

    // 计算调整量
    const adjustment = proportional + integral + derivative;

    // 计算调整后的给水流量
    let adjustedFeedwaterFlow = feedwaterFlow + adjustment + flowError * 0.3;

    // 限制给水流量范围
    adjustedFeedwaterFlow = Math.max(0, Math.min(1000, adjustedFeedwaterFlow));

    // 确定水位状态
    let waterLevelStatus:
      | 'normal'
      | 'low'
      | 'high'
      | 'critical_low'
      | 'critical_high';
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

    logger.debug(ModuleType.STORE, 'Three-impulse level control calculated', {
      levelError,
      flowError,
      adjustedFeedwaterFlow,
      waterLevelStatus,
      alarm,
    });
  }

  calculateCorePurification (_deltaTime: number) {
    logger.trace(ModuleType.STORE, 'Calculating core purification');

    const { purification } = this.state;

    if (!purification.status) {
      this.state.purification = {
        ...purification,
        efficiency: 0,
        warningLevel: 'alarm',
        isEffective: false,
      };
      logger.debug(ModuleType.STORE, 'Core purification system is off');
      return;
    }

    // 计算净化效率
    const flowFactor = purification.flowRate / 100000; // 最大流量100000 kg/h
    const impurityFactor =
      1 -
      purification.impurityConcentration /
        purification.maxImpurityConcentration;
    const purificationEfficiency =
      purification.filterEfficiency * flowFactor * impurityFactor * 100;

    // 计算过滤后的杂质浓度
    const filteredImpurityConcentration =
      purification.impurityConcentration *
      (1 - purification.filterEfficiency * flowFactor);

    // 计算警告级别
    let warningLevel: 'normal' | 'warning' | 'alarm';
    if (
      filteredImpurityConcentration >
      0.8 * purification.maxImpurityConcentration
    ) {
      warningLevel = 'alarm';
    } else if (
      filteredImpurityConcentration >
      0.5 * purification.maxImpurityConcentration
    ) {
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

    logger.debug(ModuleType.STORE, 'Core purification calculated', {
      efficiency: purificationEfficiency,
      impurityConcentration: filteredImpurityConcentration,
      warningLevel,
      isEffective: purificationEfficiency > 50,
    });
  }

  calculateSteamBypass (_deltaTime: number) {
    logger.trace(ModuleType.STORE, 'Calculating steam bypass');

    const { steamBypass } = this.state;
    const {
      pressureSetpoint,
      steamPressure,
      maxPressure,
      steamFlowMax,
      currentBypassPosition = 0,
    } = steamBypass;

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
    const bypassFlow =
      (bypassPosition / 100) * steamFlowMax * (steamPressure / maxPressure);

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

    logger.debug(ModuleType.STORE, 'Steam bypass calculated', {
      bypassPosition,
      bypassFlow,
      bypassCapacity,
      status,
    });
  }

  calculateTurbine (_deltaTime: number) {
    logger.trace(ModuleType.STORE, 'Calculating turbine system');

    const { turbine } = this.state;
    const { status, load, speed, steamPressure, steamTemperature } = turbine;

    if (!status) {
      logger.debug(ModuleType.STORE, 'Turbine system is off');
      return;
    }

    let newSpeed = speed;
    if (load > 0) {
      newSpeed = 3000 + (load - 50) * 10;
    } else {
      newSpeed = 1000;
    }

    const powerOutput = (load / 100) * 1000;

    const exhaustTemperature = 30 + (load / 100) * 50;

    let tripStatus = turbine.tripStatus;
    let tripReason = turbine.tripReason;
    let newStatus: boolean = status;

    if (!tripStatus) {
      if (newSpeed > 3300) {
        tripStatus = true;
        newStatus = false;
        tripReason = 'OVERSPEED';
        logger.warn(ModuleType.STORE, 'Turbine trip: Overspeed', {
          speed: newSpeed,
        });
      }

      if (steamPressure > 8.5) {
        tripStatus = true;
        newStatus = false;
        tripReason = 'HIGH STEAM PRESSURE';
        logger.warn(ModuleType.STORE, 'Turbine trip: High steam pressure', {
          steamPressure,
        });
      }

      if (steamTemperature > 320) {
        tripStatus = true;
        newStatus = false;
        tripReason = 'HIGH STEAM TEMPERATURE';
        logger.warn(ModuleType.STORE, 'Turbine trip: High steam temperature', {
          steamTemperature,
        });
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

    logger.debug(ModuleType.STORE, 'Turbine system calculated', {
      speed: newSpeed,
      powerOutput,
      exhaustTemperature,
      tripStatus,
      status: newStatus,
    });
  }

  setWaterLevelSetpoint (setpoint: number) {
    this.state.levelControl.waterLevelSetpoint = Math.max(
      0,
      Math.min(100, setpoint)
    );
    logger.debug(ModuleType.STORE, 'Water level setpoint updated', {
      setpoint,
    });
  }

  setSteamFlow (flow: number) {
    this.state.levelControl.steamFlow = flow;
    logger.debug(ModuleType.STORE, 'Steam flow updated', { flow });
  }

  setFeedwaterFlow (flow: number) {
    this.state.levelControl.feedwaterFlow = flow;
    logger.debug(ModuleType.STORE, 'Feedwater flow updated', { flow });
  }

  setPurificationFlowRate (flowRate: number) {
    this.state.purification.flowRate = flowRate;
    logger.debug(ModuleType.STORE, 'Purification flow rate updated', {
      flowRate,
    });
  }

  setSteamPressure (pressure: number) {
    this.state.steamBypass.steamPressure = pressure;
    this.state.turbine.steamPressure = pressure;
    logger.debug(ModuleType.STORE, 'Steam pressure updated', { pressure });
  }

  setTurbineLoad (load: number) {
    this.state.turbine.load = Math.max(0, Math.min(100, load));
    logger.debug(ModuleType.STORE, 'Turbine load updated', { load });
  }

  setTurbineStatus (status: boolean) {
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
    logger.debug(ModuleType.STORE, 'Turbine status updated', { status });
  }

  update (deltaTime: number) {
    logger.time('Systems update', ModuleType.STORE);

    this.calculateThreeImpulseLevelControl(deltaTime);
    this.calculateCorePurification(deltaTime);
    this.calculateSteamBypass(deltaTime);
    this.calculateTurbine(deltaTime);

    logger.timeEnd('Systems update', ModuleType.STORE);
  }

  reset () {
    this.state = { ...initialState };
    logger.info(ModuleType.STORE, 'Systems store reset');
  }
}

// 导出单例
export const systemsStore = new SystemsStore();
