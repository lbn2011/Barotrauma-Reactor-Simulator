// 控制棒物理模型
// 模拟RBMK-1000反应堆中控制棒的物理行为，包括石墨尖端效应

/**
 * 控制棒物理计算输入参数
 */
interface ControlRodPhysicsInput {
  ρ_max: number; // 控制棒完全插入时的最大反应性（负反应性）
  z: number; // 控制棒插入深度（米）
  L: number; // 控制棒总长度（米）
  ρ_graphite_effect: number; // 石墨尖端效应反应性（正反应性）
}

/**
 * 控制棒物理计算输出结果
 */
interface ControlRodPhysicsOutput {
  ρ_rod: number; // 控制棒总反应性
  ρ_tip: number; // 石墨尖端效应反应性（正反应性）
  ρ_absorption: number; // 吸收效应反应性（负反应性）
}

/**
 * 计算控制棒物理特性
 * 模拟RBMK-1000反应堆控制棒的石墨尖端效应和吸收效应
 *
 * @param input 输入参数
 * @returns 控制棒物理特性结果
 *
 * @description
 * RBMK-1000反应堆控制棒设计特点：
 * 1. 控制棒前端有石墨段，用于置换水（慢化剂）
 * 2. 石墨的慢化效果比水好，导致前20%插入时产生正反应性
 * 3. 当控制棒完全插入（超过20%深度）后，吸收剂开始发挥作用，产生负反应性
 * 4. 这种设计在紧急停堆时可能导致初始功率上升，这是切尔诺贝利事故的原因之一
 */
export function calculateControlRodPhysics(
  input: ControlRodPhysicsInput
): ControlRodPhysicsOutput {
  let ρ_tip = 0; // 石墨尖端效应反应性
  let ρ_absorption = 0; // 吸收效应反应性

  // 计算石墨尖端效应（前20%插入深度）
  if (input.z < 0.2 * input.L) {
    // 前20%插入深度时，只有石墨尖端效应
    ρ_tip = input.ρ_graphite_effect;
    ρ_absorption = 0;
  } else {
    // 计算延迟的吸收效应（后80%插入深度）
    ρ_tip = 0; // 石墨尖端效应消失
    // 吸收效应与插入深度成正比
    ρ_absorption = (-input.ρ_max * (input.z - 0.2 * input.L)) / (0.8 * input.L);
  }

  // 总反应性 = 石墨尖端效应 + 吸收效应
  const ρ_rod = ρ_tip + ρ_absorption;

  return {
    ρ_rod,
    ρ_tip,
    ρ_absorption,
  };
}

/**
 * 计算控制棒插入速度
 * 将厘米/秒转换为米/秒
 *
 * @param speed_cm_s 速度（厘米/秒）
 * @returns 速度（米/秒）
 */
export function calculateControlRodSpeed(speed_cm_s: number): number {
  return speed_cm_s / 100; // 转换为米/秒
}

/**
 * 计算控制棒完全插入时间
 *
 * @param L 控制棒总长度（米）
 * @param speed 插入速度（米/秒）
 * @returns 完全插入时间（秒）
 */
export function calculateControlRodInsertionTime(
  L: number,
  speed: number
): number {
  return L / speed;
}

/**
 * 计算紧急停堆过程中的功率变化
 * 模拟RBMK-1000反应堆紧急停堆时的功率响应
 *
 * @param P_initial 初始功率
 * @param z 控制棒插入深度
 * @param L 控制棒总长度
 * @returns 停堆过程中的功率
 *
 * @description
 * RBMK-1000紧急停堆特性：
 * 1. 控制棒开始插入时（前20%深度），石墨尖端效应导致功率短暂上升（约5%）
 * 2. 当控制棒插入超过20%深度后，吸收效应开始主导，功率快速下降
 * 3. 完全插入时功率降至接近零
 */
export function calculateScramPower(
  P_initial: number,
  z: number,
  L: number
): number {
  if (z < 0.2 * L) {
    // 石墨尖端效应（前20%插入深度）
    // 功率短暂上升，最大上升5%
    return P_initial * (1 + 0.05 * (z / (0.2 * L)));
  } else {
    // 主要吸收效应（后80%插入深度）
    // 功率从105%下降到5%
    return P_initial * (1 - 0.95 * ((z - 0.2 * L) / (0.8 * L)));
  }
}
