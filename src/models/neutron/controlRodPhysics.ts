// 控制棒物理模型

interface ControlRodPhysicsInput {
  ρ_max: number; // 控制棒完全插入时的最大反应性
  z: number; // 控制棒插入深度
  L: number; // 控制棒总长度
  ρ_graphite_effect: number; // 石墨尖端效应反应性
}

interface ControlRodPhysicsOutput {
  ρ_rod: number; // 控制棒反应性
  ρ_tip: number; // 石墨尖端效应反应性
  ρ_absorption: number; // 吸收效应反应性
}

/**
 * 计算控制棒物理特性
 * @param input 输入参数
 * @returns 控制棒物理特性结果
 */
export function calculateControlRodPhysics(
  input: ControlRodPhysicsInput
): ControlRodPhysicsOutput {
  let ρ_tip = 0;
  let ρ_absorption = 0;

  // 计算石墨尖端效应（前20%插入深度）
  if (input.z < 0.2 * input.L) {
    ρ_tip = input.ρ_graphite_effect;
    ρ_absorption = 0;
  } else {
    // 计算延迟的吸收效应（后80%插入深度）
    ρ_tip = 0;
    ρ_absorption = (-input.ρ_max * (input.z - 0.2 * input.L)) / (0.8 * input.L);
  }

  // 总反应性
  const ρ_rod = ρ_tip + ρ_absorption;

  return {
    ρ_rod,
    ρ_tip,
    ρ_absorption,
  };
}

/**
 * 计算控制棒插入速度
 * @param speed_cm_s 速度（cm/s）
 * @returns 速度（m/s）
 */
export function calculateControlRodSpeed(speed_cm_s: number): number {
  return speed_cm_s / 100; // 转换为m/s
}

/**
 * 计算控制棒完全插入时间
 * @param L 控制棒总长度（m）
 * @param speed 插入速度（m/s）
 * @returns 完全插入时间（s）
 */
export function calculateControlRodInsertionTime(
  L: number,
  speed: number
): number {
  return L / speed;
}

/**
 * 计算紧急停堆过程中的功率变化
 * @param P_initial 初始功率
 * @param z 控制棒插入深度
 * @param L 控制棒总长度
 * @returns 停堆过程中的功率
 */
export function calculateScramPower(
  P_initial: number,
  z: number,
  L: number
): number {
  if (z < 0.2 * L) {
    // 石墨尖端效应（前20%插入深度）
    return P_initial * (1 + 0.05 * (z / (0.2 * L)));
  } else {
    // 主要吸收效应（后80%插入深度）
    return P_initial * (1 - 0.95 * ((z - 0.2 * L) / (0.8 * L)));
  }
}
