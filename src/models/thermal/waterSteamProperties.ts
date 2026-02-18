// 水和蒸汽特性模型

/**
 * 计算饱和温度（简化模型）
 * @param pressure 压力（MPa）
 * @returns 饱和温度（°C）
 */
export function calculateSaturationTemperature(pressure: number): number {
  // 使用简化公式计算饱和温度
  // 参考：Antoine方程
  const A = 8.07131;
  const B = 1730.63;
  const C = 233.426;

  // 将压力转换为mmHg
  const pressure_mmHg = pressure * 7500.62;

  // Antoine方程：log10(P) = A - B/(T + C)
  // 解得：T = B/(A - log10(P)) - C
  const logP = Math.log10(pressure_mmHg);
  const T_sat = B / (A - logP) - C;

  return T_sat;
}

/**
 * 计算水的焓值（简化模型）
 * @param temperature 温度（°C）
 * @param pressure 压力（MPa）
 * @returns 水的焓值（kJ/kg）
 */
export function calculateWaterEnthalpy(
  temperature: number,
  _pressure: number
): number {
  // 简化计算：假设压力对液体焓影响较小
  // 参考值：0°C时水的焓为0 kJ/kg，100°C时为419 kJ/kg
  return 4.19 * temperature;
}

/**
 * 计算蒸汽的焓值（简化模型）
 * @param temperature 温度（°C）
 * @param pressure 压力（MPa）
 * @returns 蒸汽的焓值（kJ/kg）
 */
export function calculateSteamEnthalpy(
  temperature: number,
  pressure: number
): number {
  // 简化计算：使用饱和蒸汽焓加上过热部分
  const T_sat = calculateSaturationTemperature(pressure);
  const h_g_sat = 2257 + 1.84 * T_sat; // 饱和蒸汽焓

  if (temperature <= T_sat) {
    return h_g_sat;
  } else {
    // 过热蒸汽焓
    const ΔT = temperature - T_sat;
    return h_g_sat + 1.9 * ΔT;
  }
}

/**
 * 计算水的密度（简化模型）
 * @param temperature 温度（°C）
 * @param pressure 压力（MPa）
 * @returns 水的密度（kg/m³）
 */
export function calculateWaterDensity(
  temperature: number,
  _pressure: number
): number {
  // 简化计算：假设压力对液体密度影响较小
  // 参考值：20°C时水的密度为998 kg/m³
  return 998 - 0.2 * (temperature - 20);
}

/**
 * 计算蒸汽的密度（简化模型）
 * @param temperature 温度（°C）
 * @param pressure 压力（MPa）
 * @returns 蒸汽的密度（kg/m³）
 */
export function calculateSteamDensity(
  temperature: number,
  pressure: number
): number {
  // 简化计算：使用理想气体状态方程
  const R = 461.5; // 水蒸气气体常数
  const T_kelvin = temperature + 273.15;
  const P_pascal = pressure * 1e6;

  return P_pascal / (R * T_kelvin);
}

/**
 * 计算空泡分数
 * @param ρ_mix 混合密度
 * @param ρ_f 液体密度
 * @param ρ_g 蒸汽密度
 * @returns 空泡分数
 */
export function calculateVoidFraction(
  ρ_mix: number,
  ρ_f: number,
  ρ_g: number
): number {
  return (ρ_f - ρ_mix) / (ρ_f - ρ_g);
}

/**
 * 计算混合密度
 * @param α 空泡分数
 * @param ρ_f 液体密度
 * @param ρ_g 蒸汽密度
 * @returns 混合密度
 */
export function calculateMixedDensity(
  α: number,
  ρ_f: number,
  ρ_g: number
): number {
  return α * ρ_g + (1 - α) * ρ_f;
}
