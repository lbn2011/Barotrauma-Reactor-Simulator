/**
 * Worker Manager
 * Manages Web Workers for computationally intensive tasks
 */

import log from '../lib/utils/logger';

/**
 * Worker Type Enum
 */
const enum WorkerType {
  PHYSICS_CALCULATION = 'physicsCalculation', // Physics calculation worker
  DATA_PROCESSING = 'dataProcessing', // Data processing worker
}

/**
 * Worker Response Interface
 */
interface WorkerResponse {
  type: string; // Response type
  data: any; // Response data
}

/**
 * Worker Instance Interface
 */
interface WorkerInstance {
  worker: Worker; // Worker instance
  callbacks: Map<string, (data: any) => void>; // Callback function map
}

/**
 * Worker Manager Class
 * Manages multiple Web Workers for physics calculations and data processing tasks
 */
class WorkerManager {
  private workers: Map<WorkerType, WorkerInstance> = new Map(); // Worker instance map
  private isInitialized: boolean = false; // Initialization status

  /**
 * Initialize Workers
 * Creates physics calculation and data processing workers
 */
  initialize () {
    if (this.isInitialized) {
      log.debug('Worker manager already initialized');
      return;
    }

    log.info('Starting worker manager initialization');

    // Create physics calculation worker
    try {
      log.debug('Creating physics calculation worker');
      const physicsWorker = new Worker(
        new URL('./physicsCalculation.worker.ts', import.meta.url)
      );
      this.workers.set(WorkerType.PHYSICS_CALCULATION, {
        worker: physicsWorker,
        callbacks: new Map(),
      });

      // Set up physics calculation worker message handling
      physicsWorker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        this.handleWorkerMessage(WorkerType.PHYSICS_CALCULATION, e.data);
      };

      // Handle physics calculation worker errors
      physicsWorker.onerror = (error) => {
        log.error('Physics calculation worker error:', error);
      };
      log.success('Physics calculation worker created successfully');
    } catch (error) {
      log.error('Failed to create physics calculation worker:', error);
    }

    // Create data processing worker
    try {
      log.debug('Creating data processing worker');
      const dataWorker = new Worker(
        new URL('./dataProcessing.worker.ts', import.meta.url)
      );
      this.workers.set(WorkerType.DATA_PROCESSING, {
        worker: dataWorker,
        callbacks: new Map(),
      });

      // Set up data processing worker message handling
      dataWorker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        this.handleWorkerMessage(WorkerType.DATA_PROCESSING, e.data);
      };

      // Handle data processing worker errors
      dataWorker.onerror = (error) => {
        log.error('Data processing worker error:', error);
      };
      log.success('Data processing worker created successfully');
    } catch (error) {
      log.error('Failed to create data processing worker:', error);
    }

    this.isInitialized = true;
    log.success('Worker manager initialization completed');
  }

  /**
 * Handle Worker Messages
 * @param workerType Worker type
 * @param response Response data
 */
  private handleWorkerMessage (
    workerType: WorkerType,
    response: WorkerResponse
  ) {
    log.debug(`Received message from ${workerType}: ${response.type}`);
    log.trace(`Message data: ${JSON.stringify(response.data)}`);

    const workerInstance = this.workers.get(workerType);
    if (!workerInstance) {
      log.error(`Worker instance not found for ${workerType}`);
      return;
    }

    const callback = workerInstance.callbacks.get(response.type);
    if (callback) {
      log.debug(`Executing callback for ${response.type} from ${workerType}`);
      callback(response.data);
      workerInstance.callbacks.delete(response.type);
      log.debug(`Callback executed and removed for ${response.type}`);
    } else {
      log.warn(`No callback found for response type: ${response.type} from ${workerType}`);
    }
  }

  /**
 * Send Message to Worker
 * @param workerType Worker type
 * @param type Message type
 * @param data Message data
 * @returns Promise<any> Processing result
 */
  sendMessage (workerType: WorkerType, type: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const workerInstance = this.workers.get(workerType);
      if (!workerInstance) {
        const errorMsg = `Worker ${workerType} not initialized`;
        log.error(errorMsg);
        reject(new Error(errorMsg));
        return;
      }

      const responseType = `${type}Result`;
      log.debug(`Sending message to ${workerType}: ${type}`);
      log.trace(`Message data: ${JSON.stringify(data)}`);
      log.trace(`Expected response type: ${responseType}`);

      // Register callback
      workerInstance.callbacks.set(responseType, (result) => {
        log.debug(`${workerType} processing ${type} completed successfully`);
        log.trace(`Received result: ${JSON.stringify(result)}`);
        resolve(result);
      });

      // Send message
      log.trace(`Posting message to ${workerType} worker`);
      workerInstance.worker.postMessage({
        type,
        data,
      });
      log.debug(`Message posted to ${workerType} worker`);

      // Set timeout
      log.debug(`Setting 10-second timeout for ${type} on ${workerType}`);
      setTimeout(() => {
        if (workerInstance.callbacks.has(responseType)) {
          workerInstance.callbacks.delete(responseType);
          const errorMsg = `Worker ${workerType} processing ${type} timed out after 10 seconds`;
          log.error(errorMsg);
          reject(new Error(errorMsg));
        }
      }, 10000); // 10 second timeout
    });
  }

  /**
 * Calculate Mass Balance
 * @param data Input data
 * @returns Promise<any> Calculation result
 */
  async calculateMassBalance (data: any): Promise<any> {
    return this.sendMessage(
      WorkerType.PHYSICS_CALCULATION,
      'calculateMassBalance',
      data
    );
  }

  /**
 * Calculate Energy Balance
 * @param data Input data
 * @returns Promise<any> Calculation result
 */
  async calculateEnergyBalance (data: any): Promise<any> {
    return this.sendMessage(
      WorkerType.PHYSICS_CALCULATION,
      'calculateEnergyBalance',
      data
    );
  }

  /**
 * Calculate Void Coefficient
 * @param data Input data
 * @returns Promise<any> Calculation result
 */
  async calculateVoidCoefficient (data: any): Promise<any> {
    return this.sendMessage(
      WorkerType.PHYSICS_CALCULATION,
      'calculateVoidCoefficient',
      data
    );
  }

  /**
 * Calculate Xenon Poisoning
 * @param data Input data
 * @returns Promise<any> Calculation result
 */
  async calculateXenonPoisoning (data: any): Promise<any> {
    return this.sendMessage(
      WorkerType.PHYSICS_CALCULATION,
      'calculateXenonPoisoning',
      data
    );
  }

  /**
 * Calculate Control Rod Physics
 * @param data Input data
 * @returns Promise<any> Calculation result
 */
  async calculateControlRodPhysics (data: any): Promise<any> {
    return this.sendMessage(
      WorkerType.PHYSICS_CALCULATION,
      'calculateControlRodPhysics',
      data
    );
  }

  /**
 * Calculate Reactor Core
 * @param data Input data
 * @returns Promise<any> Calculation result
 */
  async calculateReactorCore (data: any): Promise<any> {
    return this.sendMessage(
      WorkerType.PHYSICS_CALCULATION,
      'calculateReactorCore',
      data
    );
  }

  /**
 * Process Alarm Data
 * @param data Input data
 * @returns Promise<any> Processing result
 */
  async processAlarmData (data: any): Promise<any> {
    return this.sendMessage(
      WorkerType.DATA_PROCESSING,
      'processAlarmData',
      data
    );
  }

  /**
 * Process Trend Data
 * @param data Input data
 * @returns Promise<any> Processing result
 */
  async processTrendData (data: any): Promise<any> {
    return this.sendMessage(
      WorkerType.DATA_PROCESSING,
      'processTrendData',
      data
    );
  }

  /**
 * Generate Report
 * @param data Input data
 * @returns Promise<any> Processing result
 */
  async generateReport (data: any): Promise<any> {
    return this.sendMessage(WorkerType.DATA_PROCESSING, 'generateReport', data);
  }

  /**
 * Terminate Workers
 * Clean up all worker instances
 */
  terminate () {
    log.info('Starting worker manager termination');
    this.workers.forEach((workerInstance, workerType) => {
      log.debug(`Terminating ${workerType} worker`);
      workerInstance.worker.terminate();
    });
    this.workers.clear();
    this.isInitialized = false;
    log.success('Worker manager terminated');
  }
}

// Export singleton
export const workerManager = new WorkerManager();
