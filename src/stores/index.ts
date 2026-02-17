// State Management Index
// This file serves as the entry point for all state management stores

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
  switch (intent.type) {
  // Reactor Intents
  case ReactorIntentType.START_SIMULATION:
    startSimulation();
    break;
  case ReactorIntentType.STOP_SIMULATION:
    stopSimulation();
    break;
  case ReactorIntentType.RESET_SIMULATION:
    resetSimulation();
    break;
  case ReactorIntentType.SET_CONTROL_ROD_POSITION:
    if (intent.payload?.position !== undefined) {
      import('../lib/stores/reactorStore').then(
        ({ setControlRodPosition }) => {
          setControlRodPosition(intent.payload.position);
        }
      );
    }
    break;
  case ReactorIntentType.EMERGENCY_ROD_INSERTION:
    import('../lib/stores/reactorStore').then(({ emergencyRodInsertion }) => {
      emergencyRodInsertion();
    });
    break;
  case ReactorIntentType.SET_POWER_SETPOINT:
    if (intent.payload?.setpoint !== undefined) {
      import('../lib/stores/reactorStore').then(({ setPowerSetpoint }) => {
        setPowerSetpoint(intent.payload.setpoint);
      });
    }
    break;
  case ReactorIntentType.TOGGLE_AUTOMATIC_CONTROL:
    import('../lib/stores/reactorStore').then(
      ({ toggleAutomaticControl }) => {
        toggleAutomaticControl();
      }
    );
    break;
  case ReactorIntentType.TRIP_REACTOR:
    import('../lib/stores/reactorStore').then(({ tripReactor }) => {
      tripReactor();
    });
    break;
  case ReactorIntentType.UPDATE_STATE:
    updateReactorState();
    break;

    // I18n Intents
  case I18nIntentType.SET_LANGUAGE:
    if (intent.payload?.language) {
      setLanguage(intent.payload.language);
    }
    break;

    // UI Intents
  case UIIntentType.TOGGLE_SIDEBAR:
    sidebarIsHidden.update((hidden) => !hidden);
    break;
  case UIIntentType.SET_REDUCED_MOTION:
    if (intent.payload?.enabled !== undefined) {
      // Note: prefersReducedMotion is a readonly store based on media query
      // This intent would typically be used to store user preference in localStorage
      localStorage.setItem(
        'reducedMotion',
        intent.payload.enabled.toString()
      );
    }
    break;

  default:
    console.warn('Unknown intent type:', intent.type);
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
