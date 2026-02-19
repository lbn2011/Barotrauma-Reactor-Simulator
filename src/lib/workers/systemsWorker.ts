// 系统模型计算Worker
import log from '../utils/logger';

// 定义消息类型
interface WorkerMessage {
  type: string;
  payload: any;
}

// 定义响应类型
interface WorkerResponse {
  type: string;
  success: boolean;
  data?: any;
  error?: string;
}

// 三冲量水位控制参数接口
interface ThreeImpulseLevelControlParams {
  levelControl: {
    waterLevel: number;
    waterLevelSetpoint: number;
    steamFlow: number;
    feedwaterFlow: number;
    adjustedFeedwaterFlow: number;
    levelError: number;
    flowError: number;
    waterLevelStatus:
      | 'normal'
      | 'low'
      | 'high'
      | 'critical_low'
      | 'critical_high';
    alarm: boolean;
    pid: {
      kp: number;
      ki: number;
      kd: number;
      integral: number;
      derivative: number;
      previousError: number;
    };
  };
  deltaTime: number;
}

// 堆芯净化系统参数接口
interface CorePurificationParams {
  purification: {
    status: boolean;
    flowRate: number;
    efficiency: number;
    impurityConcentration: number;
    maxImpurityConcentration: number;
    warningLevel: 'normal' | 'warning' | 'alarm';
    filterEfficiency: number;
    purificationSystemStatus: boolean;
    isEffective: boolean;
  };
}

// 蒸汽旁路系统参数接口
interface SteamBypassParams {
  steamBypass: {
    status: boolean;
    bypassPosition: number;
    bypassFlow: number;
    bypassCapacity: number;
    pressureSetpoint: number;
    steamPressure: number;
    maxPressure: number;
    steamFlowMax: number;
  };
}

// 汽轮机系统参数接口
interface TurbineParams {
  turbine: {
    status: boolean;
    load: number;
    speed: number;
    powerOutput: number;
    steamPressure: number;
    steamTemperature: number;
    exhaustPressure: number;
    exhaustTemperature: number;
    valvePosition: number;
    automaticControl: boolean;
    tripStatus: boolean;
    tripReason: string;
  };
}

// 三冲量水位控制计算
function calculateThreeImpulseLevelControl (
  params: ThreeImpulseLevelControlParams
): any {
  const { levelControl, deltaTime } = params;
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

  return {
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
}

// 堆芯净化系统计算
function calculateCorePurification (params: CorePurificationParams): any {
  const { purification } = params;

  if (!purification.status) {
    // 系统关闭时
    return {
      ...purification,
      efficiency: 0,
      warningLevel: 'alarm',
      isEffective: false,
    };
  }

  // 计算净化效率
  const flowFactor = purification.flowRate / 100000; // 最大流量100000 kg/h
  const impurityFactor =
    1 -
    purification.impurityConcentration / purification.maxImpurityConcentration;
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

  return {
    ...purification,
    efficiency: purificationEfficiency,
    impurityConcentration: filteredImpurityConcentration,
    warningLevel,
    isEffective: purificationEfficiency > 50,
  };
}

// 蒸汽旁路系统计算
function calculateSteamBypass (params: SteamBypassParams): any {
  const { steamBypass } = params;
  const {
    pressureSetpoint,
    steamPressure,
    maxPressure,
    steamFlowMax,
    bypassPosition,
  } = steamBypass;

  // 计算压力误差
  const pressureError = steamPressure - pressureSetpoint;

  // 计算旁路阀位置调整
  let newBypassPosition = bypassPosition;
  if (pressureError > 0) {
    // 压力高于设定值，打开旁路阀
    newBypassPosition += pressureError * 10;
  } else {
    // 压力低于设定值，关闭旁路阀
    newBypassPosition += pressureError * 5;
  }

  // 限制旁路阀位置范围
  newBypassPosition = Math.max(0, Math.min(100, newBypassPosition));

  // 计算旁路流量
  const bypassFlow =
    (newBypassPosition / 100) * steamFlowMax * (steamPressure / maxPressure);

  // 计算旁路容量
  const bypassCapacity = newBypassPosition;

  // 确定系统状态
  const status = newBypassPosition > 0;

  return {
    ...steamBypass,
    bypassPosition: newBypassPosition,
    bypassFlow,
    bypassCapacity,
    status,
  };
}

// 汽轮机系统计算
function calculateTurbine (params: TurbineParams): any {
  const { turbine } = params;
  const { status, load, speed, steamPressure, steamTemperature } = turbine;

  if (!status) {
    // 系统关闭时
    return turbine;
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
    }

    // 蒸汽压力保护
    if (steamPressure > 8.5) {
      tripStatus = true;
      newStatus = false;
      tripReason = 'HIGH STEAM PRESSURE';
    }

    // 蒸汽温度保护
    if (steamTemperature > 320) {
      tripStatus = true;
      newStatus = false;
      tripReason = 'HIGH STEAM TEMPERATURE';
    }
  }

  return {
    ...turbine,
    speed: newSpeed,
    powerOutput,
    exhaustTemperature,
    tripStatus,
    tripReason,
    status: newStatus,
  };
}

// 处理消息
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;
  let response: WorkerResponse;

  try {
    log.trace(`SystemsWorker received message: ${type}`);

    switch (type) {
    case 'calculateThreeImpulseLevelControl': {
      const levelControlResult = calculateThreeImpulseLevelControl(payload);
      response = {
        type: 'threeImpulseLevelControlResult',
        success: true,
        data: levelControlResult,
      };
      break;
    }

    case 'calculateCorePurification': {
      const purificationResult = calculateCorePurification(payload);
      response = {
        type: 'corePurificationResult',
        success: true,
        data: purificationResult,
      };
      break;
    }

    case 'calculateSteamBypass': {
      const bypassResult = calculateSteamBypass(payload);
      response = {
        type: 'steamBypassResult',
        success: true,
        data: bypassResult,
      };
      break;
    }

    case 'calculateTurbine': {
      const turbineResult = calculateTurbine(payload);
      response = {
        type: 'turbineResult',
        success: true,
        data: turbineResult,
      };
      break;
    }

    default:
      response = {
        type: 'error',
        success: false,
        error: `Unknown message type: ${type}`,
      };
    }
  } catch (error) {
    log.error(`SystemsWorker error: ${error}`);
    response = {
      type: 'error',
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  self.postMessage(response);
};

export {};
