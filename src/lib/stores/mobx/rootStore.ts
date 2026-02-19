import { makeAutoObservable } from 'mobx';
import logger, { ModuleType } from '@/lib/utils/logger';
import { PhysicsStore, physicsStore } from './physicsStore';
import { ReactorSystemStore, reactorSystemStore } from './reactorStore';
import { NeutronStore, neutronStore } from './neutronStore';
import { ThermalStore, thermalStore } from './thermalStore';
import { SystemsStore, systemsStore } from './systemsStore';

export class RootStore {
  physics: PhysicsStore;
  reactor: ReactorSystemStore;
  neutron: NeutronStore;
  thermal: ThermalStore;
  systems: SystemsStore;

  constructor () {
    logger.trace(ModuleType.STORE, 'RootStore constructor called');

    this.physics = physicsStore;
    this.reactor = reactorSystemStore;
    this.neutron = neutronStore;
    this.thermal = thermalStore;
    this.systems = systemsStore;

    makeAutoObservable(this);

    logger.info(ModuleType.STORE, 'RootStore initialized with all sub-stores');
  }

  initialize () {
    logger.info(ModuleType.STORE, 'Initializing all stores');

    this.physics.reset();
    this.reactor.reset();
    this.neutron.reset();
    this.thermal.reset();
    this.systems.reset();

    logger.info(ModuleType.STORE, 'All stores initialized successfully');
  }

  reset () {
    logger.info(ModuleType.STORE, 'Resetting all stores');

    this.physics.reset();
    this.reactor.reset();
    this.neutron.reset();
    this.thermal.reset();
    this.systems.reset();

    logger.info(ModuleType.STORE, 'All stores reset successfully');
  }

  updatePhysics (deltaTime: number) {
    logger.trace(ModuleType.STORE, 'Updating physics calculations', {
      deltaTime,
    });

    this.neutron.update(deltaTime);
    this.thermal.update(deltaTime);
    this.physics.update(deltaTime);
    this.systems.update(deltaTime);

    logger.trace(ModuleType.STORE, 'Physics calculations completed');
  }
}

export const rootStore = new RootStore();
