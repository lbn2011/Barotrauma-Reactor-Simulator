import log from '@/lib/utils/logger';

// 中子输运参数接口
interface NeutronTransportParams {
  // 中子通量
  flux: number;
  // 中子密度
  density: number;
  // 宏观截面
  macroscopicCrossSection: {
    absorption: number;
    fission: number;
    scattering: number;
  };
  // 中子速度
  velocity: number;
  // 中子能量
  energy: number;
}

// 反应动力学参数接口
interface ReactorKineticsParams {
  // 反应性
  reactivity: number;
  // 中子代时间
  generationTime: number;
  // 延迟中子参数
  delayedNeutrons: {
    precursors: number[];
    decayConstants: number[];
    fractions: number[];
  };
  // 初始中子通量
  initialFlux: number;
  // 时间步长
  timeStep: number;
}

// 中子输运计算结果接口
interface NeutronTransportResult {
  // 中子通量
  flux: number;
  // 中子密度
  density: number;
  // 反应率
  reactionRate: number;
  // 能量沉积
  energyDeposition: number;
}

// 反应动力学计算结果接口
interface ReactorKineticsResult {
  // 中子通量
  flux: number;
  // 中子密度
  density: number;
  // 延迟中子先驱核浓度
  precursors: number[];
  // 功率
  power: number;
}

// 中子输运计算模块
export class NeutronTransport {
  // 计算中子通量
  static calculateFlux (params: NeutronTransportParams): NeutronTransportResult {
    log.trace('Calculating neutron flux...');

    // 计算反应率
    const reactionRate = params.flux * params.macroscopicCrossSection.fission;

    // 计算能量沉积
    const energyDeposition = reactionRate * params.energy;

    // 计算中子密度
    const density = params.flux / params.velocity;

    log.trace('Neutron flux calculation completed');

    return {
      flux: params.flux,
      density,
      reactionRate,
      energyDeposition,
    };
  }

  // 计算宏观截面
  static calculateMacroscopicCrossSection (
    microscopicCrossSection: number,
    nucleiDensity: number
  ): number {
    return microscopicCrossSection * nucleiDensity;
  }

  // 计算中子速度
  static calculateNeutronVelocity (energy: number): number {
    // 中子质量 (kg)
    const neutronMass = 1.67492749804e-27;
    // 焦耳到电子伏特转换因子
    const eVtoJoule = 1.602176634e-19;
    // 转换能量到焦耳
    const energyJoule = energy * eVtoJoule;
    // 计算速度 (m/s)
    const velocity = Math.sqrt((2 * energyJoule) / neutronMass);

    return velocity;
  }

  // 计算中子输运方程（扩散近似）
  static calculateDiffusion (
    flux: number,
    diffusionCoefficient: number,
    absorptionCrossSection: number,
    fissionCrossSection: number,
    v: number
  ): number {
    // 扩散方程：∇²φ - (1/L²)φ + S = 0
    // 简化为一维情况，假设源项S = νΣfφ
    const L2 = diffusionCoefficient / absorptionCrossSection; // 扩散长度平方
    const source = v * fissionCrossSection * flux;
    const diffusionTerm = -flux / L2;

    return diffusionTerm + source;
  }

  // 计算中子能谱
  static calculateNeutronSpectrum (energy: number, temperature: number): number {
    // 麦克斯韦-玻尔兹曼分布
    const k = 8.617333262e-5; // 玻尔兹曼常数 (eV/K)
    const T = temperature;
    const E = energy;

    return (
      ((Math.sqrt(2 / Math.PI) * Math.pow(E, 0.5)) / Math.pow(k * T, 1.5)) *
      Math.exp(-E / (k * T))
    );
  }

  // 计算中子慢化长度
  static calculateSlowingDownLength (
    energy: number,
    macroscopicCrossSection: number
  ): number {
    // 慢化长度计算
    const meanFreePath = 1 / macroscopicCrossSection;
    return Math.sqrt((meanFreePath * energy) / 6);
  }
}

// 反应动力学计算模块
export class ReactorKinetics {
  // 计算反应动力学
  static calculateKinetics (
    params: ReactorKineticsParams
  ): ReactorKineticsResult {
    log.trace('Calculating reactor kinetics...');

    // 提取参数
    const {
      reactivity,
      generationTime,
      delayedNeutrons,
      initialFlux,
      timeStep,
    } = params;
    const { precursors, decayConstants, fractions } = delayedNeutrons;

    // 计算中子通量随时间的变化
    // 使用改进的欧拉法（预测-校正法）求解点动力学方程
    let flux = initialFlux;
    const newPrecursors = [...precursors];

    // 使用预测-校正法提高精度
    for (let i = 0; i < 10; i++) {
      // 迭代10次以提高精度
      // 预测步骤
      // 计算延迟中子产生率
      let delayedNeutronProduction = 0;
      for (let j = 0; j < newPrecursors.length; j++) {
        delayedNeutronProduction += decayConstants[j] * newPrecursors[j];
      }

      // 计算中子通量变化率
      const fluxRate =
        (reactivity / generationTime) * flux + delayedNeutronProduction;

      // 预测新的中子通量
      const predictedFlux = flux + fluxRate * timeStep;

      // 预测新的先驱核浓度
      const predictedPrecursors = newPrecursors.map((precursor, j) => {
        const precursorRate =
          ((fractions[j] * reactivity) / generationTime) * flux -
          decayConstants[j] * precursor;
        return precursor + precursorRate * timeStep;
      });

      // 校正步骤
      // 计算预测状态下的延迟中子产生率
      let predictedDelayedProduction = 0;
      for (let j = 0; j < predictedPrecursors.length; j++) {
        predictedDelayedProduction +=
          decayConstants[j] * predictedPrecursors[j];
      }

      // 计算预测状态下的中子通量变化率
      const predictedFluxRate =
        (reactivity / generationTime) * predictedFlux +
        predictedDelayedProduction;

      // 校正中子通量
      flux += ((fluxRate + predictedFluxRate) * timeStep) / 2;

      // 校正先驱核浓度
      for (let j = 0; j < newPrecursors.length; j++) {
        const precursorRate =
          ((fractions[j] * reactivity) / generationTime) * flux -
          decayConstants[j] * newPrecursors[j];
        const predictedPrecursorRate =
          ((fractions[j] * reactivity) / generationTime) * predictedFlux -
          decayConstants[j] * predictedPrecursors[j];
        newPrecursors[j] +=
          ((precursorRate + predictedPrecursorRate) * timeStep) / 2;
      }
    }

    // 计算功率（考虑能量转换效率）
    const fissionEnergy = 200 * 1.602176634e-13; // 每次裂变释放200MeV能量
    const thermalEfficiency = 0.33; // 热效率
    const power = flux * fissionEnergy * thermalEfficiency;

    log.trace('Reactor kinetics calculation completed');

    return {
      flux,
      density: flux / NeutronTransport.calculateNeutronVelocity(1e6), // 假设中子能量为1MeV
      precursors: newPrecursors,
      power,
    };
  }

  // 计算反应性
  static calculateReactivity (k: number): number {
    return (k - 1) / k;
  }

  // 计算中子代时间
  static calculateGenerationTime (
    meanFreePath: number,
    velocity: number,
    k: number
  ): number {
    return (meanFreePath / velocity) * (1 / (k - 1));
  }

  // 计算温度系数
  static calculateTemperatureCoefficient (
    temperature: number,
    _fuelType: string = 'UO2'
  ): number {
    // 温度系数计算
    // 对于UO2燃料，温度系数随温度升高而变得更负
    const baseCoefficient = -0.0001;
    const temperatureFactor = Math.exp((temperature - 600) / 300) * 0.00005;
    return baseCoefficient - temperatureFactor;
  }

  // 计算功率系数
  static calculatePowerCoefficient (power: number): number {
    // 功率系数计算
    // 功率系数随功率升高而变得更负
    const baseCoefficient = -0.00001;
    const powerFactor = Math.min(0.00002, (power / 1000) * 0.00001);
    return baseCoefficient - powerFactor;
  }
}

// 计算控制棒效应
export function calculateControlRodEffect (
  position: number,
  maxEffect: number = 0.05
): number {
  // 控制棒位置从0（完全插入）到100（完全抽出）
  // 控制棒效应与位置成反比
  const normalizedPosition = position / 100;
  return maxEffect * (1 - normalizedPosition);
}

// 计算空泡系数
export function calculateVoidCoefficient (
  voidFraction: number,
  fuelTemperature: number
): number {
  // 空泡系数计算
  // 简化模型：空泡系数与空泡份额成正比，与燃料温度成反比
  const baseCoefficient = 0.001; // 基础空泡系数
  const temperatureFactor = Math.exp(-(fuelTemperature - 600) / 200); // 温度因子
  return baseCoefficient * voidFraction * temperatureFactor;
}

// 计算氙毒效应
export function calculateXenonPoisoning (
  time: number,
  neutronFlux: number
): number {
  // 氙毒效应计算
  // 简化模型：氙毒浓度随时间和中子通量变化
  const xenonDecayConstant = 0.00021; // 氙-135衰变常数 (1/s)
  const iodineDecayConstant = 0.0000124; // 碘-135衰变常数 (1/s)
  const xenonAbsorptionCrossSection = 2.65e6; // 氙-135吸收截面 (barn)

  // 假设碘-135浓度达到平衡
  const iodineConcentration = (neutronFlux * 0.063) / iodineDecayConstant;

  // 计算氙-135浓度
  const xenonConcentration =
    (iodineDecayConstant * iodineConcentration + neutronFlux * 0.0026) /
    (xenonDecayConstant + neutronFlux * xenonAbsorptionCrossSection * 1e-24);

  // 计算氙毒引起的反应性变化
  const reactivityChange =
    -xenonConcentration * xenonAbsorptionCrossSection * 1e-24 * neutronFlux;

  return reactivityChange;
}
