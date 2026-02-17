// Component Factory Utility
// This utility provides functions to create and configure components

import type { ComponentConfig } from '../config/components';
import { getComponentConfig } from '../config/components';

// Component factory options
interface ComponentFactoryOptions<T> {
  component: T;
  config?: Partial<ComponentConfig>;
  props?: Record<string, any>;
}

// Create a configured component instance
export function createComponent<T> ({
  component,
  config,
  props = {},
}: ComponentFactoryOptions<T>): {
  component: T;
  config: ComponentConfig;
  props: Record<string, any>;
} {
  const resolvedConfig = getComponentConfig(config);

  return {
    component,
    config: resolvedConfig,
    props,
  };
}

// Create a responsive component with breakpoints
export function createResponsiveComponent<T> ({
  component,
  config,
  props = {},
  breakpoints = {
    sm: {},
    md: {},
    lg: {},
    xl: {},
  },
}: ComponentFactoryOptions<T> & {
  breakpoints?: Record<string, Record<string, any>>;
}): {
  component: T;
  config: ComponentConfig;
  props: Record<string, any>;
  breakpoints: Record<string, Record<string, any>>;
} {
  const resolvedConfig = getComponentConfig(config);

  return {
    component,
    config: resolvedConfig,
    props,
    breakpoints,
  };
}

// Create a localized component with i18n support
export function createLocalizedComponent<T> ({
  component,
  config,
  props = {},
  translations = {},
}: ComponentFactoryOptions<T> & {
  translations?: Record<string, Record<string, string>>;
}): {
  component: T;
  config: ComponentConfig;
  props: Record<string, any>;
  translations: Record<string, Record<string, string>>;
} {
  const resolvedConfig = getComponentConfig(config);

  return {
    component,
    config: resolvedConfig,
    props,
    translations,
  };
}

// Component registry for dynamic component loading
class ComponentRegistry {
  private components = new Map<string, any>();

  register (name: string, component: any): void {
    this.components.set(name, component);
  }

  get (name: string): any | undefined {
    return this.components.get(name);
  }

  has (name: string): boolean {
    return this.components.has(name);
  }

  getAll (): Map<string, any> {
    return this.components;
  }
}

export const componentRegistry = new ComponentRegistry();

// Helper function to register components in bulk
export function registerComponents (components: Record<string, any>): void {
  Object.entries(components).forEach(([name, component]) => {
    componentRegistry.register(name, component);
  });
}
