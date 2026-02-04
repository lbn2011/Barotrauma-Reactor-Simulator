import { writable, type Writable } from 'svelte/store';

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

  logs: [],
};

// 创建store
export const reactorStore: Writable<ReactorState> = writable(initialState);

// 模拟更新函数
export function updateReactorState() {
  reactorStore.update((state) => {
    if (!state.isRunning) return state;

    // 创建新状态对象，避免直接修改原状态
    const newState = JSON.parse(JSON.stringify(state));

    // 更新模拟时间
    newState.simulationTime += 1;

    // 模拟功率变化
    const powerDifference =
      newState.powerRegulation.targetPower -
      newState.powerRegulation.powerLevel;
    newState.powerRegulation.powerLevel += powerDifference * 0.05;

    // 模拟控制棒影响
    newState.powerRegulation.reactivity =
      (50 - newState.controlRods.position) * 0.02;
    newState.powerRegulation.powerLevel +=
      newState.powerRegulation.reactivity * 0.1;

    // 限制功率范围
    newState.powerRegulation.powerLevel = Math.max(
      0,
      Math.min(100, newState.powerRegulation.powerLevel)
    );

    // 模拟堆芯温度和压力
    newState.core.temperature = 250 + newState.powerRegulation.powerLevel * 0.8;
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
        pressureData: [...newState.trends.pressureData, newState.core.pressure],
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

    // 添加操作日志
    if (newState.simulationTime % 10 === 0) {
      newState.logs = [
        ...newState.logs,
        {
          timestamp: Date.now(),
          message: `Power level: ${newState.powerRegulation.powerLevel.toFixed(1)}%, Core temp: ${newState.core.temperature.toFixed(1)}°C`,
        },
      ];

      // 限制日志数量
      if (newState.logs.length > 50) {
        newState.logs.shift();
      }
    }

    return newState;
  });
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
