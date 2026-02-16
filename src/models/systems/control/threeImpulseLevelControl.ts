// 三冲量水位控制模型

interface ThreeImpulseLevelControlInput {
  H_actual: number; // 实际水位
  H_setpoint: number; // 水位设定值
  m_steam: number; // 蒸汽流量
  m_feedwater: number; // 给水流量
  K_p: number; // 比例增益
  K_d: number; // 微分增益
  m_feedwater_adjusted_prev: number; // 前一次的给水流量调整值
  m_steam_prev: number; // 前一次的蒸汽流量
}

interface ThreeImpulseLevelControlOutput {
  m_feedwater_adjusted: number; // 调整后的给水流量
  error: number; // 水位误差
  steamFlowChange: number; // 蒸汽流量变化
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
  const error = input.H_setpoint - input.H_actual;

  // 计算蒸汽流量变化
  const steamFlowChange = input.m_steam - input.m_steam_prev;

  // 三冲量水位控制公式
  const m_feedwater_adjusted =
    input.m_feedwater_adjusted_prev +
    input.K_p * error +
    input.K_d * steamFlowChange;

  return {
    m_feedwater_adjusted,
    error,
    steamFlowChange,
  };
}

/**
 * 计算水位警报阈值
 * @param H_actual 实际水位
 * @param H_setpoint 水位设定值
 * @returns 水位状态
 */
export function calculateWaterLevelStatus(
  H_actual: number,
  H_setpoint: number
): {
  status: 'normal' | 'warning' | 'alarm' | 'shutdown';
  message: string;
} {
  const highLevelAlarm = H_setpoint * 1.15; // 高水位警报
  const highLevelShutdown = H_setpoint * 1.2; // 高水位停堆
  const lowLevelAlarm = H_setpoint * 0.85; // 低水位警报
  const lowLevelShutdown = H_setpoint * 0.8; // 低水位停堆

  if (H_actual > highLevelShutdown) {
    return {
      status: 'shutdown',
      message: 'HIGH WATER LEVEL - SHUTDOWN',
    };
  } else if (H_actual > highLevelAlarm) {
    return {
      status: 'alarm',
      message: 'HIGH WATER LEVEL ALARM',
    };
  } else if (H_actual < lowLevelShutdown) {
    return {
      status: 'shutdown',
      message: 'LOW WATER LEVEL - SHUTDOWN',
    };
  } else if (H_actual < lowLevelAlarm) {
    return {
      status: 'alarm',
      message: 'LOW WATER LEVEL ALARM',
    };
  } else if (H_actual > H_setpoint * 1.1 || H_actual < H_setpoint * 0.9) {
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
