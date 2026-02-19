// 热工水力计算Worker
import log from '../utils/logger';

// 定义消息类型
interface WorkerMessage {
  type: string;
  payload: any;
}

// 定义响应类型
interface WorkerResponse {
  type: string;
  success: boolean;
  data?: any;
  error?: string;
}

// 燃料热传导参数接口
interface FuelHeatConductionParams {
  fuel: {
    temperature: {
      center: number;
      surface: number;
      average: number;
    };
    density: number;
    specificHeat: number;
    thermalConductivity: number;
  };
  thermal: {
    power: number;
    heatFlux: number;
    linearHeatGeneration: number;
    thermalResistance: number;
  };
  deltaTime: number;
}

// 冷却剂传热参数接口
interface CoolantHeatTransferParams {
  fuel: {
    temperature: {
      surface: number;
    };
  };
  coolant: {
    temperature: number;
    pressure: number;
    flowRate: number;
    voidFraction: number;
    enthalpy: number;
  };
  cladding: {
    temperature: number;
    thermalConductivity: number;
    thickness: number;
  };
  thermal: {
    heatFlux: number;
  };
  boiling: {
    heatTransferCoefficient: number;
  };
  deltaTime: number;
}

// 流动参数计算参数接口
interface FlowParametersParams {
  coolant: {
    flowRate: number;
    pressure: number;
    temperature: number;
  };
  pipeDiameter: number;
  pipeLength: number;
}

// 泵性能计算参数接口
interface PumpPerformanceParams {
  pump: {
    flowRate: number;
    speed: number;
    efficiency: number;
  };
  H_max: number;
  k: number;
}

// 燃料热传导计算
function calculateFuelHeatConduction (params: FuelHeatConductionParams): any {
  const { fuel, thermal } = params;
  const q_volume =
    thermal.linearHeatGeneration / (Math.PI * Math.pow(0.005, 2)); // 体积热源

  // 简化的燃料热传导计算
  const r0 = 0.005; // 燃料棒半径
  const T_surface = fuel.temperature.surface;

  // 燃料中心温度计算（稳态）
  const newT_center =
    T_surface + (q_volume * r0 * r0) / (4 * fuel.thermalConductivity);
  const newT_average = (2 * T_surface + newT_center) / 3;

  return {
    centerTemperature: newT_center,
    averageTemperature: newT_average,
    surfaceTemperature: T_surface,
  };
}

// 冷却剂传热计算
function calculateCoolantHeatTransfer (params: CoolantHeatTransferParams): any {
  const { coolant, thermal, boiling, deltaTime } = params;
  const h = boiling.heatTransferCoefficient;

  // 计算冷却剂温度
  const T_coolant = coolant.temperature;
  const deltaT = thermal.heatFlux / h;
  const newT_clad_outer = T_coolant + deltaT;

  // 更新冷却剂温度（简化）
  const m_dot = coolant.flowRate;
  const c_p = 4186; // 水的比热容
  const deltaT_coolant =
    (thermal.heatFlux * Math.PI * 0.01 * 1) / (m_dot * c_p);
  const newCoolantTemperature =
    coolant.temperature + deltaT_coolant * deltaTime;

  return {
    claddingTemperature: newT_clad_outer,
    coolantTemperature: newCoolantTemperature,
    temperatureDifference: deltaT,
  };
}

// 流动参数计算
function calculateFlowParameters (params: FlowParametersParams): any {
  const { coolant, pipeDiameter, pipeLength } = params;
  const flowRate = coolant.flowRate;
  const density = 998; // 水的密度
  const viscosity = 1e-3; // 水的动力粘度

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
  const pressureDrop =
    (frictionCoefficient *
      (pipeLength / pipeDiameter) *
      (density * velocity * velocity)) /
    2;

  return {
    reynoldsNumber,
    flowRegime,
    frictionCoefficient,
    pressureDrop,
    velocity,
  };
}

// 泵性能计算
function calculatePumpPerformance (params: PumpPerformanceParams): any {
  const { pump, H_max, k } = params;
  const flowRate = pump.flowRate;

  // 简化的泵性能计算
  const head = H_max - k * Math.pow(flowRate / 1000, 2);

  // 计算泵功率
  const density = 998;
  const g = 9.81;
  const power = (density * g * flowRate * head) / (pump.efficiency * 1000);

  return {
    head,
    power,
    efficiency: pump.efficiency,
    flowRate,
  };
}

// 沸腾参数计算
function calculateBoilingParameters (params: any): any {
  const { coolant, thermal } = params;
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

  return {
    saturationTemperature,
    criticalHeatFlux,
    heatTransferCoefficient,
    boilingRegime,
  };
}

// 处理消息
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;
  let response: WorkerResponse;

  try {
    log.trace(`ThermalWorker received message: ${type}`);

    switch (type) {
    case 'calculateFuelHeatConduction': {
      const fuelResult = calculateFuelHeatConduction(payload);
      response = {
        type: 'fuelHeatConductionResult',
        success: true,
        data: fuelResult,
      };
      break;
    }

    case 'calculateCoolantHeatTransfer': {
      const coolantResult = calculateCoolantHeatTransfer(payload);
      response = {
        type: 'coolantHeatTransferResult',
        success: true,
        data: coolantResult,
      };
      break;
    }

    case 'calculateFlowParameters': {
      const flowResult = calculateFlowParameters(payload);
      response = {
        type: 'flowParametersResult',
        success: true,
        data: flowResult,
      };
      break;
    }

    case 'calculatePumpPerformance': {
      const pumpResult = calculatePumpPerformance(payload);
      response = {
        type: 'pumpPerformanceResult',
        success: true,
        data: pumpResult,
      };
      break;
    }

    case 'calculateBoilingParameters': {
      const boilingResult = calculateBoilingParameters(payload);
      response = {
        type: 'boilingParametersResult',
        success: true,
        data: boilingResult,
      };
      break;
    }

    default:
      response = {
        type: 'error',
        success: false,
        error: `Unknown message type: ${type}`,
      };
    }
  } catch (error) {
    log.error(`ThermalWorker error: ${error}`);
    response = {
      type: 'error',
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  self.postMessage(response);
};

export {};
