// Configuration Loader
// This utility loads and manages component configuration from external JSON files

import type { ComponentConfig } from '@/config/components';
import { defaultComponentConfig } from '@/config/components';

/**
 * Load component configuration from JSON file
 * @param configPath - Path to configuration JSON file
 * @returns Component configuration object
 */
export async function loadComponentConfig(configPath?: string): Promise<ComponentConfig> {
  try {
    if (configPath) {
      // In a browser environment, we would use fetch
      // For now, we'll use dynamic import for SSR compatibility
      const configModule = await import(configPath);
      const userConfig = configModule.default || configModule;
      return mergeComponentConfig(defaultComponentConfig, userConfig);
    }
    return defaultComponentConfig;
  } catch (error) {
    console.warn('Failed to load component configuration, using defaults:', error);
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
  return {
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
}

/**
 * Create a configuration factory for components
 * @param baseConfig - Base component configuration
 * @returns Configuration factory function
 */
export function createConfigFactory(baseConfig: ComponentConfig) {
  return {
    /**
     * Get configuration for a specific component
     * @param componentName - Name of the component
     * @returns Component-specific configuration
     */
    getConfig: <T extends keyof ComponentConfig>(componentName: T): ComponentConfig[T] => {
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
      return {
        ...baseConfig,
        [componentName]: {
          ...baseConfig[componentName],
          ...config,
        },
      };
    },
  };
}

/**
 * Load configuration synchronously (for SSR)
 * @param config - Optional configuration object
 * @returns Component configuration
 */
export function loadConfigSync(config?: Partial<ComponentConfig>): ComponentConfig {
  if (config) {
    return mergeComponentConfig(defaultComponentConfig, config);
  }
  return defaultComponentConfig;
}
