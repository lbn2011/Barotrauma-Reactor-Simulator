// 物理模拟 Web Worker

// 导入模型
import { neutron, thermal, systems } from '../models';

// 定义消息类型
interface WorkerMessage {
  type: string;
  id: string;
  payload: any;
}

// 定义计算任务类型
interface CalculationTask {
  type:
    | 'neutronTransport'
    | 'reactorKinetics'
    | 'thermalHydraulics'
    | 'reactorCoreStatus';
  params: any;
}

// 处理消息
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, id, payload } = event.data;

  try {
    if (type === 'calculate') {
      const task: CalculationTask = payload;
      let result: any;

      // 根据任务类型执行计算
      switch (task.type) {
      case 'neutronTransport':
        result = neutron.NeutronTransport.calculateFlux(task.params);
        break;
      case 'reactorKinetics':
        result = neutron.ReactorKinetics.calculateKinetics(task.params);
        break;
      case 'thermalHydraulics':
        result = thermal.ThermalHydraulics.calculateThermalHydraulics(
          task.params
        );
        break;
      case 'reactorCoreStatus':
        result = systems.ReactorCore.getCoreStatus(task.params);
        break;
      default:
        throw new Error(`Unknown task type: ${task.type}`);
      }

      // 返回结果
      self.postMessage({
        type: 'result',
        id,
        payload: result,
      });
    } else if (type === 'ping') {
      // 响应心跳
      self.postMessage({
        type: 'pong',
        id,
      });
    } else if (type === 'cancel') {
      // 取消计算
      // 这里可以添加取消逻辑
      self.postMessage({
        type: 'cancelled',
        id,
      });
    }
  } catch (error) {
    // 返回错误
    self.postMessage({
      type: 'error',
      id,
      payload: { message: (error as Error).message },
    });
  }
};

// 导出 Worker 类型
export type PhysicsWorker = typeof self;
