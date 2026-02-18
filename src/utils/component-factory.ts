// Component Factory Utility
// This utility provides functions to create and configure components

import type { ComponentConfig } from '../config/components';
import { getComponentConfig } from '../config/components';
import log from '../lib/utils/logger';

// Component factory options
interface ComponentFactoryOptions<T> {
  component: T;
  config?: Partial<ComponentConfig>;
  props?: Record<string, any>;
}

// Create a configured component instance
export function createComponent<T>({
  component,
  config,
  props = {},
}: ComponentFactoryOptions<T>): {
  component: T;
  config: ComponentConfig;
  props: Record<string, any>;
} {
  log.info('Starting component instance creation');
  log.debug('Component type:', typeof component);
  log.trace('Using config:', config ? 'custom config' : 'default config');

  const resolvedConfig = getComponentConfig(config);
  log.trace('Config resolution completed');

  const result = {
    component,
    config: resolvedConfig,
    props,
  };

  log.success('Component instance created successfully');
  return result;
}

// Create a responsive component with breakpoints
export function createResponsiveComponent<T>({
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
  log.info('Starting responsive component instance creation');
  log.debug('Component type:', typeof component);
  log.trace('Using config:', config ? 'custom config' : 'default config');
  log.trace('Breakpoint config:', Object.keys(breakpoints));

  const resolvedConfig = getComponentConfig(config);
  log.trace('Config resolution completed');

  const result = {
    component,
    config: resolvedConfig,
    props,
    breakpoints,
  };

  log.success('Responsive component instance created successfully');
  return result;
}

// Create a localized component with i18n support
export function createLocalizedComponent<T>({
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
  log.info('Starting localized component instance creation');
  log.debug('Component type:', typeof component);
  log.trace('Using config:', config ? 'custom config' : 'default config');
  log.trace('Translation language count:', Object.keys(translations).length);

  const resolvedConfig = getComponentConfig(config);
  log.trace('Config resolution completed');

  const result = {
    component,
    config: resolvedConfig,
    props,
    translations,
  };

  log.success('Localized component instance created successfully');
  return result;
}

// Component registry for dynamic component loading
class ComponentRegistry {
  private components = new Map<string, any>();

  register(name: string, component: any): void {
    log.info(`Registering component: ${name}`);
    log.debug('Component type:', typeof component);
    this.components.set(name, component);
    log.success(`Component ${name} registered successfully`);
  }

  get(name: string): any | undefined {
    log.trace(`Getting component: ${name}`);
    const component = this.components.get(name);
    if (component) {
      log.debug(`Component ${name} retrieved successfully`);
    } else {
      log.warn(`Component ${name} not found`);
    }
    return component;
  }

  has(name: string): boolean {
    const exists = this.components.has(name);
    log.trace(`Checking if component ${name} exists: ${exists}`);
    return exists;
  }

  getAll(): Map<string, any> {
    log.debug(
      `Getting all registered components, total: ${this.components.size}`
    );
    return this.components;
  }
}

export const componentRegistry = new ComponentRegistry();

// Helper function to register components in bulk
export function registerComponents(components: Record<string, any>): void {
  const componentCount = Object.keys(components).length;
  log.info(`Starting bulk component registration, total: ${componentCount}`);

  Object.entries(components).forEach(([name, component]) => {
    componentRegistry.register(name, component);
  });

  log.success(
    `Bulk registration completed, successfully registered ${componentCount} components`
  );
}
