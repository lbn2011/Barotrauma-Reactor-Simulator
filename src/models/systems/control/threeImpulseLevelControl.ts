// 三冲量水位控制模型
// 模拟核电站蒸汽发生器的水位控制系统

/**
 * 三冲量水位控制输入参数
 */
interface ThreeImpulseLevelControlInput {
  waterLevel: number; // 实际水位（%）
  waterLevelSetpoint: number; // 水位设定值（%）
  steamFlow: number; // 蒸汽流量（kg/s）
  feedwaterFlow: number; // 给水流量（kg/s）
}

/**
 * 三冲量水位控制输出结果
 */
interface ThreeImpulseLevelControlOutput {
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
}

/**
 * 计算三冲量水位控制
 * 模拟核电站蒸汽发生器的水位控制系统
 *
 * @param input 输入参数
 * @returns 三冲量水位控制结果
 *
 * @description
 * 三冲量水位控制是核电站广泛使用的水位控制方法：
 * 1. 第一冲量：水位信号（反馈信号）
 * 2. 第二冲量：蒸汽流量信号（前馈信号）
 * 3. 第三冲量：给水流量信号（反馈信号）
 *
 * 这种控制方法可以快速响应负荷变化，提高水位控制精度
 */
export function calculateThreeImpulseLevelControl(
  input: ThreeImpulseLevelControlInput
): ThreeImpulseLevelControlOutput {
  // 计算水位误差：设定值 - 实际值
  const levelError = input.waterLevelSetpoint - input.waterLevel;

  // 计算流量误差：给水流量 - 蒸汽流量
  const flowError = input.feedwaterFlow - input.steamFlow;

  // 三冲量水位控制公式（简化版）
  // 实际应用中可能需要更复杂的PID控制算法
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
    waterLevelStatus = 'critical_low'; // 严重低水位
    alarm = true;
  } else if (input.waterLevel < input.waterLevelSetpoint * 0.85) {
    waterLevelStatus = 'low'; // 低水位
    alarm = true;
  } else if (input.waterLevel > input.waterLevelSetpoint * 1.3) {
    waterLevelStatus = 'critical_high'; // 严重高水位
    alarm = true;
  } else if (input.waterLevel > input.waterLevelSetpoint * 1.15) {
    waterLevelStatus = 'high'; // 高水位
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
 * 评估水位状态并生成相应的警报消息
 *
 * @param waterLevel 实际水位（%）
 * @param waterLevelSetpoint 水位设定值（%）
 * @returns 水位状态和消息
 */
export function calculateWaterLevelStatus(
  waterLevel: number,
  waterLevelSetpoint: number
): {
  status: 'normal' | 'warning' | 'alarm' | 'shutdown';
  message: string;
} {
  // 定义水位警报阈值
  const highLevelAlarm = waterLevelSetpoint * 1.15; // 高水位警报
  const highLevelShutdown = waterLevelSetpoint * 1.2; // 高水位停堆
  const lowLevelAlarm = waterLevelSetpoint * 0.85; // 低水位警报
  const lowLevelShutdown = waterLevelSetpoint * 0.8; // 低水位停堆

  // 评估水位状态
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
