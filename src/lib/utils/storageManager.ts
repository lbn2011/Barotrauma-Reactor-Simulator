import log from './logger';

// 定义存储数据类型
export interface SimulationState {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  initialParams: any;
  boundaryConditions: any;
  currentState: any;
}

export interface SimulationHistory {
  id: string;
  simulationId: string;
  timestamp: number;
  result: any;
  log: string[];
}

// 存储管理器类
export class StorageManager {
  // 数据库名称
  private readonly DB_NAME = 'BarotraumaReactorSimulator';

  // 数据库版本
  private readonly DB_VERSION = 1;

  // 存储对象名称
  private readonly STORES = {
    SIMULATIONS: 'simulations',
    HISTORY: 'history',
  };

  // 数据库实例
  private db: globalThis.IDBDatabase | null = null;

  // 初始化数据库
  async initialize (): Promise<void> {
    log.trace('Initializing storage manager...');

    return new Promise((resolve, reject) => {
      const request = globalThis.indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = (event) => {
        log.error(
          'Failed to open database:',
          (event.target as globalThis.IDBOpenDBRequest).error
        );
        reject((event.target as globalThis.IDBOpenDBRequest).error);
      };

      request.onsuccess = (event) => {
        this.db = (event.target as globalThis.IDBOpenDBRequest).result;
        log.info('Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as globalThis.IDBOpenDBRequest).result;

        // 创建模拟状态存储
        if (!db.objectStoreNames.contains(this.STORES.SIMULATIONS)) {
          const simulationStore = db.createObjectStore(
            this.STORES.SIMULATIONS,
            {
              keyPath: 'id',
            }
          );
          simulationStore.createIndex('name', 'name', { unique: false });
          simulationStore.createIndex('createdAt', 'createdAt', {
            unique: false,
          });
          simulationStore.createIndex('updatedAt', 'updatedAt', {
            unique: false,
          });
          log.trace('Created simulations store');
        }

        // 创建历史数据存储
        if (!db.objectStoreNames.contains(this.STORES.HISTORY)) {
          const historyStore = db.createObjectStore(this.STORES.HISTORY, {
            keyPath: 'id',
          });
          historyStore.createIndex('simulationId', 'simulationId', {
            unique: false,
          });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
          log.trace('Created history store');
        }
      };
    });
  }

  // 保存模拟状态
  async saveSimulation (
    simulation: Omit<SimulationState, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SimulationState> {
    if (!this.db) {
      await this.initialize();
    }

    const newSimulation: SimulationState = {
      ...simulation,
      id: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.STORES.SIMULATIONS],
        'readwrite'
      );
      const store = transaction.objectStore(this.STORES.SIMULATIONS);
      const request = store.add(newSimulation);

      request.onerror = (event) => {
        log.error(
          'Failed to save simulation:',
          (event.target as globalThis.IDBRequest).error
        );
        reject((event.target as globalThis.IDBRequest).error);
      };

      request.onsuccess = () => {
        log.info(`Simulation saved successfully: ${newSimulation.id}`);
        resolve(newSimulation);
      };
    });
  }

  // 更新模拟状态
  async updateSimulation (
    id: string,
    updates: Partial<SimulationState>
  ): Promise<SimulationState> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.STORES.SIMULATIONS],
        'readwrite'
      );
      const store = transaction.objectStore(this.STORES.SIMULATIONS);
      const getRequest = store.get(id);

      getRequest.onerror = (event) => {
        log.error(
          'Failed to get simulation:',
          (event.target as globalThis.IDBRequest).error
        );
        reject((event.target as globalThis.IDBRequest).error);
      };

      getRequest.onsuccess = () => {
        const simulation = getRequest.result;
        if (!simulation) {
          reject(new Error('Simulation not found'));
          return;
        }

        const updatedSimulation = {
          ...simulation,
          ...updates,
          updatedAt: Date.now(),
        };

        const putRequest = store.put(updatedSimulation);
        putRequest.onerror = (event) => {
          log.error(
            'Failed to update simulation:',
            (event.target as globalThis.IDBRequest).error
          );
          reject((event.target as globalThis.IDBRequest).error);
        };

        putRequest.onsuccess = () => {
          log.info(`Simulation updated successfully: ${id}`);
          resolve(updatedSimulation);
        };
      };
    });
  }

  // 获取模拟状态
  async getSimulation (id: string): Promise<SimulationState | null> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.STORES.SIMULATIONS],
        'readonly'
      );
      const store = transaction.objectStore(this.STORES.SIMULATIONS);
      const request = store.get(id);

      request.onerror = (event) => {
        log.error(
          'Failed to get simulation:',
          (event.target as globalThis.IDBRequest).error
        );
        reject((event.target as globalThis.IDBRequest).error);
      };

      request.onsuccess = () => {
        const simulation = request.result;
        log.trace(`Simulation retrieved: ${id}`);
        resolve(simulation || null);
      };
    });
  }

  // 获取所有模拟状态
  async getAllSimulations (): Promise<SimulationState[]> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.STORES.SIMULATIONS],
        'readonly'
      );
      const store = transaction.objectStore(this.STORES.SIMULATIONS);
      const request = store.getAll();

      request.onerror = (event) => {
        log.error(
          'Failed to get all simulations:',
          (event.target as globalThis.IDBRequest).error
        );
        reject((event.target as globalThis.IDBRequest).error);
      };

      request.onsuccess = () => {
        const simulations = request.result;
        log.trace(`Retrieved ${simulations.length} simulations`);
        resolve(simulations);
      };
    });
  }

  // 删除模拟状态
  async deleteSimulation (id: string): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.STORES.SIMULATIONS, this.STORES.HISTORY],
        'readwrite'
      );

      // 删除关联的历史数据
      const historyStore = transaction.objectStore(this.STORES.HISTORY);
      const historyIndex = historyStore.index('simulationId');
      const historyRequest = historyIndex.openCursor(id);

      historyRequest.onsuccess = (event) => {
        const cursor = (event.target as globalThis.IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      // 删除模拟状态
      const simulationStore = transaction.objectStore(this.STORES.SIMULATIONS);
      const simulationRequest = simulationStore.delete(id);

      simulationRequest.onerror = (event) => {
        log.error(
          'Failed to delete simulation:',
          (event.target as globalThis.IDBRequest).error
        );
        reject((event.target as globalThis.IDBRequest).error);
      };

      simulationRequest.onsuccess = () => {
        log.info(`Simulation deleted successfully: ${id}`);
        resolve();
      };
    });
  }

  // 保存模拟历史
  async saveHistory (
    history: Omit<SimulationHistory, 'id'>
  ): Promise<SimulationHistory> {
    if (!this.db) {
      await this.initialize();
    }

    const newHistory: SimulationHistory = {
      ...history,
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.STORES.HISTORY],
        'readwrite'
      );
      const store = transaction.objectStore(this.STORES.HISTORY);
      const request = store.add(newHistory);

      request.onerror = (event) => {
        log.error(
          'Failed to save history:',
          (event.target as globalThis.IDBRequest).error
        );
        reject((event.target as globalThis.IDBRequest).error);
      };

      request.onsuccess = () => {
        log.trace(`History saved successfully: ${newHistory.id}`);
        resolve(newHistory);
      };
    });
  }

  // 获取模拟历史
  async getHistory (simulationId: string): Promise<SimulationHistory[]> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.STORES.HISTORY],
        'readonly'
      );
      const store = transaction.objectStore(this.STORES.HISTORY);
      const index = store.index('simulationId');
      const request = index.getAll(simulationId);

      request.onerror = (event) => {
        log.error(
          'Failed to get history:',
          (event.target as globalThis.IDBRequest).error
        );
        reject((event.target as globalThis.IDBRequest).error);
      };

      request.onsuccess = () => {
        const history = request.result;
        log.trace(
          `Retrieved ${history.length} history records for simulation: ${simulationId}`
        );
        resolve(history);
      };
    });
  }

  // 导出模拟数据
  async exportSimulation (
    simulationId: string,
    format: 'json' | 'csv'
  ): Promise<string> {
    const simulation = await this.getSimulation(simulationId);
    if (!simulation) {
      throw new Error('Simulation not found');
    }

    const history = await this.getHistory(simulationId);

    const exportData = {
      simulation,
      history,
    };

    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    } else if (format === 'csv') {
      // 生成CSV格式
      let csv = 'Timestamp,Result\n';
      history.forEach((record) => {
        csv += `${new Date(record.timestamp).toISOString()},${JSON.stringify(record.result)}\n`;
      });
      return csv;
    } else {
      throw new Error('Unsupported export format');
    }
  }

  // 导入模拟数据
  async importSimulation (data: any): Promise<SimulationState> {
    // 验证导入数据
    if (!data.simulation || !data.simulation.name) {
      throw new Error('Invalid import data');
    }

    // 创建新的模拟状态
    const newSimulation = await this.saveSimulation({
      name: data.simulation.name,
      initialParams: data.simulation.initialParams,
      boundaryConditions: data.simulation.boundaryConditions,
      currentState: data.simulation.currentState,
    });

    // 导入历史数据
    if (data.history && Array.isArray(data.history)) {
      for (const historyRecord of data.history) {
        await this.saveHistory({
          simulationId: newSimulation.id,
          timestamp: historyRecord.timestamp,
          result: historyRecord.result,
          log: historyRecord.log,
        });
      }
    }

    log.info(`Simulation imported successfully: ${newSimulation.id}`);
    return newSimulation;
  }

  // 清空所有数据
  async clearAll (): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.STORES.SIMULATIONS, this.STORES.HISTORY],
        'readwrite'
      );

      const simulationStore = transaction.objectStore(this.STORES.SIMULATIONS);
      const simulationRequest = simulationStore.clear();

      simulationRequest.onerror = (event) => {
        log.error(
          'Failed to clear simulations:',
          (event.target as globalThis.IDBRequest).error
        );
        reject((event.target as globalThis.IDBRequest).error);
      };

      const historyStore = transaction.objectStore(this.STORES.HISTORY);
      const historyRequest = historyStore.clear();

      historyRequest.onerror = (event) => {
        log.error(
          'Failed to clear history:',
          (event.target as globalThis.IDBRequest).error
        );
        reject((event.target as globalThis.IDBRequest).error);
      };

      historyRequest.onsuccess = () => {
        log.info('All data cleared successfully');
        resolve();
      };
    });
  }
}

// 导出单例
export const storageManager = new StorageManager();
