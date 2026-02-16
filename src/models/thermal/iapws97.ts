// IAPWS-97标准公式实现
// 用于计算水和蒸汽的热力学性质

// 区域定义
export const REGION_1 = 'liquid'; // 液态水区
export const REGION_2 = 'vapor';  // 蒸汽区
export const REGION_3 = 'two_phase'; // 两相区
export const REGION_4 = 'saturation'; // 饱和线

// 基础常数
export const T_CRIT = 647.096; // 临界温度（K）
export const P_CRIT = 22.064;  // 临界压力（MPa）
export const R = 0.461526;     // 气体常数（kJ/(kg·K)）
export const M = 18.015268;    // 摩尔质量（g/mol）

/**
 * 确定水/蒸汽的区域
 * @param T 温度（K）
 * @param P 压力（MPa）
 * @returns 区域标识符
 */
export function getRegion(T: number, P: number): string {
  // 检查是否在临界温度以上
  if (T > T_CRIT) {
    return REGION_2;
  }

  // 计算饱和压力
  const ps = calculateSaturationPressure(T);

  if (P < ps) {
    return REGION_2; // 蒸汽区
  } else if (P > ps) {
    return REGION_1; // 液态水区
  } else {
    return REGION_4; // 饱和线
  }
}

/**
 * 计算饱和压力（MPa）
 * @param T 温度（K）
 * @returns 饱和压力（MPa）
 */
export function calculateSaturationPressure(T: number): number {
  if (T <= 0) {
    return 0;
  }

  // 使用简化的饱和压力计算公式
  // 适用于 273.15 K 到 647.096 K
  const Tc = T_CRIT;
  const Pc = P_CRIT;
  const T_valid = Math.max(273.15, Math.min(T, Tc));

  const theta = 1 - T_valid / Tc;
  const A = [-7.85951783, 1.84408259, -11.7866497, 22.6807411, -15.9618719, 1.80122502];

  let lnPs = 0;
  for (let i = 0; i < A.length; i++) {
    lnPs += A[i] * Math.pow(theta, (i + 1) / 6);
  }

  lnPs *= (Tc / T);
  return Pc * Math.exp(lnPs);
}

/**
 * 计算饱和温度（K）
 * @param P 压力（MPa）
 * @returns 饱和温度（K）
 */
export function calculateSaturationTemperature(P: number): number {
  if (P <= 0) {
    return 273.15; // 0°C
  }

  if (P >= P_CRIT) {
    return T_CRIT;
  }

  // 使用简化的饱和温度计算公式
  const Pc = P_CRIT;
  const Tc = T_CRIT;
  const pi = P / Pc;

  const A = [6.54682177, -13.7189451, 29.2048855, -47.1471958, 59.4405636, -51.5719865, 23.8553633];

  let theta = 0;
  let T = 373.15; // 初始猜测值：100°C
  let error = 1;
  let iterations = 0;

  while (error > 1e-6 && iterations < 100) {
    theta = 1 - T / Tc;
    let lnPi = 0;
    for (let i = 0; i < A.length; i++) {
      lnPi += A[i] * Math.pow(theta, (i + 1) / 3);
    }

    const calculatedPi = Math.exp(lnPi);
    error = Math.abs(calculatedPi - pi);

    // 牛顿迭代法修正
    T += (pi - calculatedPi) * (Tc - T) / (10 * calculatedPi);
    T = Math.max(273.15, Math.min(T, Tc));
    iterations++;
  }

  return T;
}

/**
 * 计算液态水的比容（m³/kg）
 * @param T 温度（K）
 * @param P 压力（MPa）
 * @returns 比容（m³/kg）
 */
function calculateLiquidSpecificVolume(T: number, P: number): number {
  // 液态水的近似比容计算
  // 基于 20°C 时的密度 998.2 kg/m³
  const rho20 = 998.2; // kg/m³
  const beta = 2.07e-4; // 体积膨胀系数 1/°C
  const k = 4.5e-10; // 压缩系数 1/Pa

  const Tc = T - 273.15; // °C
  const Pc = P * 1e6; // Pa

  // 温度和压力对密度的影响
  const rho = rho20 * (1 - beta * (Tc - 20)) * (1 - k * (Pc - 101325));

  return 1 / rho;
}

/**
 * 计算蒸汽的比容（m³/kg）
 * @param T 温度（K）
 * @param P 压力（MPa）
 * @returns 比容（m³/kg）
 */
function calculateVaporSpecificVolume(T: number, P: number): number {
  // 使用理想气体定律近似
  // 对于低压蒸汽，理想气体定律是一个合理的近似
  const P_pa = P * 1e6; // 转换为帕斯卡
  return (R * 1000 * T) / P_pa; // R 转换为 J/(kg·K)
}

/**
 * 计算比容（m³/kg）
 * @param T 温度（K）
 * @param P 压力（MPa）
 * @returns 比容（m³/kg）
 */
export function calculateSpecificVolume(T: number, P: number): number {
  const region = getRegion(T, P);

  if (region === REGION_1) {
    return calculateLiquidSpecificVolume(T, P);
  } else if (region === REGION_2) {
    return calculateVaporSpecificVolume(T, P);
  } else {
    // 饱和线上，返回液相值
    return calculateLiquidSpecificVolume(T, P);
  }
}

/**
 * 计算液态水的比内能（kJ/kg）
 * @param T 温度（K）
 * @returns 比内能（kJ/kg）
 */
function calculateLiquidInternalEnergy(T: number): number {
  // 液态水的近似内能计算
  // 基于 0°C 时的内能为 0
  const Tc = T - 273.15; // °C
  const cp = 4.186; // 比热容 kJ/(kg·K)

  return cp * Tc;
}

/**
 * 计算蒸汽的比内能（kJ/kg）
 * @param T 温度（K）
 * @param P 压力（MPa）
 * @returns 比内能（kJ/kg）
 */
function calculateVaporInternalEnergy(T: number, P: number): number {
  // 蒸汽的近似内能计算
  const Tc = T - 273.15; // °C
  const hfg = 2257; // 汽化潜热 kJ/kg

  // 基于液态水内能加上汽化潜热
  const u_liquid = calculateLiquidInternalEnergy(T);
  return u_liquid + hfg;
}

/**
 * 计算比内能（kJ/kg）
 * @param T 温度（K）
 * @param P 压力（MPa）
 * @returns 比内能（kJ/kg）
 */
export function calculateInternalEnergy(T: number, P: number): number {
  const region = getRegion(T, P);

  if (region === REGION_1) {
    return calculateLiquidInternalEnergy(T);
  } else if (region === REGION_2) {
    return calculateVaporInternalEnergy(T, P);
  } else {
    // 饱和线上，返回液相值
    return calculateLiquidInternalEnergy(T);
  }
}

/**
 * 计算焓（kJ/kg）
 * @param T 温度（K）
 * @param P 压力（MPa）
 * @returns 焓（kJ/kg）
 */
export function calculateEnthalpy(T: number, P: number): number {
  const u = calculateInternalEnergy(T, P);
  const v = calculateSpecificVolume(T, P);

  return u + P * 1000 * v; // P 转换为 kPa
}

/**
 * 计算熵（kJ/(kg·K)）
 * @param T 温度（K）
 * @param P 压力（MPa）
 * @returns 熵（kJ/(kg·K)）
 */
export function calculateEntropy(T: number, P: number): number {
  const region = getRegion(T, P);

  if (region === REGION_1) {
    // 液态水的近似熵计算
    const Tc = T - 273.15; // °C
    const cp = 4.186; // 比热容 kJ/(kg·K)
    return cp * Math.log(T / 273.15);
  } else if (region === REGION_2) {
    // 蒸汽的近似熵计算
    const h = calculateEnthalpy(T, P);
    const u = calculateInternalEnergy(T, P);
    return (h - u) / T;
  } else {
    // 饱和线上，返回液相值
    const Tc = T - 273.15; // °C
    const cp = 4.186; // 比热容 kJ/(kg·K)
    return cp * Math.log(T / 273.15);
  }
}

/**
 * 计算定压比热容（kJ/(kg·K)）
 * @param T 温度（K）
 * @param P 压力（MPa）
 * @returns 定压比热容（kJ/(kg·K)）
 */
export function calculateSpecificHeatCapacityP(T: number, P: number): number {
  const region = getRegion(T, P);

  if (region === REGION_1) {
    // 液态水的定压比热容近似为常数
    return 4.186;
  } else if (region === REGION_2) {
    // 蒸汽的定压比热容
    return 1.86;
  } else {
    // 饱和线上，返回液相值
    return 4.186;
  }
}

/**
 * 计算定容比热容（kJ/(kg·K)）
 * @param T 温度（K）
 * @param P 压力（MPa）
 * @returns 定容比热容（kJ/(kg·K)）
 */
export function calculateSpecificHeatCapacityV(T: number, P: number): number {
  const region = getRegion(T, P);

  if (region === REGION_1) {
    // 液态水的定容比热容近似为常数
    return 4.186;
  } else if (region === REGION_2) {
    // 蒸汽的定容比热容
    return 1.41;
  } else {
    // 饱和线上，返回液相值
    return 4.186;
  }
}
