import { makeAutoObservable } from 'mobx';

// 控制棒状态接口
interface ControlRodState {
  position: number;
  isMoving: boolean;
  speed: number;
}

// 泵状态接口
interface PumpState {
  status: 'off' | 'on';
  speed: number;
  flowRate: number;
  pressure: number;
}

// 汽轮机状态接口
interface TurbineState {
  status: 'off' | 'on';
  load: number;
  speed: number;
  powerOutput: number;
}

// 蒸汽系统状态接口
interface SteamSystemState {
  pressure: number;
  temperature: number;
  flowRate: number;
  valvePosition: number;
}

// 给水系统状态接口
interface FeedwaterSystemState {
  flowRate: number;
  pressure: number;
  temperature: number;
  valvePosition: number;
}

// 反应堆系统状态接口
interface ReactorSystemState {
  // 控制棒系统
  controlRods: ControlRodState;

  // 再循环泵系统
  recirculationPumps: {
    pump1: PumpState;
    pump2: PumpState;
    pump3: PumpState;
  };

  // 应急冷却泵系统
  emergencyCoolingPumps: {
    pump1: PumpState;
    pump2: PumpState;
    dieselPump: PumpState;
  };

  // 堆芯离线冷却泵系统
  offlineCoolingPumps: {
    pump1: PumpState;
    pump2: PumpState;
  };

  // 汽轮机系统
  turbine: TurbineState;

  // 蒸汽系统
  steamSystem: SteamSystemState;

  // 给水系统
  feedwaterSystem: FeedwaterSystemState;

  // 凝汽器系统
  condenser: {
    vacuum: number;
    hotwellLevel: number;
    circulationPumps: {
      pump1: PumpState;
      pump2: PumpState;
    };
  };

  // 除氧器系统
  deaerator: {
    level: number;
    pressure: number;
    temperature: number;
  };

  // 凝结水系统
  condensateSystem: {
    pumps: {
      pump1: PumpState;
      pump2: PumpState;
      pump3: PumpState;
    };
    polishers: {
      polisher1: {
        status: 'off' | 'on';
      };
      polisher2: {
        status: 'off' | 'on';
      };
    };
  };

  // 补水系统
  makeupWaterSystem: {
    flowRate: number;
    valvePosition: number;
  };

  // HEPA过滤器系统
  hepaFilter: {
    status: 'off' | 'on';
    flowRate: number;
    pressureDrop: number;
  };
}

// 初始状态
const initialState: ReactorSystemState = {
  // 控制棒系统
  controlRods: {
    position: 100,
    isMoving: false,
    speed: 10,
  },

  // 再循环泵系统
  recirculationPumps: {
    pump1: {
      status: 'off',
      speed: 0,
      flowRate: 0,
      pressure: 0,
    },
    pump2: {
      status: 'off',
      speed: 0,
      flowRate: 0,
      pressure: 0,
    },
    pump3: {
      status: 'off',
      speed: 0,
      flowRate: 0,
      pressure: 0,
    },
  },

  // 应急冷却泵系统
  emergencyCoolingPumps: {
    pump1: {
      status: 'off',
      speed: 0,
      flowRate: 0,
      pressure: 0,
    },
    pump2: {
      status: 'off',
      speed: 0,
      flowRate: 0,
      pressure: 0,
    },
    dieselPump: {
      status: 'off',
      speed: 0,
      flowRate: 0,
      pressure: 0,
    },
  },

  // 堆芯离线冷却泵系统
  offlineCoolingPumps: {
    pump1: {
      status: 'off',
      speed: 0,
      flowRate: 0,
      pressure: 0,
    },
    pump2: {
      status: 'off',
      speed: 0,
      flowRate: 0,
      pressure: 0,
    },
  },

  // 汽轮机系统
  turbine: {
    status: 'off',
    load: 0,
    speed: 0,
    powerOutput: 0,
  },

  // 蒸汽系统
  steamSystem: {
    pressure: 6.0,
    temperature: 275.0,
    flowRate: 0,
    valvePosition: 0,
  },

  // 给水系统
  feedwaterSystem: {
    flowRate: 0,
    pressure: 7.0,
    temperature: 200.0,
    valvePosition: 0,
  },

  // 凝汽器系统
  condenser: {
    vacuum: 0.02,
    hotwellLevel: 50,
    circulationPumps: {
      pump1: {
        status: 'off',
        speed: 0,
        flowRate: 0,
        pressure: 0,
      },
      pump2: {
        status: 'off',
        speed: 0,
        flowRate: 0,
        pressure: 0,
      },
    },
  },

  // 除氧器系统
  deaerator: {
    level: 50,
    pressure: 0.5,
    temperature: 150.0,
  },

  // 凝结水系统
  condensateSystem: {
    pumps: {
      pump1: {
        status: 'off',
        speed: 0,
        flowRate: 0,
        pressure: 0,
      },
      pump2: {
        status: 'off',
        speed: 0,
        flowRate: 0,
        pressure: 0,
      },
      pump3: {
        status: 'off',
        speed: 0,
        flowRate: 0,
        pressure: 0,
      },
    },
    polishers: {
      polisher1: {
        status: 'off',
      },
      polisher2: {
        status: 'off',
      },
    },
  },

  // 补水系统
  makeupWaterSystem: {
    flowRate: 0,
    valvePosition: 0,
  },

  // HEPA过滤器系统
  hepaFilter: {
    status: 'off',
    flowRate: 0,
    pressureDrop: 0,
  },
};

// 反应堆系统Store
export class ReactorSystemStore {
  // 状态
  state: ReactorSystemState;

  // 构造函数
  constructor () {
    this.state = { ...initialState };
    makeAutoObservable(this);
  }

  // 设置控制棒位置
  setControlRodPosition (position: number) {
    this.state.controlRods.position = Math.max(0, Math.min(100, position));
  }

  // 切换控制棒移动状态
  toggleControlRodMovement (isMoving: boolean) {
    this.state.controlRods.isMoving = isMoving;
  }

  // 设置泵状态
  setPumpStatus (system: string, pump: string, status: 'off' | 'on') {
    if (
      system in this.state &&
      pump in this.state[system as keyof ReactorSystemState]
    ) {
      const pumpState = this.state[system as keyof ReactorSystemState][
        pump as keyof (typeof this.state)[keyof ReactorSystemState]
      ] as PumpState;
      if (pumpState) {
        pumpState.status = status;
        if (status === 'on') {
          pumpState.speed = 100;
          pumpState.flowRate = 1000;
          pumpState.pressure = 5.0;
        } else {
          pumpState.speed = 0;
          pumpState.flowRate = 0;
          pumpState.pressure = 0;
        }
      }
    }
  }

  // 设置泵速度
  setPumpSpeed (system: string, pump: string, speed: number) {
    if (
      system in this.state &&
      pump in this.state[system as keyof ReactorSystemState]
    ) {
      const pumpState = this.state[system as keyof ReactorSystemState][
        pump as keyof (typeof this.state)[keyof ReactorSystemState]
      ] as PumpState;
      if (pumpState) {
        pumpState.speed = Math.max(0, Math.min(100, speed));
        // 根据速度计算流量和压力
        pumpState.flowRate = (speed / 100) * 1000;
        pumpState.pressure = (speed / 100) * 5.0;
      }
    }
  }

  // 设置汽轮机状态
  setTurbineStatus (status: 'off' | 'on') {
    this.state.turbine.status = status;
    if (status === 'on') {
      this.state.turbine.speed = 3000;
    } else {
      this.state.turbine.speed = 0;
      this.state.turbine.load = 0;
      this.state.turbine.powerOutput = 0;
    }
  }

  // 设置汽轮机负载
  setTurbineLoad (load: number) {
    this.state.turbine.load = Math.max(0, Math.min(100, load));
    // 根据负载计算功率输出
    this.state.turbine.powerOutput = (load / 100) * 1000;
  }

  // 设置蒸汽系统压力
  setSteamPressure (pressure: number) {
    this.state.steamSystem.pressure = pressure;
  }

  // 设置蒸汽系统流量
  setSteamFlowRate (flowRate: number) {
    this.state.steamSystem.flowRate = flowRate;
  }

  // 设置蒸汽阀位置
  setSteamValvePosition (position: number) {
    this.state.steamSystem.valvePosition = Math.max(0, Math.min(100, position));
  }

  // 设置给水系统流量
  setFeedwaterFlowRate (flowRate: number) {
    this.state.feedwaterSystem.flowRate = flowRate;
  }

  // 设置给水阀位置
  setFeedwaterValvePosition (position: number) {
    this.state.feedwaterSystem.valvePosition = Math.max(
      0,
      Math.min(100, position)
    );
  }

  // 重置状态
  reset () {
    this.state = { ...initialState };
  }
}

// 导出单例
export const reactorSystemStore = new ReactorSystemStore();
