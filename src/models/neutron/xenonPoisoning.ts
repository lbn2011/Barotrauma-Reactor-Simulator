// 氙-135中毒模型

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
  dt: number; // 时间步长
}

interface XenonPoisoningOutput {
  Xe_new: number; // 新的氙-135浓度
  I_new: number; // 新的碘-135浓度
  ρ_Xe: number; // 氙中毒对反应性的影响
}

/**
 * 计算氙-135中毒效应
 * @param input 输入参数
 * @returns 氙中毒效应结果
 */
export function calculateXenonPoisoning(
  input: XenonPoisoningInput
): XenonPoisoningOutput {
  // 氙-135动力学方程
  const dXe_dt =
    input.λ_I * input.I -
    input.λ_Xe * input.Xe -
    input.σ_Xe * input.φ * input.Xe +
    input.γ_Xe * input.Σ_f * input.φ;
  const dI_dt = input.γ_I * input.Σ_f * input.φ - input.λ_I * input.I;

  // 计算新的浓度
  const Xe_new = input.Xe + dXe_dt * input.dt;
  const I_new = input.I + dI_dt * input.dt;

  // 计算氙中毒对反应性的影响
  const ρ_Xe = (-input.σ_Xe * Xe_new) / input.Σ_f;

  return {
    Xe_new,
    I_new,
    ρ_Xe,
  };
}

/**
 * 获取默认的衰变常数和产额值
 * @returns 默认参数
 */
export function getDefaultXenonParameters() {
  return {
    λ_Xe: 2.95e-5, // 氙-135衰变常数（s⁻¹）
    λ_I: 2.87e-5, // 碘-135衰变常数（s⁻¹）
    σ_Xe: 2.65e-18, // 氙-135中子俘获截面（cm²）
    γ_Xe: 0.0639, // 氙-135产额
    γ_I: 0.0639, // 碘-135产额
  };
}
