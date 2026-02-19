import logger, { ModuleType } from '@/lib/utils/logger';

// 热工水力参数接口
interface ThermalHydraulicParams {
  // 燃料参数
  fuel: {
    temperature: number;
    thermalConductivity: number;
    heatCapacity: number;
    density: number;
  };

  // 冷却剂参数
  coolant: {
    temperature: number;
    pressure: number;
    flowRate: number;
    thermalConductivity: number;
    heatCapacity: number;
    density: number;
    viscosity: number;
  };

  // 包壳参数
  cladding: {
    temperature: number;
    thermalConductivity: number;
    thickness: number;
  };

  // 功率参数
  power: {
    thermalPower: number;
    linearHeatGenerationRate: number;
  };

  // 几何参数
  geometry: {
    fuelDiameter: number;
    claddingInnerDiameter: number;
    claddingOuterDiameter: number;
    coolantChannelDiameter: number;
    assemblyPitch: number;
  };
}

// 热工水力计算结果接口
interface ThermalHydraulicResult {
  // 温度分布
  temperatures: {
    fuelCenter: number;
    fuelSurface: number;
    claddingInner: number;
    claddingOuter: number;
    coolantBulk: number;
    coolantFilm: number;
  };

  // 热传递系数
  heatTransferCoefficients: {
    fuelToCladding: number;
    claddingToCoolant: number;
    coolantToStructure: number;
  };

  // 压力损失
  pressureLoss: {
    friction: number;
    form: number;
    acceleration: number;
    total: number;
  };

  // 流体特性
  fluidProperties: {
    reynoldsNumber: number;
    prandtlNumber: number;
    nusseltNumber: number;
    flowRegime: string;
  };

  // 空泡份额
  voidFraction: number;

  // 临界热流密度
  criticalHeatFlux: number;

  // 安全裕度
  safetyMargins: {
    DNBR: number; // Departure from Nucleate Boiling Ratio
    fuelTemperatureMargin: number;
    pressureMargin: number;
  };
}

// 热工水力计算模块
export class ThermalHydraulics {
  // 计算热工水力状态
  static calculateThermalHydraulics (
    params: ThermalHydraulicParams
  ): ThermalHydraulicResult {
    logger.trace(ModuleType.MODEL, 'Calculating thermal hydraulics');

    const reynoldsNumber = this.calculateReynoldsNumber(
      params.coolant.density,
      params.coolant.flowRate,
      params.geometry.coolantChannelDiameter,
      params.coolant.viscosity
    );

    const prandtlNumber = this.calculatePrandtlNumber(
      params.coolant.heatCapacity,
      params.coolant.viscosity,
      params.coolant.thermalConductivity
    );

    const nusseltNumber = this.calculateNusseltNumber(
      reynoldsNumber,
      prandtlNumber
    );

    // 计算冷却剂到包壳的热传递系数
    const claddingToCoolantHTC = this.calculateHeatTransferCoefficient(
      nusseltNumber,
      params.coolant.thermalConductivity,
      params.geometry.coolantChannelDiameter
    );

    // 计算燃料到包壳的热传递系数（假设为导热）
    const fuelToCladdingHTC = this.calculateFuelToCladdingHTC(
      params.fuel.thermalConductivity,
      params.geometry.fuelDiameter / 2,
      params.geometry.claddingInnerDiameter / 2
    );

    // 计算温度分布
    const temperatures = this.calculateTemperatureDistribution(
      params,
      fuelToCladdingHTC,
      claddingToCoolantHTC
    );

    // 计算压力损失
    const pressureLoss = this.calculatePressureLoss(params, reynoldsNumber);

    // 计算空泡份额
    const voidFraction = this.calculateVoidFraction(
      params.coolant.temperature,
      params.coolant.pressure
    );

    // 计算临界热流密度
    const criticalHeatFlux = this.calculateCriticalHeatFlux(params);

    // 计算安全裕度
    const safetyMargins = this.calculateSafetyMargins(
      params,
      criticalHeatFlux,
      temperatures
    );

    // 确定流态
    const flowRegime = this.determineFlowRegime(reynoldsNumber, voidFraction);

    logger.trace(ModuleType.MODEL, 'Thermal hydraulics calculation completed');

    return {
      temperatures,
      heatTransferCoefficients: {
        fuelToCladding: fuelToCladdingHTC,
        claddingToCoolant: claddingToCoolantHTC,
        coolantToStructure: claddingToCoolantHTC * 0.8, // 简化假设
      },
      pressureLoss,
      fluidProperties: {
        reynoldsNumber,
        prandtlNumber,
        nusseltNumber,
        flowRegime,
      },
      voidFraction,
      criticalHeatFlux,
      safetyMargins,
    };
  }

  // 计算雷诺数
  static calculateReynoldsNumber (
    density: number,
    flowRate: number,
    diameter: number,
    viscosity: number
  ): number {
    // Re = ρ * v * D / μ
    // 其中 v = Q / A = Q / (π * (D/2)^2)
    const velocity = flowRate / (Math.PI * Math.pow(diameter / 2, 2));
    return (density * velocity * diameter) / viscosity;
  }

  // 计算普朗特数
  static calculatePrandtlNumber (
    heatCapacity: number,
    viscosity: number,
    thermalConductivity: number
  ): number {
    // Pr = μ * Cp / k
    return (viscosity * heatCapacity) / thermalConductivity;
  }

  // 计算努塞尔数
  static calculateNusseltNumber (
    reynoldsNumber: number,
    prandtlNumber: number
  ): number {
    // 对于湍流
    if (reynoldsNumber > 10000) {
      // Dittus-Boelter 方程
      return (
        0.023 * Math.pow(reynoldsNumber, 0.8) * Math.pow(prandtlNumber, 0.4)
      );
    }
    // 对于层流
    else if (reynoldsNumber < 2300) {
      // 圆形通道层流
      return 3.66;
    }
    // 对于过渡流
    else {
      // 线性插值
      const laminarNu = 3.66;
      const turbulentNu =
        0.023 * Math.pow(10000, 0.8) * Math.pow(prandtlNumber, 0.4);
      const transitionFactor = (reynoldsNumber - 2300) / (10000 - 2300);
      return laminarNu + transitionFactor * (turbulentNu - laminarNu);
    }
  }

  // 计算热传递系数
  static calculateHeatTransferCoefficient (
    nusseltNumber: number,
    thermalConductivity: number,
    diameter: number
  ): number {
    // h = Nu * k / D
    return (nusseltNumber * thermalConductivity) / diameter;
  }

  // 计算燃料到包壳的热传递系数
  static calculateFuelToCladdingHTC (
    fuelThermalConductivity: number,
    fuelRadius: number,
    claddingInnerRadius: number
  ): number {
    // 对于圆柱形燃料棒，热阻为 ln(r2/r1) / (2πkL)
    // 热传递系数为 1 / 热阻
    const radiusRatio = claddingInnerRadius / fuelRadius;
    const thermalResistance =
      Math.log(radiusRatio) / (2 * Math.PI * fuelThermalConductivity);
    return 1 / thermalResistance;
  }

  // 计算温度分布
  static calculateTemperatureDistribution (
    params: ThermalHydraulicParams,
    fuelToCladdingHTC: number,
    claddingToCoolantHTC: number
  ): ThermalHydraulicResult['temperatures'] {
    const { fuel, cladding, coolant, power, geometry } = params;

    // 计算燃料中心温度
    // 假设径向热流均匀分布
    const fuelRadius = geometry.fuelDiameter / 2;
    const linearHeatGenerationRate = power.linearHeatGenerationRate;
    const fuelCenterTemp =
      fuel.temperature +
      linearHeatGenerationRate / (4 * Math.PI * fuel.thermalConductivity);

    // 计算燃料表面温度
    const fuelSurfaceTemp =
      fuel.temperature +
      linearHeatGenerationRate /
        (2 * Math.PI * fuel.thermalConductivity * fuelRadius);

    // 计算包壳内表面温度
    const claddingInnerTemp =
      fuelSurfaceTemp +
      linearHeatGenerationRate /
        ((2 * Math.PI * fuelToCladdingHTC * geometry.claddingInnerDiameter) /
          2);

    // 计算包壳外表面温度
    const claddingOuterTemp =
      claddingInnerTemp +
      (linearHeatGenerationRate * cladding.thickness) /
        (2 *
          Math.PI *
          cladding.thermalConductivity *
          ((geometry.claddingInnerDiameter + geometry.claddingOuterDiameter) /
            4));

    // 计算冷却剂膜温度
    const coolantFilmTemp =
      claddingOuterTemp -
      linearHeatGenerationRate /
        ((2 * Math.PI * claddingToCoolantHTC * geometry.claddingOuterDiameter) /
          2);

    // 计算冷却剂本体温度
    const coolantBulkTemp = coolant.temperature;

    return {
      fuelCenter: fuelCenterTemp,
      fuelSurface: fuelSurfaceTemp,
      claddingInner: claddingInnerTemp,
      claddingOuter: claddingOuterTemp,
      coolantBulk: coolantBulkTemp,
      coolantFilm: coolantFilmTemp,
    };
  }

  // 计算压力损失
  static calculatePressureLoss (
    params: ThermalHydraulicParams,
    reynoldsNumber: number
  ): ThermalHydraulicResult['pressureLoss'] {
    const { coolant, geometry } = params;

    // 计算摩擦系数
    let frictionFactor: number;
    if (reynoldsNumber > 10000) {
      // 湍流
      frictionFactor = 0.3164 / Math.pow(reynoldsNumber, 0.25);
    } else if (reynoldsNumber < 2300) {
      // 层流
      frictionFactor = 64 / reynoldsNumber;
    } else {
      // 过渡流
      const laminarFactor = 64 / 2300;
      const turbulentFactor = 0.3164 / Math.pow(10000, 0.25);
      const transitionFactor = (reynoldsNumber - 2300) / (10000 - 2300);
      frictionFactor =
        laminarFactor + transitionFactor * (turbulentFactor - laminarFactor);
    }

    // 假设通道长度为1米
    const channelLength = 1.0;

    // 计算摩擦压力损失
    const velocity =
      coolant.flowRate /
      (Math.PI * Math.pow(geometry.coolantChannelDiameter / 2, 2));
    const frictionLoss =
      (frictionFactor *
        (channelLength / geometry.coolantChannelDiameter) *
        (coolant.density * velocity * velocity)) /
      2;

    // 计算形阻压力损失（假设为摩擦损失的10%）
    const formLoss = frictionLoss * 0.1;

    // 计算加速压力损失（假设为摩擦损失的5%）
    const accelerationLoss = frictionLoss * 0.05;

    // 计算总压力损失
    const totalLoss = frictionLoss + formLoss + accelerationLoss;

    return {
      friction: frictionLoss,
      form: formLoss,
      acceleration: accelerationLoss,
      total: totalLoss,
    };
  }

  // 计算空泡份额
  static calculateVoidFraction (temperature: number, pressure: number): number {
    // 改进的空泡份额计算
    // 计算饱和温度
    const saturationTemp = this.calculateSaturationTemperature(pressure);

    // 如果温度低于饱和温度，空泡份额为0
    if (temperature < saturationTemp) {
      return 0;
    }

    // 否则，使用Zuber-Findlay模型计算空泡份额
    const subcooling = temperature - saturationTemp;
    const quality = Math.min(1.0, subcooling / 200); // 简化的含汽率计算

    // Zuber-Findlay模型参数
    const C0 = 1.13; // 分布参数
    const Vgj = 1.4; // 漂移速度 (m/s)
    const velocity = 1.0; // 假设冷却剂速度为1 m/s

    // 计算空泡份额
    const voidFraction = quality / (C0 + (Vgj / velocity) * (1 - quality));

    return Math.min(1.0, Math.max(0, voidFraction));
  }

  // 计算临界热流密度
  static calculateCriticalHeatFlux (params: ThermalHydraulicParams): number {
    const { coolant, geometry } = params;

    // 改进的临界热流密度计算
    // 基于W-3 correlation的简化版本
    const pressureFactor = 0.1 + 0.9 * Math.exp(-0.0001 * coolant.pressure);
    const flowRateFactor = Math.min(1.0, coolant.flowRate / 1000);
    const diameterFactor = Math.sqrt(8 / geometry.coolantChannelDiameter);

    // 基础临界热流密度
    const baseCHF = 1000000; // 1 MW/m²

    // 计算临界热流密度
    const criticalHeatFlux =
      baseCHF * pressureFactor * flowRateFactor * diameterFactor;

    return criticalHeatFlux;
  }

  // 计算安全裕度
  static calculateSafetyMargins (
    params: ThermalHydraulicParams,
    criticalHeatFlux: number,
    temperatures: ThermalHydraulicResult['temperatures']
  ): ThermalHydraulicResult['safetyMargins'] {
    const { power, geometry } = params;

    // 计算当前热流密度
    const fuelSurfaceAreaPerUnitLength = Math.PI * geometry.fuelDiameter;
    const currentHeatFlux =
      power.linearHeatGenerationRate / fuelSurfaceAreaPerUnitLength;

    // 计算偏离泡核沸腾比（DNBR）
    const DNBR = criticalHeatFlux / currentHeatFlux;

    // 计算燃料温度裕度
    const fuelMeltingPoint = 2800; // 燃料熔点（K）
    const fuelTemperatureMargin = fuelMeltingPoint - temperatures.fuelCenter;

    // 计算压力裕度
    const criticalPressure = 16000000; // 临界压力（Pa）
    const pressureMargin = criticalPressure - params.coolant.pressure;

    return {
      DNBR,
      fuelTemperatureMargin,
      pressureMargin,
    };
  }

  // 确定流态
  static determineFlowRegime (
    reynoldsNumber: number,
    voidFraction: number
  ): string {
    if (reynoldsNumber < 2300) {
      return '层流';
    } else if (reynoldsNumber < 10000) {
      return '过渡流';
    } else {
      if (voidFraction < 0.2) {
        return '单相湍流';
      } else if (voidFraction < 0.8) {
        return '两相流';
      } else {
        return '环状流';
      }
    }
  }

  // 计算饱和温度
  static calculateSaturationTemperature (pressure: number): number {
    // 改进的饱和温度计算
    // 基于安托因方程
    const A = 8.07131;
    const B = 1730.63;
    const C = 233.426;

    // 将压力转换为mmHg
    const pressuremmHg = pressure / 133.322;

    // 安托因方程：log10(P) = A - B/(T+C)
    // 解出T
    const logP = Math.log10(pressuremmHg);
    const saturationTempC = B / (A - logP) - C;

    // 转换为开尔文
    const saturationTempK = saturationTempC + 273.15;

    return saturationTempK;
  }

  // 计算焓
  static calculateEnthalpy (
    temperature: number,
    pressure: number,
    isVapor: boolean = false
  ): number {
    // 改进的焓计算
    const specificHeat = 4186; // 水的比热容（J/kg·K）
    const latentHeat = 2260000; // 汽化潜热（J/kg）
    const referenceTemp = 273.15; // 参考温度（K）

    // 计算显热
    const sensibleHeat = specificHeat * (temperature - referenceTemp);

    // 如果是蒸汽，加上汽化潜热
    const enthalpy = sensibleHeat + (isVapor ? latentHeat : 0);

    return enthalpy;
  }

  // 计算熵
  static calculateEntropy (temperature: number, pressure: number): number {
    // 改进的熵计算
    const specificHeat = 4186; // 水的比热容（J/kg·K）
    const referenceTemp = 273.15; // 参考温度（K）
    const referencePressure = 101325; // 参考压力（Pa）

    // 考虑温度和压力对熵的影响
    const temperatureTerm =
      specificHeat * Math.log(temperature / referenceTemp);
    const pressureTerm =
      specificHeat * Math.log(referencePressure / pressure) * 0.1; // 压力对熵的影响较小

    const entropy = temperatureTerm + pressureTerm;

    return entropy;
  }

  // 计算能量平衡
  static calculateEnergyBalance (
    inflowEnergy: number,
    outflowEnergy: number,
    heatInput: number,
    heatLoss: number,
    initialEnergy: number,
    timeStep: number
  ): number {
    // 能量平衡方程：dE/dt = inflowEnergy - outflowEnergy + heatInput - heatLoss
    const energyChange =
      (inflowEnergy - outflowEnergy + heatInput - heatLoss) * timeStep;
    const newEnergy = initialEnergy + energyChange;

    return Math.max(0, newEnergy); // 确保能量不为负
  }

  // 计算质量平衡
  static calculateMassBalance (
    inflow: number,
    outflow: number,
    initialMass: number,
    timeStep: number
  ): number {
    // 质量平衡方程：dm/dt = inflow - outflow
    const massChange = (inflow - outflow) * timeStep;
    const newMass = initialMass + massChange;

    return Math.max(0, newMass); // 确保质量不为负
  }
}

// 计算质量平衡
export function calculateMassBalance (
  inflow: number,
  outflow: number,
  initialMass: number,
  timeStep: number
): number {
  // 质量平衡方程：dm/dt = inflow - outflow
  const massChange = (inflow - outflow) * timeStep;
  const newMass = initialMass + massChange;

  return Math.max(0, newMass); // 确保质量不为负
}

// 计算能量平衡
export function calculateEnergyBalance (
  inflowEnergy: number,
  outflowEnergy: number,
  heatInput: number,
  heatLoss: number,
  initialEnergy: number,
  timeStep: number
): number {
  // 能量平衡方程：dE/dt = inflowEnergy - outflowEnergy + heatInput - heatLoss
  const energyChange =
    (inflowEnergy - outflowEnergy + heatInput - heatLoss) * timeStep;
  const newEnergy = initialEnergy + energyChange;

  return Math.max(0, newEnergy); // 确保能量不为负
}

// 计算流动阻力
export function calculateFlowResistance (
  flowRate: number,
  viscosity: number,
  length: number,
  diameter: number,
  roughness: number
): number {
  // 计算雷诺数
  const density = 1000; // 假设水的密度为1000 kg/m³
  const velocity = flowRate / (Math.PI * Math.pow(diameter / 2, 2));
  const reynoldsNumber = (density * velocity * diameter) / viscosity;

  // 计算摩擦系数
  let frictionFactor: number;
  if (reynoldsNumber < 2300) {
    // 层流
    frictionFactor = 64 / reynoldsNumber;
  } else {
    // 湍流，使用Colebrook方程的近似解
    const relativeRoughness = roughness / diameter;
    frictionFactor = Math.pow(
      -2 *
        Math.log10(
          relativeRoughness / 3.7 + 2.51 / (reynoldsNumber * Math.sqrt(0.04))
        ),
      -2
    );
  }

  // 计算流动阻力
  const resistance =
    (frictionFactor * (length / diameter) * (density * velocity * velocity)) /
    2;

  return resistance;
}

// 计算泵性能
export function calculatePumpPerformance (
  speed: number,
  flowRate: number,
  fluidDensity: number,
  totalHead: number
): {
  power: number;
  efficiency: number;
  netPositiveSuctionHead: number;
} {
  // 计算泵功率
  const power = (fluidDensity * 9.81 * flowRate * totalHead) / 1000; // kW

  // 计算泵效率（假设为流量的函数）
  const efficiency = Math.max(
    0.4,
    Math.min(0.85, 0.5 + 0.35 * Math.sin((flowRate / 1000) * Math.PI))
  );

  // 计算净正吸入压头（假设为常数）
  const npsh = 5; // m

  return {
    power,
    efficiency,
    netPositiveSuctionHead: npsh,
  };
}

// 计算摩擦系数
export function calculateFrictionCoefficient (
  reynoldsNumber: number,
  relativeRoughness: number
): number {
  if (reynoldsNumber < 2300) {
    // 层流
    return 64 / reynoldsNumber;
  } else if (reynoldsNumber < 4000) {
    // 过渡流
    const laminarFactor = 64 / 2300;
    const turbulentFactor = Math.pow(
      -2 *
        Math.log10(relativeRoughness / 3.7 + 2.51 / (4000 * Math.sqrt(0.04))),
      -2
    );
    const transitionFactor = (reynoldsNumber - 2300) / (4000 - 2300);
    return laminarFactor + transitionFactor * (turbulentFactor - laminarFactor);
  } else {
    // 湍流
    return Math.pow(
      -2 *
        Math.log10(
          relativeRoughness / 3.7 + 2.51 / (reynoldsNumber * Math.sqrt(0.04))
        ),
      -2
    );
  }
}

// 计算饱和温度
export function calculateSaturationTemperature (pressure: number): number {
  // 简化的饱和温度计算
  // 基于安托因方程
  const A = 8.07131;
  const B = 1730.63;
  const C = 233.426;

  // 将压力转换为mmHg
  const pressuremmHg = pressure / 133.322;

  // 安托因方程：log10(P) = A - B/(T+C)
  // 解出T
  const logP = Math.log10(pressuremmHg);
  const saturationTempC = B / (A - logP) - C;

  // 转换为开尔文
  const saturationTempK = saturationTempC + 273.15;

  return saturationTempK;
}

// 计算饱和压力
export function calculateSaturationPressure (temperature: number): number {
  // 简化的饱和压力计算
  // 基于安托因方程
  const A = 8.07131;
  const B = 1730.63;
  const C = 233.426;

  // 将温度转换为摄氏度
  const temperatureC = temperature - 273.15;

  // 安托因方程：log10(P) = A - B/(T+C)
  const logP = A - B / (temperatureC + C);
  const pressuremmHg = Math.pow(10, logP);

  // 转换为帕斯卡
  const pressurePa = pressuremmHg * 133.322;

  return pressurePa;
}

// 计算焓
export function calculateEnthalpy (
  temperature: number,
  pressure: number
): number {
  // 简化的焓计算
  const specificHeat = 4186; // 水的比热容（J/kg·K）
  const referenceTemp = 273.15; // 参考温度（K）

  // 计算显热
  const sensibleHeat = specificHeat * (temperature - referenceTemp);

  // 检查是否为蒸汽
  const saturationTemp = calculateSaturationTemperature(pressure);
  if (temperature >= saturationTemp) {
    // 如果是蒸汽，加上汽化潜热
    const latentHeat = 2260000; // 汽化潜热（J/kg）
    return sensibleHeat + latentHeat;
  }

  return sensibleHeat;
}

// 计算熵
export function calculateEntropy (
  temperature: number,
  _pressure: number
): number {
  // 简化的熵计算
  const specificHeat = 4186; // 水的比热容（J/kg·K）
  const referenceTemp = 273.15; // 参考温度（K）

  // 假设压力对熵的影响可以忽略
  const entropy = specificHeat * Math.log(temperature / referenceTemp);

  return entropy;
}

// 计算内能
export function calculateInternalEnergy (
  temperature: number,
  pressure: number,
  specificVolume: number
): number {
  // 内能 = 焓 - 压力 * 比容
  const enthalpy = calculateEnthalpy(temperature, pressure);
  const internalEnergy = enthalpy - pressure * specificVolume;

  return internalEnergy;
}

// 计算比容
export function calculateSpecificVolume (
  temperature: number,
  pressure: number
): number {
  // 简化的比容计算
  // 假设为理想气体
  const gasConstant = 461.5; // 水蒸气的气体常数（J/kg·K）
  const specificVolume = (gasConstant * temperature) / pressure;

  return specificVolume;
}

// 计算定压比热容
export function calculateSpecificHeatCapacityP (temperature: number): number {
  // 简化的定压比热容计算
  // 假设随温度线性变化
  const baseCp = 4186; // 基础比热容（J/kg·K）
  const temperatureFactor = 0.1; // 温度系数
  const cp = baseCp + temperatureFactor * (temperature - 273.15);

  return cp;
}

// 计算定容比热容
export function calculateSpecificHeatCapacityV (temperature: number): number {
  // 简化的定容比热容计算
  // 假设为定压比热容的0.7倍
  const cp = calculateSpecificHeatCapacityP(temperature);
  const cv = cp * 0.7;

  return cv;
}
