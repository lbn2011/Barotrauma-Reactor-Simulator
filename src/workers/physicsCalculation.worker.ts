// Physics Calculation Web Worker

import { thermal, neutron, systems } from '@/models';

const { calculateMassBalance, calculateEnergyBalance } = thermal;
const {
  calculateVoidCoefficient,
  calculateXenonPoisoning,
  calculateControlRodPhysics,
} = neutron;
const { calculateReactorCore } = systems.reactorCore;

// Log function
function log(
  message: string,
  level: 'info' | 'debug' | 'error' | 'warn' = 'info'
) {
  console[level](`[Physics Worker] ${message}`);
}

// Initialization logs
log('Physics calculation worker initialized');
log('Loading physics model calculation functions');
log('Worker ready to process calculation tasks');

// Define message types
interface WorkerMessage {
  type: string;
  data: any;
}

// Define response types
interface WorkerResponse {
  type: string;
  data: any;
}

// Process messages
self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, data } = e.data;
  log(`Received message: ${type}`, 'debug');
  log(`Message data: ${JSON.stringify(data)}`, 'debug');

  let result: any;

  try {
    switch (type) {
      case 'calculateMassBalance':
        log('Starting mass balance calculation', 'debug');
        log('Mass balance input data received', 'debug');
        result = calculateMassBalance(data);
        log('Mass balance calculation completed successfully', 'debug');
        log(`Mass balance result: ${JSON.stringify(result)}`, 'debug');
        break;

      case 'calculateEnergyBalance':
        log('Starting energy balance calculation', 'debug');
        log('Energy balance input data received', 'debug');
        result = calculateEnergyBalance(data);
        log('Energy balance calculation completed successfully', 'debug');
        log(`Energy balance result: ${JSON.stringify(result)}`, 'debug');
        break;

      case 'calculateVoidCoefficient':
        log('Starting void coefficient calculation', 'debug');
        log('Void coefficient input data received', 'debug');
        result = calculateVoidCoefficient(data);
        log('Void coefficient calculation completed successfully', 'debug');
        log(`Void coefficient result: ${JSON.stringify(result)}`, 'debug');
        break;

      case 'calculateXenonPoisoning':
        log('Starting xenon poisoning calculation', 'debug');
        log('Xenon poisoning input data received', 'debug');
        result = calculateXenonPoisoning(data);
        log('Xenon poisoning calculation completed successfully', 'debug');
        log(`Xenon poisoning result: ${JSON.stringify(result)}`, 'debug');
        break;

      case 'calculateControlRodPhysics':
        log('Starting control rod physics calculation', 'debug');
        log('Control rod physics input data received', 'debug');
        result = calculateControlRodPhysics(data);
        log('Control rod physics calculation completed successfully', 'debug');
        log(`Control rod physics result: ${JSON.stringify(result)}`, 'debug');
        break;

      case 'calculateReactorCore':
        log('Starting reactor core status calculation', 'debug');
        log('Reactor core input data received', 'debug');
        result = calculateReactorCore(data);
        log('Reactor core status calculation completed successfully', 'debug');
        log(`Reactor core result: ${JSON.stringify(result)}`, 'debug');
        break;

      default:
        log(`Unknown message type: ${type}`, 'error');
        log(`Message data for unknown type: ${JSON.stringify(data)}`, 'error');
        return;
    }

    // Send response
    const response: WorkerResponse = {
      type: `${type}Result`,
      data: result,
    };

    log(`Sending response: ${response.type}`, 'debug');
    log(`Response data: ${JSON.stringify(response.data)}`, 'debug');
    self.postMessage(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    log(`Error during ${type} calculation: ${errorMessage}`, 'error');
    if (errorStack) {
      log(`Error stack: ${errorStack}`, 'error');
    }
    const errorResponse: WorkerResponse = {
      type: `${type}Error`,
      data: {
        error: errorMessage,
        stack: errorStack,
      },
    };
    log(`Sending error response: ${errorResponse.type}`, 'debug');
    self.postMessage(errorResponse);
  }
};
