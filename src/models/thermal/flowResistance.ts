// 流动阻力计算模型

interface FlowResistanceInput {
  f: number; // 摩擦系数
  L: number; // 管道长度（m）
  D: number; // 管道直径（m）
  ρ: number; // 流体密度（kg/m³）
  v: number; // 流速（m/s）
}

interface FlowResistanceOutput {
  ΔP: number; // 压降（Pa）
}

interface ReynoldsNumberInput {
  ρ: number; // 流体密度（kg/m³）
  v: number; // 流速（m/s）
  D: number; // 管道直径（m）
  μ: number; // 动力粘度（Pa·s）
}

interface ReynoldsNumberOutput {
  Re: number; // 雷诺数
  flowRegime: 'laminar' | 'turbulent' | 'transition'; // 流动状态
}

interface PumpPerformanceInput {
  H_max: number; // 最大扬程（m）
  k: number; // 阻力系数
  Q: number; // 流量（m³/s）
  ρ: number; // 流体密度（kg/m³）
  g: number; // 重力加速度（m/s²）
  η_pump: number; // 泵效率
}

interface PumpPerformanceOutput {
  H: number; // 扬程（m）
  P_pump: number; // 泵功率（W）
}

/**
 * 计算管道流动阻力
 * @param input 输入参数
 * @returns 流动阻力结果
 */
export function calculateFlowResistance(
  input: FlowResistanceInput
): FlowResistanceOutput {
  // 管道流动阻力公式：ΔP = f × (L/D) × (ρ × v²/2)
  const ΔP =
    input.f * (input.L / input.D) * ((input.ρ * input.v * input.v) / 2);

  return {
    ΔP,
  };
}

/**
 * 计算雷诺数
 * @param input 输入参数
 * @returns 雷诺数结果
 */
export function calculateReynoldsNumber(
  input: ReynoldsNumberInput
): ReynoldsNumberOutput {
  // 雷诺数公式：Re = ρ × v × D / μ
  const Re = (input.ρ * input.v * input.D) / input.μ;

  // 确定流动状态
  let flowRegime: 'laminar' | 'turbulent' | 'transition';
  if (Re < 2000) {
    flowRegime = 'laminar';
  } else if (Re < 4000) {
    flowRegime = 'transition';
  } else {
    flowRegime = 'turbulent';
  }

  return {
    Re,
    flowRegime,
  };
}

/**
 * 计算泵性能特性
 * @param input 输入参数
 * @returns 泵性能结果
 */
export function calculatePumpPerformance(
  input: PumpPerformanceInput
): PumpPerformanceOutput {
  // 扬程公式：H = H_max - k × Q²
  const H = input.H_max - input.k * input.Q * input.Q;

  // 泵功率公式：P_pump = ρ × g × H × Q / η_pump
  const P_pump = (input.ρ * input.g * H * input.Q) / input.η_pump;

  return {
    H,
    P_pump,
  };
}

/**
 * 计算摩擦系数（基于流动状态）
 * @param Re 雷诺数
 * @param roughness 管道粗糙度（m）
 * @param D 管道直径（m）
 * @returns 摩擦系数
 */
export function calculateFrictionCoefficient(
  Re: number,
  roughness: number,
  D: number
): number {
  if (Re < 2000) {
    // 层流状态
    return 64 / Re;
  } else {
    // 湍流状态（使用Colebrook公式的简化版）
    const relativeRoughness = roughness / D;
    if (Re < 10000) {
      // 过渡区
      return 0.03;
    } else {
      // 湍流区
      return 0.02 * Math.pow(1 + 100 * relativeRoughness, 0.2);
    }
  }
}
