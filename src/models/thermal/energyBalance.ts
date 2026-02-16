// 能量守恒方程模型

interface EnergyBalanceInput {
  P_nuclear: number; // 核功率
  η_thermal: number; // 热效率
  h_steam: number; // 蒸汽焓
  h_feedwater: number; // 给水焓
  m_coolant: number; // 冷却剂流量
  c_p: number; // 冷却剂比热容
  h_inlet: number; // 汽轮机入口焓
  h_outlet: number; // 汽轮机出口焓
  η_turbine: number; // 汽轮机效率
  η_generator: number; // 发电机效率
}

interface EnergyBalanceOutput {
  Q_thermal: number; // 热功率
  m_steam: number; // 蒸汽流量
  ΔT_coolant: number; // 冷却剂温度变化
  P_mechanical: number; // 机械功率
  P_electrical: number; // 电功率
}

/**
 * 计算能量守恒方程
 * @param input 输入参数
 * @returns 能量平衡结果
 */
export function calculateEnergyBalance(
  input: EnergyBalanceInput
): EnergyBalanceOutput {
  // 反应堆系统能量平衡
  const Q_thermal = input.P_nuclear * input.η_thermal;
  const m_steam = Q_thermal / (input.h_steam - input.h_feedwater);
  const ΔT_coolant = Q_thermal / (input.m_coolant * input.c_p);

  // 汽轮机系统能量平衡
  const P_mechanical =
    m_steam * (input.h_inlet - input.h_outlet) * input.η_turbine;

  // 发电机系统能量平衡
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
  const f_pressure = P_steam / P_rated;
  const f_temperature = T_steam / T_rated;
  const f_load = Math.max(0.8, Math.min(1.0, loadFactor));

  return η_base * f_pressure * f_temperature * f_load;
}

/**
 * 计算除氧器效率
 * @param T_sat 饱和温度
 * @param T_condensate 凝结水温度
 * @returns 除氧器效率
 */
export function calculateDeaeratorEfficiency(
  T_sat: number,
  T_condensate: number
): number {
  return 1 - (T_sat - T_condensate) / T_sat;
}

/**
 * 计算含氧量
 * @param O2_max 最大含氧量
 * @param η_deaerator 除氧器效率
 * @returns 含氧量
 */
export function calculateOxygenContent(
  O2_max: number,
  η_deaerator: number
): number {
  return O2_max * (1 - η_deaerator);
}
