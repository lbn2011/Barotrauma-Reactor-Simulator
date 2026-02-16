// 质量守恒方程模型

interface MassBalanceInput {
  M_reactor: number; // 反应堆内水的质量
  M_condenser: number; // 凝汽器内水的质量
  M_deaerator: number; // 除氧器内水的质量
  m_feedwater: number; // 给水流量
  m_steam: number; // 蒸汽流量
  m_condensate: number; // 凝结水流量
  m_cooling: number; // 冷却水带来的质量变化
  m_steam_heating: number; // 加热蒸汽流量
  m_feedwater_out: number; // 出口给水流量
}

interface MassBalanceOutput {
  dM_reactor: number; // 反应堆质量变化率
  dM_condenser: number; // 凝汽器质量变化率
  dM_deaerator: number; // 除氧器质量变化率
  newMasses: {
    M_reactor: number;
    M_condenser: number;
    M_deaerator: number;
  };
}

/**
 * 计算质量守恒方程
 * @param input 输入参数
 * @returns 质量变化率和新质量
 */
export function calculateMassBalance(
  input: MassBalanceInput
): MassBalanceOutput {
  // 反应堆系统质量平衡
  const dM_reactor = input.m_feedwater - input.m_steam;

  // 凝汽器系统质量平衡
  const dM_condenser = input.m_steam - input.m_condensate + input.m_cooling;

  // 除氧器系统质量平衡
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
 * @param dM_reactor 反应堆质量变化率
 * @param A_core 堆芯横截面积
 * @param ρ_water 水密度
 * @returns 水位变化率
 */
export function calculateWaterLevelChange(
  dM_reactor: number,
  A_core: number,
  ρ_water: number
): number {
  return dM_reactor / (A_core * ρ_water);
}

/**
 * 计算水位响应时间
 * @param V_core 堆芯体积
 * @param m_feedwater 给水流量
 * @param m_steam 蒸汽流量
 * @returns 水位响应时间常数
 */
export function calculateWaterLevelResponseTime(
  V_core: number,
  m_feedwater: number,
  m_steam: number
): number {
  return V_core / (m_feedwater + m_steam);
}
