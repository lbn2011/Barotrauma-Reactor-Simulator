// 中子物理计算Worker
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

// 中子物理参数接口
interface NeutronPhysicsParams {
  xenon: {
    Xe: number;
    I: number;
    λ_Xe: number;
    λ_I: number;
    σ_Xe: number;
    γ_Xe: number;
    γ_I: number;
  };
  neutron: {
    flux: number;
    Σ_f: number;
    ν: number;
    generationTime: number;
    lifetime: number;
  };
  deltaTime: number;
}

// 氙中毒计算
function calculateXenonPoisoning (params: NeutronPhysicsParams): any {
  const { xenon, neutron, deltaTime } = params;
  const φ = neutron.flux;

  // 氙-135动力学方程
  const dXe_dt =
    xenon.λ_I * xenon.I -
    xenon.λ_Xe * xenon.Xe -
    xenon.σ_Xe * φ * xenon.Xe +
    xenon.γ_Xe * neutron.Σ_f * φ;

  // 碘-135动力学方程
  const dI_dt = xenon.γ_I * neutron.Σ_f * φ - xenon.λ_I * xenon.I;

  // 更新浓度
  const newXe = xenon.Xe + dXe_dt * deltaTime;
  const newI = xenon.I + dI_dt * deltaTime;

  // 计算氙中毒对反应性的影响
  const ρ_Xe = (-xenon.σ_Xe * newXe) / neutron.Σ_f;

  return {
    Xe: newXe,
    I: newI,
    ρ_Xe,
  };
}

// 多群扩散计算
function calculateMultiGroupDiffusion (params: any): any {
  const { fastFlux, thermalFlux, generationTime, deltaTime } = params;

  // 群常数（简化）
  const Σ_a_fast = 1e-24; // 快群吸收截面
  const Σ_a_thermal = 1e-22; // 热群吸收截面
  const Σ_s_fast_to_thermal = 1e-23; // 快群到热群散射截面
  const νΣ_f_thermal = 2.43 * 1e-22; // 热群中子产生截面

  // 简化的扩散方程（忽略空间依赖）
  const dφ_fast_dt =
    (νΣ_f_thermal * thermalFlux -
      Σ_a_fast * fastFlux -
      Σ_s_fast_to_thermal * fastFlux) /
    generationTime;
  const dφ_thermal_dt =
    (Σ_s_fast_to_thermal * fastFlux - Σ_a_thermal * thermalFlux) /
    generationTime;

  // 更新通量
  const newFastFlux = fastFlux + dφ_fast_dt * deltaTime;
  const newThermalFlux = thermalFlux + dφ_thermal_dt * deltaTime;

  return {
    fastFlux: newFastFlux,
    thermalFlux: newThermalFlux,
  };
}

// 空泡系数计算
function calculateVoidCoefficient (params: any): any {
  const { α_void, Δα, P_current } = params;

  // 计算空泡反应性
  const ρ_void = α_void * Δα;

  // 计算新功率
  const P_new = P_current * (1 + ρ_void);

  // 延迟处理（简化模型）
  const P_delayed = P_new;

  return {
    ρ_void,
    P_new,
    P_delayed,
  };
}

// 控制棒物理计算
function calculateControlRodPhysics (params: any): any {
  const { ρ_max, z, L, ρ_graphite_effect } = params;
  let ρ_tip = 0; // 石墨尖端效应反应性
  let ρ_absorption = 0; // 吸收效应反应性

  // 计算石墨尖端效应（前20%插入深度）
  if (z < 0.2 * L) {
    // 前20%插入深度时，只有石墨尖端效应
    ρ_tip = ρ_graphite_effect;
    ρ_absorption = 0;
  } else {
    // 计算延迟的吸收效应（后80%插入深度）
    ρ_tip = 0; // 石墨尖端效应消失
    // 吸收效应与插入深度成正比
    ρ_absorption = (-ρ_max * (z - 0.2 * L)) / (0.8 * L);
  }

  // 总反应性 = 石墨尖端效应 + 吸收效应
  const ρ_rod = ρ_tip + ρ_absorption;

  return {
    ρ_tip,
    ρ_absorption,
    ρ_rod,
    insertionDepth: z,
  };
}

// 处理消息
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;
  let response: WorkerResponse;

  try {
    log.trace(`NeutronWorker received message: ${type}`);

    switch (type) {
    case 'calculateXenonPoisoning': {
      const xenonResult = calculateXenonPoisoning(payload);
      response = {
        type: 'xenonPoisoningResult',
        success: true,
        data: xenonResult,
      };
      break;
    }

    case 'calculateMultiGroupDiffusion': {
      const diffusionResult = calculateMultiGroupDiffusion(payload);
      response = {
        type: 'multiGroupDiffusionResult',
        success: true,
        data: diffusionResult,
      };
      break;
    }

    case 'calculateVoidCoefficient': {
      const voidResult = calculateVoidCoefficient(payload);
      response = {
        type: 'voidCoefficientResult',
        success: true,
        data: voidResult,
      };
      break;
    }

    case 'calculateControlRodPhysics': {
      const rodResult = calculateControlRodPhysics(payload);
      response = {
        type: 'controlRodPhysicsResult',
        success: true,
        data: rodResult,
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
    log.error(`NeutronWorker error: ${error}`);
    response = {
      type: 'error',
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  self.postMessage(response);
};

export {};
