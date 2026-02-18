// 正空泡系数模型
// 模拟RBMK-1000反应堆中独特的正空泡系数效应

/**
 * 空泡系数计算输入参数
 */
interface VoidCoefficientInput {
  α_void: number; // 空泡系数（正值，RBMK-1000约为+4.7×10⁻⁵）
  Δα: number; // 空泡份额变化
  P_current: number; // 当前功率
  τ_delay: number; // 反馈延迟时间（秒）
}

/**
 * 空泡系数计算输出结果
 */
interface VoidCoefficientOutput {
  ρ_void: number; // 空泡反应性
  P_new: number; // 新功率
  P_delayed: number; // 延迟后的功率
}

/**
 * 计算正空泡系数效应
 * 模拟RBMK-1000反应堆的正空泡系数反馈机制
 *
 * @param input 输入参数
 * @returns 空泡系数效应结果
 *
 * @description
 * RBMK-1000反应堆正空泡系数特性：
 * 1. 当冷却剂中蒸汽含量（空泡）增加时，反应性上升
 * 2. 这是因为水既是慢化剂又是冷却剂
 * 3. 空泡增加意味着慢化剂减少，但对于RBMK这种石墨慢化堆
 *    石墨提供了大部分慢化作用，水的减少主要减少了中子吸收
 * 4. 中子吸收减少导致反应性增加，形成正反馈循环
 * 5. 这种正反馈在某些情况下可能导致功率激增，是切尔诺贝利事故的关键因素
 */
export function calculateVoidCoefficient (
  input: VoidCoefficientInput
): VoidCoefficientOutput {
  // 计算空泡反应性：空泡系数 × 空泡份额变化
  const ρ_void = input.α_void * input.Δα;

  // 计算新功率：当前功率 × (1 + 空泡反应性)
  const P_new = input.P_current * (1 + ρ_void);

  // 简化模型，实际需要延迟处理
  // 注：真实的中子动力学需要考虑延迟中子先驱核的影响
  const P_delayed = P_new;

  return {
    ρ_void,
    P_new,
    P_delayed,
  };
}

/**
 * 计算空泡份额变化
 *
 * @param currentVoidFraction 当前空泡分数
 * @param previousVoidFraction 之前的空泡分数
 * @returns 空泡份额变化
 */
export function calculateVoidFractionChange (
  currentVoidFraction: number,
  previousVoidFraction: number
): number {
  return currentVoidFraction - previousVoidFraction;
}

/**
 * 计算基于温度的空泡分数
 * 简化模型：当温度超过饱和温度时，开始产生蒸汽
 *
 * @param temperature 温度（°C）
 * @param saturationTemperature 饱和温度（°C）
 * @returns 空泡分数
 */
export function calculateTemperatureBasedVoidFraction (
  temperature: number,
  saturationTemperature: number
): number {
  if (temperature < saturationTemperature) {
    // 温度低于饱和温度，无空泡
    return 0;
  } else {
    // 简化模型：温度超过饱和温度后，空泡分数线性增加
    const ΔT = temperature - saturationTemperature;
    // 50°C温差对应100%空泡分数
    return Math.min(1.0, ΔT / 50);
  }
}
