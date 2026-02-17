// 氙-135中毒模型
// 模拟反应堆中氙-135同位素对中子的吸收效应

/**
 * 氙中毒计算输入参数
 */
interface XenonPoisoningInput {
  Xe: number; // 氙-135浓度
  I: number; // 碘-135浓度
  λ_Xe: number; // 氙-135衰变常数（2.95×10⁻⁵ s⁻¹）
  λ_I: number; // 碘-135衰变常数（2.87×10⁻⁵ s⁻¹）
  σ_Xe: number; // 氙-135中子俘获截面（2.65×10⁻¹⁸ cm²）
  φ: number; // 中子通量
  γ_Xe: number; // 氙-135产额（0.0639）
  γ_I: number; // 碘-135产额（0.0639）
  Σ_f: number; // 裂变截面
  dt: number; // 时间步长（秒）
}

/**
 * 氙中毒计算输出结果
 */
interface XenonPoisoningOutput {
  Xe_new: number; // 新的氙-135浓度
  I_new: number; // 新的碘-135浓度
  ρ_Xe: number; // 氙中毒对反应性的影响（负反应性）
}

/**
 * 计算氙-135中毒效应
 * 模拟裂变产物氙-135对反应堆反应性的影响
 *
 * @param input 输入参数
 * @returns 氙中毒效应结果
 *
 * @description
 * 氙-135中毒特性：
 * 1. 氙-135是铀裂变的副产品，通过碘-135衰变产生
 * 2. 氙-135具有极高的中子俘获截面，是强中子毒物
 * 3. 它会吸收中子，减少可用于裂变的中子数量，降低反应性
 * 4. 氙中毒在反应堆停堆后会先增加后减少，形成"氙峰"
 * 5. 这可能导致反应堆在停堆后短时间内无法重启
 */
export function calculateXenonPoisoning (
  input: XenonPoisoningInput
): XenonPoisoningOutput {
  // 氙-135动力学方程
  // 氙-135浓度变化率 = 碘-135衰变产生 - 氙-135衰变 - 氙-135吸收中子 + 直接产生
  const dXe_dt =
    input.λ_I * input.I -
    input.λ_Xe * input.Xe -
    input.σ_Xe * input.φ * input.Xe +
    input.γ_Xe * input.Σ_f * input.φ;

  // 碘-135动力学方程
  // 碘-135浓度变化率 = 裂变直接产生 - 碘-135衰变
  const dI_dt = input.γ_I * input.Σ_f * input.φ - input.λ_I * input.I;

  // 计算新的浓度：当前浓度 + 变化率 × 时间步长
  const Xe_new = input.Xe + dXe_dt * input.dt;
  const I_new = input.I + dI_dt * input.dt;

  // 计算氙中毒对反应性的影响：-（氙-135中子俘获截面 × 氙-135浓度）/ 裂变截面
  const ρ_Xe = (-input.σ_Xe * Xe_new) / input.Σ_f;

  return {
    Xe_new,
    I_new,
    ρ_Xe,
  };
}

/**
 * 获取默认的衰变常数和产额值
 * 提供RBMK-1000反应堆氙中毒计算的默认参数
 *
 * @returns 默认参数
 */
export function getDefaultXenonParameters () {
  return {
    λ_Xe: 2.95e-5, // 氙-135衰变常数（s⁻¹），半衰期约9.2小时
    λ_I: 2.87e-5, // 碘-135衰变常数（s⁻¹），半衰期约6.7小时
    σ_Xe: 2.65e-18, // 氙-135中子俘获截面（cm²），非常大
    γ_Xe: 0.0639, // 氙-135产额，每次裂变产生的比例
    γ_I: 0.0639, // 碘-135产额，每次裂变产生的比例
  };
}
