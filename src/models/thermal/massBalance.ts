// 质量守恒方程模型
// 模拟核电站水循环系统中的质量守恒

/**
 * 质量平衡计算输入参数
 */
interface MassBalanceInput {
  M_reactor: number; // 反应堆内水的质量（千克）
  M_condenser: number; // 凝汽器内水的质量（千克）
  M_deaerator: number; // 除氧器内水的质量（千克）
  m_feedwater: number; // 给水流量（千克/秒）
  m_steam: number; // 蒸汽流量（千克/秒）
  m_condensate: number; // 凝结水流量（千克/秒）
  m_cooling: number; // 冷却水带来的质量变化（千克/秒）
  m_steam_heating: number; // 加热蒸汽流量（千克/秒）
  m_feedwater_out: number; // 出口给水流量（千克/秒）
}

/**
 * 质量平衡计算输出结果
 */
interface MassBalanceOutput {
  dM_reactor: number; // 反应堆质量变化率（千克/秒）
  dM_condenser: number; // 凝汽器质量变化率（千克/秒）
  dM_deaerator: number; // 除氧器质量变化率（千克/秒）
  newMasses: {
    M_reactor: number; // 新的反应堆质量
    M_condenser: number; // 新的凝汽器质量
    M_deaerator: number; // 新的除氧器质量
  };
}

/**
 * 计算质量守恒方程
 * 模拟核电站各系统的质量平衡
 *
 * @param input 输入参数
 * @returns 质量变化率和新质量
 *
 * @description
 * 核电站水循环系统：
 * 1. 反应堆系统：给水进入，产生蒸汽输出
 * 2. 凝汽器系统：接收蒸汽，产生凝结水，同时有冷却水影响
 * 3. 除氧器系统：接收凝结水和加热蒸汽，输出给水
 *
 * 质量守恒定律：系统质量变化率 = 输入质量流量 - 输出质量流量
 */
export function calculateMassBalance(
  input: MassBalanceInput
): MassBalanceOutput {
  // 反应堆系统质量平衡
  // 反应堆质量变化率 = 给水流量 - 蒸汽流量
  const dM_reactor = input.m_feedwater - input.m_steam;

  // 凝汽器系统质量平衡
  // 凝汽器质量变化率 = 蒸汽流量 - 凝结水流量 + 冷却水质量变化
  const dM_condenser = input.m_steam - input.m_condensate + input.m_cooling;

  // 除氧器系统质量平衡
  // 除氧器质量变化率 = 凝结水流量 + 加热蒸汽流量 - 出口给水流量
  const dM_deaerator =
    input.m_condensate + input.m_steam_heating - input.m_feedwater_out;

  return {
    dM_reactor,
    dM_condenser,
    dM_deaerator,
    newMasses: {
      M_reactor: input.M_reactor + dM_reactor,
      M_condenser: input.M_condenser + dM_condenser,
      M_deaerator: input.M_deaerator + dM_deaerator,
    },
  };
}

/**
 * 计算堆芯水位变化
 * 将质量变化率转换为水位变化率
 *
 * @param dM_reactor 反应堆质量变化率（千克/秒）
 * @param A_core 堆芯横截面积（平方米）
 * @param ρ_water 水密度（千克/立方米）
 * @returns 水位变化率（米/秒）
 */
export function calculateWaterLevelChange(
  dM_reactor: number,
  A_core: number,
  ρ_water: number
): number {
  // 水位变化率 = 质量变化率 / (横截面积 × 水密度)
  return dM_reactor / (A_core * ρ_water);
}

/**
 * 计算水位响应时间
 * 评估水位控制系统的响应速度
 *
 * @param V_core 堆芯体积（立方米）
 * @param m_feedwater 给水流量（千克/秒）
 * @param m_steam 蒸汽流量（千克/秒）
 * @returns 水位响应时间常数（秒）
 */
export function calculateWaterLevelResponseTime(
  V_core: number,
  m_feedwater: number,
  m_steam: number
): number {
  // 水位响应时间 = 堆芯体积 / (给水流量 + 蒸汽流量)
  return V_core / (m_feedwater + m_steam);
}
