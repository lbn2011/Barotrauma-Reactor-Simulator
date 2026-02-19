import { makeAutoObservable, computed } from 'mobx';
import log from '@/lib/utils/logger';

// 燃料温度分布
interface FuelTemperature {
  center: number; // 燃料中心温度
  surface: number; // 燃料表面温度
  average: number; // 平均燃料温度
}

// 冷却剂状态
interface CoolantState {
  temperature: number; // 冷却剂温度
  pressure: number; // 冷却剂压力
  flowRate: number; // 冷却剂流量
  voidFraction: number; // 空泡份额
  enthalpy: number; // 冷却剂焓
}

// 热工水力状态接口
interface ThermalState {
  // 燃料温度
  fuel: {
    temperature: FuelTemperature;
    density: number; // 燃料密度
    specificHeat: number; // 燃料比热容
    thermalConductivity: number; // 燃料热导率
  };

  // 冷却剂状态
  coolant: CoolantState;

  // 包壳温度
  cladding: {
    temperature: number; // 包壳温度
    thermalConductivity: number; // 包壳热导率
    thickness: number; // 包壳厚度
  };

  // 热工参数
  thermal: {
    power: number; // 热功率
    heatFlux: number; // 热流密度
    linearHeatGeneration: number; // 线功率密度
    thermalResistance: number; // 热阻
  };

  // 流动参数
  flow: {
    reynoldsNumber: number; // 雷诺数
    flowRegime: 'laminar' | 'turbulent' | 'transition'; // 流动状态
    frictionCoefficient: number; // 摩擦系数
    pressureDrop: number; // 压降
    velocity: number; // 流速
  };

  // 泵性能参数
  pump: {
    head: number; // 扬程
    power: number; // 泵功率
    efficiency: number; // 泵效率
    flowRate: number; // 泵流量
    speed: number; // 泵转速
  };

  // 沸腾参数
  boiling: {
    saturationTemperature: number; // 饱和温度
    criticalHeatFlux: number; // 临界热流密度
    heatTransferCoefficient: number; // 传热系数
    boilingRegime: 'single-phase' | 'nucleate' | 'transition' | 'film'; // 沸腾状态
  };
}

// 初始状态
const initialState: ThermalState = {
  // 燃料温度
  fuel: {
    temperature: {
      center: 600,
      surface: 400,
      average: 500,
    },
    density: 10970, // UO2密度 (kg/m³)
    specificHeat: 400, // 比热容 (J/kg·K)
    thermalConductivity: 2.5, // 热导率 (W/m·K)
  },

  // 冷却剂状态
  coolant: {
    temperature: 280,
    pressure: 7.0,
    flowRate: 10000,
    voidFraction: 0.01,
    enthalpy: 1200,
  },

  // 包壳温度
  cladding: {
    temperature: 320,
    thermalConductivity: 15.0, // 锆合金热导率 (W/m·K)
    thickness: 0.004, // 包壳厚度 (m)
  },

  // 热工参数
  thermal: {
    power: 50,
    heatFlux: 1e6,
    linearHeatGeneration: 15,
    thermalResistance: 0.1,
  },

  // 流动参数
  flow: {
    reynoldsNumber: 1e4,
    flowRegime: 'turbulent',
    frictionCoefficient: 0.02,
    pressureDrop: 1000,
    velocity: 5,
  },

  // 泵性能参数
  pump: {
    head: 50,
    power: 10000,
    efficiency: 0.8,
    flowRate: 10000,
    speed: 1500,
  },

  // 沸腾参数
  boiling: {
    saturationTemperature: 285,
    criticalHeatFlux: 3e6,
    heatTransferCoefficient: 10000,
    boilingRegime: 'single-phase',
  },
};

/**
 * ThermalStore
 * 处理热工水力计算，包括燃料热传导、冷却剂流动和泵性能
 */
export class ThermalStore {
  // 状态
  state: ThermalState;

  // 构造函数
  constructor() {
    this.state = { ...initialState };
    makeAutoObservable(this, {
      // 计算属性
      nusseltNumber: computed,
      prandtlNumber: computed,
      pecletNumber: computed,
    });
  }

  // 努塞尔数
  get nusseltNumber() {
    const { reynoldsNumber } = this.state.flow;
    const pr = this.prandtlNumber;
    
    // 湍流流动的Dittus-Boelter方程
    if (this.state.flow.flowRegime === 'turbulent') {
      return 0.023 * Math.pow(reynoldsNumber, 0.8) * Math.pow(pr, 0.4);
    }
    // 层流流动
    return 3.66;
  }

  // 普朗特数
  get prandtlNumber() {
    // 水的普朗特数（简化计算）
    const T = this.state.coolant.temperature;
    return 7.0 - 0.03 * (T - 20);
  }

  // 佩克莱数
  get pecletNumber() {
    return this.state.flow.reynoldsNumber * this.prandtlNumber;
  }

  /**
   * 计算燃料热传导
   * @param deltaTime 时间步长
   */
  calculateFuelHeatConduction(deltaTime: number) {
    log.trace('Calculating fuel heat conduction');
    
    const { fuel, thermal } = this.state;
    const q''' = thermal.linearHeatGeneration / (Math.PI * Math.pow(0.005, 2)); // 体积热源

    // 简化的燃料热传导计算
    const r0 = 0.005; // 燃料棒半径
    const T_center = fuel.temperature.center;
    const T_surface = fuel.temperature.surface;

    // 燃料中心温度计算（稳态）
    const newT_center = T_surface + (q''' * r0 * r0) / (4 * fuel.thermalConductivity);
    const newT_average = (2 * T_surface + T_center) / 3;

    // 更新燃料温度
    this.state.fuel.temperature.center = newT_center;
    this.state.fuel.temperature.average = newT_average;

    log.debug('Fuel heat conduction calculated:', {
      centerTemperature: newT_center,
      averageTemperature: newT_average,
      surfaceTemperature: T_surface,
    });
  }

  /**
   * 计算冷却剂传热
   * @param deltaTime 时间步长
   */
  calculateCoolantHeatTransfer(deltaTime: number) {
    log.trace('Calculating coolant heat transfer');
    
    const { fuel, coolant, cladding, thermal, flow } = this.state;
    const h = this.state.boiling.heatTransferCoefficient;

    // 计算包壳温度
    const T_fuel_surface = fuel.temperature.surface;
    const q'' = thermal.heatFlux;
    const R_clad = cladding.thickness / cladding.thermalConductivity;
    const T_clad_outer = T_fuel_surface - q'' * R_clad;

    // 计算冷却剂温度
    const T_coolant = coolant.temperature;
    const deltaT = q'' / h;
    const newT_clad_outer = T_coolant + deltaT;

    // 更新温度
    this.state.cladding.temperature = newT_clad_outer;

    // 更新冷却剂温度（简化）
    const m_dot = coolant.flowRate;
    const c_p = 4186; // 水的比热容
    const deltaT_coolant = (q'' * Math.PI * 0.01 * 1) / (m_dot * c_p);
    this.state.coolant.temperature += deltaT_coolant * deltaTime;

    log.debug('Coolant heat transfer calculated:', {
      claddingTemperature: newT_clad_outer,
      coolantTemperature: this.state.coolant.temperature,
      temperatureDifference: deltaT,
    });
  }

  /**
   * 计算流动参数
   * @param deltaTime 时间步长
   */
  calculateFlowParameters(deltaTime: number) {
    log.trace('Calculating flow parameters');
    
    const { coolant } = this.state;
    const flowRate = coolant.flowRate;
    const density = 998; // 水的密度
    const viscosity = 1e-3; // 水的动力粘度
    const pipeDiameter = 0.02; // 管道直径

    // 计算流速
    const pipeArea = Math.PI * Math.pow(pipeDiameter / 2, 2);
    const velocity = flowRate / (density * pipeArea);

    // 计算雷诺数
    const reynoldsNumber = (density * velocity * pipeDiameter) / viscosity;

    // 确定流动状态
    let flowRegime: 'laminar' | 'turbulent' | 'transition';
    if (reynoldsNumber < 2300) {
      flowRegime = 'laminar';
    } else if (reynoldsNumber > 4000) {
      flowRegime = 'turbulent';
    } else {
      flowRegime = 'transition';
    }

    // 计算摩擦系数
    let frictionCoefficient;
    if (flowRegime === 'laminar') {
      frictionCoefficient = 64 / reynoldsNumber;
    } else {
      // Blasius公式
      frictionCoefficient = 0.3164 / Math.pow(reynoldsNumber, 0.25);
    }

    // 计算压降
    const pipeLength = 10; // 管道长度
    const pressureDrop = frictionCoefficient * (pipeLength / pipeDiameter) * (density * velocity * velocity) / 2;

    // 更新流动参数
    this.state.flow = {
      reynoldsNumber,
      flowRegime,
      frictionCoefficient,
      pressureDrop,
      velocity,
    };

    log.debug('Flow parameters calculated:', {
      reynoldsNumber,
      flowRegime,
      frictionCoefficient,
      pressureDrop,
      velocity,
    });
  }

  /**
   * 计算泵性能
   * @param deltaTime 时间步长
   */
  calculatePumpPerformance(deltaTime: number) {
    log.trace('Calculating pump performance');
    
    const { pump } = this.state;
    const flowRate = pump.flowRate;
    const speed = pump.speed;

    // 简化的泵性能计算
    const H_max = 100; // 最大扬程
    const k = 1000; // 常数
    const head = H_max - k * Math.pow(flowRate / 1000, 2);

    // 计算泵功率
    const density = 998;
    const g = 9.81;
    const power = (density * g * flowRate * head) / (pump.efficiency * 1000);

    // 更新泵性能参数
    this.state.pump = {
      ...pump,
      head,
      power,
    };

    log.debug('Pump performance calculated:', {
      head,
      power,
      efficiency: pump.efficiency,
      flowRate,
    });
  }

  /**
   * 计算沸腾参数
   * @param deltaTime 时间步长
   */
  calculateBoilingParameters(deltaTime: number) {
    log.trace('Calculating boiling parameters');
    
    const { coolant, thermal } = this.state;
    const pressure = coolant.pressure * 1e6; // 转换为帕斯卡
    const heatFlux = thermal.heatFlux;

    // 计算饱和温度（简化计算）
    const saturationTemperature = 100 + (pressure - 1e5) / 3600;

    // 计算临界热流密度（Zuber方程，简化）
    const criticalHeatFlux = 0.131 * Math.pow(pressure, 0.6);

    // 计算传热系数
    const heatTransferCoefficient = 5000 + 100 * (coolant.temperature - 20);

    // 确定沸腾状态
    let boilingRegime: 'single-phase' | 'nucleate' | 'transition' | 'film';
    if (coolant.temperature < saturationTemperature - 5) {
      boilingRegime = 'single-phase';
    } else if (heatFlux < 0.5 * criticalHeatFlux) {
      boilingRegime = 'nucleate';
    } else if (heatFlux < criticalHeatFlux) {
      boilingRegime = 'transition';
    } else {
      boilingRegime = 'film';
    }

    // 更新沸腾参数
    this.state.boiling = {
      saturationTemperature,
      criticalHeatFlux,
      heatTransferCoefficient,
      boilingRegime,
    };

    log.debug('Boiling parameters calculated:', {
      saturationTemperature,
      criticalHeatFlux,
      heatTransferCoefficient,
      boilingRegime,
    });
  }

  /**
   * 计算冷却剂焓
   * @param deltaTime 时间步长
   */
  calculateCoolantEnthalpy(deltaTime: number) {
    log.trace('Calculating coolant enthalpy');
    
    const { coolant } = this.state;
    const T = coolant.temperature;
    const P = coolant.pressure;

    // 简化的焓计算
    const h = 4.186 * T + 2500 * coolant.voidFraction;

    // 更新焓
    this.state.coolant.enthalpy = h;

    log.debug('Coolant enthalpy calculated:', h);
  }

  /**
   * 更新热功率
   * @param power 热功率
   */
  setThermalPower(power: number) {
    this.state.thermal.power = power;
    // 更新热流密度
    this.state.thermal.heatFlux = power * 10000;
    log.debug(`Thermal power set to ${power}%`);
  }

  /**
   * 更新冷却剂流量
   * @param flowRate 冷却剂流量
   */
  setCoolantFlowRate(flowRate: number) {
    this.state.coolant.flowRate = flowRate;
    this.state.pump.flowRate = flowRate;
    log.debug(`Coolant flow rate set to ${flowRate} kg/s`);
  }

  /**
   * 更新泵转速
   * @param speed 泵转速
   */
  setPumpSpeed(speed: number) {
    this.state.pump.speed = speed;
    log.debug(`Pump speed set to ${speed} RPM`);
  }

  /**
   * 更新冷却剂压力
   * @param pressure 冷却剂压力
   */
  setCoolantPressure(pressure: number) {
    this.state.coolant.pressure = pressure;
    log.debug(`Coolant pressure set to ${pressure} MPa`);
  }

  /**
   * 更新空泡份额
   * @param voidFraction 空泡份额
   */
  setVoidFraction(voidFraction: number) {
    this.state.coolant.voidFraction = voidFraction;
    log.debug(`Void fraction set to ${voidFraction}`);
  }

  /**
   * 更新热工水力计算
   * @param deltaTime 时间步长
   */
  update(deltaTime: number) {
    log.time('Thermal hydraulic update');
    
    // 计算流动参数
    this.calculateFlowParameters(deltaTime);
    
    // 计算泵性能
    this.calculatePumpPerformance(deltaTime);
    
    // 计算沸腾参数
    this.calculateBoilingParameters(deltaTime);
    
    // 计算燃料热传导
    this.calculateFuelHeatConduction(deltaTime);
    
    // 计算冷却剂传热
    this.calculateCoolantHeatTransfer(deltaTime);
    
    // 计算冷却剂焓
    this.calculateCoolantEnthalpy(deltaTime);
    
    log.timeEnd('Thermal hydraulic update');
  }

  /**
   * 重置状态
   */
  reset() {
    this.state = { ...initialState };
    log.info('Thermal store reset');
  }
}

// 导出单例
export const thermalStore = new ThermalStore();
