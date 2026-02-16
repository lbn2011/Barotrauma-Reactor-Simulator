// 流动阻力计算模型
// 模拟核电站管道系统中的流体力学现象

/**
 * 流动阻力计算输入参数
 */
interface FlowResistanceInput {
  f: number; // 摩擦系数
  L: number; // 管道长度（m）
  D: number; // 管道直径（m）
  ρ: number; // 流体密度（kg/m³）
  v: number; // 流速（m/s）
}

/**
 * 流动阻力计算输出结果
 */
interface FlowResistanceOutput {
  ΔP: number; // 压降（Pa）
}

/**
 * 雷诺数计算输入参数
 */
interface ReynoldsNumberInput {
  ρ: number; // 流体密度（kg/m³）
  v: number; // 流速（m/s）
  D: number; // 管道直径（m）
  μ: number; // 动力粘度（Pa·s）
}

/**
 * 雷诺数计算输出结果
 */
interface ReynoldsNumberOutput {
  Re: number; // 雷诺数
  flowRegime: 'laminar' | 'turbulent' | 'transition'; // 流动状态
}

/**
 * 泵性能计算输入参数
 */
interface PumpPerformanceInput {
  H_max: number; // 最大扬程（m）
  k: number; // 阻力系数
  Q: number; // 流量（m³/s）
  ρ: number; // 流体密度（kg/m³）
  g: number; // 重力加速度（m/s²）
  η_pump: number; // 泵效率
}

/**
 * 泵性能计算输出结果
 */
interface PumpPerformanceOutput {
  H: number; // 扬程（m）
  P_pump: number; // 泵功率（W）
}

/**
 * 计算管道流动阻力
 * 模拟流体在管道中流动时的压力损失
 * 
 * @param input 输入参数
 * @returns 流动阻力结果
 * 
 * @description
 * 管道流动阻力公式：ΔP = f × (L/D) × (ρ × v²/2)
 * 其中：
 * - f: 摩擦系数
 * - L: 管道长度
 * - D: 管道直径
 * - ρ: 流体密度
 * - v: 流速
 */
export function calculateFlowResistance(
  input: FlowResistanceInput
): FlowResistanceOutput {
  // 计算管道流动阻力
  const ΔP =
    input.f * (input.L / input.D) * ((input.ρ * input.v * input.v) / 2);

  return {
    ΔP,
  };
}

/**
 * 计算雷诺数
 * 判断流体流动状态（层流、湍流或过渡流）
 * 
 * @param input 输入参数
 * @returns 雷诺数结果
 * 
 * @description
 * 雷诺数公式：Re = ρ × v × D / μ
 * 流动状态判断：
 * - Re < 2000: 层流
 * - 2000 ≤ Re < 4000: 过渡流
 * - Re ≥ 4000: 湍流
 */
export function calculateReynoldsNumber(
  input: ReynoldsNumberInput
): ReynoldsNumberOutput {
  // 计算雷诺数
  const Re = (input.ρ * input.v * input.D) / input.μ;

  // 确定流动状态
  let flowRegime: 'laminar' | 'turbulent' | 'transition';
  if (Re < 2000) {
    flowRegime = 'laminar'; // 层流：流体分层流动，无横向混合
  } else if (Re < 4000) {
    flowRegime = 'transition'; // 过渡流：从层流到湍流的过渡状态
  } else {
    flowRegime = 'turbulent'; // 湍流：流体剧烈混合，有随机脉动
  }

  return {
    Re,
    flowRegime,
  };
}

/**
 * 计算泵性能特性
 * 模拟泵的扬程和功率消耗
 * 
 * @param input 输入参数
 * @returns 泵性能结果
 * 
 * @description
 * 扬程公式：H = H_max - k × Q²
 * 泵功率公式：P_pump = ρ × g × H × Q / η_pump
 * 其中：
 * - H_max: 最大扬程
 * - k: 阻力系数
 * - Q: 流量
 * - ρ: 流体密度
 * - g: 重力加速度
 * - η_pump: 泵效率
 */
export function calculatePumpPerformance(
  input: PumpPerformanceInput
): PumpPerformanceOutput {
  // 计算扬程
  const H = input.H_max - input.k * input.Q * input.Q;

  // 计算泵功率
  const P_pump = (input.ρ * input.g * H * input.Q) / input.η_pump;

  return {
    H,
    P_pump,
  };
}

/**
 * 计算摩擦系数（基于流动状态）
 * 根据雷诺数和管道粗糙度计算摩擦系数
 * 
 * @param Re 雷诺数
 * @param roughness 管道粗糙度（m）
 * @param D 管道直径（m）
 * @returns 摩擦系数
 * 
 * @description
 * 摩擦系数计算：
 * - 层流状态：f = 64 / Re
 * - 湍流状态：使用简化的Colebrook公式
 */
export function calculateFrictionCoefficient(
  Re: number,
  roughness: number,
  D: number
): number {
  if (Re < 2000) {
    // 层流状态：摩擦系数与雷诺数成反比
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
