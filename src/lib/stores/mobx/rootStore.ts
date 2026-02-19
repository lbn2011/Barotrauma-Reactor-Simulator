import { makeAutoObservable } from 'mobx';
import { PhysicsStore, physicsStore } from './physicsStore';
import { ReactorSystemStore, reactorSystemStore } from './reactorStore';
import { NeutronStore, neutronStore } from './neutronStore';
import { ThermalStore, thermalStore } from './thermalStore';
import { SystemsStore, systemsStore } from './systemsStore';

/**
 * RootStore
 * 作为所有store的容器，管理store之间的依赖关系
 */
export class RootStore {
  // 子store
  physics: PhysicsStore;
  reactor: ReactorSystemStore;
  neutron: NeutronStore;
  thermal: ThermalStore;
  systems: SystemsStore;

  // 构造函数
  constructor() {
    // 使用已有的单例实例
    this.physics = physicsStore;
    this.reactor = reactorSystemStore;
    this.neutron = neutronStore;
    this.thermal = thermalStore;
    this.systems = systemsStore;

    // 使RootStore成为响应式
    makeAutoObservable(this);
  }

  /**
   * 初始化所有store
   */
  initialize() {
    console.log('RootStore initialized');
    // 可以在这里添加初始化逻辑
  }

  /**
   * 重置所有store到初始状态
   */
  reset() {
    this.physics.reset();
    this.reactor.reset();
    this.neutron.reset();
    this.thermal.reset();
    this.systems.reset();
    console.log('All stores reset');
  }

  /**
   * 更新所有物理计算
   * @param deltaTime 时间步长
   */
  updatePhysics(deltaTime: number) {
    // 按顺序更新物理计算
    this.neutron.update(deltaTime);
    this.thermal.update(deltaTime);
    this.physics.update(deltaTime);
    this.systems.update(deltaTime);
  }
}

// 导出单例
export const rootStore = new RootStore();
