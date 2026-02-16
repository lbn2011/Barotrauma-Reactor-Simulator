import { writable, type Writable } from 'svelte/store';
import { getDefaultXenonParameters } from '../../models/neutron/xenonPoisoning';
import {
  calculateFlowResistance,
  calculateReynoldsNumber,
  calculatePumpPerformance,
  calculateFrictionCoefficient,
} from '../../models/thermal/flowResistance';
import { workerManager } from '../../workers/workerManager';

// 定义反应堆状态类型
export interface ReactorState {
  // 模拟控制
  isRunning: boolean;
  simulationTime: number; // 模拟时间（秒）

  // 1. 反应堆控制（吸收）棒
  controlRods: {
    position: number; // 控制棒位置（0-100%）
    insertionSpeed: number; // 插入速度
  };

  // 2. 反应堆功率调节面板
  powerRegulation: {
    powerLevel: number; // 功率水平（0-100%）
    targetPower: number; // 目标功率
    reactivity: number; // 反应性
  };

  // 3/4. 反应堆再循环泵
  recirculationPumps: {
    pump1: {
      status: boolean; // 状态
      speed: number; // 转速（0-100%）
    };
    pump2: {
      status: boolean;
      speed: number;
    };
  };

  // 5/6. 反应堆应急冷却（ERC）泵
  emergencyCoolingPumps: {
    pump1: {
      status: boolean;
      flowRate: number; // 流量
    };
    pump2: {
      status: boolean;
      flowRate: number;
    };
  };

  // 7. 反应堆排水控制
  reactorDrain: {
    status: boolean;
    flowRate: number;
  };

  // 8. 堆芯离线冷却泵
  coreCoolingPump: {
    status: boolean;
    flowRate: number;
  };

  // 9. 汽轮机控制
  turbine: {
    status: boolean;
    load: number; // 负载（0-100%）
    speed: number; // 转速
  };

  // 10. 除氧器蒸汽控制
  deaerator: {
    pressure: number;
    level: number; // 液位（0-100%）
  };

  // 11. 凝汽器真空系统
  condenserVacuum: {
    vacuumLevel: number;
    status: boolean;
  };

  // 12. 蒸汽排汽控制
  steamDump: {
    status: boolean;
    capacity: number; // 容量（0-100%）
  };

  // 13. 汽轮机辅助系统
  turbineAuxiliary: {
    lubricationOil: {
      pressure: number;
      temperature: number;
    };
    sealOil: {
      pressure: number;
    };
  };

  // 14. 凝汽器热井液位控制
  condenserHotwell: {
    level: number; // 液位（0-100%）
  };

  // 15. 凝汽器循环水泵
  condenserCirculationPumps: {
    pump1: {
      status: boolean;
      flowRate: number;
    };
    pump2: {
      status: boolean;
      flowRate: number;
    };
  };

  // 16. 补水系统
  makeUpWater: {
    status: boolean;
    flowRate: number;
  };

  // 17. 反应堆给水泵控制
  reactorFeedPumps: {
    pump1: {
      status: boolean;
      flowRate: number;
    };
    pump2: {
      status: boolean;
      flowRate: number;
    };
  };

  // 18. 数据趋势图
  trends: {
    timePoints: number[];
    powerData: number[];
    temperatureData: number[];
    pressureData: number[];
  };

  // 19. HEPA过滤器控制
  hepaFilters: {
    status: boolean;
    efficiency: number; // 效率（0-100%）
  };

  // 20. 警报CRT
  alarms: {
    active: boolean;
    messages: string[];
  };

  // 21. CRT示意图
  crtDiagram: {
    reactorStatus: string;
    systemStatus: Record<string, string>;
  };

  // 22. 凝结水系统
  condensateSystem: {
    status: boolean;
    flowRate: number;
    temperature: number;
  };

  // 核心参数
  core: {
    temperature: number; // 温度
    pressure: number; // 压力
    waterLevel: number; // 水位（0-100%）
  };

  // 物理模型参数
  physics: {
    masses: {
      M_reactor: number; // 反应堆内水的质量
      M_condenser: number; // 凝汽器内水的质量
      M_deaerator: number; // 除氧器内水的质量
    };

    neutron: {
      Xe: number; // 氙-135浓度
      I: number; // 碘-135浓度
      φ: number; // 中子通量
      Σ_f: number; // 裂变截面
    };

    reactivity: {
      void: number; // 空泡反应性
      xenon: number; // 氙中毒反应性
      controlRod: number; // 控制棒反应性
      total: number; // 总反应性
    };

    thermal: {
      flow: {
        reynoldsNumber: number; // 雷诺数
        flowRegime: 'laminar' | 'turbulent' | 'transition'; // 流动状态
        frictionCoefficient: number; // 摩擦系数
        pressureDrop: number; // 压降
      };
      pumpPerformance: {
        head: number; // 扬程
        power: number; // 功率
        efficiency: number; // 效率
      };
    };
  };

  // 汽轮机旁路系统
  steamBypass: {
    status: boolean; // 状态
    bypassPosition: number; // 旁路阀位置（0-100%）
    bypassFlow: number; // 旁路流量
    bypassCapacity: number; // 旁路容量
    pressureSetpoint: number; // 压力设定点
  };

  // 堆芯冷却剂净化系统
  corePurification: {
    status: boolean; // 状态
    flowRate: number; // 流量
    efficiency: number; // 净化效率
    impurityConcentration: number; // 杂质浓度
    maxImpurityConcentration: number; // 最大杂质浓度
    warningLevel: 'normal' | 'warning' | 'alarm'; // 警告级别
  };

  // 三冲量水位控制系统
  threeImpulseLevelControl: {
    waterLevelSetpoint: number; // 水位设定点
    adjustedFeedwaterFlow: number; // 调整后的给水流量
    levelError: number; // 水位误差
    flowError: number; // 流量误差
    waterLevelStatus:
      | 'normal'
      | 'low'
      | 'high'
      | 'critical_low'
      | 'critical_high'; // 水位状态
    alarm: boolean; // 警报
  };

  // 故障模拟系统
  faultSimulation: {
    activeFaults: any[]; // 活跃故障
    systemReliability: number; // 系统可靠性
    riskLevel: 'low' | 'medium' | 'high' | 'critical'; // 风险级别
    recommendedActions: string[]; // 推荐操作
    maintenanceLevel: number; // 维护水平
  };

  // 操作日志
  logs: {
    timestamp: number;
    message: string;
  }[];
}

// 初始状态
const initialState: ReactorState = {
  isRunning: false,
  simulationTime: 0,

  controlRods: {
    position: 50,
    insertionSpeed: 0,
  },

  powerRegulation: {
    powerLevel: 50,
    targetPower: 50,
    reactivity: 0,
  },

  recirculationPumps: {
    pump1: {
      status: true,
      speed: 70,
    },
    pump2: {
      status: true,
      speed: 70,
    },
  },

  emergencyCoolingPumps: {
    pump1: {
      status: false,
      flowRate: 0,
    },
    pump2: {
      status: false,
      flowRate: 0,
    },
  },

  reactorDrain: {
    status: false,
    flowRate: 0,
  },

  coreCoolingPump: {
    status: false,
    flowRate: 0,
  },

  turbine: {
    status: true,
    load: 50,
    speed: 3000,
  },

  deaerator: {
    pressure: 0.1,
    level: 60,
  },

  condenserVacuum: {
    vacuumLevel: 0.95,
    status: true,
  },

  steamDump: {
    status: false,
    capacity: 0,
  },

  turbineAuxiliary: {
    lubricationOil: {
      pressure: 0.3,
      temperature: 45,
    },
    sealOil: {
      pressure: 0.4,
    },
  },

  condenserHotwell: {
    level: 60,
  },

  condenserCirculationPumps: {
    pump1: {
      status: true,
      flowRate: 80,
    },
    pump2: {
      status: true,
      flowRate: 80,
    },
  },

  makeUpWater: {
    status: true,
    flowRate: 20,
  },

  reactorFeedPumps: {
    pump1: {
      status: true,
      flowRate: 70,
    },
    pump2: {
      status: true,
      flowRate: 70,
    },
  },

  trends: {
    timePoints: [],
    powerData: [],
    temperatureData: [],
    pressureData: [],
  },

  hepaFilters: {
    status: true,
    efficiency: 99.97,
  },

  alarms: {
    active: false,
    messages: [],
  },

  crtDiagram: {
    reactorStatus: 'NORMAL',
    systemStatus: {
      reactor: 'ONLINE',
      turbine: 'ONLINE',
      cooling: 'ONLINE',
      electrical: 'ONLINE',
    },
  },

  condensateSystem: {
    status: true,
    flowRate: 60,
    temperature: 30,
  },

  core: {
    temperature: 280,
    pressure: 7.0,
    waterLevel: 70,
  },

  physics: {
    masses: {
      M_reactor: 100000, // 100吨
      M_condenser: 50000, // 50吨
      M_deaerator: 30000, // 30吨
    },
    neutron: {
      Xe: 0,
      I: 0,
      φ: 1e13, // 中子通量
      Σ_f: 1e-22, // 裂变截面
    },
    reactivity: {
      void: 0,
      xenon: 0,
      controlRod: 0,
      total: 0,
    },
    thermal: {
      flow: {
        reynoldsNumber: 1e4, // 雷诺数
        flowRegime: 'turbulent', // 流动状态
        frictionCoefficient: 0.02, // 摩擦系数
        pressureDrop: 1000, // 压降
      },
      pumpPerformance: {
        head: 50, // 扬程
        power: 10000, // 功率
        efficiency: 0.8, // 效率
      },
    },
  },

  steamBypass: {
    status: false,
    bypassPosition: 0,
    bypassFlow: 0,
    bypassCapacity: 0,
    pressureSetpoint: 7.0,
  },

  corePurification: {
    status: true,
    flowRate: 50000, // 50,000 kg/h
    efficiency: 95,
    impurityConcentration: 10, // 10 ppb
    maxImpurityConcentration: 100, // 100 ppb
    warningLevel: 'normal',
  },

  threeImpulseLevelControl: {
    waterLevelSetpoint: 70, // 70%
    adjustedFeedwaterFlow: 65000, // 65,000 kg/h
    levelError: 0,
    flowError: 0,
    waterLevelStatus: 'normal',
    alarm: false,
  },

  faultSimulation: {
    activeFaults: [],
    systemReliability: 1.0,
    riskLevel: 'low',
    recommendedActions: ['继续正常运行', '保持定期维护'],
    maintenanceLevel: 90, // 90%
  },

  logs: [],
};

// 创建store
export const reactorStore: Writable<ReactorState> = writable(initialState);

// 初始化Worker
workerManager.initialize();

// 模拟更新函数
export async function updateReactorState() {
  reactorStore.update((state) => {
    if (!state.isRunning) return state;

    // 创建新状态对象，避免直接修改原状态
    const newState = JSON.parse(JSON.stringify(state));

    // 更新模拟时间
    newState.simulationTime += 1;

    return newState;
  });

  // 异步计算物理模型
  try {
    const currentState = await new Promise<ReactorState>((resolve) => {
      const unsubscribe = reactorStore.subscribe((state) => {
        resolve(state);
        unsubscribe();
      });
    });

    if (!currentState.isRunning) return;

    // 获取默认参数
    const xenonParams = getDefaultXenonParameters();

    // 准备计算参数
    const reactorCoreInput = {
      // 反应堆参数
      P_nuclear: currentState.powerRegulation.powerLevel * 30, // 转换为MW
      M_reactor: currentState.physics.masses.M_reactor,
      M_condenser: currentState.physics.masses.M_condenser,
      M_deaerator: currentState.physics.masses.M_deaerator,

      // 流量参数
      m_feedwater: currentState.reactorFeedPumps.pump1.status
        ? currentState.reactorFeedPumps.pump1.flowRate * 100
        : 0 + currentState.reactorFeedPumps.pump2.status
          ? currentState.reactorFeedPumps.pump2.flowRate * 100
          : 0,
      m_steam: currentState.powerRegulation.powerLevel * 100,
      m_condensate: currentState.condensateSystem.status
        ? currentState.condensateSystem.flowRate * 100
        : 0,
      m_cooling: 1000,
      m_steam_heating: 500,
      m_feedwater_out: currentState.reactorFeedPumps.pump1.status
        ? currentState.reactorFeedPumps.pump1.flowRate * 100
        : 0 + currentState.reactorFeedPumps.pump2.status
          ? currentState.reactorFeedPumps.pump2.flowRate * 100
          : 0,

      // 热工参数
      η_thermal: 0.33,
      m_coolant: currentState.recirculationPumps.pump1.status
        ? currentState.recirculationPumps.pump1.speed * 1000
        : 0 + currentState.recirculationPumps.pump2.status
          ? currentState.recirculationPumps.pump2.speed * 1000
          : 0,
      c_p: 4.186, // 水的比热容
      h_inlet: 2800, // 蒸汽焓
      h_outlet: 2200, // 给水焓
      η_turbine: 0.85,
      η_generator: 0.95,

      // 中子物理参数
      α_void: 4.7e-5, // 正空泡系数
      Δα: 0.01, // 空泡份额变化
      τ_delay: 10, // 10秒延迟
      Xe: currentState.physics.neutron.Xe,
      I: currentState.physics.neutron.I,
      λ_Xe: xenonParams.λ_Xe,
      λ_I: xenonParams.λ_I,
      σ_Xe: xenonParams.σ_Xe,
      φ: currentState.physics.neutron.φ,
      γ_Xe: xenonParams.γ_Xe,
      γ_I: xenonParams.γ_I,
      Σ_f: currentState.physics.neutron.Σ_f,

      // 控制棒参数
      ρ_max: 0.1,
      z: (100 - currentState.controlRods.position) * 0.01 * 4, // 假设控制棒长度为4米
      L: 4,
      ρ_graphite_effect: 0.05,

      // 汽轮机参数
      turbineStatus: currentState.turbine.status,
      steamPressure: currentState.core.pressure,
      pressureSetpoint: currentState.steamBypass.pressureSetpoint,
      maxPressure: 8.5,
      steamFlowMax: 3000, // 3000 kg/s
      currentBypassPosition: currentState.steamBypass.bypassPosition,

      // 净化系统参数
      filterEfficiency: 0.95,
      purificationFlow: currentState.corePurification.flowRate,
      maxPurificationFlow: 100000,
      impurityConcentration:
        currentState.corePurification.impurityConcentration,
      maxImpurityConcentration:
        currentState.corePurification.maxImpurityConcentration,
      purificationSystemStatus: currentState.corePurification.status,

      // 三冲量水位控制参数
      waterLevel: currentState.core.waterLevel,
      waterLevelSetpoint:
        currentState.threeImpulseLevelControl.waterLevelSetpoint,
      steamFlow: currentState.powerRegulation.powerLevel * 100,
      feedwaterFlow: currentState.reactorFeedPumps.pump1.status
        ? currentState.reactorFeedPumps.pump1.flowRate * 100
        : 0 + currentState.reactorFeedPumps.pump2.status
          ? currentState.reactorFeedPumps.pump2.flowRate * 100
          : 0,

      // 故障模拟参数
      operatingTime: currentState.simulationTime,
      componentStatus: {
        pump1: currentState.recirculationPumps.pump1.status,
        pump2: currentState.recirculationPumps.pump2.status,
        feedpump1: currentState.reactorFeedPumps.pump1.status,
        feedpump2: currentState.reactorFeedPumps.pump2.status,
        turbine: currentState.turbine.status,
      },
      environmentalFactors: {
        temperature: currentState.core.temperature,
        vibration: 0.05,
        humidity: 50,
      },
      maintenanceLevel: currentState.faultSimulation.maintenanceLevel,
      currentFaults: currentState.faultSimulation.activeFaults,

      // 时间参数
      dt: 1,
    };

    // 使用Worker计算反应堆核心模型
    const reactorCoreResult =
      await workerManager.calculateReactorCore(reactorCoreInput);

    // 计算流动阻力和泵性能
    const flowRate = currentState.recirculationPumps.pump1.status
      ? currentState.recirculationPumps.pump1.speed * 0.01
      : 0 + currentState.recirculationPumps.pump2.status
        ? currentState.recirculationPumps.pump2.speed * 0.01
        : 0;
    const fluidDensity = 998; // 水的密度
    const fluidViscosity = 1e-3; // 水的动力粘度
    const pipeDiameter = 0.5; // 管道直径
    const pipeLength = 100; // 管道长度
    const pipeRoughness = 0.0001; // 管道粗糙度
    const pumpEfficiency = 0.8; // 泵效率
    const gravity = 9.81; // 重力加速度

    // 计算流速
    const pipeArea = Math.PI * Math.pow(pipeDiameter / 2, 2);
    const flowVelocity = flowRate / pipeArea;

    // 计算雷诺数
    const reynoldsResult = calculateReynoldsNumber({
      ρ: fluidDensity,
      v: flowVelocity,
      D: pipeDiameter,
      μ: fluidViscosity,
    });

    // 计算摩擦系数
    const frictionCoeff = calculateFrictionCoefficient(
      reynoldsResult.Re,
      pipeRoughness,
      pipeDiameter
    );

    // 计算流动阻力
    const flowResistanceResult = calculateFlowResistance({
      f: frictionCoeff,
      L: pipeLength,
      D: pipeDiameter,
      ρ: fluidDensity,
      v: flowVelocity,
    });

    // 计算泵性能
    const pumpPerformanceResult = calculatePumpPerformance({
      H_max: 100,
      k: 1000,
      Q: flowRate,
      ρ: fluidDensity,
      g: gravity,
      η_pump: pumpEfficiency,
    });

    // 更新状态
    reactorStore.update((state) => {
      if (!state.isRunning) return state;

      const newState = JSON.parse(JSON.stringify(state));

      // 更新质量参数
      newState.physics.masses = reactorCoreResult.massBalance.newMasses;

      // 更新中子物理参数
      newState.physics.neutron.Xe =
        reactorCoreResult.neutronPhysics.xenonPoisoning.Xe_new;
      newState.physics.neutron.I =
        reactorCoreResult.neutronPhysics.xenonPoisoning.I_new;

      // 更新反应性参数
      newState.physics.reactivity.void =
        reactorCoreResult.neutronPhysics.voidCoefficient.ρ_void;
      newState.physics.reactivity.xenon =
        reactorCoreResult.neutronPhysics.xenonPoisoning.ρ_Xe;
      newState.physics.reactivity.controlRod =
        reactorCoreResult.neutronPhysics.controlRod.ρ_rod;
      newState.physics.reactivity.total = reactorCoreResult.totalReactivity;

      // 更新热工参数
      newState.physics.thermal.flow.reynoldsNumber = reynoldsResult.Re;
      newState.physics.thermal.flow.flowRegime = reynoldsResult.flowRegime;
      newState.physics.thermal.flow.frictionCoefficient = frictionCoeff;
      newState.physics.thermal.flow.pressureDrop = flowResistanceResult.ΔP;
      newState.physics.thermal.pumpPerformance.head = pumpPerformanceResult.H;
      newState.physics.thermal.pumpPerformance.power =
        pumpPerformanceResult.P_pump;
      newState.physics.thermal.pumpPerformance.efficiency = pumpEfficiency;

      // 更新汽轮机旁路系统
      newState.steamBypass = {
        ...newState.steamBypass,
        bypassPosition: reactorCoreResult.steamBypass.bypassPosition,
        bypassFlow: reactorCoreResult.steamBypass.bypassFlow,
        bypassCapacity: reactorCoreResult.steamBypass.bypassCapacity,
        status: reactorCoreResult.steamBypass.isActive,
      };

      // 更新堆芯冷却剂净化系统
      newState.corePurification = {
        ...newState.corePurification,
        efficiency:
          reactorCoreResult.corePurification.purificationEfficiency * 100,
        impurityConcentration:
          reactorCoreResult.corePurification.filteredImpurityConcentration,
        warningLevel: reactorCoreResult.corePurification.warningLevel,
      };

      // 更新三冲量水位控制系统
      newState.threeImpulseLevelControl = {
        ...newState.threeImpulseLevelControl,
        adjustedFeedwaterFlow:
          reactorCoreResult.threeImpulseLevelControl.adjustedFeedwaterFlow,
        levelError: reactorCoreResult.threeImpulseLevelControl.levelError,
        flowError: reactorCoreResult.threeImpulseLevelControl.flowError,
        waterLevelStatus:
          reactorCoreResult.threeImpulseLevelControl.waterLevelStatus,
        alarm: reactorCoreResult.threeImpulseLevelControl.alarm,
      };

      // 更新故障模拟系统
      newState.faultSimulation = {
        ...newState.faultSimulation,
        activeFaults: reactorCoreResult.faultSimulation.activeFaults,
        systemReliability: reactorCoreResult.faultSimulation.systemReliability,
        riskLevel: reactorCoreResult.faultSimulation.riskLevel,
        recommendedActions:
          reactorCoreResult.faultSimulation.recommendedActions,
      };

      // 更新功率
      newState.powerRegulation.powerLevel = reactorCoreResult.newPower / 30;
      newState.powerRegulation.reactivity = reactorCoreResult.totalReactivity;

      // 限制功率范围
      newState.powerRegulation.powerLevel = Math.max(
        0,
        Math.min(100, newState.powerRegulation.powerLevel)
      );

      // 模拟堆芯温度和压力
      newState.core.temperature =
        250 + newState.powerRegulation.powerLevel * 0.8;
      newState.core.pressure = 6.5 + newState.powerRegulation.powerLevel * 0.01;

      // 更新数据趋势
      if (newState.simulationTime % 5 === 0) {
        // 创建新的趋势数组，避免直接修改原数组
        newState.trends = {
          timePoints: [...newState.trends.timePoints, newState.simulationTime],
          powerData: [
            ...newState.trends.powerData,
            newState.powerRegulation.powerLevel,
          ],
          temperatureData: [
            ...newState.trends.temperatureData,
            newState.core.temperature,
          ],
          pressureData: [
            ...newState.trends.pressureData,
            newState.core.pressure,
          ],
        };

        // 限制数据点数量
        if (newState.trends.timePoints.length > 100) {
          newState.trends.timePoints.shift();
          newState.trends.powerData.shift();
          newState.trends.temperatureData.shift();
          newState.trends.pressureData.shift();
        }
      }

      // 模拟警报
      if (newState.core.temperature > 320) {
        newState.alarms.active = true;
        if (!newState.alarms.messages.includes('CORE TEMPERATURE HIGH')) {
          newState.alarms.messages = [
            ...newState.alarms.messages,
            'CORE TEMPERATURE HIGH',
          ];
        }
      }

      if (newState.core.pressure > 7.5) {
        newState.alarms.active = true;
        if (!newState.alarms.messages.includes('CORE PRESSURE HIGH')) {
          newState.alarms.messages = [
            ...newState.alarms.messages,
            'CORE PRESSURE HIGH',
          ];
        }
      }

      // 三冲量水位控制系统警报
      if (newState.threeImpulseLevelControl.alarm) {
        newState.alarms.active = true;
        const levelStatus = newState.threeImpulseLevelControl.waterLevelStatus;
        const alarmMessage = `WATER LEVEL ${levelStatus.toUpperCase()}`;
        if (!newState.alarms.messages.includes(alarmMessage)) {
          newState.alarms.messages = [
            ...newState.alarms.messages,
            alarmMessage,
          ];
        }
      }

      // 故障模拟系统警报
      if (reactorCoreResult.faultSimulation.newFaults.length > 0) {
        newState.alarms.active = true;
        reactorCoreResult.faultSimulation.newFaults.forEach((fault: any) => {
          const alarmMessage = `FAULT: ${fault.description}`;
          if (!newState.alarms.messages.includes(alarmMessage)) {
            newState.alarms.messages = [
              ...newState.alarms.messages,
              alarmMessage,
            ];
          }
        });
      }

      // 添加操作日志
      if (newState.simulationTime % 10 === 0) {
        newState.logs = [
          ...newState.logs,
          {
            timestamp: Date.now(),
            message: `Power level: ${newState.powerRegulation.powerLevel.toFixed(1)}%, Core temp: ${newState.core.temperature.toFixed(1)}°C, Reactivity: ${newState.physics.reactivity.total.toFixed(4)}, Flow regime: ${newState.physics.thermal.flow.flowRegime}, Pressure drop: ${(newState.physics.thermal.flow.pressureDrop / 1000).toFixed(2)} kPa, Bypass position: ${newState.steamBypass.bypassPosition.toFixed(1)}%, Purification efficiency: ${newState.corePurification.efficiency.toFixed(1)}%, Water level status: ${newState.threeImpulseLevelControl.waterLevelStatus}, Risk level: ${newState.faultSimulation.riskLevel}`,
          },
        ];

        // 限制日志数量
        if (newState.logs.length > 50) {
          newState.logs.shift();
        }
      }

      return newState;
    });
  } catch (error) {
    console.error('Error in updateReactorState:', error);
  }
}

// 控制模拟的函数
export function startSimulation() {
  reactorStore.update((state) => ({
    ...state,
    isRunning: true,
  }));

  // 添加启动日志
  reactorStore.update((state) => ({
    ...state,
    logs: [
      ...state.logs,
      {
        timestamp: Date.now(),
        message: 'Simulation started',
      },
    ],
  }));
}

export function stopSimulation() {
  reactorStore.update((state) => ({
    ...state,
    isRunning: false,
  }));

  // 添加停止日志
  reactorStore.update((state) => ({
    ...state,
    logs: [
      ...state.logs,
      {
        timestamp: Date.now(),
        message: 'Simulation stopped',
      },
    ],
  }));
}

export function resetSimulation() {
  reactorStore.set(initialState);
}

// 控制棒操作函数
export function setControlRodPosition(position: number) {
  reactorStore.update((state) => ({
    ...state,
    controlRods: {
      ...state.controlRods,
      position: Math.max(0, Math.min(100, position)),
    },
  }));
}

// 功率调节函数
export function setTargetPower(power: number) {
  reactorStore.update((state) => ({
    ...state,
    powerRegulation: {
      ...state.powerRegulation,
      targetPower: Math.max(0, Math.min(100, power)),
    },
  }));
}

// 泵控制函数
export function toggleRecirculationPump(pumpNumber: 1 | 2) {
  reactorStore.update((state) => ({
    ...state,
    recirculationPumps: {
      ...state.recirculationPumps,
      [`pump${pumpNumber}`]: {
        ...state.recirculationPumps[`pump${pumpNumber}`],
        status: !state.recirculationPumps[`pump${pumpNumber}`].status,
      },
    },
  }));
}

export function setRecirculationPumpSpeed(pumpNumber: 1 | 2, speed: number) {
  reactorStore.update((state) => ({
    ...state,
    recirculationPumps: {
      ...state.recirculationPumps,
      [`pump${pumpNumber}`]: {
        ...state.recirculationPumps[`pump${pumpNumber}`],
        speed: Math.max(0, Math.min(100, speed)),
      },
    },
  }));
}

// 应急冷却泵控制函数
export function toggleEmergencyCoolingPump(pumpNumber: 1 | 2) {
  reactorStore.update((state) => ({
    ...state,
    emergencyCoolingPumps: {
      ...state.emergencyCoolingPumps,
      [`pump${pumpNumber}`]: {
        ...state.emergencyCoolingPumps[`pump${pumpNumber}`],
        status: !state.emergencyCoolingPumps[`pump${pumpNumber}`].status,
      },
    },
  }));
}

export function setEmergencyCoolingPumpFlowRate(
  pumpNumber: 1 | 2,
  flowRate: number
) {
  reactorStore.update((state) => ({
    ...state,
    emergencyCoolingPumps: {
      ...state.emergencyCoolingPumps,
      [`pump${pumpNumber}`]: {
        ...state.emergencyCoolingPumps[`pump${pumpNumber}`],
        flowRate: Math.max(0, Math.min(100, flowRate)),
      },
    },
  }));
}

// 反应堆排水控制函数
export function toggleReactorDrain() {
  reactorStore.update((state) => ({
    ...state,
    reactorDrain: {
      ...state.reactorDrain,
      status: !state.reactorDrain.status,
    },
  }));
}

export function setReactorDrainFlowRate(flowRate: number) {
  reactorStore.update((state) => ({
    ...state,
    reactorDrain: {
      ...state.reactorDrain,
      flowRate: Math.max(0, Math.min(100, flowRate)),
    },
  }));
}

// 堆芯离线冷却泵控制函数
export function toggleCoreCoolingPump() {
  reactorStore.update((state) => ({
    ...state,
    coreCoolingPump: {
      ...state.coreCoolingPump,
      status: !state.coreCoolingPump.status,
    },
  }));
}

export function setCoreCoolingPumpFlowRate(flowRate: number) {
  reactorStore.update((state) => ({
    ...state,
    coreCoolingPump: {
      ...state.coreCoolingPump,
      flowRate: Math.max(0, Math.min(100, flowRate)),
    },
  }));
}

// 汽轮机控制函数
export function toggleTurbine() {
  reactorStore.update((state) => ({
    ...state,
    turbine: {
      ...state.turbine,
      status: !state.turbine.status,
    },
  }));
}

export function setTurbineLoad(load: number) {
  reactorStore.update((state) => ({
    ...state,
    turbine: {
      ...state.turbine,
      load: Math.max(0, Math.min(100, load)),
    },
  }));
}

// 除氧器控制函数
export function setDeaeratorPressure(pressure: number) {
  reactorStore.update((state) => ({
    ...state,
    deaerator: {
      ...state.deaerator,
      pressure: Math.max(0, pressure),
    },
  }));
}

export function setDeaeratorLevel(level: number) {
  reactorStore.update((state) => ({
    ...state,
    deaerator: {
      ...state.deaerator,
      level: Math.max(0, Math.min(100, level)),
    },
  }));
}

// 凝汽器真空系统控制函数
export function toggleCondenserVacuum() {
  reactorStore.update((state) => ({
    ...state,
    condenserVacuum: {
      ...state.condenserVacuum,
      status: !state.condenserVacuum.status,
    },
  }));
}

export function setCondenserVacuumLevel(vacuumLevel: number) {
  reactorStore.update((state) => ({
    ...state,
    condenserVacuum: {
      ...state.condenserVacuum,
      vacuumLevel: Math.max(0, Math.min(1, vacuumLevel)),
    },
  }));
}

// 蒸汽排汽控制函数
export function toggleSteamDump() {
  reactorStore.update((state) => ({
    ...state,
    steamDump: {
      ...state.steamDump,
      status: !state.steamDump.status,
    },
  }));
}

export function setSteamDumpCapacity(capacity: number) {
  reactorStore.update((state) => ({
    ...state,
    steamDump: {
      ...state.steamDump,
      capacity: Math.max(0, Math.min(100, capacity)),
    },
  }));
}

// 汽轮机辅助系统控制函数
export function setLubricationOilPressure(pressure: number) {
  reactorStore.update((state) => ({
    ...state,
    turbineAuxiliary: {
      ...state.turbineAuxiliary,
      lubricationOil: {
        ...state.turbineAuxiliary.lubricationOil,
        pressure: Math.max(0, pressure),
      },
    },
  }));
}

export function setLubricationOilTemperature(temperature: number) {
  reactorStore.update((state) => ({
    ...state,
    turbineAuxiliary: {
      ...state.turbineAuxiliary,
      lubricationOil: {
        ...state.turbineAuxiliary.lubricationOil,
        temperature: Math.max(0, temperature),
      },
    },
  }));
}

export function setSealOilPressure(pressure: number) {
  reactorStore.update((state) => ({
    ...state,
    turbineAuxiliary: {
      ...state.turbineAuxiliary,
      sealOil: {
        ...state.turbineAuxiliary.sealOil,
        pressure: Math.max(0, pressure),
      },
    },
  }));
}

// 凝汽器热井液位控制函数
export function setCondenserHotwellLevel(level: number) {
  reactorStore.update((state) => ({
    ...state,
    condenserHotwell: {
      level: Math.max(0, Math.min(100, level)),
    },
  }));
}

// 凝汽器循环水泵控制函数
export function toggleCondenserCirculationPump(pumpNumber: 1 | 2) {
  reactorStore.update((state) => ({
    ...state,
    condenserCirculationPumps: {
      ...state.condenserCirculationPumps,
      [`pump${pumpNumber}`]: {
        ...state.condenserCirculationPumps[`pump${pumpNumber}`],
        status: !state.condenserCirculationPumps[`pump${pumpNumber}`].status,
      },
    },
  }));
}

export function setCondenserCirculationPumpFlowRate(
  pumpNumber: 1 | 2,
  flowRate: number
) {
  reactorStore.update((state) => ({
    ...state,
    condenserCirculationPumps: {
      ...state.condenserCirculationPumps,
      [`pump${pumpNumber}`]: {
        ...state.condenserCirculationPumps[`pump${pumpNumber}`],
        flowRate: Math.max(0, Math.min(100, flowRate)),
      },
    },
  }));
}

// 补水系统控制函数
export function toggleMakeUpWater() {
  reactorStore.update((state) => ({
    ...state,
    makeUpWater: {
      ...state.makeUpWater,
      status: !state.makeUpWater.status,
    },
  }));
}

export function setMakeUpWaterFlowRate(flowRate: number) {
  reactorStore.update((state) => ({
    ...state,
    makeUpWater: {
      ...state.makeUpWater,
      flowRate: Math.max(0, Math.min(100, flowRate)),
    },
  }));
}

// 反应堆给水泵控制函数
export function toggleReactorFeedPump(pumpNumber: 1 | 2) {
  reactorStore.update((state) => ({
    ...state,
    reactorFeedPumps: {
      ...state.reactorFeedPumps,
      [`pump${pumpNumber}`]: {
        ...state.reactorFeedPumps[`pump${pumpNumber}`],
        status: !state.reactorFeedPumps[`pump${pumpNumber}`].status,
      },
    },
  }));
}

export function setReactorFeedPumpFlowRate(
  pumpNumber: 1 | 2,
  flowRate: number
) {
  reactorStore.update((state) => ({
    ...state,
    reactorFeedPumps: {
      ...state.reactorFeedPumps,
      [`pump${pumpNumber}`]: {
        ...state.reactorFeedPumps[`pump${pumpNumber}`],
        flowRate: Math.max(0, Math.min(100, flowRate)),
      },
    },
  }));
}

// HEPA过滤器控制函数
export function toggleHepaFilters() {
  reactorStore.update((state) => ({
    ...state,
    hepaFilters: {
      ...state.hepaFilters,
      status: !state.hepaFilters.status,
    },
  }));
}

export function setHepaFilterEfficiency(efficiency: number) {
  reactorStore.update((state) => ({
    ...state,
    hepaFilters: {
      ...state.hepaFilters,
      efficiency: Math.max(0, Math.min(100, efficiency)),
    },
  }));
}

// 凝结水系统控制函数
export function toggleCondensateSystem() {
  reactorStore.update((state) => ({
    ...state,
    condensateSystem: {
      ...state.condensateSystem,
      status: !state.condensateSystem.status,
    },
  }));
}

export function setCondensateSystemFlowRate(flowRate: number) {
  reactorStore.update((state) => ({
    ...state,
    condensateSystem: {
      ...state.condensateSystem,
      flowRate: Math.max(0, Math.min(100, flowRate)),
    },
  }));
}

export function setCondensateSystemTemperature(temperature: number) {
  reactorStore.update((state) => ({
    ...state,
    condensateSystem: {
      ...state.condensateSystem,
      temperature: Math.max(0, temperature),
    },
  }));
}

// 汽轮机旁路系统控制函数
export function toggleSteamBypass() {
  reactorStore.update((state) => ({
    ...state,
    steamBypass: {
      ...state.steamBypass,
      status: !state.steamBypass.status,
    },
  }));
}

export function setSteamBypassPressureSetpoint(pressureSetpoint: number) {
  reactorStore.update((state) => ({
    ...state,
    steamBypass: {
      ...state.steamBypass,
      pressureSetpoint: Math.max(6.0, Math.min(8.0, pressureSetpoint)),
    },
  }));
}

// 堆芯冷却剂净化系统控制函数
export function toggleCorePurification() {
  reactorStore.update((state) => ({
    ...state,
    corePurification: {
      ...state.corePurification,
      status: !state.corePurification.status,
    },
  }));
}

export function setCorePurificationFlowRate(flowRate: number) {
  reactorStore.update((state) => ({
    ...state,
    corePurification: {
      ...state.corePurification,
      flowRate: Math.max(0, Math.min(100000, flowRate)),
    },
  }));
}

// 三冲量水位控制系统控制函数
export function setWaterLevelSetpoint(setpoint: number) {
  reactorStore.update((state) => ({
    ...state,
    threeImpulseLevelControl: {
      ...state.threeImpulseLevelControl,
      waterLevelSetpoint: Math.max(45, Math.min(90, setpoint)),
    },
  }));
}

// 故障模拟系统控制函数
export function setMaintenanceLevel(level: number) {
  reactorStore.update((state) => ({
    ...state,
    faultSimulation: {
      ...state.faultSimulation,
      maintenanceLevel: Math.max(0, Math.min(100, level)),
    },
  }));
}

// 存档和加载函数
export function saveState(): string {
  let state;
  reactorStore.subscribe((s) => (state = s))();
  return btoa(JSON.stringify(state));
}

export function loadState(saveCode: string) {
  try {
    const state = JSON.parse(atob(saveCode));
    reactorStore.set(state);
    return true;
  } catch (error) {
    console.error('Failed to load state:', error);
    return false;
  }
}
