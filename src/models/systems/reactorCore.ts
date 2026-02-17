// 反应堆核心模型

import { calculateMassBalance } from '../thermal/massBalance';
import { calculateEnergyBalance } from '../thermal/energyBalance';

import { calculateVoidCoefficient } from '../neutron/voidCoefficient';
import { calculateXenonPoisoning } from '../neutron/xenonPoisoning';
import { calculateControlRodPhysics } from '../neutron/controlRodPhysics';
import { calculateSteamBypass } from './steamBypass';
import { calculateCorePurification } from './corePurification';
import { simulateFaults } from './faultSimulation';
import { calculateThreeImpulseLevelControl } from './control/threeImpulseLevelControl';

interface ReactorCoreInput {
  // 反应堆参数
  P_nuclear: number; // 核功率
  M_reactor: number; // 反应堆内水的质量
  M_condenser: number; // 凝汽器内水的质量
  M_deaerator: number; // 除氧器内水的质量

  // 流量参数
  m_feedwater: number; // 给水流量
  m_steam: number; // 蒸汽流量
  m_condensate: number; // 凝结水流量
  m_cooling: number; // 冷却水带来的质量变化
  m_steam_heating: number; // 加热蒸汽流量
  m_feedwater_out: number; // 出口给水流量

  // 热工参数
  η_thermal: number; // 热效率
  m_coolant: number; // 冷却剂流量
  c_p: number; // 冷却剂比热容
  h_inlet: number; // 汽轮机入口焓
  h_outlet: number; // 汽轮机出口焓
  η_turbine: number; // 汽轮机效率
  η_generator: number; // 发电机效率

  // 中子物理参数
  α_void: number; // 空泡系数
  Δα: number; // 空泡份额变化
  τ_delay: number; // 反馈延迟时间
  Xe: number; // 氙-135浓度
  I: number; // 碘-135浓度
  λ_Xe: number; // 氙-135衰变常数
  λ_I: number; // 碘-135衰变常数
  σ_Xe: number; // 氙-135中子俘获截面
  φ: number; // 中子通量
  γ_Xe: number; // 氙-135产额
  γ_I: number; // 碘-135产额
  Σ_f: number; // 裂变截面

  // 控制棒参数
  ρ_max: number; // 控制棒完全插入时的最大反应性
  z: number; // 控制棒插入深度
  L: number; // 控制棒总长度
  ρ_graphite_effect: number; // 石墨尖端效应反应性

  // 汽轮机参数
  turbineStatus: boolean; // 汽轮机状态
  steamPressure: number; // 蒸汽压力
  pressureSetpoint: number; // 压力设定点
  maxPressure: number; // 最大压力
  steamFlowMax: number; // 最大蒸汽流量
  currentBypassPosition: number; // 当前旁路阀位置

  // 净化系统参数
  filterEfficiency: number; // 过滤器效率
  purificationFlow: number; // 净化系统流量
  maxPurificationFlow: number; // 最大净化流量
  impurityConcentration: number; // 杂质浓度
  maxImpurityConcentration: number; // 最大杂质浓度
  purificationSystemStatus: boolean; // 净化系统状态

  // 三冲量水位控制参数
  waterLevel: number; // 水位
  waterLevelSetpoint: number; // 水位设定点
  steamFlow: number; // 蒸汽流量
  feedwaterFlow: number; // 给水流量

  // 故障模拟参数
  operatingTime: number; // 运行时间
  componentStatus: Record<string, boolean>; // 组件状态
  environmentalFactors: {
    temperature: number; // 环境温度
    vibration: number; // 振动水平
    humidity: number; // 湿度
  };
  maintenanceLevel: number; // 维护水平
  currentFaults: any[]; // 当前故障

  // 时间参数
  dt: number; // 时间步长
}

interface ReactorCoreOutput {
  // 质量平衡结果
  massBalance: {
    dM_reactor: number;
    dM_condenser: number;
    dM_deaerator: number;
    newMasses: {
      M_reactor: number;
      M_condenser: number;
      M_deaerator: number;
    };
  };

  // 能量平衡结果
  energyBalance: {
    Q_thermal: number;
    m_steam: number;
    ΔT_coolant: number;
    P_mechanical: number;
    P_electrical: number;
  };

  // 中子物理结果
  neutronPhysics: {
    voidCoefficient: {
      ρ_void: number;
      P_new: number;
      P_delayed: number;
    };
    xenonPoisoning: {
      Xe_new: number;
      I_new: number;
      ρ_Xe: number;
    };
    controlRod: {
      ρ_rod: number;
      ρ_tip: number;
      ρ_absorption: number;
    };
  };

  // 汽轮机旁路系统结果
  steamBypass: {
    bypassPosition: number;
    bypassFlow: number;
    bypassCapacity: number;
    isActive: boolean;
  };

  // 堆芯冷却剂净化系统结果
  corePurification: {
    purificationEfficiency: number;
    filteredImpurityConcentration: number;
    impurityRemovalRate: number;
    systemStatus: boolean;
    isEffective: boolean;
    warningLevel: 'normal' | 'warning' | 'alarm';
  };

  // 三冲量水位控制系统结果
  threeImpulseLevelControl: {
    adjustedFeedwaterFlow: number;
    levelError: number;
    flowError: number;
    waterLevelStatus:
      | 'normal'
      | 'low'
      | 'high'
      | 'critical_low'
      | 'critical_high';
    alarm: boolean;
  };

  // 故障模拟系统结果
  faultSimulation: {
    activeFaults: any[];
    newFaults: any[];
    resolvedFaults: any[];
    systemReliability: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendedActions: string[];
  };

  // 总反应性
  totalReactivity: number;

  // 新的功率
  newPower: number;
}

/**
 * 计算反应堆核心模型
 * @param input 输入参数
 * @returns 反应堆核心模型结果
 */
export function calculateReactorCore (
  input: ReactorCoreInput
): ReactorCoreOutput {
  // 计算质量平衡
  const massBalanceResult = calculateMassBalance({
    M_reactor: input.M_reactor,
    M_condenser: input.M_condenser,
    M_deaerator: input.M_deaerator,
    m_feedwater: input.m_feedwater,
    m_steam: input.m_steam,
    m_condensate: input.m_condensate,
    m_cooling: input.m_cooling,
    m_steam_heating: input.m_steam_heating,
    m_feedwater_out: input.m_feedwater_out,
  });

  // 计算能量平衡
  const energyBalanceResult = calculateEnergyBalance({
    P_nuclear: input.P_nuclear,
    η_thermal: input.η_thermal,
    h_steam: input.h_inlet,
    h_feedwater: input.h_outlet,
    m_coolant: input.m_coolant,
    c_p: input.c_p,
    h_inlet: input.h_inlet,
    h_outlet: input.h_outlet,
    η_turbine: input.η_turbine,
    η_generator: input.η_generator,
  });

  // 计算空泡系数效应
  const voidCoefficientResult = calculateVoidCoefficient({
    α_void: input.α_void,
    Δα: input.Δα,
    P_current: input.P_nuclear,
    τ_delay: input.τ_delay,
  });

  // 计算氙-135中毒效应
  const xenonPoisoningResult = calculateXenonPoisoning({
    Xe: input.Xe,
    I: input.I,
    λ_Xe: input.λ_Xe,
    λ_I: input.λ_I,
    σ_Xe: input.σ_Xe,
    φ: input.φ,
    γ_Xe: input.γ_Xe,
    γ_I: input.γ_I,
    Σ_f: input.Σ_f,
    dt: input.dt,
  });

  // 计算控制棒物理特性
  const controlRodResult = calculateControlRodPhysics({
    ρ_max: input.ρ_max,
    z: input.z,
    L: input.L,
    ρ_graphite_effect: input.ρ_graphite_effect,
  });

  // 计算汽轮机旁路系统
  const steamBypassResult = calculateSteamBypass({
    turbineStatus: input.turbineStatus,
    steamPressure: input.steamPressure,
    pressureSetpoint: input.pressureSetpoint,
    maxPressure: input.maxPressure,
    steamFlowMax: input.steamFlowMax,
    currentBypassPosition: input.currentBypassPosition,
  });

  // 计算堆芯冷却剂净化系统
  const corePurificationResult = calculateCorePurification({
    filterEfficiency: input.filterEfficiency,
    actualFlow: input.purificationFlow,
    maxFlow: input.maxPurificationFlow,
    impurityConcentration: input.impurityConcentration,
    maxImpurityConcentration: input.maxImpurityConcentration,
    systemStatus: input.purificationSystemStatus,
  });

  // 计算三冲量水位控制系统
  const threeImpulseLevelControlResult = calculateThreeImpulseLevelControl({
    waterLevel: input.waterLevel,
    waterLevelSetpoint: input.waterLevelSetpoint,
    steamFlow: input.steamFlow,
    feedwaterFlow: input.feedwaterFlow,
  });

  // 计算故障模拟系统
  const faultSimulationResult = simulateFaults({
    currentFaults: input.currentFaults,
    operatingTime: input.operatingTime,
    componentStatus: input.componentStatus,
    environmentalFactors: input.environmentalFactors,
    maintenanceLevel: input.maintenanceLevel,
  });

  // 计算总反应性
  const totalReactivity =
    voidCoefficientResult.ρ_void +
    xenonPoisoningResult.ρ_Xe +
    controlRodResult.ρ_rod;

  // 计算新的功率
  const newPower = input.P_nuclear * (1 + totalReactivity);

  return {
    massBalance: massBalanceResult,
    energyBalance: energyBalanceResult,
    neutronPhysics: {
      voidCoefficient: voidCoefficientResult,
      xenonPoisoning: xenonPoisoningResult,
      controlRod: controlRodResult,
    },
    steamBypass: steamBypassResult,
    corePurification: corePurificationResult,
    threeImpulseLevelControl: threeImpulseLevelControlResult,
    faultSimulation: faultSimulationResult,
    totalReactivity,
    newPower,
  };
}
