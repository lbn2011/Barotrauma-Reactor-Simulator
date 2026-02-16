// 故障模拟系统模型

// 故障类型
interface Fault {
  id: string; // 故障ID
  type: 'pump' | 'valve' | 'sensor' | 'controller'; // 故障类型
  componentId: string; // 组件ID
  severity: 'minor' | 'major' | 'critical'; // 严重程度
  status: 'active' | 'inactive' | 'repaired'; // 状态
  startTime?: number; // 开始时间
  endTime?: number; // 结束时间
  description: string; // 故障描述
  impact: string[]; // 影响范围
  recoveryTime: number; // 恢复时间（秒）
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
function simulatePumpFault(
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

    if (severityRoll < 0.7) {
      severity = 'minor';
      recoveryTime = 300; // 5分钟
    } else if (severityRoll < 0.9) {
      severity = 'major';
      recoveryTime = 1800; // 30分钟
    } else {
      severity = 'critical';
      recoveryTime = 3600; // 1小时
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
    };
  }

  return null;
}

// 模拟故障
function simulateFaults(input: FaultSimulationInput): FaultSimulationOutput {
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

  // 计算系统可靠性
  const totalComponents = Object.keys(input.componentStatus).length;
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
  } else if (majorFaults > 0) {
    recommendedActions.push('准备停机维修');
    recommendedActions.push('密切监控系统状态');
  } else if (activeFaults.length > 0) {
    recommendedActions.push('计划定期维护');
    recommendedActions.push('检查相关组件状态');
  } else {
    recommendedActions.push('继续正常运行');
    recommendedActions.push('保持定期维护');
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
function triggerSpecificFault(
  faultType: 'pump' | 'valve' | 'sensor' | 'controller',
  componentId: string,
  severity: 'minor' | 'major' | 'critical'
): Fault {
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
  };
}

// 修复故障
function repairFault(faultId: string, currentFaults: Fault[]): Fault[] {
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

export {
  simulateFaults,
  triggerSpecificFault,
  repairFault,
  type Fault,
  type FaultSimulationInput,
  type FaultSimulationOutput,
};
