// 正空泡系数模型

interface VoidCoefficientInput {
  α_void: number; // 空泡系数（正值，约+4.7×10⁻⁵）
  Δα: number; // 空泡份额变化
  P_current: number; // 当前功率
  τ_delay: number; // 反馈延迟时间
}

interface VoidCoefficientOutput {
  ρ_void: number; // 空泡反应性
  P_new: number; // 新功率
  P_delayed: number; // 延迟后的功率
}

/**
 * 计算正空泡系数效应
 * @param input 输入参数
 * @returns 空泡系数效应结果
 */
export function calculateVoidCoefficient(
  input: VoidCoefficientInput
): VoidCoefficientOutput {
  // 计算空泡反应性
  const ρ_void = input.α_void * input.Δα;

  // 计算新功率
  const P_new = input.P_current * (1 + ρ_void);

  // 简化模型，实际需要延迟处理
  const P_delayed = P_new;

  return {
    ρ_void,
    P_new,
    P_delayed,
  };
}

/**
 * 计算空泡份额变化
 * @param currentVoidFraction 当前空泡分数
 * @param previousVoidFraction 之前的空泡分数
 * @returns 空泡份额变化
 */
export function calculateVoidFractionChange(
  currentVoidFraction: number,
  previousVoidFraction: number
): number {
  return currentVoidFraction - previousVoidFraction;
}

/**
 * 计算基于温度的空泡分数
 * @param temperature 温度（°C）
 * @param saturationTemperature 饱和温度（°C）
 * @returns 空泡分数
 */
export function calculateTemperatureBasedVoidFraction(
  temperature: number,
  saturationTemperature: number
): number {
  if (temperature < saturationTemperature) {
    return 0;
  } else {
    // 简化模型：温度超过饱和温度后，空泡分数线性增加
    const ΔT = temperature - saturationTemperature;
    return Math.min(1.0, ΔT / 50); // 50°C温差对应100%空泡分数
  }
}
