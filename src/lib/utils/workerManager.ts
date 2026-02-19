import log from './logger';

// 定义消息类型
export interface WorkerMessage {
	type: string;
	id: string;
	payload: any;
}

// 定义计算任务类型
export interface CalculationTask {
	type: 'neutronTransport' | 'reactorKinetics' | 'thermalHydraulics' | 'reactorCoreStatus';
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
	private taskCallbacks: Map<string, (result: any, error: string | null) => void> = new Map();
	
	// 构造函数
	constructor() {
		this.initializeWorker();
	}
	
	// 初始化 Worker
	private initializeWorker() {
		try {
			// 创建 Worker
			this.worker = new Worker(new URL('../../workers/physicsWorker.ts', import.meta.url), {
				type: 'module'
			});
			
			// 设置消息处理器
			this.worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
				this.handleWorkerMessage(event.data);
			};
			
			// 设置错误处理器
			this.worker.onerror = (error) => {
				log.error('Worker error:', error);
			};
			
			log.info('Worker initialized successfully');
		} catch (error) {
			log.error('Failed to initialize worker:', error);
		}
	}
	
	// 处理 Worker 消息
	private handleWorkerMessage(message: WorkerMessage) {
		const { type, id, payload } = message;
		
		const task = this.tasks.get(id);
		if (!task) {
			log.warn('Received message for unknown task:', id);
			return;
		}
		
		switch (type) {
			case 'result':
				task.status = 'completed';
				task.result = payload;
				task.progress = 100;
				
				// 调用回调
				const callback = this.taskCallbacks.get(id);
				if (callback) {
					callback(payload, null);
					this.taskCallbacks.delete(id);
				}
				
				log.trace(`Task ${id} completed successfully`);
				break;
				
			case 'error':
				task.status = 'failed';
				task.error = payload.message;
				
				// 调用回调
				const errorCallback = this.taskCallbacks.get(id);
				if (errorCallback) {
					errorCallback(null, payload.message);
					this.taskCallbacks.delete(id);
				}
				
				log.error(`Task ${id} failed:`, payload.message);
				break;
				
			case 'cancelled':
				task.status = 'cancelled';
				
				// 调用回调
				const cancelCallback = this.taskCallbacks.get(id);
				if (cancelCallback) {
					cancelCallback(null, 'Task cancelled');
					this.taskCallbacks.delete(id);
				}
				
				log.trace(`Task ${id} cancelled`);
				break;
				
			case 'pong':
				log.trace('Worker ping response received');
				break;
		}
		
		// 更新任务状态
		this.tasks.set(id, task);
	}
	
	// 执行计算任务
	executeTask(task: CalculationTask): Promise<any> {
		return new Promise((resolve, reject) => {
			if (!this.worker) {
				reject(new Error('Worker not initialized'));
				return;
			}
			
			// 生成任务 ID
			const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
			
			// 创建任务状态
			const taskStatus: TaskStatus = {
				id: taskId,
				status: 'pending',
				progress: 0
			};
			
			// 添加任务到队列
			this.tasks.set(taskId, taskStatus);
			
			// 添加回调
			this.taskCallbacks.set(taskId, (result, error) => {
				if (error) {
					reject(new Error(error));
				} else {
					resolve(result);
				}
			});
			
			// 发送任务到 Worker
			this.worker.postMessage({
				type: 'calculate',
				id: taskId,
				payload: task
			});
			
			// 更新任务状态为运行中
			taskStatus.status = 'running';
			this.tasks.set(taskId, taskStatus);
			
			log.trace(`Task ${taskId} started: ${task.type}`);
		});
	}
	
	// 取消任务
	cancelTask(taskId: string): void {
		if (!this.worker) {
			return;
		}
		
		// 发送取消消息
		this.worker.postMessage({
			type: 'cancel',
			id: taskId,
			payload: {}
		});
		
		log.trace(`Task ${taskId} cancellation requested`);
	}
	
	// 获取任务状态
	getTaskStatus(taskId: string): TaskStatus | undefined {
		return this.tasks.get(taskId);
	}
	
	// 获取所有任务状态
	getAllTasks(): TaskStatus[] {
		return Array.from(this.tasks.values());
	}
	
	// 清理完成的任务
	cleanupTasks(): void {
		for (const [taskId, task] of this.tasks.entries()) {
			if (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') {
				this.tasks.delete(taskId);
				this.taskCallbacks.delete(taskId);
			}
		}
		
		log.trace('Cleaned up completed tasks');
	}
	
	// 销毁 Worker
	destroy(): void {
		if (this.worker) {
			this.worker.terminate();
			this.worker = null;
		}
		
		// 清理任务
		this.tasks.clear();
		this.taskCallbacks.clear();
		
		log.info('Worker destroyed');
	}
	
	// 检查 Worker 状态
	ping(): Promise<boolean> {
		return new Promise((resolve) => {
			if (!this.worker) {
				resolve(false);
				return;
			}
			
			// 生成 ping ID
			const pingId = `ping-${Date.now()}`;
			
			// 设置临时回调
			const timeout = setTimeout(() => {
				resolve(false);
			}, 1000);
			
			// 发送 ping 消息
			this.worker.postMessage({
				type: 'ping',
				id: pingId,
				payload: {}
			});
			
			// 临时消息处理器
			const originalOnMessage = this.worker.onmessage;
			this.worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
				const { type, id } = event.data;
				if (type === 'pong' && id === pingId) {
					clearTimeout(timeout);
					this.worker!.onmessage = originalOnMessage;
					resolve(true);
				} else if (originalOnMessage) {
					originalOnMessage(event);
				}
			};
		});
	}
}

// 导出单例
export const workerManager = new WorkerManager();
