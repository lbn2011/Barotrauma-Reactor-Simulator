import logger, { ModuleType } from './logger';

// 定义消息类型
export interface WorkerMessage {
  type: string;
  id: string;
  payload: any;
}

// 定义计算任务类型
export interface CalculationTask {
  type:
    | 'neutronTransport'
    | 'reactorKinetics'
    | 'thermalHydraulics'
    | 'reactorCoreStatus';
  params: any;
}

// 定义任务状态
export interface TaskStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  result?: any;
  error?: string;
  progress?: number;
}

// Worker 管理器类
export class WorkerManager {
  // Worker 实例
  private worker: Worker | null = null;

  // 任务队列
  private tasks: Map<string, TaskStatus> = new Map();

  // 任务回调
  private taskCallbacks: Map<
    string,
    (result: any, error: string | null) => void
  > = new Map();

  // 构造函数
  constructor () {
    this.initializeWorker();
  }

  // 初始化 Worker
  private initializeWorker () {
    logger.trace(ModuleType.CONTROLLER, 'Initializing worker');

    try {
      this.worker = new Worker(
        new URL('../../workers/physicsWorker.ts', import.meta.url),
        {
          type: 'module',
        }
      );

      this.worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
        this.handleWorkerMessage(event.data);
      };

      this.worker.onerror = (error) => {
        logger.error(ModuleType.CONTROLLER, 'Worker error occurred', { error });
      };

      logger.info(ModuleType.CONTROLLER, 'Worker initialized successfully');
    } catch (error) {
      logger.error(ModuleType.CONTROLLER, 'Failed to initialize worker', {
        error,
      });
    }
  }

  // 处理 Worker 消息
  private handleWorkerMessage (message: WorkerMessage) {
    const { type, id, payload } = message;

    logger.trace(ModuleType.CONTROLLER, 'Received worker message', {
      type,
      id,
    });

    const task = this.tasks.get(id);
    if (!task) {
      logger.warn(ModuleType.CONTROLLER, 'Received message for unknown task', {
        id,
      });
      return;
    }

    switch (type) {
    case 'result': {
      task.status = 'completed';
      task.result = payload;
      task.progress = 100;

      const callback = this.taskCallbacks.get(id);
      if (callback) {
        callback(payload, null);
        this.taskCallbacks.delete(id);
      }

      logger.info(ModuleType.CONTROLLER, `Task ${id} completed successfully`);
      break;
    }

    case 'error': {
      task.status = 'failed';
      task.error = payload.message;

      const errorCallback = this.taskCallbacks.get(id);
      if (errorCallback) {
        errorCallback(null, payload.message);
        this.taskCallbacks.delete(id);
      }

      logger.error(ModuleType.CONTROLLER, `Task ${id} failed`, {
        error: payload.message,
      });
      break;
    }

    case 'cancelled': {
      task.status = 'cancelled';

      const cancelCallback = this.taskCallbacks.get(id);
      if (cancelCallback) {
        cancelCallback(null, 'Task cancelled');
        this.taskCallbacks.delete(id);
      }

      logger.info(ModuleType.CONTROLLER, `Task ${id} cancelled`);
      break;
    }

    case 'pong':
      logger.trace(ModuleType.CONTROLLER, 'Worker ping response received');
      break;
    }

    this.tasks.set(id, task);
  }

  executeTask (task: CalculationTask): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        logger.error(ModuleType.CONTROLLER, 'Worker not initialized');
        reject(new Error('Worker not initialized'));
        return;
      }

      const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const taskStatus: TaskStatus = {
        id: taskId,
        status: 'pending',
        progress: 0,
      };

      this.tasks.set(taskId, taskStatus);

      this.taskCallbacks.set(taskId, (result, error) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(result);
        }
      });

      this.worker.postMessage({
        type: 'calculate',
        id: taskId,
        payload: task,
      });

      taskStatus.status = 'running';
      this.tasks.set(taskId, taskStatus);

      logger.info(ModuleType.CONTROLLER, `Task ${taskId} started`, {
        type: task.type,
      });
    });
  }

  cancelTask (taskId: string): void {
    if (!this.worker) {
      return;
    }

    this.worker.postMessage({
      type: 'cancel',
      id: taskId,
      payload: {},
    });

    logger.info(ModuleType.CONTROLLER, `Task ${taskId} cancellation requested`);
  }

  getTaskStatus (taskId: string): TaskStatus | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks (): TaskStatus[] {
    return Array.from(this.tasks.values());
  }

  cleanupTasks (): void {
    let cleanedCount = 0;
    for (const [taskId, task] of this.tasks.entries()) {
      if (
        task.status === 'completed' ||
        task.status === 'failed' ||
        task.status === 'cancelled'
      ) {
        this.tasks.delete(taskId);
        this.taskCallbacks.delete(taskId);
        cleanedCount++;
      }
    }

    logger.debug(ModuleType.CONTROLLER, 'Cleaned up completed tasks', {
      count: cleanedCount,
    });
  }

  destroy (): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.tasks.clear();
    this.taskCallbacks.clear();

    logger.info(ModuleType.CONTROLLER, 'Worker destroyed');
  }

  ping (): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.worker) {
        logger.warn(
          ModuleType.CONTROLLER,
          'Ping failed: Worker not initialized'
        );
        resolve(false);
        return;
      }

      const pingId = `ping-${Date.now()}`;

      const timeout = setTimeout(() => {
        logger.warn(ModuleType.CONTROLLER, 'Worker ping timeout');
        resolve(false);
      }, 1000);

      this.worker.postMessage({
        type: 'ping',
        id: pingId,
        payload: {},
      });

      const originalOnMessage = this.worker.onmessage;
      const handlePong = (event: MessageEvent) => {
        const { type, id } = event.data as WorkerMessage;
        if (type === 'pong' && id === pingId) {
          clearTimeout(timeout);
          this.worker!.onmessage = originalOnMessage;
          logger.trace(ModuleType.CONTROLLER, 'Worker ping successful');
          resolve(true);
        } else if (originalOnMessage) {
          originalOnMessage.call(this.worker, event);
        }
      };
      this.worker.onmessage = handlePong;
    });
  }
}

export const workerManager = new WorkerManager();
