import { makeAutoObservable, computed } from 'mobx';
import log from '@/lib/utils/logger';
import { neutronStore } from './neutronStore';
import { thermalStore } from './thermalStore';

// 物理模型状态接口
interface PhysicsState {
  // 中子物理参数
  neutron: {
    flux: number;
    generationTime: number;
    lifetime: number;
  };

  // 反应性参数
  reactivity: {
    value: number;
    temperatureCoefficient: number;
    voidCoefficient: number;
    fuelTemperatureCoefficient: number;
  };

  // 热工参数
  thermal: {
    power: number;
    temperature: number;
    pressure: number;
    enthalpy: number;
  };

  // 冷却系统参数
  cooling: {
    flowRate: number;
    inletTemperature: number;
    outletTemperature: number;
    pressureDrop: number;
  };

  // 时间参数
  time: {
    simulationTime: number;
    timeStep: number;
  };
}

// 初始状态
const initialState: PhysicsState = {
  // 中子物理参数
  neutron: {
    flux: 1.0e13,
    generationTime: 0.01,
    lifetime: 1.0,
  },

  // 反应性参数
  reactivity: {
    value: 0.0,
    temperatureCoefficient: -0.0001,
    voidCoefficient: 0.0001,
    fuelTemperatureCoefficient: -0.00005,
  },

  // 热工参数
  thermal: {
    power: 1000.0,
    temperature: 600.0,
    pressure: 7.0,
    enthalpy: 2784.0,
  },

  // 冷却系统参数
  cooling: {
    flowRate: 10000.0,
    inletTemperature: 200.0,
    outletTemperature: 300.0,
    pressureDrop: 0.5,
  },

  // 时间参数
  time: {
    simulationTime: 0.0,
    timeStep: 0.1,
  },
};

/**
 * PhysicsStore
 * 物理计算核心，集成中子物理和热工水力计算
 */
export class PhysicsStore {
  // 状态
  state: PhysicsState;

  // 构造函数
  constructor () {
    this.state = { ...initialState };
    makeAutoObservable(this, {
      // 计算属性
      totalReactivity: computed,
      neutronFlux: computed,
      thermalPower: computed,
      coolantTemperature: computed,
    });
  }

  // 总反应性
  get totalReactivity () {
    return neutronStore.state.reactivity.total;
  }

  // 中子通量
  get neutronFlux () {
    return neutronStore.state.neutron.flux.thermal;
  }

  // 热功率
  get thermalPower () {
    return thermalStore.state.thermal.power;
  }

  // 冷却剂温度
  get coolantTemperature () {
    return thermalStore.state.coolant.temperature;
  }

  /**
   * 更新中子通量
   * @param flux 中子通量
   */
  updateNeutronFlux (flux: number) {
    this.state.neutron.flux = flux;
    neutronStore.setNeutronFlux(flux);
    log.debug(`Neutron flux updated to ${flux}`);
  }

  /**
   * 更新反应性
   * @param reactivity 反应性
   */
  updateReactivity (reactivity: number) {
    this.state.reactivity.value = reactivity;
    log.debug(`Reactivity updated to ${reactivity}`);
  }

  /**
   * 更新热功率
   * @param power 热功率
   */
  updatePower (power: number) {
    this.state.thermal.power = power;
    thermalStore.setThermalPower(power);
    neutronStore.setCurrentPower(power);
    log.debug(`Power updated to ${power}`);
  }

  /**
   * 更新温度
   * @param temperature 温度
   */
  updateTemperature (temperature: number) {
    this.state.thermal.temperature = temperature;
    thermalStore.state.coolant.temperature = temperature;
    log.debug(`Temperature updated to ${temperature}`);
  }

  /**
   * 更新压力
   * @param pressure 压力
   */
  updatePressure (pressure: number) {
    this.state.thermal.pressure = pressure;
    thermalStore.setCoolantPressure(pressure);
    log.debug(`Pressure updated to ${pressure}`);
  }

  /**
   * 更新冷却系统流量
   * @param flowRate 流量
   */
  updateCoolingFlowRate (flowRate: number) {
    this.state.cooling.flowRate = flowRate;
    thermalStore.setCoolantFlowRate(flowRate);
    log.debug(`Cooling flow rate updated to ${flowRate}`);
  }

  /**
   * 更新模拟时间
   * @param time 模拟时间
   */
  updateSimulationTime (time: number) {
    this.state.time.simulationTime = time;
    log.debug(`Simulation time updated to ${time}`);
  }

  /**
   * 更新物理计算
   * @param deltaTime 时间步长
   */
  update (deltaTime: number) {
    log.time('Physics store update');

    // 更新模拟时间
    this.state.time.simulationTime += deltaTime;

    // 同步状态到子store
    this.updateNeutronFlux(this.state.neutron.flux);
    this.updatePower(this.state.thermal.power);
    this.updateTemperature(this.state.thermal.temperature);
    this.updatePressure(this.state.thermal.pressure);
    this.updateCoolingFlowRate(this.state.cooling.flowRate);

    log.timeEnd('Physics store update');
  }

  /**
   * 重置状态
   */
  reset () {
    this.state = { ...initialState };
    log.info('Physics store reset');
  }
}

// 导出单例
export const physicsStore = new PhysicsStore();
