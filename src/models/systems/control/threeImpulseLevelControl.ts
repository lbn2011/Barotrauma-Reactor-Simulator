// 三冲量水位控制模型

interface ThreeImpulseLevelControlInput {
  waterLevel: number; // 实际水位
  waterLevelSetpoint: number; // 水位设定值
  steamFlow: number; // 蒸汽流量
  feedwaterFlow: number; // 给水流量
}

interface ThreeImpulseLevelControlOutput {
  adjustedFeedwaterFlow: number; // 调整后的给水流量
  levelError: number; // 水位误差
  flowError: number; // 流量误差
  waterLevelStatus:
    | 'normal'
    | 'low'
    | 'high'
    | 'critical_low'
    | 'critical_high'; // 水位状态
  alarm: boolean; // 警报状态
}

/**
 * 计算三冲量水位控制
 * @param input 输入参数
 * @returns 三冲量水位控制结果
 */
export function calculateThreeImpulseLevelControl(
  input: ThreeImpulseLevelControlInput
): ThreeImpulseLevelControlOutput {
  // 计算水位误差
  const levelError = input.waterLevelSetpoint - input.waterLevel;

  // 计算流量误差（给水流量与蒸汽流量的差值）
  const flowError = input.feedwaterFlow - input.steamFlow;

  // 三冲量水位控制公式（简化版）
  // 这里使用简化的控制算法，实际应用中可能需要更复杂的PID控制
  const adjustedFeedwaterFlow =
    input.feedwaterFlow + levelError * 0.5 + flowError * 0.3;

  // 确定水位状态
  let waterLevelStatus:
    | 'normal'
    | 'low'
    | 'high'
    | 'critical_low'
    | 'critical_high' = 'normal';
  let alarm = false;

  if (input.waterLevel < input.waterLevelSetpoint * 0.7) {
    waterLevelStatus = 'critical_low';
    alarm = true;
  } else if (input.waterLevel < input.waterLevelSetpoint * 0.85) {
    waterLevelStatus = 'low';
    alarm = true;
  } else if (input.waterLevel > input.waterLevelSetpoint * 1.3) {
    waterLevelStatus = 'critical_high';
    alarm = true;
  } else if (input.waterLevel > input.waterLevelSetpoint * 1.15) {
    waterLevelStatus = 'high';
    alarm = true;
  }

  return {
    adjustedFeedwaterFlow,
    levelError,
    flowError,
    waterLevelStatus,
    alarm,
  };
}

/**
 * 计算水位警报阈值
 * @param waterLevel 实际水位
 * @param waterLevelSetpoint 水位设定值
 * @returns 水位状态
 */
export function calculateWaterLevelStatus(
  waterLevel: number,
  waterLevelSetpoint: number
): {
  status: 'normal' | 'warning' | 'alarm' | 'shutdown';
  message: string;
} {
  const highLevelAlarm = waterLevelSetpoint * 1.15; // 高水位警报
  const highLevelShutdown = waterLevelSetpoint * 1.2; // 高水位停堆
  const lowLevelAlarm = waterLevelSetpoint * 0.85; // 低水位警报
  const lowLevelShutdown = waterLevelSetpoint * 0.8; // 低水位停堆

  if (waterLevel > highLevelShutdown) {
    return {
      status: 'shutdown',
      message: 'HIGH WATER LEVEL - SHUTDOWN',
    };
  } else if (waterLevel > highLevelAlarm) {
    return {
      status: 'alarm',
      message: 'HIGH WATER LEVEL ALARM',
    };
  } else if (waterLevel < lowLevelShutdown) {
    return {
      status: 'shutdown',
      message: 'LOW WATER LEVEL - SHUTDOWN',
    };
  } else if (waterLevel < lowLevelAlarm) {
    return {
      status: 'alarm',
      message: 'LOW WATER LEVEL ALARM',
    };
  } else if (
    waterLevel > waterLevelSetpoint * 1.1 ||
    waterLevel < waterLevelSetpoint * 0.9
  ) {
    return {
      status: 'warning',
      message: 'WATER LEVEL WARNING',
    };
  } else {
    return {
      status: 'normal',
      message: 'WATER LEVEL NORMAL',
    };
  }
}
