// Worker管理器

// 定义Worker类型
const enum WorkerType {
  PHYSICS_CALCULATION = 'physicsCalculation',
  DATA_PROCESSING = 'dataProcessing',
}

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

// 定义Worker接口
interface WorkerInstance {
  worker: Worker;
  callbacks: Map<string, (data: any) => void>;
}

// Worker管理器类
class WorkerManager {
  private workers: Map<WorkerType, WorkerInstance> = new Map();
  private isInitialized: boolean = false;

  // 初始化Worker
  initialize() {
    if (this.isInitialized) return;

    // 创建物理计算Worker
    try {
      const physicsWorker = new Worker(
        new URL('./physicsCalculation.worker.ts', import.meta.url)
      );
      this.workers.set(WorkerType.PHYSICS_CALCULATION, {
        worker: physicsWorker,
        callbacks: new Map(),
      });

      // 设置物理计算Worker的消息处理
      physicsWorker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        this.handleWorkerMessage(WorkerType.PHYSICS_CALCULATION, e.data);
      };

      // 处理物理计算Worker的错误
      physicsWorker.onerror = (error) => {
        console.error('Physics Worker error:', error);
      };
    } catch (error) {
      console.error('Failed to create physics worker:', error);
    }

    // 创建数据处理Worker
    try {
      const dataWorker = new Worker(
        new URL('./dataProcessing.worker.ts', import.meta.url)
      );
      this.workers.set(WorkerType.DATA_PROCESSING, {
        worker: dataWorker,
        callbacks: new Map(),
      });

      // 设置数据处理Worker的消息处理
      dataWorker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        this.handleWorkerMessage(WorkerType.DATA_PROCESSING, e.data);
      };

      // 处理数据处理Worker的错误
      dataWorker.onerror = (error) => {
        console.error('Data Worker error:', error);
      };
    } catch (error) {
      console.error('Failed to create data worker:', error);
    }

    this.isInitialized = true;
  }

  // 处理Worker消息
  private handleWorkerMessage(
    workerType: WorkerType,
    response: WorkerResponse
  ) {
    const workerInstance = this.workers.get(workerType);
    if (!workerInstance) return;

    const callback = workerInstance.callbacks.get(response.type);
    if (callback) {
      callback(response.data);
      workerInstance.callbacks.delete(response.type);
    }
  }

  // 发送消息到Worker
  sendMessage(workerType: WorkerType, type: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const workerInstance = this.workers.get(workerType);
      if (!workerInstance) {
        reject(new Error(`Worker ${workerType} not initialized`));
        return;
      }

      const responseType = `${type}Result`;

      // 注册回调
      workerInstance.callbacks.set(responseType, (result) => {
        resolve(result);
      });

      // 发送消息
      workerInstance.worker.postMessage({
        type,
        data,
      });

      // 设置超时
      setTimeout(() => {
        if (workerInstance.callbacks.has(responseType)) {
          workerInstance.callbacks.delete(responseType);
          reject(new Error(`Worker ${workerType} timeout for ${type}`));
        }
      }, 10000); // 10秒超时
    });
  }

  // 计算质量平衡
  async calculateMassBalance(data: any): Promise<any> {
    return this.sendMessage(
      WorkerType.PHYSICS_CALCULATION,
      'calculateMassBalance',
      data
    );
  }

  // 计算能量平衡
  async calculateEnergyBalance(data: any): Promise<any> {
    return this.sendMessage(
      WorkerType.PHYSICS_CALCULATION,
      'calculateEnergyBalance',
      data
    );
  }

  // 计算空泡系数
  async calculateVoidCoefficient(data: any): Promise<any> {
    return this.sendMessage(
      WorkerType.PHYSICS_CALCULATION,
      'calculateVoidCoefficient',
      data
    );
  }

  // 计算氙中毒
  async calculateXenonPoisoning(data: any): Promise<any> {
    return this.sendMessage(
      WorkerType.PHYSICS_CALCULATION,
      'calculateXenonPoisoning',
      data
    );
  }

  // 计算控制棒物理特性
  async calculateControlRodPhysics(data: any): Promise<any> {
    return this.sendMessage(
      WorkerType.PHYSICS_CALCULATION,
      'calculateControlRodPhysics',
      data
    );
  }

  // 计算反应堆核心
  async calculateReactorCore(data: any): Promise<any> {
    return this.sendMessage(
      WorkerType.PHYSICS_CALCULATION,
      'calculateReactorCore',
      data
    );
  }

  // 处理警报数据
  async processAlarmData(data: any): Promise<any> {
    return this.sendMessage(
      WorkerType.DATA_PROCESSING,
      'processAlarmData',
      data
    );
  }

  // 处理趋势数据
  async processTrendData(data: any): Promise<any> {
    return this.sendMessage(
      WorkerType.DATA_PROCESSING,
      'processTrendData',
      data
    );
  }

  // 生成报告
  async generateReport(data: any): Promise<any> {
    return this.sendMessage(WorkerType.DATA_PROCESSING, 'generateReport', data);
  }

  // 终止Worker
  terminate() {
    this.workers.forEach((workerInstance) => {
      workerInstance.worker.terminate();
    });
    this.workers.clear();
    this.isInitialized = false;
  }
}

// 导出单例
export const workerManager = new WorkerManager();
