// 能量守恒方程模型
// 模拟核电站能量转换和传递过程

/**
 * 能量平衡计算输入参数
 */
interface EnergyBalanceInput {
  P_nuclear: number; // 核功率（兆瓦）
  η_thermal: number; // 热效率
  h_steam: number; // 蒸汽焓（千焦/千克）
  h_feedwater: number; // 给水焓（千焦/千克）
  m_coolant: number; // 冷却剂流量（千克/秒）
  c_p: number; // 冷却剂比热容（千焦/千克·℃）
  h_inlet: number; // 汽轮机入口焓（千焦/千克）
  h_outlet: number; // 汽轮机出口焓（千焦/千克）
  η_turbine: number; // 汽轮机效率
  η_generator: number; // 发电机效率
}

/**
 * 能量平衡计算输出结果
 */
interface EnergyBalanceOutput {
  Q_thermal: number; // 热功率（兆瓦）
  m_steam: number; // 蒸汽流量（千克/秒）
  ΔT_coolant: number; // 冷却剂温度变化（℃）
  P_mechanical: number; // 机械功率（兆瓦）
  P_electrical: number; // 电功率（兆瓦）
}

/**
 * 计算能量守恒方程
 * 模拟核电站各系统的能量转换
 *
 * @param input 输入参数
 * @returns 能量平衡结果
 *
 * @description
 * 核电站能量转换过程：
 * 1. 反应堆：核能 → 热能（Q_thermal）
 * 2. 蒸汽发生器：热能 → 蒸汽焓
 * 3. 汽轮机：蒸汽焓 → 机械功（P_mechanical）
 * 4. 发电机：机械功 → 电能（P_electrical）
 */
export function calculateEnergyBalance(
  input: EnergyBalanceInput
): EnergyBalanceOutput {
  // 反应堆系统能量平衡
  // 热功率 = 核功率 × 热效率
  const Q_thermal = input.P_nuclear * input.η_thermal;

  // 蒸汽流量 = 热功率 / (蒸汽焓 - 给水焓)
  const m_steam = Q_thermal / (input.h_steam - input.h_feedwater);

  // 冷却剂温度变化 = 热功率 / (冷却剂流量 × 比热容)
  const ΔT_coolant = Q_thermal / (input.m_coolant * input.c_p);

  // 汽轮机系统能量平衡
  // 机械功率 = 蒸汽流量 × (入口焓 - 出口焓) × 汽轮机效率
  const P_mechanical =
    m_steam * (input.h_inlet - input.h_outlet) * input.η_turbine;

  // 发电机系统能量平衡
  // 电功率 = 机械功率 × 发电机效率
  const P_electrical = P_mechanical * input.η_generator;

  return {
    Q_thermal,
    m_steam,
    ΔT_coolant,
    P_mechanical,
    P_electrical,
  };
}

/**
 * 计算汽轮机效率
 * 考虑蒸汽参数和负荷对效率的影响
 *
 * @param η_base 基础效率
 * @param P_steam 蒸汽压力
 * @param P_rated 额定蒸汽压力
 * @param T_steam 蒸汽温度
 * @param T_rated 额定蒸汽温度
 * @param loadFactor 负荷因子
 * @returns 汽轮机效率
 */
export function calculateTurbineEfficiency(
  η_base: number,
  P_steam: number,
  P_rated: number,
  T_steam: number,
  T_rated: number,
  loadFactor: number
): number {
  // 压力修正因子
  const f_pressure = P_steam / P_rated;
  // 温度修正因子
  const f_temperature = T_steam / T_rated;
  // 负荷修正因子（限制在0.8-1.0之间）
  const f_load = Math.max(0.8, Math.min(1.0, loadFactor));

  // 综合修正后的效率
  return η_base * f_pressure * f_temperature * f_load;
}

/**
 * 计算除氧器效率
 * 基于温度差计算除氧效果
 *
 * @param T_sat 饱和温度（℃）
 * @param T_condensate 凝结水温度（℃）
 * @returns 除氧器效率
 */
export function calculateDeaeratorEfficiency(
  T_sat: number,
  T_condensate: number
): number {
  // 除氧器效率 = 1 - (饱和温度 - 凝结水温度) / 饱和温度
  return 1 - (T_sat - T_condensate) / T_sat;
}

/**
 * 计算含氧量
 * 基于除氧器效率计算水中剩余含氧量
 *
 * @param O2_max 最大含氧量
 * @param η_deaerator 除氧器效率
 * @returns 含氧量
 */
export function calculateOxygenContent(
  O2_max: number,
  η_deaerator: number
): number {
  // 含氧量 = 最大含氧量 × (1 - 除氧器效率)
  return O2_max * (1 - η_deaerator);
}
