// 故障模拟系统模型

// 故障类型
interface Fault {
  id: string; // 故障ID
  type:
    | 'pump'
    | 'valve'
    | 'sensor'
    | 'controller'
    | 'pipe'
    | 'electrical'
    | 'cooling'
    | 'steam'; // 故障类型
  componentId: string; // 组件ID
  severity: 'minor' | 'major' | 'critical'; // 严重程度
  status: 'active' | 'inactive' | 'repaired'; // 状态
  startTime?: number; // 开始时间
  endTime?: number; // 结束时间
  description: string; // 故障描述
  impact: string[]; // 影响范围
  recoveryTime: number; // 恢复时间（秒）
  emergencyProcedure?: string; // 推荐的应急程序
}

// 故障输入参数
interface FaultSimulationInput {
  currentFaults: Fault[]; // 当前故障
  operatingTime: number; // 运行时间（秒）
  componentStatus: Record<string, boolean>; // 组件状态
  environmentalFactors: {
    temperature: number; // 环境温度
    vibration: number; // 振动水平
    humidity: number; // 湿度
  };
  maintenanceLevel: number; // 维护水平（0-100%）
}

// 故障模拟输出参数
interface FaultSimulationOutput {
  activeFaults: Fault[]; // 活跃故障
  newFaults: Fault[]; // 新发生的故障
  resolvedFaults: Fault[]; // 已解决的故障
  systemReliability: number; // 系统可靠性
  riskLevel: 'low' | 'medium' | 'high' | 'critical'; // 风险级别
  recommendedActions: string[]; // 推荐操作
}

// 泵故障模型
function simulatePumpFault (
  pumpId: string,
  input: FaultSimulationInput
): Fault | null {
  // 检查泵是否运行
  if (!input.componentStatus[pumpId]) {
    return null;
  }

  // 计算故障概率
  let faultProbability = 0.01; // 基础故障概率

  // 根据环境因素调整故障概率
  if (input.environmentalFactors.temperature > 60) {
    faultProbability *= 1.5; // 温度过高增加故障概率
  }

  if (input.environmentalFactors.vibration > 0.1) {
    faultProbability *= 1.8; // 振动过大增加故障概率
  }

  // 根据维护水平调整故障概率
  const maintenanceFactor = 1 - (input.maintenanceLevel / 100) * 0.7;
  faultProbability *= maintenanceFactor;

  // 随机生成故障
  if (Math.random() < faultProbability) {
    // 确定故障严重程度
    const severityRoll = Math.random();
    let severity: 'minor' | 'major' | 'critical';
    let recoveryTime: number;
    let emergencyProcedure: string;

    if (severityRoll < 0.7) {
      severity = 'minor';
      recoveryTime = 300; // 5分钟
      emergencyProcedure = '降低泵负载，监控运行状态';
    } else if (severityRoll < 0.9) {
      severity = 'major';
      recoveryTime = 1800; // 30分钟
      emergencyProcedure = '切换到备用泵，准备维修';
    } else {
      severity = 'critical';
      recoveryTime = 3600; // 1小时
      emergencyProcedure = '立即停机，启动应急冷却系统';
    }

    return {
      id: `fault_${pumpId}_${Date.now()}`,
      type: 'pump',
      componentId: pumpId,
      severity,
      status: 'active',
      startTime: input.operatingTime,
      description: `泵 ${pumpId} ${severity === 'minor' ? '轻微故障' : severity === 'major' ? '重大故障' : '灾难性故障'}`,
      impact: [`${pumpId} 性能下降`, '可能影响冷却系统'],
      recoveryTime,
      emergencyProcedure,
    };
  }

  return null;
}

// 阀门故障模型
function simulateValveFault (
  valveId: string,
  input: FaultSimulationInput
): Fault | null {
  // 计算故障概率
  let faultProbability = 0.008; // 基础故障概率

  // 根据环境因素调整故障概率
  if (input.environmentalFactors.temperature > 60) {
    faultProbability *= 1.3; // 温度过高增加故障概率
  }

  // 根据维护水平调整故障概率
  const maintenanceFactor = 1 - (input.maintenanceLevel / 100) * 0.6;
  faultProbability *= maintenanceFactor;

  // 随机生成故障
  if (Math.random() < faultProbability) {
    // 确定故障严重程度
    const severityRoll = Math.random();
    let severity: 'minor' | 'major' | 'critical';
    let recoveryTime: number;
    let emergencyProcedure: string;

    if (severityRoll < 0.7) {
      severity = 'minor';
      recoveryTime = 240; // 4分钟
      emergencyProcedure = '手动调整阀门，监控泄漏情况';
    } else if (severityRoll < 0.9) {
      severity = 'major';
      recoveryTime = 1200; // 20分钟
      emergencyProcedure = '隔离相关系统，准备维修';
    } else {
      severity = 'critical';
      recoveryTime = 2400; // 40分钟
      emergencyProcedure = '立即隔离系统，启动备用回路';
    }

    return {
      id: `fault_${valveId}_${Date.now()}`,
      type: 'valve',
      componentId: valveId,
      severity,
      status: 'active',
      startTime: input.operatingTime,
      description: `阀门 ${valveId} ${severity === 'minor' ? '轻微故障' : severity === 'major' ? '重大故障' : '灾难性故障'}`,
      impact: [`${valveId} 控制失效`, '可能导致流体泄漏'],
      recoveryTime,
      emergencyProcedure,
    };
  }

  return null;
}

// 传感器故障模型
function simulateSensorFault (
  sensorId: string,
  input: FaultSimulationInput
): Fault | null {
  // 计算故障概率
  let faultProbability = 0.012; // 基础故障概率

  // 根据环境因素调整故障概率
  if (input.environmentalFactors.temperature > 60) {
    faultProbability *= 1.4; // 温度过高增加故障概率
  }

  if (input.environmentalFactors.humidity > 70) {
    faultProbability *= 1.6; // 湿度过高增加故障概率
  }

  // 根据维护水平调整故障概率
  const maintenanceFactor = 1 - (input.maintenanceLevel / 100) * 0.5;
  faultProbability *= maintenanceFactor;

  // 随机生成故障
  if (Math.random() < faultProbability) {
    // 确定故障严重程度
    const severityRoll = Math.random();
    let severity: 'minor' | 'major' | 'critical';
    let recoveryTime: number;
    let emergencyProcedure: string;

    if (severityRoll < 0.7) {
      severity = 'minor';
      recoveryTime = 180; // 3分钟
      emergencyProcedure = '使用备用传感器数据，监控系统状态';
    } else if (severityRoll < 0.9) {
      severity = 'major';
      recoveryTime = 900; // 15分钟
      emergencyProcedure = '切换到手动控制模式，准备更换传感器';
    } else {
      severity = 'critical';
      recoveryTime = 1800; // 30分钟
      emergencyProcedure = '立即启动安全系统，使用冗余传感器';
    }

    return {
      id: `fault_${sensorId}_${Date.now()}`,
      type: 'sensor',
      componentId: sensorId,
      severity,
      status: 'active',
      startTime: input.operatingTime,
      description: `传感器 ${sensorId} ${severity === 'minor' ? '轻微故障' : severity === 'major' ? '重大故障' : '灾难性故障'}`,
      impact: [`${sensorId} 数据不准确`, '可能导致控制失效'],
      recoveryTime,
      emergencyProcedure,
    };
  }

  return null;
}

// 控制器故障模型
function simulateControllerFault (
  controllerId: string,
  input: FaultSimulationInput
): Fault | null {
  // 计算故障概率
  let faultProbability = 0.006; // 基础故障概率

  // 根据环境因素调整故障概率
  if (input.environmentalFactors.temperature > 60) {
    faultProbability *= 1.5; // 温度过高增加故障概率
  }

  // 根据维护水平调整故障概率
  const maintenanceFactor = 1 - (input.maintenanceLevel / 100) * 0.7;
  faultProbability *= maintenanceFactor;

  // 随机生成故障
  if (Math.random() < faultProbability) {
    // 确定故障严重程度
    const severityRoll = Math.random();
    let severity: 'minor' | 'major' | 'critical';
    let recoveryTime: number;
    let emergencyProcedure: string;

    if (severityRoll < 0.7) {
      severity = 'minor';
      recoveryTime = 360; // 6分钟
      emergencyProcedure = '重启控制器，监控运行状态';
    } else if (severityRoll < 0.9) {
      severity = 'major';
      recoveryTime = 1800; // 30分钟
      emergencyProcedure = '切换到备用控制器，准备维修';
    } else {
      severity = 'critical';
      recoveryTime = 3600; // 1小时
      emergencyProcedure = '立即启动手动控制，隔离故障控制器';
    }

    return {
      id: `fault_${controllerId}_${Date.now()}`,
      type: 'controller',
      componentId: controllerId,
      severity,
      status: 'active',
      startTime: input.operatingTime,
      description: `控制器 ${controllerId} ${severity === 'minor' ? '轻微故障' : severity === 'major' ? '重大故障' : '灾难性故障'}`,
      impact: [`${controllerId} 控制失效`, '可能导致系统不稳定'],
      recoveryTime,
      emergencyProcedure,
    };
  }

  return null;
}

// 管道故障模型
function simulatePipeFault (
  pipeId: string,
  input: FaultSimulationInput
): Fault | null {
  // 计算故障概率
  let faultProbability = 0.005; // 基础故障概率

  // 根据环境因素调整故障概率
  if (input.environmentalFactors.temperature > 60) {
    faultProbability *= 1.2; // 温度过高增加故障概率
  }

  if (input.environmentalFactors.vibration > 0.1) {
    faultProbability *= 1.4; // 振动过大增加故障概率
  }

  // 根据维护水平调整故障概率
  const maintenanceFactor = 1 - (input.maintenanceLevel / 100) * 0.6;
  faultProbability *= maintenanceFactor;

  // 随机生成故障
  if (Math.random() < faultProbability) {
    // 确定故障严重程度
    const severityRoll = Math.random();
    let severity: 'minor' | 'major' | 'critical';
    let recoveryTime: number;
    let emergencyProcedure: string;

    if (severityRoll < 0.7) {
      severity = 'minor';
      recoveryTime = 600; // 10分钟
      emergencyProcedure = '关闭相关阀门，修补泄漏';
    } else if (severityRoll < 0.9) {
      severity = 'major';
      recoveryTime = 2400; // 40分钟
      emergencyProcedure = '隔离管道段，准备更换';
    } else {
      severity = 'critical';
      recoveryTime = 4800; // 80分钟
      emergencyProcedure = '立即停机，启动应急冷却系统';
    }

    return {
      id: `fault_${pipeId}_${Date.now()}`,
      type: 'pipe',
      componentId: pipeId,
      severity,
      status: 'active',
      startTime: input.operatingTime,
      description: `管道 ${pipeId} ${severity === 'minor' ? '轻微故障' : severity === 'major' ? '重大故障' : '灾难性故障'}`,
      impact: [`${pipeId} 泄漏`, '可能导致流体损失'],
      recoveryTime,
      emergencyProcedure,
    };
  }

  return null;
}

// 电气故障模型
function simulateElectricalFault (
  electricalId: string,
  input: FaultSimulationInput
): Fault | null {
  // 计算故障概率
  let faultProbability = 0.009; // 基础故障概率

  // 根据环境因素调整故障概率
  if (input.environmentalFactors.humidity > 70) {
    faultProbability *= 1.8; // 湿度过高增加故障概率
  }

  // 根据维护水平调整故障概率
  const maintenanceFactor = 1 - (input.maintenanceLevel / 100) * 0.6;
  faultProbability *= maintenanceFactor;

  // 随机生成故障
  if (Math.random() < faultProbability) {
    // 确定故障严重程度
    const severityRoll = Math.random();
    let severity: 'minor' | 'major' | 'critical';
    let recoveryTime: number;
    let emergencyProcedure: string;

    if (severityRoll < 0.7) {
      severity = 'minor';
      recoveryTime = 240; // 4分钟
      emergencyProcedure = '重启电气设备，监控电压';
    } else if (severityRoll < 0.9) {
      severity = 'major';
      recoveryTime = 1200; // 20分钟
      emergencyProcedure = '切换到备用电源，准备维修';
    } else {
      severity = 'critical';
      recoveryTime = 2400; // 40分钟
      emergencyProcedure = '立即停机，启动备用电源系统';
    }

    return {
      id: `fault_${electricalId}_${Date.now()}`,
      type: 'electrical',
      componentId: electricalId,
      severity,
      status: 'active',
      startTime: input.operatingTime,
      description: `电气系统 ${electricalId} ${severity === 'minor' ? '轻微故障' : severity === 'major' ? '重大故障' : '灾难性故障'}`,
      impact: [`${electricalId} 供电不稳定`, '可能导致设备停机'],
      recoveryTime,
      emergencyProcedure,
    };
  }

  return null;
}

// 冷却系统故障模型
function simulateCoolingFault (
  coolingId: string,
  input: FaultSimulationInput
): Fault | null {
  // 计算故障概率
  let faultProbability = 0.007; // 基础故障概率

  // 根据环境因素调整故障概率
  if (input.environmentalFactors.temperature > 60) {
    faultProbability *= 2.0; // 温度过高增加故障概率
  }

  // 根据维护水平调整故障概率
  const maintenanceFactor = 1 - (input.maintenanceLevel / 100) * 0.7;
  faultProbability *= maintenanceFactor;

  // 随机生成故障
  if (Math.random() < faultProbability) {
    // 确定故障严重程度
    const severityRoll = Math.random();
    let severity: 'minor' | 'major' | 'critical';
    let recoveryTime: number;
    let emergencyProcedure: string;

    if (severityRoll < 0.7) {
      severity = 'minor';
      recoveryTime = 480; // 8分钟
      emergencyProcedure = '增加冷却流量，监控温度';
    } else if (severityRoll < 0.9) {
      severity = 'major';
      recoveryTime = 1800; // 30分钟
      emergencyProcedure = '切换到备用冷却系统，准备维修';
    } else {
      severity = 'critical';
      recoveryTime = 3600; // 1小时
      emergencyProcedure = '立即停机，启动应急冷却系统';
    }

    return {
      id: `fault_${coolingId}_${Date.now()}`,
      type: 'cooling',
      componentId: coolingId,
      severity,
      status: 'active',
      startTime: input.operatingTime,
      description: `冷却系统 ${coolingId} ${severity === 'minor' ? '轻微故障' : severity === 'major' ? '重大故障' : '灾难性故障'}`,
      impact: [`${coolingId} 冷却效率下降`, '可能导致温度升高'],
      recoveryTime,
      emergencyProcedure,
    };
  }

  return null;
}

// 蒸汽系统故障模型
function simulateSteamFault (
  steamId: string,
  input: FaultSimulationInput
): Fault | null {
  // 计算故障概率
  let faultProbability = 0.006; // 基础故障概率

  // 根据环境因素调整故障概率
  if (input.environmentalFactors.temperature > 60) {
    faultProbability *= 1.3; // 温度过高增加故障概率
  }

  // 根据维护水平调整故障概率
  const maintenanceFactor = 1 - (input.maintenanceLevel / 100) * 0.6;
  faultProbability *= maintenanceFactor;

  // 随机生成故障
  if (Math.random() < faultProbability) {
    // 确定故障严重程度
    const severityRoll = Math.random();
    let severity: 'minor' | 'major' | 'critical';
    let recoveryTime: number;
    let emergencyProcedure: string;

    if (severityRoll < 0.7) {
      severity = 'minor';
      recoveryTime = 300; // 5分钟
      emergencyProcedure = '调整蒸汽流量，监控压力';
    } else if (severityRoll < 0.9) {
      severity = 'major';
      recoveryTime = 1500; // 25分钟
      emergencyProcedure = '切换到备用蒸汽系统，准备维修';
    } else {
      severity = 'critical';
      recoveryTime = 3000; // 50分钟
      emergencyProcedure = '立即停机，启动蒸汽旁路系统';
    }

    return {
      id: `fault_${steamId}_${Date.now()}`,
      type: 'steam',
      componentId: steamId,
      severity,
      status: 'active',
      startTime: input.operatingTime,
      description: `蒸汽系统 ${steamId} ${severity === 'minor' ? '轻微故障' : severity === 'major' ? '重大故障' : '灾难性故障'}`,
      impact: [`${steamId} 压力不稳定`, '可能导致设备损坏'],
      recoveryTime,
      emergencyProcedure,
    };
  }

  return null;
}

// 模拟故障
function simulateFaults (input: FaultSimulationInput): FaultSimulationOutput {
  const activeFaults: Fault[] = [];
  const newFaults: Fault[] = [];
  const resolvedFaults: Fault[] = [];

  // 处理现有故障
  for (const fault of input.currentFaults) {
    if (fault.status === 'active') {
      // 检查故障是否已恢复
      if (input.operatingTime - (fault.startTime || 0) >= fault.recoveryTime) {
        resolvedFaults.push({
          ...fault,
          status: 'repaired',
          endTime: input.operatingTime,
        });
      } else {
        activeFaults.push(fault);
      }
    } else if (fault.status === 'inactive') {
      // 故障未激活，不处理
    } else if (fault.status === 'repaired') {
      // 故障已修复，不处理
    }
  }

  // 模拟新故障
  // 泵故障
  const pumpIds = Object.keys(input.componentStatus).filter((key) =>
    key.includes('pump')
  );
  for (const pumpId of pumpIds) {
    const fault = simulatePumpFault(pumpId, input);
    if (fault) {
      activeFaults.push(fault);
      newFaults.push(fault);
    }
  }

  // 阀门故障
  const valveIds = ['valve1', 'valve2', 'valve3', 'valve4'];
  for (const valveId of valveIds) {
    const fault = simulateValveFault(valveId, input);
    if (fault) {
      activeFaults.push(fault);
      newFaults.push(fault);
    }
  }

  // 传感器故障
  const sensorIds = [
    'temperatureSensor',
    'pressureSensor',
    'levelSensor',
    'flowSensor',
  ];
  for (const sensorId of sensorIds) {
    const fault = simulateSensorFault(sensorId, input);
    if (fault) {
      activeFaults.push(fault);
      newFaults.push(fault);
    }
  }

  // 控制器故障
  const controllerIds = [
    'reactorController',
    'turbineController',
    'feedwaterController',
  ];
  for (const controllerId of controllerIds) {
    const fault = simulateControllerFault(controllerId, input);
    if (fault) {
      activeFaults.push(fault);
      newFaults.push(fault);
    }
  }

  // 管道故障
  const pipeIds = ['coolingPipe', 'steamPipe', 'feedwaterPipe'];
  for (const pipeId of pipeIds) {
    const fault = simulatePipeFault(pipeId, input);
    if (fault) {
      activeFaults.push(fault);
      newFaults.push(fault);
    }
  }

  // 电气故障
  const electricalIds = ['mainPower', 'backupPower', 'controlPower'];
  for (const electricalId of electricalIds) {
    const fault = simulateElectricalFault(electricalId, input);
    if (fault) {
      activeFaults.push(fault);
      newFaults.push(fault);
    }
  }

  // 冷却系统故障
  const coolingIds = ['primaryCooling', 'secondaryCooling', 'emergencyCooling'];
  for (const coolingId of coolingIds) {
    const fault = simulateCoolingFault(coolingId, input);
    if (fault) {
      activeFaults.push(fault);
      newFaults.push(fault);
    }
  }

  // 蒸汽系统故障
  const steamIds = ['mainSteam', 'feedwaterHeaterSteam', 'deaeratorSteam'];
  for (const steamId of steamIds) {
    const fault = simulateSteamFault(steamId, input);
    if (fault) {
      activeFaults.push(fault);
      newFaults.push(fault);
    }
  }

  // 计算系统可靠性
  const totalComponents =
    Object.keys(input.componentStatus).length +
    valveIds.length +
    sensorIds.length +
    controllerIds.length +
    pipeIds.length +
    electricalIds.length +
    coolingIds.length +
    steamIds.length;
  const faultyComponents = new Set(
    activeFaults.map((fault) => fault.componentId)
  ).size;
  const systemReliability = Math.max(0, 1 - faultyComponents / totalComponents);

  // 评估风险级别
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  const criticalFaults = activeFaults.filter(
    (fault) => fault.severity === 'critical'
  ).length;
  const majorFaults = activeFaults.filter(
    (fault) => fault.severity === 'major'
  ).length;

  if (criticalFaults > 0) {
    riskLevel = 'critical';
  } else if (majorFaults > 1) {
    riskLevel = 'high';
  } else if (majorFaults > 0 || activeFaults.length > 2) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // 生成推荐操作
  const recommendedActions: string[] = [];
  if (criticalFaults > 0) {
    recommendedActions.push('立即停机进行维修');
    recommendedActions.push('启动备用系统');
    recommendedActions.push('执行应急程序');
  } else if (majorFaults > 0) {
    recommendedActions.push('准备停机维修');
    recommendedActions.push('密切监控系统状态');
    recommendedActions.push('启动备用设备');
  } else if (activeFaults.length > 0) {
    recommendedActions.push('计划定期维护');
    recommendedActions.push('检查相关组件状态');
    recommendedActions.push('优化运行参数');
  } else {
    recommendedActions.push('继续正常运行');
    recommendedActions.push('保持定期维护');
    recommendedActions.push('进行预防性检查');
  }

  return {
    activeFaults,
    newFaults,
    resolvedFaults,
    systemReliability,
    riskLevel,
    recommendedActions,
  };
}

// 触发特定故障
function triggerSpecificFault (
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
): Fault {
  // 根据故障类型和严重程度生成应急程序
  let emergencyProcedure: string;
  switch (faultType) {
  case 'pump':
    emergencyProcedure =
        severity === 'minor'
          ? '降低泵负载，监控运行状态'
          : severity === 'major'
            ? '切换到备用泵，准备维修'
            : '立即停机，启动应急冷却系统';
    break;
  case 'valve':
    emergencyProcedure =
        severity === 'minor'
          ? '手动调整阀门，监控泄漏情况'
          : severity === 'major'
            ? '隔离相关系统，准备维修'
            : '立即隔离系统，启动备用回路';
    break;
  case 'sensor':
    emergencyProcedure =
        severity === 'minor'
          ? '使用备用传感器数据，监控系统状态'
          : severity === 'major'
            ? '切换到手动控制模式，准备更换传感器'
            : '立即启动安全系统，使用冗余传感器';
    break;
  case 'controller':
    emergencyProcedure =
        severity === 'minor'
          ? '重启控制器，监控运行状态'
          : severity === 'major'
            ? '切换到备用控制器，准备维修'
            : '立即启动手动控制，隔离故障控制器';
    break;
  case 'pipe':
    emergencyProcedure =
        severity === 'minor'
          ? '关闭相关阀门，修补泄漏'
          : severity === 'major'
            ? '隔离管道段，准备更换'
            : '立即停机，启动应急冷却系统';
    break;
  case 'electrical':
    emergencyProcedure =
        severity === 'minor'
          ? '重启电气设备，监控电压'
          : severity === 'major'
            ? '切换到备用电源，准备维修'
            : '立即停机，启动备用电源系统';
    break;
  case 'cooling':
    emergencyProcedure =
        severity === 'minor'
          ? '增加冷却流量，监控温度'
          : severity === 'major'
            ? '切换到备用冷却系统，准备维修'
            : '立即停机，启动应急冷却系统';
    break;
  case 'steam':
    emergencyProcedure =
        severity === 'minor'
          ? '调整蒸汽流量，监控压力'
          : severity === 'major'
            ? '切换到备用蒸汽系统，准备维修'
            : '立即停机，启动蒸汽旁路系统';
    break;
  }

  return {
    id: `fault_${componentId}_${Date.now()}`,
    type: faultType,
    componentId,
    severity,
    status: 'active',
    startTime: Date.now() / 1000, // 转换为秒
    description: `${componentId} ${severity === 'minor' ? '轻微故障' : severity === 'major' ? '重大故障' : '灾难性故障'}`,
    impact: [`${componentId} 性能下降`, '可能影响相关系统'],
    recoveryTime:
      severity === 'minor' ? 300 : severity === 'major' ? 1800 : 3600,
    emergencyProcedure,
  };
}

// 修复故障
function repairFault (faultId: string, currentFaults: Fault[]): Fault[] {
  return currentFaults.map((fault) => {
    if (fault.id === faultId && fault.status === 'active') {
      return {
        ...fault,
        status: 'repaired',
        endTime: Date.now() / 1000, // 转换为秒
      };
    }
    return fault;
  });
}

// 生成应急程序指南
function generateEmergencyProcedureGuide (fault: Fault): string[] {
  const guide: string[] = [];

  guide.push(`故障类型: ${fault.type}`);
  guide.push(`组件: ${fault.componentId}`);
  guide.push(
    `严重程度: ${fault.severity === 'minor' ? '轻微' : fault.severity === 'major' ? '重大' : '灾难性'}`
  );
  guide.push(`描述: ${fault.description}`);
  guide.push(`影响范围: ${fault.impact.join(', ')}`);
  guide.push(`推荐应急程序: ${fault.emergencyProcedure || '无'}`);
  guide.push(`预计恢复时间: ${fault.recoveryTime}秒`);

  // 根据严重程度添加额外的应急步骤
  if (fault.severity === 'critical') {
    guide.push('');
    guide.push('紧急操作步骤:');
    guide.push('1. 立即触发紧急停堆（AZ-5）');
    guide.push('2. 启动应急冷却系统');
    guide.push('3. 隔离故障系统');
    guide.push('4. 通知相关人员');
    guide.push('5. 实施维修计划');
  } else if (fault.severity === 'major') {
    guide.push('');
    guide.push('重要操作步骤:');
    guide.push('1. 降低系统负载');
    guide.push('2. 切换到备用设备');
    guide.push('3. 监控系统状态');
    guide.push('4. 计划维修');
  } else {
    guide.push('');
    guide.push('常规操作步骤:');
    guide.push('1. 调整运行参数');
    guide.push('2. 监控故障发展');
    guide.push('3. 安排定期维修');
  }

  return guide;
}

export {
  simulateFaults,
  triggerSpecificFault,
  repairFault,
  generateEmergencyProcedureGuide,
  type Fault,
  type FaultSimulationInput,
  type FaultSimulationOutput,
};
