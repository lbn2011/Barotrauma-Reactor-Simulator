// Export all models here

// 导入所有模型
import * as neutronModels from './neutron/controlRodPhysics';
import * as voidCoefficientModels from './neutron/voidCoefficient';
import * as xenonPoisoningModels from './neutron/xenonPoisoning';

import * as threeImpulseLevelControlModels from './systems/control/threeImpulseLevelControl';
import * as corePurificationModels from './systems/corePurification';
import * as faultSimulationModels from './systems/faultSimulation';
import * as reactorCoreModels from './systems/reactorCore';
import * as steamBypassModels from './systems/steamBypass';

import * as energyBalanceModels from './thermal/energyBalance';
import * as flowResistanceModels from './thermal/flowResistance';
import * as iapws97Models from './thermal/iapws97';
import * as massBalanceModels from './thermal/massBalance';
import * as waterSteamPropertiesModels from './thermal/waterSteamProperties';

// 统一导出所有模型（保持向后兼容）
export * from './neutron/controlRodPhysics';
export * from './neutron/voidCoefficient';
export * from './neutron/xenonPoisoning';

export * from './systems/control/threeImpulseLevelControl';
export * from './systems/corePurification';
export * from './systems/faultSimulation';
export * from './systems/reactorCore';
export * from './systems/steamBypass';

export * from './thermal/energyBalance';
export * from './thermal/flowResistance';
export * from './thermal/iapws97';
export * from './thermal/massBalance';

// 从 waterSteamProperties 导出，避免函数名冲突
export {
  calculateWaterEnthalpy,
  calculateSteamEnthalpy,
  calculateWaterDensity,
  calculateSteamDensity,
  calculateVoidFraction,
  calculateMixedDensity,
  calculateSaturationTemperature as calculateSaturationTemperatureSimple,
} from './thermal/waterSteamProperties';

// 分组导出（简化导入）
export const neutron = {
  ...neutronModels,
  ...voidCoefficientModels,
  ...xenonPoisoningModels,
};

export const systems = {
  control: {
    ...threeImpulseLevelControlModels,
  },
  corePurification: corePurificationModels,
  faultSimulation: faultSimulationModels,
  reactorCore: reactorCoreModels,
  steamBypass: steamBypassModels,
};

export const thermal = {
  ...energyBalanceModels,
  ...flowResistanceModels,
  ...iapws97Models,
  ...massBalanceModels,
  waterSteam: {
    ...waterSteamPropertiesModels,
    calculateSaturationTemperature:
      iapws97Models.calculateSaturationTemperature,
    calculateSaturationTemperatureSimple:
      waterSteamPropertiesModels.calculateSaturationTemperature,
  },
};
