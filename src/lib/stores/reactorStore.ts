import { writable, type Writable } from 'svelte/store';
import { logger as log } from '../utils/logger';
import { neutron, thermal, systems } from '@/models';

const { getDefaultXenonParameters } = neutron;
const {
  calculateFlowResistance,
  calculateReynoldsNumber,
  calculatePumpPerformance,
  calculateFrictionCoefficient,
} = thermal;
const { triggerSpecificFault, repairFault } = systems.faultSimulation;
import type { Fault } from '../../models/systems/faultSimulation';
import { workerManager } from '../../workers/workerManager';

// Initialize logger
log.info('Reactor state store initialized');
log.info('Initializing Worker manager');
workerManager.initialize();
log.success('Worker manager initialization completed');

// Define reactor state type
export interface ReactorState {
  // Simulation control
  isRunning: boolean;
  simulationTime: number; // Simulation time (seconds)

  // 1. Reactor control (absorber) rods
  controlRods: {
    position: number; // Control rod position (0-100%)
    insertionSpeed: number; // Insertion speed
    rods: Array<
      Array<{
        // 25 control rods (5x5 grid)
        position: number; // Individual control rod position
        status: 'normal' | 'fault' | 'maintenance'; // Control rod status
        type: 'control' | 'shutdown' | 'automatic'; // Control rod type
      }>
    >;
    emergencyInsertion: boolean; // Emergency insertion status
    autoMode: boolean; // Automatic control mode
  };

  // 2. Reactor power regulation panel
  powerRegulation: {
    powerLevel: number; // Power level (0-100%)
    targetPower: number; // Target power
    reactivity: number; // Reactivity
    powerRate: number; // Power change rate
    neutronFlux: number; // Neutron flux
    neutronFluxLog: number; // Neutron flux logarithm
    controlError: number; // Control error
    automaticControl: boolean; // Automatic control mode
    axialOffsetControl: boolean; // Axial offset control
    powerSetpoint: number; // Power setpoint
  };

  // 3/4. Reactor recirculation pumps
  recirculationPumps: {
    pump1: {
      status: boolean; // Status
      speed: number; // Speed (0-100%)
    };
    pump2: {
      status: boolean;
      speed: number;
    };
  };

  // 5/6. Reactor emergency cooling (ERC) pumps
  emergencyCoolingPumps: {
    pump1: {
      status: boolean;
      flowRate: number; // Flow rate
    };
    pump2: {
      status: boolean;
      flowRate: number;
    };
  };

  // 7. Reactor drain control
  reactorDrain: {
    status: boolean;
    flowRate: number;
  };

  // 8. Core offline cooling pump
  coreCoolingPump: {
    status: boolean;
    flowRate: number;
  };

  // 9. Turbine control
  turbine: {
    status: boolean;
    load: number; // Load (0-100%)
    speed: number; // Speed
    speedSetpoint: number; // Speed setpoint
    loadSetpoint: number; // Load setpoint
    steamPressure: number; // Steam pressure
    steamTemperature: number; // Steam temperature
    exhaustPressure: number; // Exhaust pressure
    exhaustTemperature: number; // Exhaust temperature
    valvePosition: number; // Valve position (0-100%)
    automaticControl: boolean; // Automatic control mode
    tripStatus: boolean; // Trip status
    tripReason: string; // Trip reason
  };

  // 10. Deaerator steam control
  deaerator: {
    pressure: number;
    level: number; // Level (0-100%)
  };

  // 11. Condenser vacuum system
  condenserVacuum: {
    vacuumLevel: number;
    status: boolean;
  };

  // 12. Steam dump control
  steamDump: {
    status: boolean;
    capacity: number; // Capacity (0-100%)
  };

  // 13. Turbine auxiliary systems
  turbineAuxiliary: {
    lubricationOil: {
      pressure: number;
      temperature: number;
    };
    sealOil: {
      pressure: number;
    };
  };

  // 14. Condenser hotwell level control
  condenserHotwell: {
    level: number; // Level (0-100%)
  };

  // 15. Condenser circulation pumps
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

  // 16. Makeup water system
  makeUpWater: {
    status: boolean;
    flowRate: number;
  };

  // 17. Reactor feedwater pump control
  reactorFeedPumps: {
    pump1: {
      status: boolean;
      flowRate: number;
      pressure: number;
      temperature: number;
      vibration: number;
      statusText: string;
    };
    pump2: {
      status: boolean;
      flowRate: number;
      pressure: number;
      temperature: number;
      vibration: number;
      statusText: string;
    };
  };

  // Feedwater system extension
  feedwaterSystem: {
    // Isolation valves
    isolationValves: {
      pump1Inlet: {
        status: boolean;
        position: number;
      };
      pump1Outlet: {
        status: boolean;
        position: number;
      };
      pump2Inlet: {
        status: boolean;
        position: number;
      };
      pump2Outlet: {
        status: boolean;
        position: number;
      };
    };
    // Feedwater heaters
    heaters: {
      heater1: {
        status: boolean;
        inletTemperature: number;
        outletTemperature: number;
        steamPressure: number;
        flowRate: number;
      };
      heater2: {
        status: boolean;
        inletTemperature: number;
        outletTemperature: number;
        steamPressure: number;
        flowRate: number;
      };
    };
    // System parameters
    system: {
      totalFlowRate: number;
      headerPressure: number;
      headerTemperature: number;
      waterLevel: number;
      status: string;
    };
  };

  // 18. Data trend chart
  trends: {
    timePoints: number[];
    powerData: number[];
    temperatureData: number[];
    pressureData: number[];
  };

  // 19. HEPA filter control
  hepaFilters: {
    status: boolean;
    efficiency: number; // Efficiency (0-100%)
  };

  // 20. Alarm CRT
  alarms: {
    active: boolean;
    messages: string[];
  };

  // 21. CRT diagram
  crtDiagram: {
    reactorStatus: string;
    systemStatus: Record<string, string>;
  };

  // 22. Condensate system
  condensateSystem: {
    status: boolean;
    flowRate: number;
    temperature: number;
  };

  // Core parameters
  core: {
    temperature: number; // Temperature
    pressure: number; // Pressure
    waterLevel: number; // Water level (0-100%)
  };

  // Physics model parameters
  physics: {
    masses: {
      M_reactor: number; // Mass of water in reactor
      M_condenser: number; // Mass of water in condenser
      M_deaerator: number; // Mass of water in deaerator
    };

    neutron: {
      Xe: number; // Xenon-135 concentration
      I: number; // Iodine-135 concentration
      φ: number; // Neutron flux
      Σ_f: number; // Fission cross section
    };

    reactivity: {
      void: number; // Void reactivity
      xenon: number; // Xenon poisoning reactivity
      controlRod: number; // Control rod reactivity
      total: number; // Total reactivity
    };

    thermal: {
      flow: {
        reynoldsNumber: number; // Reynolds number
        flowRegime: 'laminar' | 'turbulent' | 'transition'; // Flow regime
        frictionCoefficient: number; // Friction coefficient
        pressureDrop: number; // Pressure drop
      };
      pumpPerformance: {
        head: number; // Head
        power: number; // Power
        efficiency: number; // Efficiency
      };
    };
  };

  // Turbine bypass system
  steamBypass: {
    status: boolean; // Status
    bypassPosition: number; // Bypass valve position (0-100%)
    bypassFlow: number; // Bypass flow rate
    bypassCapacity: number; // Bypass capacity
    pressureSetpoint: number; // Pressure setpoint
  };

  // Core coolant cleanup system
  corePurification: {
    status: boolean; // Status
    flowRate: number; // Flow rate
    efficiency: number; // Purification efficiency
    impurityConcentration: number; // Impurity concentration
    maxImpurityConcentration: number; // Maximum impurity concentration
    warningLevel: 'normal' | 'warning' | 'alarm'; // Warning level
  };

  // Three-impulse level control system
  threeImpulseLevelControl: {
    waterLevelSetpoint: number; // Water level setpoint
    adjustedFeedwaterFlow: number; // Adjusted feedwater flow
    levelError: number; // Level error
    flowError: number; // Flow error
    waterLevelStatus:
      | 'normal'
      | 'low'
      | 'high'
      | 'critical_low'
      | 'critical_high'; // Water level status
    alarm: boolean; // Alarm
  };

  // Fault simulation system
  faultSimulation: {
    activeFaults: any[]; // Active faults
    systemReliability: number; // System reliability
    riskLevel: 'low' | 'medium' | 'high' | 'critical'; // Risk level
    recommendedActions: string[]; // Recommended actions
    maintenanceLevel: number; // Maintenance level
  };

  // Operation logs
  logs: {
    timestamp: number;
    message: string;
  }[];
}

// Initial state
const initialState: ReactorState = {
  isRunning: false,
  simulationTime: 0,

  controlRods: {
    position: 50,
    insertionSpeed: 0,
    rods: Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, () => ({
        position: 50,
        status: 'normal' as const,
        type: 'control' as const,
      }))
    ),
    emergencyInsertion: false,
    autoMode: false,
  },

  powerRegulation: {
    powerLevel: 50,
    targetPower: 50,
    reactivity: 0,
    powerRate: 0,
    neutronFlux: 1e13,
    neutronFluxLog: Math.log10(1e13),
    controlError: 0,
    automaticControl: false,
    axialOffsetControl: false,
    powerSetpoint: 50,
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
    speedSetpoint: 3000,
    loadSetpoint: 50,
    steamPressure: 7.0,
    steamTemperature: 280,
    exhaustPressure: 0.05,
    exhaustTemperature: 40,
    valvePosition: 50,
    automaticControl: false,
    tripStatus: false,
    tripReason: '',
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
      pressure: 12.0,
      temperature: 180,
      vibration: 0.05,
      statusText: 'Normal Operation',
    },
    pump2: {
      status: true,
      flowRate: 70,
      pressure: 12.0,
      temperature: 180,
      vibration: 0.05,
      statusText: 'Normal Operation',
    },
  },

  // Feedwater system extension
  feedwaterSystem: {
    // Isolation valves
    isolationValves: {
      pump1Inlet: {
        status: true,
        position: 100,
      },
      pump1Outlet: {
        status: true,
        position: 100,
      },
      pump2Inlet: {
        status: true,
        position: 100,
      },
      pump2Outlet: {
        status: true,
        position: 100,
      },
    },
    // Feedwater heaters
    heaters: {
      heater1: {
        status: true,
        inletTemperature: 150,
        outletTemperature: 220,
        steamPressure: 3.5,
        flowRate: 65,
      },
      heater2: {
        status: true,
        inletTemperature: 220,
        outletTemperature: 260,
        steamPressure: 5.0,
        flowRate: 65,
      },
    },
    // System parameters
    system: {
      totalFlowRate: 130,
      headerPressure: 11.5,
      headerTemperature: 260,
      waterLevel: 65,
      status: 'Normal',
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
      M_reactor: 100000, // 100 tons
      M_condenser: 50000, // 50 tons
      M_deaerator: 30000, // 30 tons
    },
    neutron: {
      Xe: 0,
      I: 0,
      φ: 1e13, // Neutron flux
      Σ_f: 1e-22, // Fission cross section
    },
    reactivity: {
      void: 0,
      xenon: 0,
      controlRod: 0,
      total: 0,
    },
    thermal: {
      flow: {
        reynoldsNumber: 1e4, // Reynolds number
        flowRegime: 'turbulent', // Flow regime
        frictionCoefficient: 0.02, // Friction coefficient
        pressureDrop: 1000, // Pressure drop
      },
      pumpPerformance: {
        head: 50, // Head
        power: 10000, // Power
        efficiency: 0.8, // Efficiency
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
    recommendedActions: [
      'Continue normal operation',
      'Maintain regular maintenance',
    ],
    maintenanceLevel: 90, // 90%
  },

  logs: [],
};

// Create store
export const reactorStore: Writable<ReactorState> = writable(initialState);

// Simulation update function
export async function updateReactorState() {
  log.trace('Starting reactor state update');

  reactorStore.update((state) => {
    if (!state.isRunning) return state;

    // Create new state object to avoid direct modification
    const newState = JSON.parse(JSON.stringify(state));

    // Update simulation time
    newState.simulationTime += 1;

    return newState;
  });

  // Async physics model calculation
  try {
    log.time('Physics model calculation');

    const currentState = await new Promise<ReactorState>((resolve) => {
      const unsubscribe = reactorStore.subscribe((state) => {
        resolve(state);
        unsubscribe();
      });
    });

    if (!currentState.isRunning) {
      log.trace('Simulation not running, skipping state update');
      return;
    }

    // Get default parameters
    const xenonParams = getDefaultXenonParameters();

    // Prepare calculation parameters
    const reactorCoreInput = {
      // Reactor parameters
      P_nuclear: currentState.powerRegulation.powerLevel * 30, // Convert to MW
      M_reactor: currentState.physics.masses.M_reactor,
      M_condenser: currentState.physics.masses.M_condenser,
      M_deaerator: currentState.physics.masses.M_deaerator,

      // Flow parameters
      m_feedwater:
        (currentState.reactorFeedPumps.pump1.status
          ? currentState.reactorFeedPumps.pump1.flowRate * 100
          : 0) +
        (currentState.reactorFeedPumps.pump2.status
          ? currentState.reactorFeedPumps.pump2.flowRate * 100
          : 0),
      m_steam: currentState.powerRegulation.powerLevel * 100,
      m_condensate: currentState.condensateSystem.status
        ? currentState.condensateSystem.flowRate * 100
        : 0,
      m_cooling: 1000,
      m_steam_heating: 500,
      m_feedwater_out:
        (currentState.reactorFeedPumps.pump1.status
          ? currentState.reactorFeedPumps.pump1.flowRate * 100
          : 0) +
        (currentState.reactorFeedPumps.pump2.status
          ? currentState.reactorFeedPumps.pump2.flowRate * 100
          : 0),

      // Thermal parameters
      η_thermal: 0.33,
      m_coolant:
        (currentState.recirculationPumps.pump1.status
          ? currentState.recirculationPumps.pump1.speed * 1000
          : 0) +
        (currentState.recirculationPumps.pump2.status
          ? currentState.recirculationPumps.pump2.speed * 1000
          : 0),
      c_p: 4.186, // Water specific heat capacity
      h_inlet: 2800, // Steam enthalpy
      h_outlet: 2200, // Feedwater enthalpy
      η_turbine: 0.85,
      η_generator: 0.95,

      // Neutron physics parameters
      α_void: 4.7e-5, // Positive void coefficient
      Δα: 0.01, // Void fraction change
      τ_delay: 10, // 10 seconds delay
      Xe: currentState.physics.neutron.Xe,
      I: currentState.physics.neutron.I,
      λ_Xe: xenonParams.λ_Xe,
      λ_I: xenonParams.λ_I,
      σ_Xe: xenonParams.σ_Xe,
      φ: currentState.physics.neutron.φ,
      γ_Xe: xenonParams.γ_Xe,
      γ_I: xenonParams.γ_I,
      Σ_f: currentState.physics.neutron.Σ_f,

      // Control rod parameters
      ρ_max: 0.1,
      z: (100 - currentState.controlRods.position) * 0.01 * 4, // Assuming control rod length is 4 meters
      L: 4,
      ρ_graphite_effect: 0.05,

      // Turbine parameters
      turbineStatus: currentState.turbine.status,
      steamPressure: currentState.core.pressure,
      pressureSetpoint: currentState.steamBypass.pressureSetpoint,
      maxPressure: 8.5,
      steamFlowMax: 3000, // 3000 kg/s
      currentBypassPosition: currentState.steamBypass.bypassPosition,

      // Purification system parameters
      filterEfficiency: 0.95,
      purificationFlow: currentState.corePurification.flowRate,
      maxPurificationFlow: 100000,
      impurityConcentration:
        currentState.corePurification.impurityConcentration,
      maxImpurityConcentration:
        currentState.corePurification.maxImpurityConcentration,
      purificationSystemStatus: currentState.corePurification.status,

      // Three-impulse level control parameters
      waterLevel: currentState.core.waterLevel,
      waterLevelSetpoint:
        currentState.threeImpulseLevelControl.waterLevelSetpoint,
      steamFlow: currentState.powerRegulation.powerLevel * 100,
      feedwaterFlow:
        (currentState.reactorFeedPumps.pump1.status
          ? currentState.reactorFeedPumps.pump1.flowRate * 100
          : 0) +
        (currentState.reactorFeedPumps.pump2.status
          ? currentState.reactorFeedPumps.pump2.flowRate * 100
          : 0),

      // Fault simulation parameters
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

      // Time parameters
      dt: 1,
    };

    // Calculate reactor core model using Worker
    const reactorCoreResult =
      await workerManager.calculateReactorCore(reactorCoreInput);

    // Calculate flow resistance and pump performance
    const flowRate =
      (currentState.recirculationPumps.pump1.status
        ? currentState.recirculationPumps.pump1.speed * 0.01
        : 0) +
      (currentState.recirculationPumps.pump2.status
        ? currentState.recirculationPumps.pump2.speed * 0.01
        : 0);
    const fluidDensity = 998; // Water density
    const fluidViscosity = 1e-3; // Water dynamic viscosity
    const pipeDiameter = 0.5; // Pipe diameter
    const pipeLength = 100; // Pipe length
    const pipeRoughness = 0.0001; // Pipe roughness
    const pumpEfficiency = 0.8; // Pump efficiency
    const gravity = 9.81; // Gravity acceleration

    // Calculate flow velocity
    const pipeArea = Math.PI * Math.pow(pipeDiameter / 2, 2);
    const flowVelocity = flowRate / pipeArea;

    // Calculate Reynolds number
    const reynoldsResult = calculateReynoldsNumber({
      ρ: fluidDensity,
      v: flowVelocity,
      D: pipeDiameter,
      μ: fluidViscosity,
    });

    // Calculate friction coefficient
    const frictionCoeff = calculateFrictionCoefficient(
      reynoldsResult.Re,
      pipeRoughness,
      pipeDiameter
    );

    // Calculate flow resistance
    const flowResistanceResult = calculateFlowResistance({
      f: frictionCoeff,
      L: pipeLength,
      D: pipeDiameter,
      ρ: fluidDensity,
      v: flowVelocity,
    });

    // Calculate pump performance
    const pumpPerformanceResult = calculatePumpPerformance({
      H_max: 100,
      k: 1000,
      Q: flowRate,
      ρ: fluidDensity,
      g: gravity,
      η_pump: pumpEfficiency,
    });

    // Update state
    reactorStore.update((state) => {
      if (!state.isRunning) return state;

      const newState = JSON.parse(JSON.stringify(state));

      // Update mass parameters
      newState.physics.masses = reactorCoreResult.massBalance.newMasses;

      // Update neutron physics parameters
      newState.physics.neutron.Xe =
        reactorCoreResult.neutronPhysics.xenonPoisoning.Xe_new;
      newState.physics.neutron.I =
        reactorCoreResult.neutronPhysics.xenonPoisoning.I_new;

      // Update reactivity parameters
      newState.physics.reactivity.void =
        reactorCoreResult.neutronPhysics.voidCoefficient.ρ_void;
      newState.physics.reactivity.xenon =
        reactorCoreResult.neutronPhysics.xenonPoisoning.ρ_Xe;
      newState.physics.reactivity.controlRod =
        reactorCoreResult.neutronPhysics.controlRod.ρ_rod;
      newState.physics.reactivity.total = reactorCoreResult.totalReactivity;

      // Update thermal parameters
      newState.physics.thermal.flow.reynoldsNumber = reynoldsResult.Re;
      newState.physics.thermal.flow.flowRegime = reynoldsResult.flowRegime;
      newState.physics.thermal.flow.frictionCoefficient = frictionCoeff;
      newState.physics.thermal.flow.pressureDrop = flowResistanceResult.ΔP;
      newState.physics.thermal.pumpPerformance.head = pumpPerformanceResult.H;
      newState.physics.thermal.pumpPerformance.power =
        pumpPerformanceResult.P_pump;
      newState.physics.thermal.pumpPerformance.efficiency = pumpEfficiency;

      // Update turbine bypass system
      newState.steamBypass = {
        ...newState.steamBypass,
        bypassPosition: reactorCoreResult.steamBypass.bypassPosition,
        bypassFlow: reactorCoreResult.steamBypass.bypassFlow,
        bypassCapacity: reactorCoreResult.steamBypass.bypassCapacity,
        status: reactorCoreResult.steamBypass.isActive,
      };

      // Update core coolant cleanup system
      newState.corePurification = {
        ...newState.corePurification,
        efficiency:
          reactorCoreResult.corePurification.purificationEfficiency * 100,
        impurityConcentration:
          reactorCoreResult.corePurification.filteredImpurityConcentration,
        warningLevel: reactorCoreResult.corePurification.warningLevel,
      };

      // Update three-impulse level control system
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

      // Update fault simulation system
      newState.faultSimulation = {
        ...newState.faultSimulation,
        activeFaults: reactorCoreResult.faultSimulation.activeFaults,
        systemReliability: reactorCoreResult.faultSimulation.systemReliability,
        riskLevel: reactorCoreResult.faultSimulation.riskLevel,
        recommendedActions:
          reactorCoreResult.faultSimulation.recommendedActions,
      };

      // Update power
      newState.powerRegulation.powerLevel = reactorCoreResult.newPower / 30;
      newState.powerRegulation.reactivity = reactorCoreResult.totalReactivity;

      // Calculate power change rate
      const previousPower = state.powerRegulation.powerLevel;
      newState.powerRegulation.powerRate =
        (newState.powerRegulation.powerLevel - previousPower) / 1;

      // Calculate neutron flux
      newState.powerRegulation.neutronFlux =
        1e13 * (newState.powerRegulation.powerLevel / 50);
      newState.powerRegulation.neutronFluxLog = Math.log10(
        newState.powerRegulation.neutronFlux + 1e-10
      );

      // Calculate control error
      newState.powerRegulation.controlError =
        newState.powerRegulation.targetPower -
        newState.powerRegulation.powerLevel;

      // Limit power range
      newState.powerRegulation.powerLevel = Math.max(
        0,
        Math.min(100, newState.powerRegulation.powerLevel)
      );

      // Simulate core temperature and pressure
      newState.core.temperature =
        250 + newState.powerRegulation.powerLevel * 0.8;
      newState.core.pressure = 6.5 + newState.powerRegulation.powerLevel * 0.01;

      // Automatic control logic
      if (newState.powerRegulation.automaticControl) {
        // Adjust control rod position based on control error
        const error = newState.powerRegulation.controlError;
        let rodAdjustment = 0;

        if (Math.abs(error) > 2) {
          rodAdjustment = error > 0 ? -0.5 : 0.5; // Fast adjustment for large error
        } else if (Math.abs(error) > 0.5) {
          rodAdjustment = error > 0 ? -0.2 : 0.2; // Fine adjustment for small error
        }

        // Update control rod position
        newState.controlRods.position = Math.max(
          0,
          Math.min(100, newState.controlRods.position + rodAdjustment)
        );

        // Update all control rod positions
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 5; j++) {
            newState.controlRods.rods[i][j].position =
              newState.controlRods.position;
          }
        }
      }

      // Axial offset control logic
      if (newState.powerRegulation.axialOffsetControl) {
        // Simplified axial offset control
        // More complex control can be implemented here based on actual axial power distribution
      }

      // Update data trends
      if (newState.simulationTime % 5 === 0) {
        // Create new trend arrays to avoid direct modification
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

        // Limit number of data points
        if (newState.trends.timePoints.length > 100) {
          newState.trends.timePoints.shift();
          newState.trends.powerData.shift();
          newState.trends.temperatureData.shift();
          newState.trends.pressureData.shift();
        }
      }

      // Simulate alarms
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

      // Three-impulse level control system alarms
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

      // Fault simulation system alarms
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

      // Update feedwater system status
      // Calculate total flow rate
      newState.feedwaterSystem.system.totalFlowRate =
        (newState.reactorFeedPumps.pump1.status
          ? newState.reactorFeedPumps.pump1.flowRate
          : 0) +
        (newState.reactorFeedPumps.pump2.status
          ? newState.reactorFeedPumps.pump2.flowRate
          : 0);

      // Calculate feedwater temperature (based on heater status)
      let feedwaterTemp = 150; // Initial temperature
      if (newState.feedwaterSystem.heaters.heater1.status) {
        feedwaterTemp =
          newState.feedwaterSystem.heaters.heater1.outletTemperature;
      }
      if (newState.feedwaterSystem.heaters.heater2.status) {
        feedwaterTemp =
          newState.feedwaterSystem.heaters.heater2.outletTemperature;
      }
      newState.feedwaterSystem.system.headerTemperature = feedwaterTemp;

      // Calculate feedwater pressure
      newState.feedwaterSystem.system.headerPressure =
        12.0 - (newState.feedwaterSystem.system.totalFlowRate / 100) * 0.5;

      // Update pump status
      newState.reactorFeedPumps.pump1.statusText = newState.reactorFeedPumps
        .pump1.status
        ? 'Normal Operation'
        : 'Stopped';
      newState.reactorFeedPumps.pump2.statusText = newState.reactorFeedPumps
        .pump2.status
        ? 'Normal Operation'
        : 'Stopped';

      // Update turbine status
      newState.turbine.steamPressure = newState.core.pressure;
      newState.turbine.steamTemperature = newState.core.temperature;
      newState.turbine.exhaustTemperature = 30 + newState.turbine.load * 0.2;
      newState.turbine.valvePosition = newState.turbine.load;

      // Turbine automatic control logic
      if (newState.turbine.automaticControl && newState.turbine.status) {
        // Speed control
        const speedError =
          newState.turbine.speedSetpoint - newState.turbine.speed;
        if (Math.abs(speedError) > 10) {
          // Adjust valve position based on speed error
          const valveAdjustment = speedError > 0 ? 1 : -1;
          newState.turbine.valvePosition = Math.max(
            0,
            Math.min(100, newState.turbine.valvePosition + valveAdjustment)
          );
          newState.turbine.load = newState.turbine.valvePosition;
        }

        // Load control
        const loadError = newState.turbine.loadSetpoint - newState.turbine.load;
        if (Math.abs(loadError) > 2) {
          // Adjust valve position based on load error
          const valveAdjustment = loadError > 0 ? 0.5 : -0.5;
          newState.turbine.valvePosition = Math.max(
            0,
            Math.min(100, newState.turbine.valvePosition + valveAdjustment)
          );
          newState.turbine.load = newState.turbine.valvePosition;
        }
      }

      // Turbine trip logic
      if (newState.turbine.status) {
        // Overspeed protection
        if (newState.turbine.speed > 3300) {
          newState.turbine.tripStatus = true;
          newState.turbine.status = false;
          newState.turbine.tripReason = 'OVERSPEED';
          newState.logs = [
            ...newState.logs,
            {
              timestamp: Date.now(),
              message:
                'TURBINE TRIP: OVERSPEED - Speed: ' +
                newState.turbine.speed +
                ' RPM',
            },
          ];
        }

        // Steam pressure protection
        if (newState.turbine.steamPressure > 8.5) {
          newState.turbine.tripStatus = true;
          newState.turbine.status = false;
          newState.turbine.tripReason = 'HIGH STEAM PRESSURE';
          newState.logs = [
            ...newState.logs,
            {
              timestamp: Date.now(),
              message:
                'TURBINE TRIP: HIGH STEAM PRESSURE - Pressure: ' +
                newState.turbine.steamPressure +
                ' MPa',
            },
          ];
        }

        // Steam temperature protection
        if (newState.turbine.steamTemperature > 320) {
          newState.turbine.tripStatus = true;
          newState.turbine.status = false;
          newState.turbine.tripReason = 'HIGH STEAM TEMPERATURE';
          newState.logs = [
            ...newState.logs,
            {
              timestamp: Date.now(),
              message:
                'TURBINE TRIP: HIGH STEAM TEMPERATURE - Temperature: ' +
                newState.turbine.steamTemperature +
                ' °C',
            },
          ];
        }
      }

      // Turbine alarms
      if (newState.turbine.status) {
        if (newState.turbine.speed > 3100) {
          newState.alarms.active = true;
          const alarmMessage = 'TURBINE SPEED HIGH';
          if (!newState.alarms.messages.includes(alarmMessage)) {
            newState.alarms.messages = [
              ...newState.alarms.messages,
              alarmMessage,
            ];
          }
        }

        if (newState.turbine.steamPressure > 8.0) {
          newState.alarms.active = true;
          const alarmMessage = 'STEAM PRESSURE HIGH';
          if (!newState.alarms.messages.includes(alarmMessage)) {
            newState.alarms.messages = [
              ...newState.alarms.messages,
              alarmMessage,
            ];
          }
        }
      }

      // Feedwater system alarms
      if (newState.feedwaterSystem.system.totalFlowRate < 30) {
        newState.alarms.active = true;
        const alarmMessage = 'FEEDWATER FLOW LOW';
        if (!newState.alarms.messages.includes(alarmMessage)) {
          newState.alarms.messages = [
            ...newState.alarms.messages,
            alarmMessage,
          ];
        }
      }

      if (newState.feedwaterSystem.system.headerPressure < 8.0) {
        newState.alarms.active = true;
        const alarmMessage = 'FEEDWATER PRESSURE LOW';
        if (!newState.alarms.messages.includes(alarmMessage)) {
          newState.alarms.messages = [
            ...newState.alarms.messages,
            alarmMessage,
          ];
        }
      }

      // Add operation logs
      if (newState.simulationTime % 10 === 0) {
        newState.logs = [
          ...newState.logs,
          {
            timestamp: Date.now(),
            message: `Power level: ${newState.powerRegulation.powerLevel.toFixed(1)}%, Core temp: ${newState.core.temperature.toFixed(1)}°C, Reactivity: ${newState.physics.reactivity.total.toFixed(4)}, Flow regime: ${newState.physics.thermal.flow.flowRegime}, Pressure drop: ${(newState.physics.thermal.flow.pressureDrop / 1000).toFixed(2)} kPa, Bypass position: ${newState.steamBypass.bypassPosition.toFixed(1)}%, Purification efficiency: ${newState.corePurification.efficiency.toFixed(1)}%, Water level status: ${newState.threeImpulseLevelControl.waterLevelStatus}, Risk level: ${newState.faultSimulation.riskLevel}`,
          },
        ];

        // Limit log quantity
        if (newState.logs.length > 50) {
          newState.logs.shift();
        }
      }

      return newState;
    });

    log.timeEnd('Physics model calculation');
    log.debug('Reactor state update completed');

    // Record system status statistics
    const finalState = await new Promise<ReactorState>((resolve) => {
      const unsubscribe = reactorStore.subscribe((state) => {
        resolve(state);
        unsubscribe();
      });
    });

    log.stats({
      powerLevel: finalState.powerRegulation.powerLevel.toFixed(1),
      coreTemperature: finalState.core.temperature.toFixed(1),
      corePressure: finalState.core.pressure.toFixed(2),
      reactivity: finalState.physics.reactivity.total.toFixed(4),
      simulationTime: finalState.simulationTime,
      activeAlarms: finalState.alarms.messages.length,
      activeFaults: finalState.faultSimulation.activeFaults.length,
    });
  } catch (error) {
    log.timeEnd('Physics model calculation');
    log.error('Error updating reactor state:', error);
  }
}

// Simulation control functions
export function startSimulation() {
  log.info('Starting simulation');
  reactorStore.update((state) => ({
    ...state,
    isRunning: true,
  }));

  // Add startup log
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
  log.success('Simulation started');
}

export function stopSimulation() {
  log.info('Stopping simulation');
  reactorStore.update((state) => ({
    ...state,
    isRunning: false,
  }));

  // Add stop log
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
  log.success('Simulation stopped');
}

export function resetSimulation() {
  log.info('Resetting simulation to initial state');
  reactorStore.set(initialState);
  log.success('Simulation reset');
}

// Control rod operation functions
export function setControlRodPosition(position: number) {
  const clampedPosition = Math.max(0, Math.min(100, position));
  log.debug(`Setting control rod position: ${clampedPosition}%`);
  reactorStore.update((state) => ({
    ...state,
    controlRods: {
      ...state.controlRods,
      position: clampedPosition,
    },
  }));
}

// Set single control rod position
export function setSingleControlRodPosition(
  row: number,
  col: number,
  position: number
) {
  const clampedPosition = Math.max(0, Math.min(100, position));
  log.debug(
    `Setting single control rod position: row ${row}, column ${col}, position ${clampedPosition}%`
  );
  reactorStore.update((state) => {
    const newState = JSON.parse(JSON.stringify(state));
    if (row >= 0 && row < 5 && col >= 0 && col < 5) {
      newState.controlRods.rods[row][col].position = clampedPosition;
    }
    return newState;
  });
}

// Control rod emergency insertion (AZ-5)
export function emergencyRodInsertion() {
  log.fatal('Triggering control rod emergency insertion (AZ-5)');
  reactorStore.update((state) => {
    const newState = JSON.parse(JSON.stringify(state));
    newState.controlRods.emergencyInsertion = true;
    newState.controlRods.position = 100; // Fully inserted
    // Update all control rod positions
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        newState.controlRods.rods[i][j].position = 100;
      }
    }
    // Add emergency insertion log
    newState.logs = [
      ...newState.logs,
      {
        timestamp: Date.now(),
        message: 'EMERGENCY ROD INSERTION (AZ-5) TRIGGERED',
      },
    ];
    return newState;
  });
  log.success('Control rod emergency insertion completed');
}

// Toggle control rod auto mode
export function toggleControlRodAutoMode() {
  log.info('Toggling control rod auto mode');
  reactorStore.update((state) => {
    const newAutoMode = !state.controlRods.autoMode;
    log.debug(`Control rod auto mode ${newAutoMode ? 'enabled' : 'disabled'}`);
    return {
      ...state,
      controlRods: {
        ...state.controlRods,
        autoMode: newAutoMode,
      },
    };
  });
}

// Power adjustment function
export function setTargetPower(power: number) {
  const clampedPower = Math.max(0, Math.min(100, power));
  log.info(`Setting target power: ${clampedPower}%`);
  reactorStore.update((state) => ({
    ...state,
    powerRegulation: {
      ...state.powerRegulation,
      targetPower: clampedPower,
      powerSetpoint: clampedPower,
    },
  }));
}

// Set power setpoint
export function setPowerSetpoint(setpoint: number) {
  const clampedSetpoint = Math.max(0, Math.min(100, setpoint));
  log.info(`Setting power setpoint: ${clampedSetpoint}%`);
  reactorStore.update((state) => ({
    ...state,
    powerRegulation: {
      ...state.powerRegulation,
      powerSetpoint: clampedSetpoint,
      targetPower: clampedSetpoint,
    },
  }));
}

// Toggle auto control mode
export function toggleAutomaticControl() {
  log.info('Toggling auto control mode');
  reactorStore.update((state) => {
    const newMode = !state.powerRegulation.automaticControl;
    log.debug(`Auto control mode ${newMode ? 'enabled' : 'disabled'}`);
    return {
      ...state,
      powerRegulation: {
        ...state.powerRegulation,
        automaticControl: newMode,
      },
    };
  });
}

// Toggle axial offset control
export function toggleAxialOffsetControl() {
  log.info('Toggling axial offset control');
  reactorStore.update((state) => {
    const newMode = !state.powerRegulation.axialOffsetControl;
    log.debug(`Axial offset control ${newMode ? 'enabled' : 'disabled'}`);
    return {
      ...state,
      powerRegulation: {
        ...state.powerRegulation,
        axialOffsetControl: newMode,
      },
    };
  });
}

// Trigger reactor shutdown
export function tripReactor() {
  log.fatal('Triggering reactor shutdown');
  reactorStore.update((state) => {
    const newState = JSON.parse(JSON.stringify(state));
    // Emergency insertion of control rods
    newState.controlRods.emergencyInsertion = true;
    newState.controlRods.position = 100;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        newState.controlRods.rods[i][j].position = 100;
      }
    }
    // Stop turbine
    newState.turbine.status = false;
    // Stop feedwater pumps
    newState.reactorFeedPumps.pump1.status = false;
    newState.reactorFeedPumps.pump2.status = false;
    // Close isolation valves
    Object.keys(newState.feedwaterSystem.isolationValves).forEach((valve) => {
      const v =
        newState.feedwaterSystem.isolationValves[
          valve as keyof typeof newState.feedwaterSystem.isolationValves
        ];
      v.status = false;
      v.position = 0;
    });
    // Add shutdown log
    newState.logs = [
      ...newState.logs,
      {
        timestamp: Date.now(),
        message: 'REACTOR TRIP INITIATED - FEEDWATER SYSTEM SHUT DOWN',
      },
    ];
    return newState;
  });
  log.success('Reactor shutdown completed');
}

// Feedwater system control functions

// Toggle isolation valve status
export function toggleIsolationValve(
  valve: 'pump1Inlet' | 'pump1Outlet' | 'pump2Inlet' | 'pump2Outlet'
) {
  log.info(`Toggling isolation valve: ${valve}`);
  reactorStore.update((state) => {
    const newState = JSON.parse(JSON.stringify(state));
    const newStatus = !newState.feedwaterSystem.isolationValves[valve].status;
    newState.feedwaterSystem.isolationValves[valve].status = newStatus;
    newState.feedwaterSystem.isolationValves[valve].position = newStatus
      ? 100
      : 0;
    log.debug(`Isolation valve ${valve} ${newStatus ? 'opened' : 'closed'}`);
    return newState;
  });
}

// Set isolation valve position
export function setIsolationValvePosition(
  valve: 'pump1Inlet' | 'pump1Outlet' | 'pump2Inlet' | 'pump2Outlet',
  position: number
) {
  const clampedPosition = Math.max(0, Math.min(100, position));
  log.info(`Setting isolation valve ${valve} position to ${clampedPosition}%`);
  reactorStore.update((state) => {
    const newState = JSON.parse(JSON.stringify(state));
    newState.feedwaterSystem.isolationValves[valve].position = clampedPosition;
    newState.feedwaterSystem.isolationValves[valve].status =
      clampedPosition > 0;
    log.debug(
      `Isolation valve ${valve} position set to ${clampedPosition}%, status: ${clampedPosition > 0 ? 'open' : 'closed'}`
    );
    return newState;
  });
}

// Toggle feedwater heater status
export function toggleFeedwaterHeater(heater: 'heater1' | 'heater2') {
  log.info(`Toggling feedwater heater: ${heater}`);
  reactorStore.update((state) => {
    const newState = JSON.parse(JSON.stringify(state));
    const newStatus = !newState.feedwaterSystem.heaters[heater].status;
    newState.feedwaterSystem.heaters[heater].status = newStatus;
    log.debug(
      `Feedwater heater ${heater} ${newStatus ? 'enabled' : 'disabled'}`
    );
    return newState;
  });
}

// Set feedwater heater parameter
export function setFeedwaterHeaterParameter(
  heater: 'heater1' | 'heater2',
  parameter: 'steamPressure' | 'flowRate',
  value: number
) {
  log.info(`Setting feedwater heater ${heater} ${parameter} to ${value}`);
  reactorStore.update((state) => {
    const newState = JSON.parse(JSON.stringify(state));
    newState.feedwaterSystem.heaters[heater][parameter] = value;
    log.debug(`Feedwater heater ${heater} ${parameter} set to ${value}`);
    return newState;
  });
}

// Pump control functions
export function toggleRecirculationPump(pumpNumber: 1 | 2) {
  log.info(`Toggling recirculation pump ${pumpNumber}`);
  reactorStore.update((state) => {
    const newStatus = !state.recirculationPumps[`pump${pumpNumber}`].status;
    log.debug(
      `Recirculation pump ${pumpNumber} ${newStatus ? 'started' : 'stopped'}`
    );
    return {
      ...state,
      recirculationPumps: {
        ...state.recirculationPumps,
        [`pump${pumpNumber}`]: {
          ...state.recirculationPumps[`pump${pumpNumber}`],
          status: newStatus,
        },
      },
    };
  });
}

export function setRecirculationPumpSpeed(pumpNumber: 1 | 2, speed: number) {
  const clampedSpeed = Math.max(0, Math.min(100, speed));
  log.info(
    `Setting recirculation pump ${pumpNumber} speed to ${clampedSpeed}%`
  );
  reactorStore.update((state) => ({
    ...state,
    recirculationPumps: {
      ...state.recirculationPumps,
      [`pump${pumpNumber}`]: {
        ...state.recirculationPumps[`pump${pumpNumber}`],
        speed: clampedSpeed,
      },
    },
  }));
}

// Emergency cooling pump control functions
export function toggleEmergencyCoolingPump(pumpNumber: 1 | 2) {
  log.info(`Toggling emergency cooling pump ${pumpNumber}`);
  reactorStore.update((state) => {
    const newStatus = !state.emergencyCoolingPumps[`pump${pumpNumber}`].status;
    log.debug(
      `Emergency cooling pump ${pumpNumber} ${newStatus ? 'started' : 'stopped'}`
    );
    return {
      ...state,
      emergencyCoolingPumps: {
        ...state.emergencyCoolingPumps,
        [`pump${pumpNumber}`]: {
          ...state.emergencyCoolingPumps[`pump${pumpNumber}`],
          status: newStatus,
        },
      },
    };
  });
}

export function setEmergencyCoolingPumpFlowRate(
  pumpNumber: 1 | 2,
  flowRate: number
) {
  const clampedFlowRate = Math.max(0, Math.min(100, flowRate));
  log.info(
    `Setting emergency cooling pump ${pumpNumber} flow rate to ${clampedFlowRate}%`
  );
  reactorStore.update((state) => ({
    ...state,
    emergencyCoolingPumps: {
      ...state.emergencyCoolingPumps,
      [`pump${pumpNumber}`]: {
        ...state.emergencyCoolingPumps[`pump${pumpNumber}`],
        flowRate: clampedFlowRate,
      },
    },
  }));
}

// Reactor drain control functions
export function toggleReactorDrain() {
  log.info('Toggling reactor drain');
  reactorStore.update((state) => {
    const newStatus = !state.reactorDrain.status;
    log.debug(`Reactor drain ${newStatus ? 'opened' : 'closed'}`);
    return {
      ...state,
      reactorDrain: {
        ...state.reactorDrain,
        status: newStatus,
      },
    };
  });
}

export function setReactorDrainFlowRate(flowRate: number) {
  const clampedFlowRate = Math.max(0, Math.min(100, flowRate));
  log.info(`Setting reactor drain flow rate to ${clampedFlowRate}%`);
  reactorStore.update((state) => ({
    ...state,
    reactorDrain: {
      ...state.reactorDrain,
      flowRate: clampedFlowRate,
    },
  }));
}

// Core offline cooling pump control functions
export function toggleCoreCoolingPump() {
  log.info('Toggling core cooling pump');
  reactorStore.update((state) => {
    const newStatus = !state.coreCoolingPump.status;
    log.debug(`Core cooling pump ${newStatus ? 'started' : 'stopped'}`);
    return {
      ...state,
      coreCoolingPump: {
        ...state.coreCoolingPump,
        status: newStatus,
      },
    };
  });
}

export function setCoreCoolingPumpFlowRate(flowRate: number) {
  const clampedFlowRate = Math.max(0, Math.min(100, flowRate));
  log.info(`Setting core cooling pump flow rate to ${clampedFlowRate}%`);
  reactorStore.update((state) => ({
    ...state,
    coreCoolingPump: {
      ...state.coreCoolingPump,
      flowRate: clampedFlowRate,
    },
  }));
}

// Turbine control functions
export function toggleTurbine() {
  log.info('Toggling turbine');
  reactorStore.update((state) => {
    const newState = JSON.parse(JSON.stringify(state));
    const newStatus = !newState.turbine.status;
    newState.turbine.status = newStatus;
    if (newStatus) {
      // Reset trip status on start
      newState.turbine.tripStatus = false;
      newState.turbine.tripReason = '';
      // Gradually restore speed
      newState.turbine.speed = 1000;
      // Add start log
      newState.logs = [
        ...newState.logs,
        {
          timestamp: Date.now(),
          message: 'TURBINE STARTED - INITIAL SPEED: 1000 RPM',
        },
      ];
      log.debug('Turbine started - initial speed: 1000 RPM');
    } else {
      // Record stop
      newState.logs = [
        ...newState.logs,
        {
          timestamp: Date.now(),
          message: 'TURBINE STOPPED',
        },
      ];
      log.debug('Turbine stopped');
    }
    return newState;
  });
}

export function setTurbineLoad(load: number) {
  const clampedLoad = Math.max(0, Math.min(100, load));
  log.info(`Setting turbine load to ${clampedLoad}%`);
  reactorStore.update((state) => ({
    ...state,
    turbine: {
      ...state.turbine,
      load: clampedLoad,
      loadSetpoint: clampedLoad,
    },
  }));
}

// Set speed setpoint
export function setTurbineSpeedSetpoint(speed: number) {
  const clampedSpeed = Math.max(2500, Math.min(3500, speed));
  log.info(`Setting turbine speed setpoint to ${clampedSpeed} RPM`);
  reactorStore.update((state) => ({
    ...state,
    turbine: {
      ...state.turbine,
      speedSetpoint: clampedSpeed,
    },
  }));
}

// Set load setpoint
export function setTurbineLoadSetpoint(load: number) {
  const clampedLoad = Math.max(0, Math.min(100, load));
  log.info(`Setting turbine load setpoint to ${clampedLoad}%`);
  reactorStore.update((state) => ({
    ...state,
    turbine: {
      ...state.turbine,
      loadSetpoint: clampedLoad,
    },
  }));
}

// Toggle automatic control mode
export function toggleTurbineAutomaticControl() {
  log.info('Toggling turbine automatic control');
  reactorStore.update((state) => {
    const newMode = !state.turbine.automaticControl;
    log.debug(`Turbine automatic control ${newMode ? 'enabled' : 'disabled'}`);
    return {
      ...state,
      turbine: {
        ...state.turbine,
        automaticControl: newMode,
      },
    };
  });
}

// Manually adjust turbine speed
export function adjustTurbineSpeed(adjustment: number) {
  log.info(`Adjusting turbine speed by ${adjustment} RPM`);
  reactorStore.update((state) => {
    const newState = JSON.parse(JSON.stringify(state));
    const newSpeed = Math.max(
      0,
      Math.min(4000, newState.turbine.speed + adjustment)
    );
    newState.turbine.speed = newSpeed;
    log.debug(`Turbine speed adjusted to ${newSpeed} RPM`);
    return newState;
  });
}

// Reset turbine trip
export function resetTurbineTrip() {
  log.info('Resetting turbine trip');
  reactorStore.update((state) => {
    const newState = JSON.parse(JSON.stringify(state));
    newState.turbine.tripStatus = false;
    newState.turbine.tripReason = '';
    newState.logs = [
      ...newState.logs,
      {
        timestamp: Date.now(),
        message: 'TURBINE TRIP RESET',
      },
    ];
    log.debug('Turbine trip reset');
    return newState;
  });
}

// Deaerator control functions
export function setDeaeratorPressure(pressure: number) {
  const clampedPressure = Math.max(0, pressure);
  log.info(`Setting deaerator pressure to ${clampedPressure} MPa`);
  reactorStore.update((state) => ({
    ...state,
    deaerator: {
      ...state.deaerator,
      pressure: clampedPressure,
    },
  }));
}

export function setDeaeratorLevel(level: number) {
  const clampedLevel = Math.max(0, Math.min(100, level));
  log.info(`Setting deaerator level to ${clampedLevel}%`);
  reactorStore.update((state) => ({
    ...state,
    deaerator: {
      ...state.deaerator,
      level: clampedLevel,
    },
  }));
}

// Condenser vacuum system control functions
export function toggleCondenserVacuum() {
  log.info('Toggling condenser vacuum');
  reactorStore.update((state) => {
    const newStatus = !state.condenserVacuum.status;
    log.debug(`Condenser vacuum ${newStatus ? 'enabled' : 'disabled'}`);
    return {
      ...state,
      condenserVacuum: {
        ...state.condenserVacuum,
        status: newStatus,
      },
    };
  });
}

export function setCondenserVacuumLevel(vacuumLevel: number) {
  const clampedVacuumLevel = Math.max(0, Math.min(1, vacuumLevel));
  log.info(`Setting condenser vacuum level to ${clampedVacuumLevel}`);
  reactorStore.update((state) => ({
    ...state,
    condenserVacuum: {
      ...state.condenserVacuum,
      vacuumLevel: clampedVacuumLevel,
    },
  }));
}

// Steam dump control functions
export function toggleSteamDump() {
  log.info('Toggling steam dump');
  reactorStore.update((state) => {
    const newStatus = !state.steamDump.status;
    log.debug(`Steam dump ${newStatus ? 'enabled' : 'disabled'}`);
    return {
      ...state,
      steamDump: {
        ...state.steamDump,
        status: newStatus,
      },
    };
  });
}

export function setSteamDumpCapacity(capacity: number) {
  const clampedCapacity = Math.max(0, Math.min(100, capacity));
  log.info(`Setting steam dump capacity to ${clampedCapacity}%`);
  reactorStore.update((state) => ({
    ...state,
    steamDump: {
      ...state.steamDump,
      capacity: clampedCapacity,
    },
  }));
}

// Turbine auxiliary system control functions
export function setLubricationOilPressure(pressure: number) {
  const clampedPressure = Math.max(0, pressure);
  log.info(`Setting lubrication oil pressure to ${clampedPressure} MPa`);
  reactorStore.update((state) => ({
    ...state,
    turbineAuxiliary: {
      ...state.turbineAuxiliary,
      lubricationOil: {
        ...state.turbineAuxiliary.lubricationOil,
        pressure: clampedPressure,
      },
    },
  }));
}

export function setLubricationOilTemperature(temperature: number) {
  const clampedTemperature = Math.max(0, temperature);
  log.info(`Setting lubrication oil temperature to ${clampedTemperature}°C`);
  reactorStore.update((state) => ({
    ...state,
    turbineAuxiliary: {
      ...state.turbineAuxiliary,
      lubricationOil: {
        ...state.turbineAuxiliary.lubricationOil,
        temperature: clampedTemperature,
      },
    },
  }));
}

export function setSealOilPressure(pressure: number) {
  const clampedPressure = Math.max(0, pressure);
  log.info(`Setting seal oil pressure to ${clampedPressure} MPa`);
  reactorStore.update((state) => ({
    ...state,
    turbineAuxiliary: {
      ...state.turbineAuxiliary,
      sealOil: {
        ...state.turbineAuxiliary.sealOil,
        pressure: clampedPressure,
      },
    },
  }));
}

// Condenser hotwell level control functions
export function setCondenserHotwellLevel(level: number) {
  const clampedLevel = Math.max(0, Math.min(100, level));
  log.info(`Setting condenser hotwell level to ${clampedLevel}%`);
  reactorStore.update((state) => ({
    ...state,
    condenserHotwell: {
      level: clampedLevel,
    },
  }));
}

// Condenser circulation pump control functions
export function toggleCondenserCirculationPump(pumpNumber: 1 | 2) {
  log.info(`Toggling condenser circulation pump ${pumpNumber}`);
  reactorStore.update((state) => {
    const newStatus =
      !state.condenserCirculationPumps[`pump${pumpNumber}`].status;
    log.debug(
      `Condenser circulation pump ${pumpNumber} ${newStatus ? 'started' : 'stopped'}`
    );
    return {
      ...state,
      condenserCirculationPumps: {
        ...state.condenserCirculationPumps,
        [`pump${pumpNumber}`]: {
          ...state.condenserCirculationPumps[`pump${pumpNumber}`],
          status: newStatus,
        },
      },
    };
  });
}

export function setCondenserCirculationPumpFlowRate(
  pumpNumber: 1 | 2,
  flowRate: number
) {
  const clampedFlowRate = Math.max(0, Math.min(100, flowRate));
  log.info(
    `Setting condenser circulation pump ${pumpNumber} flow rate to ${clampedFlowRate}%`
  );
  reactorStore.update((state) => ({
    ...state,
    condenserCirculationPumps: {
      ...state.condenserCirculationPumps,
      [`pump${pumpNumber}`]: {
        ...state.condenserCirculationPumps[`pump${pumpNumber}`],
        flowRate: clampedFlowRate,
      },
    },
  }));
}

// Make-up water system control functions
export function toggleMakeUpWater() {
  log.info('Toggling make-up water');
  reactorStore.update((state) => {
    const newStatus = !state.makeUpWater.status;
    log.debug(`Make-up water ${newStatus ? 'enabled' : 'disabled'}`);
    return {
      ...state,
      makeUpWater: {
        ...state.makeUpWater,
        status: newStatus,
      },
    };
  });
}

export function setMakeUpWaterFlowRate(flowRate: number) {
  const clampedFlowRate = Math.max(0, Math.min(100, flowRate));
  log.info(`Setting make-up water flow rate to ${clampedFlowRate}%`);
  reactorStore.update((state) => ({
    ...state,
    makeUpWater: {
      ...state.makeUpWater,
      flowRate: clampedFlowRate,
    },
  }));
}

// Reactor feed pump control functions
export function toggleReactorFeedPump(pumpNumber: 1 | 2) {
  log.info(`Toggling reactor feed pump ${pumpNumber}`);
  reactorStore.update((state) => {
    const newStatus = !state.reactorFeedPumps[`pump${pumpNumber}`].status;
    log.debug(
      `Reactor feed pump ${pumpNumber} ${newStatus ? 'started' : 'stopped'}`
    );
    return {
      ...state,
      reactorFeedPumps: {
        ...state.reactorFeedPumps,
        [`pump${pumpNumber}`]: {
          ...state.reactorFeedPumps[`pump${pumpNumber}`],
          status: newStatus,
        },
      },
    };
  });
}

export function setReactorFeedPumpFlowRate(
  pumpNumber: 1 | 2,
  flowRate: number
) {
  const clampedFlowRate = Math.max(0, Math.min(100, flowRate));
  log.info(
    `Setting reactor feed pump ${pumpNumber} flow rate to ${clampedFlowRate}%`
  );
  reactorStore.update((state) => ({
    ...state,
    reactorFeedPumps: {
      ...state.reactorFeedPumps,
      [`pump${pumpNumber}`]: {
        ...state.reactorFeedPumps[`pump${pumpNumber}`],
        flowRate: clampedFlowRate,
      },
    },
  }));
}

// HEPA filter control functions
export function toggleHepaFilters() {
  log.info('Toggling HEPA filters');
  reactorStore.update((state) => {
    const newStatus = !state.hepaFilters.status;
    log.debug(`HEPA filters ${newStatus ? 'enabled' : 'disabled'}`);
    return {
      ...state,
      hepaFilters: {
        ...state.hepaFilters,
        status: newStatus,
      },
    };
  });
}

export function setHepaFilterEfficiency(efficiency: number) {
  const clampedEfficiency = Math.max(0, Math.min(100, efficiency));
  log.info(`Setting HEPA filter efficiency to ${clampedEfficiency}%`);
  reactorStore.update((state) => ({
    ...state,
    hepaFilters: {
      ...state.hepaFilters,
      efficiency: clampedEfficiency,
    },
  }));
}

// Fault simulation system functions

// Trigger specific fault
export function triggerFault(
  faultType:
    | 'pump'
    | 'valve'
    | 'sensor'
    | 'controller'
    | 'pipe'
    | 'electrical'
    | 'cooling'
    | 'steam',
  componentId: string,
  severity: 'minor' | 'major' | 'critical'
) {
  reactorStore.update((state) => {
    const newState = JSON.parse(JSON.stringify(state));
    const fault = triggerSpecificFault(faultType, componentId, severity);
    newState.faultSimulation.activeFaults = [
      ...newState.faultSimulation.activeFaults,
      fault,
    ];

    // Update risk level
    const criticalFaults = newState.faultSimulation.activeFaults.filter(
      (f: Fault) => f.severity === 'critical'
    ).length;
    const majorFaults = newState.faultSimulation.activeFaults.filter(
      (f: Fault) => f.severity === 'major'
    ).length;

    if (criticalFaults > 0) {
      newState.faultSimulation.riskLevel = 'critical';
    } else if (majorFaults > 1) {
      newState.faultSimulation.riskLevel = 'high';
    } else if (
      majorFaults > 0 ||
      newState.faultSimulation.activeFaults.length > 2
    ) {
      newState.faultSimulation.riskLevel = 'medium';
    } else {
      newState.faultSimulation.riskLevel = 'low';
    }

    // Add log
    newState.logs = [
      ...newState.logs,
      {
        timestamp: Date.now(),
        message: `FAULT TRIGGERED: ${fault.description} - Severity: ${fault.severity}`,
      },
    ];

    return newState;
  });
}

// Fix fault
export function fixFault(faultId: string) {
  reactorStore.update((state) => {
    const newState = JSON.parse(JSON.stringify(state));
    newState.faultSimulation.activeFaults = repairFault(
      faultId,
      newState.faultSimulation.activeFaults
    );

    // Update risk level
    const criticalFaults = newState.faultSimulation.activeFaults.filter(
      (f: Fault) => f.severity === 'critical' && f.status === 'active'
    ).length;
    const majorFaults = newState.faultSimulation.activeFaults.filter(
      (f: Fault) => f.severity === 'major' && f.status === 'active'
    ).length;
    const activeFaults = newState.faultSimulation.activeFaults.filter(
      (f: Fault) => f.status === 'active'
    ).length;

    if (criticalFaults > 0) {
      newState.faultSimulation.riskLevel = 'critical';
    } else if (majorFaults > 1) {
      newState.faultSimulation.riskLevel = 'high';
    } else if (majorFaults > 0 || activeFaults > 2) {
      newState.faultSimulation.riskLevel = 'medium';
    } else {
      newState.faultSimulation.riskLevel = 'low';
    }

    // Add log
    newState.logs = [
      ...newState.logs,
      {
        timestamp: Date.now(),
        message: `FAULT REPAIRED: ID ${faultId}`,
      },
    ];

    return newState;
  });
}

// Set maintenance level
export function setMaintenanceLevel(level: number) {
  reactorStore.update((state) => ({
    ...state,
    faultSimulation: {
      ...state.faultSimulation,
      maintenanceLevel: Math.max(0, Math.min(100, level)),
    },
  }));
}

// Clear all faults
export function clearAllFaults() {
  reactorStore.update((state) => {
    const newState = JSON.parse(JSON.stringify(state));
    newState.faultSimulation.activeFaults = [];
    newState.faultSimulation.riskLevel = 'low';
    newState.faultSimulation.recommendedActions = [
      'Continue normal operation',
      'Maintain regular maintenance',
    ];

    // Add log
    newState.logs = [
      ...newState.logs,
      {
        timestamp: Date.now(),
        message: 'ALL FAULTS CLEARED',
      },
    ];

    return newState;
  });
}

// Condensate system control functions
export function toggleCondensateSystem() {
  log.info('Toggling condensate system');
  reactorStore.update((state) => {
    const newStatus = !state.condensateSystem.status;
    log.debug(`Condensate system ${newStatus ? 'enabled' : 'disabled'}`);
    return {
      ...state,
      condensateSystem: {
        ...state.condensateSystem,
        status: newStatus,
      },
    };
  });
}

export function setCondensateSystemFlowRate(flowRate: number) {
  const clampedFlowRate = Math.max(0, Math.min(100, flowRate));
  log.info(`Setting condensate system flow rate to ${clampedFlowRate}%`);
  reactorStore.update((state) => ({
    ...state,
    condensateSystem: {
      ...state.condensateSystem,
      flowRate: clampedFlowRate,
    },
  }));
}

export function setCondensateSystemTemperature(temperature: number) {
  const clampedTemperature = Math.max(0, temperature);
  log.info(`Setting condensate system temperature to ${clampedTemperature}°C`);
  reactorStore.update((state) => ({
    ...state,
    condensateSystem: {
      ...state.condensateSystem,
      temperature: clampedTemperature,
    },
  }));
}

// Steam bypass system control functions
export function toggleSteamBypass() {
  log.info('Toggling steam bypass');
  reactorStore.update((state) => {
    const newStatus = !state.steamBypass.status;
    log.debug(`Steam bypass ${newStatus ? 'enabled' : 'disabled'}`);
    return {
      ...state,
      steamBypass: {
        ...state.steamBypass,
        status: newStatus,
      },
    };
  });
}

export function setSteamBypassPressureSetpoint(pressureSetpoint: number) {
  const clampedPressureSetpoint = Math.max(
    6.0,
    Math.min(8.0, pressureSetpoint)
  );
  log.info(
    `Setting steam bypass pressure setpoint to ${clampedPressureSetpoint} MPa`
  );
  reactorStore.update((state) => ({
    ...state,
    steamBypass: {
      ...state.steamBypass,
      pressureSetpoint: clampedPressureSetpoint,
    },
  }));
}

// Core coolant purification system control functions
export function toggleCorePurification() {
  log.info('Toggling core purification');
  reactorStore.update((state) => {
    const newStatus = !state.corePurification.status;
    log.debug(`Core purification ${newStatus ? 'enabled' : 'disabled'}`);
    return {
      ...state,
      corePurification: {
        ...state.corePurification,
        status: newStatus,
      },
    };
  });
}

export function setCorePurificationFlowRate(flowRate: number) {
  const clampedFlowRate = Math.max(0, Math.min(100000, flowRate));
  log.info(`Setting core purification flow rate to ${clampedFlowRate} kg/h`);
  reactorStore.update((state) => ({
    ...state,
    corePurification: {
      ...state.corePurification,
      flowRate: clampedFlowRate,
    },
  }));
}

// Three-impulse level control system control functions
export function setWaterLevelSetpoint(setpoint: number) {
  const clampedSetpoint = Math.max(45, Math.min(90, setpoint));
  log.info(`Setting water level setpoint to ${clampedSetpoint}%`);
  reactorStore.update((state) => ({
    ...state,
    threeImpulseLevelControl: {
      ...state.threeImpulseLevelControl,
      waterLevelSetpoint: clampedSetpoint,
    },
  }));
}

// Save and load functions
export function saveState(): string {
  log.info('Saving reactor state');
  let state;
  reactorStore.subscribe((s) => (state = s))();
  const saveCode = btoa(JSON.stringify(state));
  log.debug('Reactor state saved successfully');
  return saveCode;
}

export function loadState(saveCode: string) {
  log.info('Loading reactor state');
  try {
    const state = JSON.parse(atob(saveCode));
    reactorStore.set(state);
    log.debug('Reactor state loaded successfully');
    return true;
  } catch (error) {
    log.error('Failed to load state:', error);
    return false;
  }
}
