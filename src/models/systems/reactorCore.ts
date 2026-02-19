import log from '@/lib/utils/logger';

// 反应堆堆芯参数接口
interface ReactorCoreParams {
  // 功率参数
  power: {
    thermalPower: number;
    electricalPower: number;
    powerDensity: number;
  };

  // 温度参数
  temperature: {
    fuel: number;
    coolant: number;
    moderator: number;
  };

  // 压力参数
  pressure: {
    primary: number;
    secondary: number;
  };

  // 几何参数
  geometry: {
    height: number;
    diameter: number;
    fuelAssemblies: number;
    controlRods: number;
  };

  // 冷却系统参数
  cooling: {
    flowRate: number;
    inletTemperature: number;
    outletTemperature: number;
  };
}

// 反应堆堆芯状态接口
interface ReactorCoreStatus {
  // 功率状态
  powerStatus: {
    thermalPower: number;
    electricalPower: number;
    efficiency: number;
  };

  // 温度状态
  temperatureStatus: {
    fuel: number;
    coolant: number;
    moderator: number;
    maxFuelTemperature: number;
  };

  // 压力状态
  pressureStatus: {
    primary: number;
    secondary: number;
    pressureDifference: number;
  };

  // 冷却系统状态
  coolingStatus: {
    flowRate: number;
    inletTemperature: number;
    outletTemperature: number;
    temperatureRise: number;
  };

  // 整体状态
  overallStatus: 'normal' | 'warning' | 'critical';

  // 安全指标
  safetyIndicators: {
    DNBR: number;
    fuelTemperatureMargin: number;
    pressureMargin: number;
  };
}

// 反应堆堆芯模型
export class ReactorCore {
  // 计算堆芯状态
  static getCoreStatus (params: ReactorCoreParams): ReactorCoreStatus {
    log.trace('Calculating reactor core status...');

    // 计算效率
    const efficiency = params.power.electricalPower / params.power.thermalPower;

    // 计算温度上升
    const temperatureRise =
      params.temperature.coolant - params.cooling.inletTemperature;

    // 计算压力差
    const pressureDifference =
      params.pressure.primary - params.pressure.secondary;

    // 计算安全指标
    const DNBR = 1.5; // 假设偏离泡核沸腾比
    const fuelTemperatureMargin = 2800 - params.temperature.fuel; // 燃料熔点 - 当前温度
    const pressureMargin = 16000000 - params.pressure.primary; // 临界压力 - 当前压力

    // 确定整体状态
    let overallStatus: 'normal' | 'warning' | 'critical' = 'normal';

    if (
      params.power.thermalPower > 1200 ||
      params.temperature.fuel > 700 ||
      params.pressure.primary > 8000000
    ) {
      overallStatus = 'critical';
    } else if (
      params.power.thermalPower > 1000 ||
      params.temperature.fuel > 600 ||
      params.pressure.primary > 7000000
    ) {
      overallStatus = 'warning';
    }

    log.trace('Reactor core status calculation completed');

    return {
      powerStatus: {
        thermalPower: params.power.thermalPower,
        electricalPower: params.power.electricalPower,
        efficiency,
      },
      temperatureStatus: {
        fuel: params.temperature.fuel,
        coolant: params.temperature.coolant,
        moderator: params.temperature.moderator,
        maxFuelTemperature: params.temperature.fuel + 50, // 假设最大燃料温度
      },
      pressureStatus: {
        primary: params.pressure.primary,
        secondary: params.pressure.secondary,
        pressureDifference,
      },
      coolingStatus: {
        flowRate: params.cooling.flowRate,
        inletTemperature: params.cooling.inletTemperature,
        outletTemperature: params.cooling.outletTemperature,
        temperatureRise,
      },
      overallStatus,
      safetyIndicators: {
        DNBR,
        fuelTemperatureMargin,
        pressureMargin,
      },
    };
  }

  // 计算堆芯功率分布
  static calculatePowerDistribution (
    _height: number,
    _radius: number
  ): number[][] {
    // 简化的功率分布计算
    // 假设功率分布为余弦分布
    const gridSize = 10;
    const powerDistribution: number[][] = [];

    for (let i = 0; i < gridSize; i++) {
      const row: number[] = [];
      for (let j = 0; j < gridSize; j++) {
        const normalizedHeight = (i / (gridSize - 1)) * 2 - 1;
        const normalizedRadius = (j / (gridSize - 1)) * 2 - 1;
        const heightFactor = Math.cos((normalizedHeight * Math.PI) / 2);
        const radiusFactor = Math.exp(-Math.pow(normalizedRadius, 2));
        row.push(heightFactor * radiusFactor);
      }
      powerDistribution.push(row);
    }

    return powerDistribution;
  }

  // 计算堆芯冷却需求
  static calculateCoolingRequirement (
    thermalPower: number,
    inletTemperature: number,
    outletTemperatureLimit: number
  ): number {
    // 计算冷却需求
    // Q = m * Cp * deltaT
    // m = Q / (Cp * deltaT)
    const specificHeat = 4186; // 水的比热容 (J/kg·K)
    const temperatureDifference = outletTemperatureLimit - inletTemperature;
    const massFlowRate = thermalPower / (specificHeat * temperatureDifference);

    return massFlowRate;
  }
}
