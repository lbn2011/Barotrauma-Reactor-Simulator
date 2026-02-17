// 物理计算Web Worker

import { calculateMassBalance } from '../models/thermal/massBalance';
import { calculateEnergyBalance } from '../models/thermal/energyBalance';
import { calculateVoidCoefficient } from '../models/neutron/voidCoefficient';
import { calculateXenonPoisoning } from '../models/neutron/xenonPoisoning';
import { calculateControlRodPhysics } from '../models/neutron/controlRodPhysics';
import { calculateReactorCore } from '../models/systems/reactorCore';

// 定义消息类型
interface WorkerMessage {
  type: string;
  data: any;
}

// 定义响应类型
interface WorkerResponse {
  type: string;
  data: any;
}

// 处理消息
self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, data } = e.data;

  let result: any;

  switch (type) {
  case 'calculateMassBalance':
    result = calculateMassBalance(data);
    break;

  case 'calculateEnergyBalance':
    result = calculateEnergyBalance(data);
    break;

  case 'calculateVoidCoefficient':
    result = calculateVoidCoefficient(data);
    break;

  case 'calculateXenonPoisoning':
    result = calculateXenonPoisoning(data);
    break;

  case 'calculateControlRodPhysics':
    result = calculateControlRodPhysics(data);
    break;

  case 'calculateReactorCore':
    result = calculateReactorCore(data);
    break;

  default:
    console.error('Unknown message type:', type);
    return;
  }

  // 发送响应
  const response: WorkerResponse = {
    type: `${type}Result`,
    data: result,
  };

  self.postMessage(response);
};
