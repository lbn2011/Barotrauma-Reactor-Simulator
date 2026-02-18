// 测试 IAPWS-97 实现
import { thermal } from './src/models/index.ts';

const {
  getRegion,
  calculateSaturationPressure,
  calculateSaturationTemperature,
  calculateInternalEnergy,
  calculateEnthalpy,
  calculateEntropy,
  calculateSpecificVolume,
  calculateSpecificHeatCapacityP,
  calculateSpecificHeatCapacityV,
} = thermal;

// 测试数据
const testCases = [
  { T: 373.15, P: 0.101325, description: '100°C, 1 atm (饱和状态)' },
  { T: 293.15, P: 0.101325, description: '20°C, 1 atm (液态水)' },
  { T: 473.15, P: 0.101325, description: '200°C, 1 atm (蒸汽)' },
  { T: 373.15, P: 1.0, description: '100°C, 1 MPa (液态水)' },
];

console.log('IAPWS-97 实现测试\n');

for (const testCase of testCases) {
  console.log(`测试: ${testCase.description}`);
  console.log(`温度: ${testCase.T} K (${testCase.T - 273.15} °C)`);
  console.log(`压力: ${testCase.P} MPa`);

  try {
    const region = getRegion(testCase.T, testCase.P);
    console.log(`区域: ${region}`);

    const u = calculateInternalEnergy(testCase.T, testCase.P);
    console.log(`比内能: ${u.toFixed(2)} kJ/kg`);

    const h = calculateEnthalpy(testCase.T, testCase.P);
    console.log(`焓: ${h.toFixed(2)} kJ/kg`);

    const s = calculateEntropy(testCase.T, testCase.P);
    console.log(`熵: ${s.toFixed(4)} kJ/(kg·K)`);

    const v = calculateSpecificVolume(testCase.T, testCase.P);
    console.log(`比容: ${v.toFixed(6)} m³/kg`);

    const cp = calculateSpecificHeatCapacityP(testCase.T, testCase.P);
    console.log(`定压比热容: ${cp.toFixed(3)} kJ/(kg·K)`);

    const cv = calculateSpecificHeatCapacityV(testCase.T, testCase.P);
    console.log(`定容比热容: ${cv.toFixed(3)} kJ/(kg·K)`);
  } catch (error) {
    console.log(`错误: ${error.message}`);
  }

  console.log('---\n');
}

// 测试饱和压力和温度
console.log('饱和状态测试\n');

// 测试饱和压力（给定温度）
const testTemperatures = [300, 350, 373.15, 400];
for (const T of testTemperatures) {
  try {
    const ps = calculateSaturationPressure(T);
    console.log(
      `温度 ${T} K (${T - 273.15} °C) 时的饱和压力: ${ps.toFixed(6)} MPa`
    );
  } catch (error) {
    console.log(`计算饱和压力错误 (T=${T}): ${error.message}`);
  }
}

console.log('');

// 测试饱和温度（给定压力）
const testPressures = [0.1, 0.5, 1.0, 5.0];
for (const P of testPressures) {
  try {
    const ts = calculateSaturationTemperature(P);
    console.log(
      `压力 ${P} MPa 时的饱和温度: ${ts.toFixed(2)} K (${ts - 273.15} °C)`
    );
  } catch (error) {
    console.log(`计算饱和温度错误 (P=${P}): ${error.message}`);
  }
}
