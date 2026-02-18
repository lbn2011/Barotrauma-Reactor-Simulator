// Configuration Loader
// This utility loads and manages component configuration from external JSON files

import type { ComponentConfig } from '@/config/components';
import { defaultComponentConfig } from '@/config/components';
import log from '../lib/utils/logger';

/**
 * Load component configuration from JSON file
 * @param configPath - Path to configuration JSON file
 * @returns Component configuration object
 */
export async function loadComponentConfig(
  configPath?: string
): Promise<ComponentConfig> {
  log.info('Starting component configuration loading');
  try {
    if (configPath) {
      log.debug(`Loading config file: ${configPath}`);
      // In a browser environment, we would use fetch
      // For now, we'll use dynamic import for SSR compatibility
      const configModule = await import(configPath);
      const userConfig = configModule.default || configModule;
      log.success('Config file loaded successfully');
      const mergedConfig = mergeComponentConfig(
        defaultComponentConfig,
        userConfig
      );
      log.debug('Config merging completed');
      return mergedConfig;
    }
    log.info('No config path provided, using default config');
    return defaultComponentConfig;
  } catch (error) {
    log.error('Failed to load component config, using default config:', error);
    return defaultComponentConfig;
  }
}

/**
 * Merge user configuration with default configuration
 * @param defaultConfig - Default component configuration
 * @param userConfig - User-provided component configuration
 * @returns Merged component configuration
 */
export function mergeComponentConfig(
  defaultConfig: ComponentConfig,
  userConfig: Partial<ComponentConfig>
): ComponentConfig {
  log.trace('Starting config merging');
  const mergedConfig = {
    navigation: {
      ...defaultConfig.navigation,
      ...userConfig.navigation,
    },
    todayCard: {
      ...defaultConfig.todayCard,
      ...userConfig.todayCard,
    },
    hero: {
      ...defaultConfig.hero,
      ...userConfig.hero,
    },
    carousel: {
      ...defaultConfig.carousel,
      ...userConfig.carousel,
    },
    artwork: {
      ...defaultConfig.artwork,
      ...userConfig.artwork,
    },
    ambientBackgroundArtwork: {
      ...defaultConfig.ambientBackgroundArtwork,
      ...userConfig.ambientBackgroundArtwork,
    },
    global: {
      ...defaultConfig.global,
      ...userConfig.global,
    },
  };
  log.trace('Config merging completed');
  return mergedConfig;
}

/**
 * Create a configuration factory for components
 * @param baseConfig - Base component configuration
 * @returns Configuration factory function
 */
export function createConfigFactory(baseConfig: ComponentConfig) {
  log.info('Creating config factory');
  return {
    /**
     * Get configuration for a specific component
     * @param componentName - Name of the component
     * @returns Component-specific configuration
     */
    getConfig: <T extends keyof ComponentConfig>(
      componentName: T
    ): ComponentConfig[T] => {
      log.trace(`Getting component config: ${componentName}`);
      return baseConfig[componentName] as ComponentConfig[T];
    },

    /**
     * Update configuration for a specific component
     * @param componentName - Name of the component
     * @param config - New configuration for the component
     * @returns Updated base configuration
     */
    updateConfig: <T extends keyof ComponentConfig>(
      componentName: T,
      config: Partial<ComponentConfig[T]>
    ): ComponentConfig => {
      log.debug(`Updating component config: ${componentName}`);
      const updatedConfig = {
        ...baseConfig,
        [componentName]: {
          ...baseConfig[componentName],
          ...config,
        },
      };
      log.trace('Component config update completed');
      return updatedConfig;
    },
  };
}

/**
 * Load configuration synchronously (for SSR)
 * @param config - Optional configuration object
 * @returns Component configuration
 */
export function loadConfigSync(
  config?: Partial<ComponentConfig>
): ComponentConfig {
  log.info('Loading config synchronously (SSR)');
  if (config) {
    log.debug('Using provided config object');
    return mergeComponentConfig(defaultComponentConfig, config);
  }
  log.info('No config provided, using default config');
  return defaultComponentConfig;
}
