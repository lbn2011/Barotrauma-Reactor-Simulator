// Worker管理器
import log from '../utils/logger';

// 定义Worker类型
type WorkerType = 'neutron' | 'thermal' | 'systems';

// 定义消息类型
interface WorkerMessage {
  type: string;
  payload: any;
}

// 定义响应类型
interface WorkerResponse {
  type: string;
  success: boolean;
  data?: any;
  error?: string;
}

// 定义Worker管理器接口
interface IWorkerManager {
  initialize: () => void;
  terminate: () => void;
  sendMessage: <T>(
    workerType: WorkerType,
    type: string,
    payload: any
  ) => Promise<T>;
  isInitialized: boolean;
}

/**
 * Worker管理器
 * 负责管理所有Web Workers的生命周期和通信
 */
export class WorkerManager implements IWorkerManager {
  private workers: Map<WorkerType, Worker> = new Map();
  private callbacks: Map<string, (response: WorkerResponse) => void> =
    new Map();
  private messageIdCounter = 0;
  private _isInitialized = false;

  /**
   * 初始化Worker管理器
   */
  initialize (): void {
    if (this._isInitialized) {
      log.warn('WorkerManager already initialized');
      return;
    }

    log.info('Initializing WorkerManager');

    // 创建并初始化各个Worker
    this.createWorker(
      'neutron',
      new Worker(new URL('./neutronWorker.ts', import.meta.url), {
        type: 'module',
      })
    );
    this.createWorker(
      'thermal',
      new Worker(new URL('./thermalWorker.ts', import.meta.url), {
        type: 'module',
      })
    );
    this.createWorker(
      'systems',
      new Worker(new URL('./systemsWorker.ts', import.meta.url), {
        type: 'module',
      })
    );

    this._isInitialized = true;
    log.success('WorkerManager initialized successfully');
  }

  /**
   * 创建并配置Worker
   * @param type Worker类型
   * @param worker Worker实例
   */
  private createWorker (type: WorkerType, worker: Worker): void {
    this.workers.set(type, worker);

    // 设置Worker消息处理器
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      this.handleWorkerMessage(type, event.data);
    };

    // 设置Worker错误处理器
    worker.onerror = (error: globalThis.ErrorEvent) => {
      log.error(`Worker ${type} error:`, error);
    };

    log.info(`Worker ${type} created and initialized`);
  }

  /**
   * 处理Worker消息
   * @param workerType Worker类型
   * @param response 响应数据
   */
  private handleWorkerMessage (
    workerType: WorkerType,
    response: WorkerResponse
  ): void {
    log.trace(`Received message from ${workerType} worker:`, response.type);

    // 提取消息ID（如果有）
    const messageId = response.type.split(':')[1];
    if (messageId && this.callbacks.has(messageId)) {
      const callback = this.callbacks.get(messageId);
      if (callback) {
        callback(response);
        this.callbacks.delete(messageId);
      }
    } else {
      // 处理没有消息ID的响应（例如错误消息）
      log.debug(
        `Received unsolicited message from ${workerType} worker:`,
        response
      );
    }
  }

  /**
   * 向Worker发送消息
   * @param workerType Worker类型
   * @param type 消息类型
   * @param payload 消息数据
   * @returns Promise<T> 响应数据
   */
  sendMessage<T> (
    workerType: WorkerType,
    type: string,
    payload: any
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this._isInitialized) {
        reject(new Error('WorkerManager not initialized'));
        return;
      }

      const worker = this.workers.get(workerType);
      if (!worker) {
        reject(new Error(`Worker ${workerType} not found`));
        return;
      }

      // 生成唯一消息ID
      const messageId = `msg_${++this.messageIdCounter}_${Date.now()}`;
      const messageType = `${type}:${messageId}`;

      // 创建回调
      this.callbacks.set(messageId, (response: WorkerResponse) => {
        if (response.success) {
          resolve(response.data as T);
        } else {
          reject(
            new Error(
              response.error || `Worker ${workerType} failed to process ${type}`
            )
          );
        }
      });

      // 发送消息
      const message: WorkerMessage = {
        type: messageType,
        payload,
      };

      log.trace(`Sending message to ${workerType} worker:`, type);
      worker.postMessage(message);
    });
  }

  /**
   * 终止所有Worker
   */
  terminate (): void {
    log.info('Terminating WorkerManager');

    // 终止所有Worker
    this.workers.forEach((worker, type) => {
      worker.terminate();
      log.info(`Worker ${type} terminated`);
    });

    // 清空Worker和回调
    this.workers.clear();
    this.callbacks.clear();
    this._isInitialized = false;

    log.success('WorkerManager terminated successfully');
  }

  /**
   * 获取初始化状态
   */
  get isInitialized (): boolean {
    return this._isInitialized;
  }

  /**
   * 获取Worker状态
   */
  getWorkerStatus (): Record<WorkerType, boolean> {
    const status: Record<WorkerType, boolean> = {
      neutron: false,
      thermal: false,
      systems: false,
    };

    this.workers.forEach((_, type) => {
      status[type] = true;
    });

    return status;
  }
}

// 导出单例
export const workerManager = new WorkerManager();
