// State Management Index
// This file serves as the entry point for all state management stores

import log from '../lib/utils/logger';

log.info('State management module initialized');
log.debug('Starting to load all state management stores');

// Import existing stores
import i18nStore, { getI18n, setLanguage } from './i18n';
import { prefersReducedMotion } from './prefers-reduced-motion';
import { sidebarIsHidden } from './sidebar-hidden';
import {
  reactorStore,
  updateReactorState,
  startSimulation,
  stopSimulation,
  resetSimulation,
} from '../lib/stores/reactorStore';

// Define Intent types
export interface Intent {
  type: string;
  payload?: any;
}

// Define Reactor Intents
export enum ReactorIntentType {
  START_SIMULATION = 'START_SIMULATION',
  STOP_SIMULATION = 'STOP_SIMULATION',
  RESET_SIMULATION = 'RESET_SIMULATION',
  SET_CONTROL_ROD_POSITION = 'SET_CONTROL_ROD_POSITION',
  EMERGENCY_ROD_INSERTION = 'EMERGENCY_ROD_INSERTION',
  SET_POWER_SETPOINT = 'SET_POWER_SETPOINT',
  TOGGLE_AUTOMATIC_CONTROL = 'TOGGLE_AUTOMATIC_CONTROL',
  TRIP_REACTOR = 'TRIP_REACTOR',
  UPDATE_STATE = 'UPDATE_STATE',
}

// Define I18n Intents
export enum I18nIntentType {
  SET_LANGUAGE = 'SET_LANGUAGE',
}

// Define UI Intents
export enum UIIntentType {
  TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR',
  SET_REDUCED_MOTION = 'SET_REDUCED_MOTION',
}

// Create Intent Handler
export function handleIntent (intent: Intent) {
  log.info(`Processing intent: ${intent.type}`);
  log.debug('Intent payload:', intent.payload);

  try {
    switch (intent.type) {
    // Reactor Intents
    case ReactorIntentType.START_SIMULATION:
      log.info('Starting reactor simulation');
      startSimulation();
      break;
    case ReactorIntentType.STOP_SIMULATION:
      log.info('Stopping reactor simulation');
      stopSimulation();
      break;
    case ReactorIntentType.RESET_SIMULATION:
      log.info('Resetting reactor simulation');
      resetSimulation();
      break;
    case ReactorIntentType.SET_CONTROL_ROD_POSITION:
      if (intent.payload?.position !== undefined) {
        log.debug(`Setting control rod position: ${intent.payload.position}`);
        import('../lib/stores/reactorStore').then(
          ({ setControlRodPosition }) => {
            setControlRodPosition(intent.payload.position);
          }
        );
      } else {
        log.warn('Failed to set control rod position: missing position parameter');
      }
      break;
    case ReactorIntentType.EMERGENCY_ROD_INSERTION:
      log.warn('Performing emergency rod insertion');
      import('../lib/stores/reactorStore').then(({ emergencyRodInsertion }) => {
        emergencyRodInsertion();
      });
      break;
    case ReactorIntentType.SET_POWER_SETPOINT:
      if (intent.payload?.setpoint !== undefined) {
        log.debug(`Setting power setpoint: ${intent.payload.setpoint}`);
        import('../lib/stores/reactorStore').then(({ setPowerSetpoint }) => {
          setPowerSetpoint(intent.payload.setpoint);
        });
      } else {
        log.warn('Failed to set power setpoint: missing setpoint parameter');
      }
      break;
    case ReactorIntentType.TOGGLE_AUTOMATIC_CONTROL:
      log.info('Toggling automatic control mode');
      import('../lib/stores/reactorStore').then(
        ({ toggleAutomaticControl }) => {
          toggleAutomaticControl();
        }
      );
      break;
    case ReactorIntentType.TRIP_REACTOR:
      log.error('Tripping reactor');
      import('../lib/stores/reactorStore').then(({ tripReactor }) => {
        tripReactor();
      });
      break;
    case ReactorIntentType.UPDATE_STATE:
      log.trace('Updating reactor state');
      updateReactorState();
      break;

      // I18n Intents
    case I18nIntentType.SET_LANGUAGE:
      if (intent.payload?.language) {
        log.info(`Setting language: ${intent.payload.language}`);
        setLanguage(intent.payload.language);
      } else {
        log.warn('Failed to set language: missing language parameter');
      }
      break;

      // UI Intents
    case UIIntentType.TOGGLE_SIDEBAR:
      log.info('Toggling sidebar visibility');
      sidebarIsHidden.update((hidden) => !hidden);
      break;
    case UIIntentType.SET_REDUCED_MOTION:
      if (intent.payload?.enabled !== undefined) {
        log.debug(`Setting reduced motion: ${intent.payload.enabled}`);
        // Note: prefersReducedMotion is a readonly store based on media query
        // This intent would typically be used to store user preference in localStorage
        localStorage.setItem(
          'reducedMotion',
          intent.payload.enabled.toString()
        );
        log.success('Reduced motion preference saved to local storage');
      } else {
        log.warn('Failed to set reduced motion: missing enabled parameter');
      }
      break;

    default:
      log.warn('Unknown intent type:', intent.type);
    }

    log.trace('Intent processing completed');
  } catch (error) {
    log.error('Error processing intent:', error);
  }
}

// Export all stores and utilities
export {
  i18nStore,
  getI18n,
  setLanguage,
  prefersReducedMotion,
  sidebarIsHidden,
  reactorStore,
  updateReactorState,
  startSimulation,
  stopSimulation,
  resetSimulation,
};

// Export store types
export type { I18nStore } from './i18n';

export type { ReactorState } from '../lib/stores/reactorStore';

// State management module loaded successfully
log.success('State management module loaded successfully, including 4 stores and intent processing system');
