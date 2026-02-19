import { makeAutoObservable, computed } from 'mobx';
import log from '@/lib/utils/logger';

// 延迟中子先驱核参数
interface DelayedNeutronPrecursor {
  lambda: number; // 衰变常数
  beta: number; // 份额
  concentration: number; // 浓度
}

// 多群中子通量
interface MultiGroupFlux {
  fast: number; // 快中子通量
  thermal: number; // 热中子通量
}

// 中子物理状态接口
interface NeutronState {
  // 氙中毒参数
  xenon: {
    Xe: number; // 氙-135浓度
    I: number; // 碘-135浓度
    λ_Xe: number; // 氙-135衰变常数
    λ_I: number; // 碘-135衰变常数
    σ_Xe: number; // 氙-135中子俘获截面
    γ_Xe: number; // 氙-135产额
    γ_I: number; // 碘-135产额
  };

  // 中子参数
  neutron: {
    flux: MultiGroupFlux; // 多群中子通量
    Σ_f: number; // 裂变截面
    ν: number; // 每次裂变产生的中子数
    generationTime: number; // 中子代时间
    lifetime: number; // 中子寿命
  };

  // 延迟中子先驱核
  delayedNeutrons: DelayedNeutronPrecursor[];

  // 反应性参数
  reactivity: {
    total: number; // 总反应性
    void: number; // 空泡反应性
    xenon: number; // 氙中毒反应性
    controlRod: number; // 控制棒反应性
    temperature: number; // 温度反应性
  };

  // 控制棒参数
  controlRod: {
    position: number; // 控制棒位置（%）
    ρ_max: number; // 最大反应性
    z: number; // 插入深度（米）
    L: number; // 控制棒长度（米）
    ρ_graphite_effect: number; // 石墨尖端效应
  };

  // 空泡参数
  void: {
    α_void: number; // 空泡系数
    Δα: number; // 空泡份额变化
    P_current: number; // 当前功率
    τ_delay: number; // 反馈延迟时间
  };
}

// 初始状态
const initialState: NeutronState = {
  // 氙中毒参数
  xenon: {
    Xe: 0,
    I: 0,
    λ_Xe: 2.95e-5, // 氙-135衰变常数（s⁻¹）
    λ_I: 2.87e-5, // 碘-135衰变常数（s⁻¹）
    σ_Xe: 2.65e-18, // 氙-135中子俘获截面（cm²）
    γ_Xe: 0.0639, // 氙-135产额
    γ_I: 0.0639, // 碘-135产额
  },

  // 中子参数
  neutron: {
    flux: {
      fast: 1e13,
      thermal: 1e13,
    },
    Σ_f: 1e-22, // 裂变截面
    ν: 2.43, // 每次裂变产生的中子数
    generationTime: 0.01, // 中子代时间（秒）
    lifetime: 1.0, // 中子寿命（秒）
  },

  // 延迟中子先驱核（6组）
  delayedNeutrons: [
    { lambda: 0.0124, beta: 0.000215, concentration: 0 },
    { lambda: 0.0316, beta: 0.001424, concentration: 0 },
    { lambda: 0.115, beta: 0.001274, concentration: 0 },
    { lambda: 0.311, beta: 0.002568, concentration: 0 },
    { lambda: 1.40, beta: 0.000748, concentration: 0 },
    { lambda: 3.87, beta: 0.000273, concentration: 0 },
  ],

  // 反应性参数
  reactivity: {
    total: 0,
    void: 0,
    xenon: 0,
    controlRod: 0,
    temperature: 0,
  },

  // 控制棒参数
  controlRod: {
    position: 50, // 初始位置50%
    ρ_max: 0.1, // 最大反应性
    z: 2.0, // 初始插入深度2米
    L: 4.0, // 控制棒长度4米
    ρ_graphite_effect: 0.05, // 石墨尖端效应
  },

  // 空泡参数
  void: {
    α_void: 4.7e-5, // 正空泡系数
    Δα: 0.01, // 空泡份额变化
    P_current: 50, // 当前功率（%）
    τ_delay: 10, // 反馈延迟时间（秒）
  },
};

/**
 * NeutronStore
 * 处理中子物理计算，包括氙中毒、空泡系数和控制棒物理
 */
export class NeutronStore {
  // 状态
  state: NeutronState;

  // 构造函数
  constructor() {
    this.state = { ...initialState };
    makeAutoObservable(this, {
      // 计算属性
      totalBeta: computed,
      effectiveMultiplicationFactor: computed,
      neutronFlux: computed,
    });
  }

  // 总延迟中子份额
  get totalBeta() {
    return this.state.delayedNeutrons.reduce((sum, precursor) => sum + precursor.beta, 0);
  }

  // 有效增殖系数
  get effectiveMultiplicationFactor() {
    const ρ = this.state.reactivity.total;
    return ρ / (ρ - 1);
  }

  // 总中子通量
  get neutronFlux() {
    return this.state.neutron.flux.fast + this.state.neutron.flux.thermal;
  }

  /**
   * 计算氙-135中毒效应
   * @param deltaTime 时间步长
   */
  calculateXenonPoisoning(deltaTime: number) {
    log.trace('Calculating xenon poisoning');
    
    const { xenon, neutron } = this.state;
    const φ = neutron.flux.thermal;

    // 氙-135动力学方程
    const dXe_dt = 
      xenon.λ_I * xenon.I - 
      xenon.λ_Xe * xenon.Xe - 
      xenon.σ_Xe * φ * xenon.Xe + 
      xenon.γ_Xe * neutron.Σ_f * φ;

    // 碘-135动力学方程
    const dI_dt = 
      xenon.γ_I * neutron.Σ_f * φ - 
      xenon.λ_I * xenon.I;

    // 更新浓度
    this.state.xenon.Xe += dXe_dt * deltaTime;
    this.state.xenon.I += dI_dt * deltaTime;

    // 计算氙中毒对反应性的影响
    const ρ_Xe = -xenon.σ_Xe * this.state.xenon.Xe / neutron.Σ_f;
    this.state.reactivity.xenon = ρ_Xe;

    log.debug('Xenon poisoning calculated:', {
      Xe: this.state.xenon.Xe,
      I: this.state.xenon.I,
      ρ_Xe,
    });
  }

  /**
   * 计算空泡系数效应
   * @param deltaTime 时间步长
   */
  calculateVoidCoefficient(deltaTime: number) {
    log.trace('Calculating void coefficient');
    
    const { void: voidParams } = this.state;

    // 计算空泡反应性
    const ρ_void = voidParams.α_void * voidParams.Δα;
    this.state.reactivity.void = ρ_void;

    // 计算新功率
    const P_new = voidParams.P_current * (1 + ρ_void);

    // 延迟处理（简化模型）
    const P_delayed = P_new;

    log.debug('Void coefficient calculated:', {
      ρ_void,
      P_new,
      P_delayed,
    });
  }

  /**
   * 计算控制棒物理特性
   */
  calculateControlRodPhysics() {
    log.trace('Calculating control rod physics');
    
    const { controlRod } = this.state;
    let ρ_tip = 0; // 石墨尖端效应反应性
    let ρ_absorption = 0; // 吸收效应反应性

    // 计算石墨尖端效应（前20%插入深度）
    if (controlRod.z < 0.2 * controlRod.L) {
      // 前20%插入深度时，只有石墨尖端效应
      ρ_tip = controlRod.ρ_graphite_effect;
      ρ_absorption = 0;
    } else {
      // 计算延迟的吸收效应（后80%插入深度）
      ρ_tip = 0; // 石墨尖端效应消失
      // 吸收效应与插入深度成正比
      ρ_absorption = -controlRod.ρ_max * (controlRod.z - 0.2 * controlRod.L) / (0.8 * controlRod.L);
    }

    // 总反应性 = 石墨尖端效应 + 吸收效应
    const ρ_rod = ρ_tip + ρ_absorption;
    this.state.reactivity.controlRod = ρ_rod;

    log.debug('Control rod physics calculated:', {
      ρ_tip,
      ρ_absorption,
      ρ_rod,
      insertionDepth: controlRod.z,
    });
  }

  /**
   * 计算多群扩散理论
   * @param deltaTime 时间步长
   */
  calculateMultiGroupDiffusion(deltaTime: number) {
    log.trace('Calculating multi-group diffusion');
    
    // 简化的2群扩散模型
    const { neutron } = this.state;
    const φ_fast = neutron.flux.fast;
    const φ_thermal = neutron.flux.thermal;

    // 群常数（简化）
    const D_fast = 1.0; // 快群扩散系数
    const D_thermal = 0.1; // 热群扩散系数
    const Σ_a_fast = 1e-24; // 快群吸收截面
    const Σ_a_thermal = 1e-22; // 热群吸收截面
    const Σ_s_fast_to_thermal = 1e-23; // 快群到热群散射截面
    const νΣ_f_thermal = neutron.ν * neutron.Σ_f; // 热群中子产生截面

    // 简化的扩散方程（忽略空间依赖）
    const dφ_fast_dt = (νΣ_f_thermal * φ_thermal - Σ_a_fast * φ_fast - Σ_s_fast_to_thermal * φ_fast) / neutron.generationTime;
    const dφ_thermal_dt = (Σ_s_fast_to_thermal * φ_fast - Σ_a_thermal * φ_thermal) / neutron.generationTime;

    // 更新通量
    this.state.neutron.flux.fast += dφ_fast_dt * deltaTime;
    this.state.neutron.flux.thermal += dφ_thermal_dt * deltaTime;

    log.debug('Multi-group diffusion calculated:', {
      fastFlux: this.state.neutron.flux.fast,
      thermalFlux: this.state.neutron.flux.thermal,
    });
  }

  /**
   * 更新控制棒位置
   * @param position 控制棒位置（%）
   */
  setControlRodPosition(position: number) {
    const clampedPosition = Math.max(0, Math.min(100, position));
    this.state.controlRod.position = clampedPosition;
    // 更新插入深度
    this.state.controlRod.z = (100 - clampedPosition) * 0.01 * this.state.controlRod.L;
    // 重新计算控制棒物理
    this.calculateControlRodPhysics();
    log.debug(`Control rod position set to ${clampedPosition}%`);
  }

  /**
   * 更新空泡份额变化
   * @param deltaAlpha 空泡份额变化
   */
  setVoidFractionChange(deltaAlpha: number) {
    this.state.void.Δα = deltaAlpha;
    this.calculateVoidCoefficient(0);
    log.debug(`Void fraction change set to ${deltaAlpha}`);
  }

  /**
   * 更新当前功率
   * @param power 当前功率（%）
   */
  setCurrentPower(power: number) {
    this.state.void.P_current = power;
    log.debug(`Current power set to ${power}%`);
  }

  /**
   * 更新中子通量
   * @param flux 中子通量
   */
  setNeutronFlux(flux: number) {
    this.state.neutron.flux.thermal = flux;
    log.debug(`Neutron flux set to ${flux}`);
  }

  /**
   * 计算总反应性
   */
  calculateTotalReactivity() {
    const { reactivity } = this.state;
    this.state.reactivity.total = 
      reactivity.void + 
      reactivity.xenon + 
      reactivity.controlRod + 
      reactivity.temperature;
    log.debug('Total reactivity calculated:', this.state.reactivity.total);
  }

  /**
   * 更新中子物理计算
   * @param deltaTime 时间步长
   */
  update(deltaTime: number) {
    log.time('Neutron physics update');
    
    // 计算多群扩散
    this.calculateMultiGroupDiffusion(deltaTime);
    
    // 计算氙中毒
    this.calculateXenonPoisoning(deltaTime);
    
    // 计算空泡系数
    this.calculateVoidCoefficient(deltaTime);
    
    // 计算控制棒物理
    this.calculateControlRodPhysics();
    
    // 计算总反应性
    this.calculateTotalReactivity();
    
    log.timeEnd('Neutron physics update');
  }

  /**
   * 重置状态
   */
  reset() {
    this.state = { ...initialState };
    log.info('Neutron store reset');
  }
}

// 导出单例
export const neutronStore = new NeutronStore();
