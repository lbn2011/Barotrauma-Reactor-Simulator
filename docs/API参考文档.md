# Barotrauma 反应堆模拟器 API 参考文档

## 1. 概述

本文档提供了 Barotrauma 反应堆模拟器的完整 API 参考，包括状态管理、物理模型、控制函数和 Web Workers 接口。这些 API 可用于扩展模拟器功能、集成第三方系统或进行高级自定义。

## 2. 状态管理 API

### 2.1 反应堆状态存储

**文件位置**: `src/lib/stores/reactorStore.ts`

#### 2.1.1 状态类型定义

```typescript
// 反应堆状态类型
export interface ReactorState {
  // 模拟控制
  isRunning: boolean;
  simulationTime: number; // 模拟时间（秒）

  // 反应堆控制（吸收）棒
  controlRods: {
    position: number; // 控制棒位置（0-100%）
    insertionSpeed: number; // 插入速度
  };

  // 反应堆功率调节面板
  powerRegulation: {
    powerLevel: number; // 功率水平（0-100%）
    targetPower: number; // 目标功率
    reactivity: number; // 反应性
  };

  // 更多状态字段...
}
```

#### 2.1.2 状态存储实例

```typescript
// 创建store
export const reactorStore: Writable<ReactorState> = writable(initialState);
```

#### 2.1.3 状态订阅方法

```typescript
// 订阅状态变化
const unsubscribe = reactorStore.subscribe((state) => {
  // 处理状态变化
  console.log('Current power level:', state.powerRegulation.powerLevel);
});

// 取消订阅
unsubscribe();
```

### 2.2 控制函数

#### 2.2.1 模拟控制

| 函数名                 | 参数 | 返回值        | 功能描述                   |
| ---------------------- | ---- | ------------- | -------------------------- |
| `startSimulation()`    | 无   | void          | 启动模拟                   |
| `stopSimulation()`     | 无   | void          | 停止模拟                   |
| `resetSimulation()`    | 无   | void          | 重置模拟到初始状态         |
| `updateReactorState()` | 无   | Promise<void> | 更新反应堆状态（内部使用） |

**使用示例**:

```typescript
import { startSimulation, stopSimulation } from '$lib/stores/reactorStore';

// 启动模拟
startSimulation();

// 停止模拟
stopSimulation();
```

#### 2.2.2 控制棒操作

| 函数名                                    | 参数                         | 返回值 | 功能描述       |
| ----------------------------------------- | ---------------------------- | ------ | -------------- |
| `setControlRodPosition(position: number)` | position: 控制棒位置 (0-100) | void   | 设置控制棒位置 |

**使用示例**:

```typescript
import { setControlRodPosition } from '$lib/stores/reactorStore';

// 设置控制棒位置为75%
setControlRodPosition(75);
```

#### 2.2.3 功率调节

| 函数名                          | 参数                    | 返回值 | 功能描述     |
| ------------------------------- | ----------------------- | ------ | ------------ |
| `setTargetPower(power: number)` | power: 目标功率 (0-100) | void   | 设置目标功率 |

**使用示例**:

```typescript
import { setTargetPower } from '$lib/stores/reactorStore';

// 设置目标功率为80%
setTargetPower(80);
```

#### 2.2.4 泵控制

| 函数名                                         | 参数                   | 返回值                                       | 功能描述               |
| ---------------------------------------------- | ---------------------- | -------------------------------------------- | ---------------------- | ------------------ |
| `toggleRecirculationPump(pumpNumber: 1         | 2)`                    | pumpNumber: 泵编号                           | void                   | 切换再循环泵状态   |
| `setRecirculationPumpSpeed(pumpNumber: 1       | 2, speed: number)`     | pumpNumber: 泵编号<br>speed: 转速 (0-100)    | void                   | 设置再循环泵转速   |
| `toggleEmergencyCoolingPump(pumpNumber: 1      | 2)`                    | pumpNumber: 泵编号                           | void                   | 切换应急冷却泵状态 |
| `setEmergencyCoolingPumpFlowRate(pumpNumber: 1 | 2, flowRate: number)`  | pumpNumber: 泵编号<br>flowRate: 流量 (0-100) | void                   | 设置应急冷却泵流量 |
| `toggleReactorDrain()`                         | 无                     | void                                         | 切换反应堆排水状态     |
| `setReactorDrainFlowRate(flowRate: number)`    | flowRate: 流量 (0-100) | void                                         | 设置反应堆排水流量     |
| `toggleCoreCoolingPump()`                      | 无                     | void                                         | 切换堆芯离线冷却泵状态 |
| `setCoreCoolingPumpFlowRate(flowRate: number)` | flowRate: 流量 (0-100) | void                                         | 设置堆芯离线冷却泵流量 |

**使用示例**:

```typescript
import { toggleRecirculationPump, setRecirculationPumpSpeed } from '$lib/stores/reactorStore';

// 切换1号再循环泵
toggleRecirculationPump(1);

// 设置2号再循环泵转速为80%
setRecirculationPumpSpeed(2, 80);
```

#### 2.2.5 汽轮机控制

| 函数名                         | 参数               | 返回值 | 功能描述       |
| ------------------------------ | ------------------ | ------ | -------------- |
| `toggleTurbine()`              | 无                 | void   | 切换汽轮机状态 |
| `setTurbineLoad(load: number)` | load: 负荷 (0-100) | void   | 设置汽轮机负荷 |

**使用示例**:

```typescript
import { toggleTurbine, setTurbineLoad } from '$lib/stores/reactorStore';

// 切换汽轮机状态
toggleTurbine();

// 设置汽轮机负荷为75%
setTurbineLoad(75);
```

#### 2.2.6 其他系统控制

| 函数名                                                     | 参数                         | 返回值                                       | 功能描述                         |
| ---------------------------------------------------------- | ---------------------------- | -------------------------------------------- | -------------------------------- | -------------------- |
| `setDeaeratorPressure(pressure: number)`                   | pressure: 压力               | void                                         | 设置除氧器压力                   |
| `setDeaeratorLevel(level: number)`                         | level: 液位 (0-100)          | void                                         | 设置除氧器液位                   |
| `toggleCondenserVacuum()`                                  | 无                           | void                                         | 切换凝汽器真空系统状态           |
| `setCondenserVacuumLevel(vacuumLevel: number)`             | vacuumLevel: 真空度 (0-1)    | void                                         | 设置凝汽器真空度                 |
| `toggleSteamDump()`                                        | 无                           | void                                         | 切换蒸汽排汽状态                 |
| `setSteamDumpCapacity(capacity: number)`                   | capacity: 容量 (0-100)       | void                                         | 设置蒸汽排汽容量                 |
| `setLubricationOilPressure(pressure: number)`              | pressure: 压力               | void                                         | 设置润滑油压力                   |
| `setLubricationOilTemperature(temperature: number)`        | temperature: 温度            | void                                         | 设置润滑油温度                   |
| `setSealOilPressure(pressure: number)`                     | pressure: 压力               | void                                         | 设置密封油压力                   |
| `setCondenserHotwellLevel(level: number)`                  | level: 液位 (0-100)          | void                                         | 设置凝汽器热井液位               |
| `toggleCondenserCirculationPump(pumpNumber: 1              | 2)`                          | pumpNumber: 泵编号                           | void                             | 切换凝汽器循环泵状态 |
| `setCondenserCirculationPumpFlowRate(pumpNumber: 1         | 2, flowRate: number)`        | pumpNumber: 泵编号<br>flowRate: 流量 (0-100) | void                             | 设置凝汽器循环泵流量 |
| `toggleMakeUpWater()`                                      | 无                           | void                                         | 切换补水系统状态                 |
| `setMakeUpWaterFlowRate(flowRate: number)`                 | flowRate: 流量 (0-100)       | void                                         | 设置补水系统流量                 |
| `toggleReactorFeedPump(pumpNumber: 1                       | 2)`                          | pumpNumber: 泵编号                           | void                             | 切换反应堆给水泵状态 |
| `setReactorFeedPumpFlowRate(pumpNumber: 1                  | 2, flowRate: number)`        | pumpNumber: 泵编号<br>flowRate: 流量 (0-100) | void                             | 设置反应堆给水泵流量 |
| `toggleHepaFilters()`                                      | 无                           | void                                         | 切换HEPA过滤器状态               |
| `setHepaFilterEfficiency(efficiency: number)`              | efficiency: 效率 (0-100)     | void                                         | 设置HEPA过滤器效率               |
| `toggleCondensateSystem()`                                 | 无                           | void                                         | 切换凝结水系统状态               |
| `setCondensateSystemFlowRate(flowRate: number)`            | flowRate: 流量 (0-100)       | void                                         | 设置凝结水系统流量               |
| `setCondensateSystemTemperature(temperature: number)`      | temperature: 温度            | void                                         | 设置凝结水系统温度               |
| `toggleSteamBypass()`                                      | 无                           | void                                         | 切换汽轮机旁路系统状态           |
| `setSteamBypassPressureSetpoint(pressureSetpoint: number)` | pressureSetpoint: 压力设定点 | void                                         | 设置汽轮机旁路系统压力设定点     |
| `toggleCorePurification()`                                 | 无                           | void                                         | 切换堆芯冷却剂净化系统状态       |
| `setCorePurificationFlowRate(flowRate: number)`            | flowRate: 流量               | void                                         | 设置堆芯冷却剂净化系统流量       |
| `setWaterLevelSetpoint(setpoint: number)`                  | setpoint: 水位设定点 (45-90) | void                                         | 设置三冲量水位控制系统水位设定点 |
| `setMaintenanceLevel(level: number)`                       | level: 维护水平 (0-100)      | void                                         | 设置故障模拟系统维护水平         |

### 2.3 存档和加载

| 函数名                        | 参数                     | 返回值  | 功能描述                       |
| ----------------------------- | ------------------------ | ------- | ------------------------------ |
| `saveState()`                 | 无                       | string  | 保存当前状态为Base64编码字符串 |
| `loadState(saveCode: string)` | saveCode: 保存的状态编码 | boolean | 加载保存的状态，返回是否成功   |

**使用示例**:

```typescript
import { saveState, loadState } from '$lib/stores/reactorStore';

// 保存状态
const saveCode = saveState();
localStorage.setItem('reactorState', saveCode);

// 加载状态
const savedState = localStorage.getItem('reactorState');
if (savedState) {
  const success = loadState(savedState);
  console.log('State loaded:', success);
}
```

## 3. 物理模型 API

### 3.1 热工水力模型

**文件位置**: `src/models/thermal/`

#### 3.1.1 质量平衡

| 函数名                       | 参数                   | 返回值            | 功能描述     |
| ---------------------------- | ---------------------- | ----------------- | ------------ |
| `calculateMassBalance(data)` | data: 质量平衡输入数据 | MassBalanceResult | 计算质量平衡 |

**参数结构**:

```typescript
interface MassBalanceInput {
  M_reactor: number; // 反应堆内水的质量
  M_condenser: number; // 凝汽器内水的质量
  M_deaerator: number; // 除氧器内水的质量
  m_feedwater: number; // 给水流量
  m_steam: number; // 蒸汽流量
  m_condensate: number; // 凝结水流量
  m_cooling: number; // 冷却水流量
  m_steam_heating: number; // 加热蒸汽流量
  m_feedwater_out: number; // 出口给水流量
}
```

**返回值结构**:

```typescript
interface MassBalanceResult {
  dM_reactor: number; // 反应堆质量变化率
  dM_condenser: number; // 凝汽器质量变化率
  dM_deaerator: number; // 除氧器质量变化率
  newMasses: {
    M_reactor: number;
    M_condenser: number;
    M_deaerator: number;
  };
}
```

#### 3.1.2 能量平衡

| 函数名                         | 参数                   | 返回值              | 功能描述     |
| ------------------------------ | ---------------------- | ------------------- | ------------ |
| `calculateEnergyBalance(data)` | data: 能量平衡输入数据 | EnergyBalanceResult | 计算能量平衡 |

**参数结构**:

```typescript
interface EnergyBalanceInput {
  P_nuclear: number; // 核功率
  η_thermal: number; // 热效率
  h_steam: number; // 蒸汽焓
  h_feedwater: number; // 给水焓
  m_coolant: number; // 冷却剂流量
  c_p: number; // 冷却剂比热容
  h_inlet: number; // 入口焓
  h_outlet: number; // 出口焓
  η_turbine: number; // 汽轮机效率
  η_generator: number; // 发电机效率
}
```

**返回值结构**:

```typescript
interface EnergyBalanceResult {
  Q_thermal: number; // 热功率
  m_steam: number; // 蒸汽流量
  ΔT_coolant: number; // 冷却剂温度变化
  P_mechanical: number; // 机械功率
  P_electrical: number; // 电功率
}
```

#### 3.1.3 流动阻力

| 函数名                                                           | 参数                                       | 返回值                | 功能描述     |
| ---------------------------------------------------------------- | ------------------------------------------ | --------------------- | ------------ |
| `calculateReynoldsNumber(data)`                                  | data: 雷诺数输入数据                       | ReynoldsResult        | 计算雷诺数   |
| `calculateFrictionCoefficient(Re: number, ε: number, D: number)` | Re: 雷诺数<br>ε: 管道粗糙度<br>D: 管道直径 | number                | 计算摩擦系数 |
| `calculateFlowResistance(data)`                                  | data: 流动阻力输入数据                     | FlowResistanceResult  | 计算流动阻力 |
| `calculatePumpPerformance(data)`                                 | data: 泵性能输入数据                       | PumpPerformanceResult | 计算泵性能   |

### 3.2 中子物理模型

**文件位置**: `src/models/neutron/`

#### 3.2.1 空泡系数

| 函数名                           | 参数                   | 返回值                | 功能描述         |
| -------------------------------- | ---------------------- | --------------------- | ---------------- |
| `calculateVoidCoefficient(data)` | data: 空泡系数输入数据 | VoidCoefficientResult | 计算空泡系数效应 |

**参数结构**:

```typescript
interface VoidCoefficientInput {
  α_void: number; // 空泡系数
  Δα: number; // 空泡份额变化
  P_current: number; // 当前功率
  τ_delay: number; // 延迟时间
}
```

**返回值结构**:

```typescript
interface VoidCoefficientResult {
  ρ_void: number; // 空泡反应性
  P_new: number; // 新功率
  P_delayed: number; // 延迟后的功率
}
```

#### 3.2.2 氙中毒

| 函数名                          | 参数                 | 返回值               | 功能描述           |
| ------------------------------- | -------------------- | -------------------- | ------------------ |
| `getDefaultXenonParameters()`   | 无                   | XenonParameters      | 获取默认氙中毒参数 |
| `calculateXenonPoisoning(data)` | data: 氙中毒输入数据 | XenonPoisoningResult | 计算氙中毒效应     |

**参数结构**:

```typescript
interface XenonPoisoningInput {
  Xe: number; // 氙-135浓度
  I: number; // 碘-135浓度
  λ_Xe: number; // 氙-135衰变常数
  λ_I: number; // 碘-135衰变常数
  σ_Xe: number; // 氙-135中子俘获截面
  φ: number; // 中子通量
  γ_Xe: number; // 氙-135产额
  γ_I: number; // 碘-135产额
  Σ_f: number; // 裂变截面
  dt: number; // 时间步长
}
```

**返回值结构**:

```typescript
interface XenonPoisoningResult {
  Xe_new: number; // 新的氙-135浓度
  I_new: number; // 新的碘-135浓度
  ρ_Xe: number; // 氙中毒反应性
}
```

#### 3.2.3 控制棒物理

| 函数名                                | 参数                       | 返回值           | 功能描述         |
| ------------------------------------- | -------------------------- | ---------------- | ---------------- |
| `calculateControlRodReactivity(data)` | data: 控制棒反应性输入数据 | ControlRodResult | 计算控制棒反应性 |

**参数结构**:

```typescript
interface ControlRodInput {
  ρ_max: number; // 最大反应性
  z: number; // 控制棒插入深度
  L: number; // 控制棒长度
  ρ_graphite_effect: number; // 石墨尖端效应
}
```

**返回值结构**:

```typescript
interface ControlRodResult {
  ρ_rod: number; // 控制棒反应性
  ρ_tip: number; // 石墨尖端效应反应性
  ρ_absorption: number; // 吸收效应反应性
}
```

### 3.3 系统模型

**文件位置**: `src/models/systems/`

#### 3.3.1 反应堆堆芯

| 函数名                       | 参数                     | 返回值            | 功能描述           |
| ---------------------------- | ------------------------ | ----------------- | ------------------ |
| `calculateReactorCore(data)` | data: 反应堆堆芯输入数据 | ReactorCoreResult | 计算反应堆堆芯状态 |

#### 3.3.2 汽轮机旁路

| 函数名                       | 参数                   | 返回值            | 功能描述             |
| ---------------------------- | ---------------------- | ----------------- | -------------------- |
| `calculateSteamBypass(data)` | data: 蒸汽旁路输入数据 | SteamBypassResult | 计算蒸汽旁路系统状态 |

#### 3.3.3 堆芯净化

| 函数名                            | 参数                   | 返回值                 | 功能描述             |
| --------------------------------- | ---------------------- | ---------------------- | -------------------- |
| `calculateCorePurification(data)` | data: 堆芯净化输入数据 | CorePurificationResult | 计算堆芯净化系统状态 |

#### 3.3.4 三冲量水位控制

| 函数名                                    | 参数                         | 返回值             | 功能描述                   |
| ----------------------------------------- | ---------------------------- | ------------------ | -------------------------- |
| `calculateThreeImpulseLevelControl(data)` | data: 三冲量水位控制输入数据 | ThreeImpulseResult | 计算三冲量水位控制系统状态 |

#### 3.3.5 故障模拟

| 函数名                 | 参数                   | 返回值                | 功能描述     |
| ---------------------- | ---------------------- | --------------------- | ------------ |
| `simulateFaults(data)` | data: 故障模拟输入数据 | FaultSimulationResult | 模拟系统故障 |

## 4. Web Workers API

### 4.1 Worker 管理器

**文件位置**: `src/workers/workerManager.ts`

#### 4.1.1 初始化和管理

| 函数名         | 参数 | 返回值 | 功能描述             |
| -------------- | ---- | ------ | -------------------- |
| `initialize()` | 无   | void   | 初始化 Web Workers   |
| `terminate()`  | 无   | void   | 终止所有 Web Workers |

**使用示例**:

```typescript
import { workerManager } from '$workers/workerManager';

// 初始化 Worker
workerManager.initialize();

// 终止 Worker（在应用关闭时）
// workerManager.terminate();
```

#### 4.1.2 计算方法

| 函数名                             | 参数                     | 返回值                         | 功能描述           |
| ---------------------------------- | ------------------------ | ------------------------------ | ------------------ |
| `calculateMassBalance(data)`       | data: 质量平衡输入数据   | Promise<MassBalanceResult>     | 计算质量平衡       |
| `calculateEnergyBalance(data)`     | data: 能量平衡输入数据   | Promise<EnergyBalanceResult>   | 计算能量平衡       |
| `calculateVoidCoefficient(data)`   | data: 空泡系数输入数据   | Promise<VoidCoefficientResult> | 计算空泡系数效应   |
| `calculateXenonPoisoning(data)`    | data: 氙中毒输入数据     | Promise<XenonPoisoningResult>  | 计算氙中毒效应     |
| `calculateControlRodPhysics(data)` | data: 控制棒物理输入数据 | Promise<ControlRodResult>      | 计算控制棒物理特性 |
| `calculateReactorCore(data)`       | data: 反应堆堆芯输入数据 | Promise<ReactorCoreResult>     | 计算反应堆堆芯状态 |
| `processAlarmData(data)`           | data: 警报数据输入数据   | Promise<AlarmDataResult>       | 处理警报数据       |
| `processTrendData(data)`           | data: 趋势数据输入数据   | Promise<TrendDataResult>       | 处理趋势数据       |
| `generateReport(data)`             | data: 报告输入数据       | Promise<ReportResult>          | 生成报告           |

**使用示例**:

```typescript
import { workerManager } from '$workers/workerManager';

// 计算反应堆堆芯状态
async function updateReactor() {
  const result = await workerManager.calculateReactorCore({
    P_nuclear: 1000,
    M_reactor: 100000,
    // 其他参数...
  });

  console.log('Reactor core result:', result);
}

updateReactor();
```

### 4.2 物理计算 Worker

**文件位置**: `src/workers/physicsCalculation.worker.ts`

#### 4.2.1 消息类型

| 消息类型                     | 描述               | 输入数据             | 输出数据              |
| ---------------------------- | ------------------ | -------------------- | --------------------- |
| `calculateMassBalance`       | 计算质量平衡       | MassBalanceInput     | MassBalanceResult     |
| `calculateEnergyBalance`     | 计算能量平衡       | EnergyBalanceInput   | EnergyBalanceResult   |
| `calculateVoidCoefficient`   | 计算空泡系数效应   | VoidCoefficientInput | VoidCoefficientResult |
| `calculateXenonPoisoning`    | 计算氙中毒效应     | XenonPoisoningInput  | XenonPoisoningResult  |
| `calculateControlRodPhysics` | 计算控制棒物理特性 | ControlRodInput      | ControlRodResult      |
| `calculateReactorCore`       | 计算反应堆堆芯状态 | ReactorCoreInput     | ReactorCoreResult     |

### 4.3 数据处理 Worker

**文件位置**: `src/workers/dataProcessing.worker.ts`

#### 4.3.1 消息类型

| 消息类型           | 描述         | 输入数据       | 输出数据        |
| ------------------ | ------------ | -------------- | --------------- |
| `processAlarmData` | 处理警报数据 | AlarmDataInput | AlarmDataResult |
| `processTrendData` | 处理趋势数据 | TrendDataInput | TrendDataResult |
| `generateReport`   | 生成报告     | ReportInput    | ReportResult    |

## 5. 工具函数 API

### 5.1 通用工具

**文件位置**: `src/lib/utils.ts`

| 函数名                                                                           | 参数                                              | 返回值 | 功能描述             |
| -------------------------------------------------------------------------------- | ------------------------------------------------- | ------ | -------------------- |
| `clamp(value: number, min: number, max: number)`                                 | value: 输入值<br>min: 最小值<br>max: 最大值       | number | 将值限制在指定范围内 |
| `formatNumber(value: number, decimals: number)`                                  | value: 数值<br>decimals: 小数位数                 | string | 格式化数值为字符串   |
| `calculatePercentage(current: number, total: number)`                            | current: 当前值<br>total: 总值                    | number | 计算百分比           |
| `linearInterpolation(x: number, x1: number, y1: number, x2: number, y2: number)` | x: 输入值<br>x1, y1: 第一个点<br>x2, y2: 第二个点 | number | 线性插值             |

### 5.2 数据处理

| 函数名                                                    | 参数                                      | 返回值        | 功能描述       |
| --------------------------------------------------------- | ----------------------------------------- | ------------- | -------------- |
| `calculateTrend(history: number[], currentValue: number)` | history: 历史数据<br>currentValue: 当前值 | TrendResult   | 计算数据趋势   |
| `calculateMovingAverage(data: number[], window: number)`  | data: 数据数组<br>window: 窗口大小        | number[]      | 计算移动平均值 |
| `detectAnomalies(data: number[], threshold: number)`      | data: 数据数组<br>threshold: 异常阈值     | AnomalyResult | 检测数据异常   |

### 5.3 时间处理

| 函数名                                    | 参数                  | 返回值 | 功能描述              |
| ----------------------------------------- | --------------------- | ------ | --------------------- |
| `formatTime(seconds: number)`             | seconds: 秒数         | string | 格式化时间为 HH:MM:SS |
| `calculateElapsedTime(startTime: number)` | startTime: 开始时间戳 | number | 计算经过的时间（秒）  |

### 5.4 日志工具

**文件位置**: `src/lib/utils/logger.ts`

日志工具是一个基于 consola 库的封装，提供了统一的日志接口，支持多种日志级别和彩色输出，可用于替代直接的 `console` 语句。

#### 5.4.1 日志方法

| 方法名        | 参数                | 返回值 | 功能描述       |
| ------------- | ------------------- | ------ | -------------- |
| `log.info()`  | ...args: any[]      | void   | 普通信息日志   |
| `log.success()` | ...args: any[]     | void   | 成功信息日志   |
| `log.warn()`  | ...args: any[]      | void   | 警告信息日志   |
| `log.error()` | ...args: any[]      | void   | 错误信息日志   |
| `log.debug()` | ...args: any[]      | void   | 调试信息日志   |
| `log.trace()` | ...args: any[]      | void   | 追踪信息日志   |
| `log.fatal()` | ...args: any[]      | void   | 致命错误日志   |
| `log.clear()` | 无                  | void   | 清除控制台     |
| `log.stats()` | obj: Record<string, any> | void   | 统计信息日志   |
| `log.time()`  | label: string       | void   | 开始时间记录   |
| `log.timeEnd()` | label: string      | void   | 结束时间记录   |

#### 5.4.2 使用示例

```typescript
import log from '@/lib/utils/logger';

// 普通信息日志
log.info('应用启动');
log.info('当前用户:', { name: '张三', role: 'admin' });

// 成功信息日志
log.success('数据加载成功');
log.success('操作完成', { result: 'success' });

// 警告信息日志
log.warn('内存使用过高');
log.warn('API 响应缓慢', { responseTime: 1500 });

// 错误信息日志
log.error('网络请求失败');
log.error('数据解析错误', { error: 'Invalid JSON' });

// 调试信息日志
log.debug('组件挂载');
log.debug('状态更新', { state: { count: 10 } });

// 追踪信息日志
log.trace('函数执行开始');
log.trace('循环执行', { iteration: 5 });

// 致命错误信息日志
log.fatal('数据库连接失败');
log.fatal('系统崩溃', { error: 'Out of memory' });

// 清除控制台
log.clear();

// 统计信息日志
log.stats({ memory: '512MB', cpu: '25%', uptime: '10m' });

// 时间记录
log.time('API 请求');
// 模拟 API 请求
setTimeout(() => {
  log.timeEnd('API 请求');
}, 1000);
```

## 6. 组件 API

### 6.1 UI 组件

**文件位置**: `src/lib/components/ui/`

#### 6.1.1 按钮组件

**文件位置**: `src/lib/components/ui/button/button.svelte`

| 属性       | 类型       | 默认值        | 功能描述         |
| ---------- | ---------- | ------------- | ---------------- | ----------- | --------- | -------- | --------- | ------------ |
| `variant`  | 'default'  | 'destructive' | 'outline'        | 'secondary' | 'ghost'   | 'link'   | 'default' | 按钮样式变体 |
| `size`     | 'default'  | 'sm'          | 'lg'             | 'icon'      | 'default' | 按钮大小 |
| `disabled` | boolean    | false         | 是否禁用         |
| `loading`  | boolean    | false         | 是否显示加载状态 |
| `form`     | string     | -             | 关联的表单ID     |
| `type`     | 'button'   | 'submit'      | 'reset'          | 'button'    | 按钮类型  |
| `onClick`  | () => void | -             | 点击事件处理函数 |

**使用示例**:

```svelte
<script>
import Button from '$lib/components/ui/button';
</script>

<Button variant="default" size="lg" on:click={() => console.log('Clicked')}>启动模拟</Button>
```

#### 6.1.2 卡片组件

**文件位置**: `src/lib/components/ui/card/`

| 组件              | 功能描述     |
| ----------------- | ------------ |
| `Card`            | 卡片容器     |
| `CardHeader`      | 卡片头部     |
| `CardTitle`       | 卡片标题     |
| `CardDescription` | 卡片描述     |
| `CardContent`     | 卡片内容     |
| `CardFooter`      | 卡片底部     |
| `CardAction`      | 卡片操作按钮 |

**使用示例**:

```svelte
<script>
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '$lib/components/ui/card';
</script>

<Card>
  <CardHeader>
    <CardTitle>反应堆状态</CardTitle>
    <CardDescription>当前运行参数</CardDescription>
  </CardHeader>
  <CardContent>
    <!-- 卡片内容 -->
  </CardContent>
  <CardFooter>
    <!-- 卡片底部操作 -->
  </CardFooter>
</Card>
```

#### 6.1.3 输入组件

**文件位置**: `src/lib/components/ui/input/input.svelte`

| 属性          | 类型               | 默认值 | 功能描述             |
| ------------- | ------------------ | ------ | -------------------- |
| `type`        | string             | 'text' | 输入类型             |
| `value`       | string             | -      | 输入值               |
| `placeholder` | string             | -      | 占位文本             |
| `disabled`    | boolean            | false  | 是否禁用             |
| `required`    | boolean            | false  | 是否必填             |
| `onChange`    | (e: Event) => void | -      | 输入变化事件处理函数 |

#### 6.1.4 滑块组件

**文件位置**: `src/lib/components/ui/slider/slider.svelte`

| 属性            | 类型                      | 默认值 | 功能描述           |
| --------------- | ------------------------- | ------ | ------------------ |
| `value`         | number[]                  | [0]    | 滑块值             |
| `min`           | number                    | 0      | 最小值             |
| `max`           | number                    | 100    | 最大值             |
| `step`          | number                    | 1      | 步长               |
| `disabled`      | boolean                   | false  | 是否禁用           |
| `onValueChange` | (value: number[]) => void | -      | 值变化事件处理函数 |

#### 6.1.5 图表组件

**文件位置**: `src/lib/components/ui/chart/`

| 组件             | 功能描述     |
| ---------------- | ------------ |
| `ChartContainer` | 图表容器     |
| `ChartTooltip`   | 图表 tooltip |
| `ChartStyle`     | 图表样式     |

#### 6.1.6 系统示意图组件

**文件位置**: `src/lib/components/ui/system-schematic/system-schematic.svelte`

| 属性             | 类型               | 默认值 | 功能描述     |
| ---------------- | ------------------ | ------ | ------------ |
| `nodes`          | SystemNode[]       | []     | 系统节点     |
| `connections`    | SystemConnection[] | []     | 系统连接     |
| `width`          | number             | 800    | 示意图宽度   |
| `height`         | number             | 600    | 示意图高度   |
| `interactive`    | boolean            | true   | 是否可交互   |
| `showLabels`     | boolean            | true   | 是否显示标签 |
| `showParameters` | boolean            | true   | 是否显示参数 |

### 6.2 面板组件

**文件位置**: `src/routes/panels/`

#### 6.2.1 控制棒面板

**文件位置**: `src/routes/panels/control-rod/+page.svelte`

| 属性                  | 类型                       | 默认值 | 功能描述           |
| --------------------- | -------------------------- | ------ | ------------------ |
| `rodPosition`         | number                     | 50     | 控制棒位置         |
| `onRodPositionChange` | (position: number) => void | -      | 控制棒位置变化回调 |

#### 6.2.2 功率调节面板

**文件位置**: `src/routes/panels/power-control/+page.svelte`

| 属性                  | 类型                    | 默认值 | 功能描述         |
| --------------------- | ----------------------- | ------ | ---------------- |
| `powerLevel`          | number                  | 50     | 功率水平         |
| `targetPower`         | number                  | 50     | 目标功率         |
| `reactivity`          | number                  | 0      | 反应性           |
| `onTargetPowerChange` | (power: number) => void | -      | 目标功率变化回调 |

#### 6.2.3 数据趋势面板

**文件位置**: `src/routes/panels/data-trend/+page.svelte`

| 属性              | 类型     | 默认值 | 功能描述 |
| ----------------- | -------- | ------ | -------- |
| `timePoints`      | number[] | []     | 时间点   |
| `powerData`       | number[] | []     | 功率数据 |
| `temperatureData` | number[] | []     | 温度数据 |
| `pressureData`    | number[] | []     | 压力数据 |

## 7. 错误处理

### 7.1 错误类型

| 错误类型                    | 描述              | 可能原因                 | 解决方案                      |
| --------------------------- | ----------------- | ------------------------ | ----------------------------- |
| `WorkerInitializationError` | Worker 初始化失败 | 浏览器不支持 Web Workers | 使用支持 Web Workers 的浏览器 |
| `CalculationError`          | 物理模型计算错误  | 输入参数无效             | 检查输入参数范围              |
| `StateLoadError`            | 状态加载失败      | 保存的状态格式错误       | 确保使用有效的保存代码        |
| `ComponentError`            | 组件渲染错误      | 组件属性无效             | 检查组件属性类型              |

### 7.2 错误处理最佳实践

1. **使用 try-catch** 捕获异步操作错误
2. **验证输入参数** 确保在有效范围内
3. **使用默认值** 处理缺失或无效数据
4. **记录错误** 便于调试和问题分析
5. **提供用户反馈** 显示友好的错误信息

**示例**:

```typescript
import { loadState } from '$lib/stores/reactorStore';

try {
  const success = loadState(savedState);
  if (!success) {
    throw new Error('Failed to load state');
  }
  console.log('State loaded successfully');
} catch (error) {
  console.error('Error loading state:', error);
  // 显示用户友好的错误信息
  showErrorMessage('无法加载保存的状态，请尝试重置系统');
}
```

## 8. 性能优化

### 8.1 API 使用最佳实践

1. **批量更新状态** 减少状态更新频率
2. **使用 Web Workers** 处理计算密集型任务
3. **缓存计算结果** 避免重复计算
4. **优化订阅** 只订阅需要的状态字段
5. **使用防抖和节流** 控制事件处理频率

### 8.2 内存管理

1. **及时取消订阅** 避免内存泄漏
2. **清理定时器** 避免未清理的定时器
3. **优化数据结构** 使用高效的数据结构
4. **限制历史数据** 控制数据存储量

### 8.3 渲染优化

1. **使用虚拟滚动** 处理大量数据
2. **组件懒加载** 按需加载组件
3. **避免不必要的重渲染** 使用适当的状态管理
4. **优化图表渲染** 控制图表更新频率

## 9. 示例代码

### 9.1 基本操作示例

**启动模拟并监控状态**:

```typescript
import { startSimulation, reactorStore } from '$lib/stores/reactorStore';

// 启动模拟
startSimulation();

// 订阅关键参数
const unsubscribe = reactorStore.subscribe((state) => {
  console.log('Power level:', state.powerRegulation.powerLevel);
  console.log('Core temperature:', state.core.temperature);
  console.log('Core pressure:', state.core.pressure);

  // 当功率达到目标值时执行操作
  if (Math.abs(state.powerRegulation.powerLevel - state.powerRegulation.targetPower) < 1) {
    console.log('Power level stabilized');
  }
});

// 5秒后停止订阅
setTimeout(() => {
  unsubscribe();
  console.log('Unsubscribed from state changes');
}, 5000);
```

### 9.2 高级控制示例

**实现自动功率控制**:

```typescript
import { setTargetPower, setControlRodPosition, reactorStore } from '$lib/stores/reactorStore';

// 设置目标功率
const targetPower = 75;
setTargetPower(targetPower);

// 实现简单的 PID 控制器
let integral = 0;
let previousError = 0;

const controlInterval = setInterval(() => {
  reactorStore.subscribe((state) => {
    const error = targetPower - state.powerRegulation.powerLevel;
    integral += error * 0.1;
    const derivative = (error - previousError) / 0.1;

    // 计算控制棒位置调整
    const adjustment = 0.5 * error + 0.1 * integral + 0.2 * derivative;
    const newRodPosition = Math.max(0, Math.min(100, state.controlRods.position + adjustment));

    // 更新控制棒位置
    setControlRodPosition(newRodPosition);

    previousError = error;

    // 当误差足够小时停止控制
    if (Math.abs(error) < 0.5) {
      clearInterval(controlInterval);
      console.log('Power control completed');
    }
  })();
}, 100);
```

### 9.3 数据导出示例

**导出模拟数据为 CSV**:

```typescript
import { reactorStore } from '$lib/stores/reactorStore';

function exportDataToCSV() {
  reactorStore.subscribe((state) => {
    const { timePoints, powerData, temperatureData, pressureData } = state.trends;

    // 创建 CSV 内容
    let csvContent = 'Time (s),Power (%),Temperature (°C),Pressure (MPa)\n';

    for (let i = 0; i < timePoints.length; i++) {
      csvContent += `${timePoints[i]},${powerData[i]},${temperatureData[i]},${pressureData[i]}\n`;
    }

    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reactor-data-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  })();
}

// 导出数据
exportDataToCSV();
```

## 10. 版本兼容性

### 10.1 API 版本

| 版本  | 主要变更             |
| ----- | -------------------- |
| 1.0.0 | 初始版本             |
| 1.1.0 | 增加故障模拟系统 API |
| 1.2.0 | 改进物理模型 API     |
| 1.3.0 | 增加数据导出功能     |

### 10.2 浏览器兼容性

| 浏览器  | 最低版本 | 推荐版本 |
| ------- | -------- | -------- |
| Chrome  | 90       | 100+     |
| Firefox | 88       | 90+      |
| Safari  | 14       | 15+      |
| Edge    | 90       | 100+     |

### 10.3 技术依赖

| 依赖           | 版本    | 用途                 |
| -------------- | ------- | -------------------- |
| Svelte         | ^5.43.8 | 前端框架             |
| TypeScript     | ~5.9.3  | 类型系统             |
| Chart.js       | ^4.5.1  | 数据可视化           |
| svelte-chartjs | ^3.1.5  | Svelte Chart.js 集成 |

## 11. 贡献指南

### 11.1 API 扩展

要扩展 API，请遵循以下步骤：

1. **添加新功能**：在相应的模块中实现新功能
2. **更新类型定义**：添加新的类型和接口
3. **导出新函数**：确保新函数被正确导出
4. **编写文档**：更新 API 文档
5. **添加测试**：为新功能编写测试

### 11.2 API 变更

当需要变更 API 时：

1. **向后兼容**：尽量保持向后兼容
2. **版本控制**：使用语义化版本控制
3. **更新文档**：明确记录变更内容
4. **迁移指南**：提供从旧版本迁移的指南

### 11.3 最佳实践

- **一致性**：保持 API 设计风格一致
- **清晰性**：使用明确的命名和类型
- **简洁性**：保持 API 简洁易用
- **可靠性**：提供错误处理和边界情况处理
- **性能**：优化 API 性能

## 12. 故障排除

### 12.1 常见问题

| 问题              | 可能原因     | 解决方案           |
| ----------------- | ------------ | ------------------ |
| API 调用无响应    | 浏览器不支持 | 使用推荐的浏览器   |
| 状态更新不生效    | 订阅方式错误 | 检查订阅代码       |
| 计算结果异常      | 输入参数无效 | 验证输入参数范围   |
| Worker 初始化失败 | 安全设置阻止 | 检查浏览器安全设置 |
| 组件渲染错误      | 属性类型错误 | 检查组件属性类型   |

### 12.2 调试技巧

1. **使用浏览器开发工具** 检查控制台错误
2. **添加日志** 跟踪 API 调用流程
3. **使用断点** 调试关键代码
4. **验证输入输出** 检查数据格式
5. **隔离测试** 单独测试 API 功能

### 12.3 支持渠道

如果遇到 API 相关问题，可以通过以下渠道获取支持：

- **GitHub Issues**：提交 bug 报告
- **电子邮件**：support@barotrauma-reactor-simulator.com
- **在线论坛**：项目官方论坛

## 13. 总结

Barotrauma 反应堆模拟器提供了全面的 API，支持从基本操作到高级自定义的各种需求。通过这些 API，开发者可以：

- **控制模拟过程**：启动、停止和重置模拟
- **调整系统参数**：控制棒位置、功率水平等
- **监控系统状态**：实时获取关键参数
- **扩展系统功能**：添加自定义模块和功能
- **集成第三方系统**：与其他系统进行集成

API 设计遵循现代前端开发最佳实践，使用 TypeScript 提供类型安全，支持异步操作，并提供详细的错误处理机制。

随着模拟器的不断发展，API 也将持续更新和改进，以支持更多功能和场景。开发者应定期查看 API 文档，了解最新的变更和特性。

---

© 2026 lbn2011和ai共同开发

本 API 参考文档如有更新，恕不另行通知。
