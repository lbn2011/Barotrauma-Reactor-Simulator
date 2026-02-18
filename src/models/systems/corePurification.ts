// 堆芯冷却剂净化系统模型

// 净化系统输入参数
interface CorePurificationInput {
  filterEfficiency: number; // 过滤器效率（0.95-0.99）
  actualFlow: number; // 实际流量
  maxFlow: number; // 最大流量
  impurityConcentration: number; // 杂质浓度
  maxImpurityConcentration: number; // 最大杂质浓度
  systemStatus: boolean; // 系统状态
}

// 净化系统输出参数
interface CorePurificationOutput {
  purificationEfficiency: number; // 净化效率
  filteredImpurityConcentration: number; // 过滤后的杂质浓度
  impurityRemovalRate: number; // 杂质去除率
  systemStatus: boolean; // 系统状态
  isEffective: boolean; // 系统是否有效
  warningLevel: 'normal' | 'warning' | 'alarm'; // 警告级别
}

// 计算堆芯冷却剂净化系统
function calculateCorePurification (
  input: CorePurificationInput
): CorePurificationOutput {
  if (!input.systemStatus) {
    // 系统关闭时
    return {
      purificationEfficiency: 0,
      filteredImpurityConcentration: input.impurityConcentration,
      impurityRemovalRate: 0,
      systemStatus: false,
      isEffective: false,
      warningLevel: 'alarm',
    };
  }

  // 计算净化效率
  const flowFactor = input.actualFlow / input.maxFlow;
  const impurityFactor =
    1 - input.impurityConcentration / input.maxImpurityConcentration;
  const purificationEfficiency =
    input.filterEfficiency * flowFactor * impurityFactor;

  // 计算过滤后的杂质浓度
  const filteredImpurityConcentration =
    input.impurityConcentration * (1 - purificationEfficiency);

  // 计算杂质去除率
  const impurityRemovalRate =
    ((input.impurityConcentration - filteredImpurityConcentration) /
      input.impurityConcentration) *
    100;

  // 计算警告级别
  let warningLevel: 'normal' | 'warning' | 'alarm' = 'normal';
  if (filteredImpurityConcentration > 0.8 * input.maxImpurityConcentration) {
    warningLevel = 'alarm';
  } else if (
    filteredImpurityConcentration >
    0.5 * input.maxImpurityConcentration
  ) {
    warningLevel = 'warning';
  }

  return {
    purificationEfficiency,
    filteredImpurityConcentration,
    impurityRemovalRate,
    systemStatus: true,
    isEffective: purificationEfficiency > 0.5, // 效率超过50%时认为有效
    warningLevel,
  };
}

// 检查净化系统状态
function checkPurificationSystemStatus (input: CorePurificationInput): {
  status: 'normal' | 'warning' | 'alarm';
  message: string;
} {
  const purificationOutput = calculateCorePurification(input);

  if (!input.systemStatus) {
    return {
      status: 'alarm',
      message: '堆芯冷却剂净化系统未运行',
    };
  } else if (purificationOutput.warningLevel === 'alarm') {
    return {
      status: 'alarm',
      message: '杂质浓度过高，净化系统效率不足',
    };
  } else if (purificationOutput.warningLevel === 'warning') {
    return {
      status: 'warning',
      message: '杂质浓度较高，建议检查净化系统',
    };
  } else {
    return {
      status: 'normal',
      message: '堆芯冷却剂净化系统运行正常',
    };
  }
}

export {
  calculateCorePurification,
  checkPurificationSystemStatus,
  type CorePurificationInput,
  type CorePurificationOutput,
};
