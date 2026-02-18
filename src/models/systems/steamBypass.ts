// 汽轮机旁路系统模型

// 旁路系统输入参数
interface SteamBypassInput {
  turbineStatus: boolean; // 汽轮机状态
  steamPressure: number; // 蒸汽压力
  pressureSetpoint: number; // 压力设定点
  maxPressure: number; // 最大压力
  steamFlowMax: number; // 最大蒸汽流量
  currentBypassPosition: number; // 当前旁路阀位置
}

// 旁路系统输出参数
interface SteamBypassOutput {
  bypassPosition: number; // 旁路阀位置（0-100%）
  bypassFlow: number; // 旁路流量
  bypassCapacity: number; // 旁路容量
  isActive: boolean; // 旁路系统是否激活
}

// 计算汽轮机旁路系统
function calculateSteamBypass(input: SteamBypassInput): SteamBypassOutput {
  let bypassPosition = input.currentBypassPosition;
  let isActive = false;

  // 计算旁路阀容量
  const bypassCapacity = input.steamFlowMax * 1.2; // 120%的最大蒸汽流量

  // 旁路阀控制逻辑
  if (!input.turbineStatus) {
    // 汽轮机离线时，完全打开旁路阀
    bypassPosition = 100;
    isActive = true;
  } else if (input.steamPressure > 1.05 * input.pressureSetpoint) {
    // 蒸汽压力超过设定点105%时，打开旁路阀
    const pressureExcess = input.steamPressure - input.pressureSetpoint;
    const pressureRange = input.maxPressure - input.pressureSetpoint;
    bypassPosition = Math.min(100, (pressureExcess / pressureRange) * 100);
    isActive = true;
  } else {
    // 其他情况，关闭旁路阀
    bypassPosition = 0;
    isActive = false;
  }

  // 计算旁路流量
  const bypassFlow = (bypassPosition / 100) * bypassCapacity;

  return {
    bypassPosition,
    bypassFlow,
    bypassCapacity,
    isActive,
  };
}

// 检查旁路系统状态
function checkBypassSystemStatus(input: SteamBypassInput): {
  status: 'normal' | 'warning' | 'alarm';
  message: string;
} {
  const bypassOutput = calculateSteamBypass(input);

  if (bypassOutput.bypassPosition > 90) {
    return {
      status: 'alarm',
      message: '旁路阀接近完全打开，汽轮机可能离线',
    };
  } else if (bypassOutput.bypassPosition > 50) {
    return {
      status: 'warning',
      message: '旁路阀开度较大，蒸汽压力可能异常',
    };
  } else {
    return {
      status: 'normal',
      message: '旁路系统运行正常',
    };
  }
}

export {
  calculateSteamBypass,
  checkBypassSystemStatus,
  type SteamBypassInput,
  type SteamBypassOutput,
};
