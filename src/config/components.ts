// Component Configuration
// This file defines configuration options for all shared components

export interface ComponentConfig {
  // Navigation Component Config
  navigation: {
    showLanguageSelector: boolean;
    showSearch: boolean;
    collapsedByDefault: boolean;
  };

  // TodayCard Component Config
  todayCard: {
    defaultStyle: 'light' | 'dark' | 'white';
    enableTextProtection: boolean;
    enableGradientEffects: boolean;
  };

  // Hero Component Config
  hero: {
    enableVideoAutoplay: boolean;
    defaultProfile: string;
    enableCollectionIcons: boolean;
  };

  // Carousel Component Config
  carousel: {
    enableBackgroundArtwork: boolean;
    enableSwipeNavigation: boolean;
    defaultActiveIndex: number;
  };

  // Artwork Component Config
  artwork: {
    defaultQuality: number;
    enableLazyLoading: boolean;
    defaultProfile: string;
  };

  // AmbientBackgroundArtwork Config
  ambientBackgroundArtwork: {
    enableAnimation: boolean;
    enableIntersectionObserver: boolean;
    defaultAspectRatio: string;
  };

  // Global Config
  global: {
    enableResponsiveDesign: boolean;
    enableReducedMotion: boolean;
    defaultLanguage: string;
    supportedLanguages: string[];
  };
}

// Default Component Configuration
export const defaultComponentConfig: ComponentConfig = {
  navigation: {
    showLanguageSelector: true,
    showSearch: true,
    collapsedByDefault: false,
  },
  todayCard: {
    defaultStyle: 'light',
    enableTextProtection: true,
    enableGradientEffects: true,
  },
  hero: {
    enableVideoAutoplay: true,
    defaultProfile: 'large-hero',
    enableCollectionIcons: true,
  },
  carousel: {
    enableBackgroundArtwork: true,
    enableSwipeNavigation: true,
    defaultActiveIndex: 0,
  },
  artwork: {
    defaultQuality: 85,
    enableLazyLoading: true,
    defaultProfile: 'large',
  },
  ambientBackgroundArtwork: {
    enableAnimation: true,
    enableIntersectionObserver: true,
    defaultAspectRatio: '16/9',
  },
  global: {
    enableResponsiveDesign: true,
    enableReducedMotion: true,
    defaultLanguage: 'zh-CN',
    supportedLanguages: ['zh-CN', 'en-US'],
  },
};

// Get Component Config with defaults
export function getComponentConfig (
  config?: Partial<ComponentConfig>
): ComponentConfig {
  return {
    navigation: {
      ...defaultComponentConfig.navigation,
      ...config?.navigation,
      showLanguageSelector:
        config?.navigation?.showLanguageSelector ??
        defaultComponentConfig.navigation.showLanguageSelector,
      showSearch:
        config?.navigation?.showSearch ??
        defaultComponentConfig.navigation.showSearch,
      collapsedByDefault:
        config?.navigation?.collapsedByDefault ??
        defaultComponentConfig.navigation.collapsedByDefault,
    },
    todayCard: {
      ...defaultComponentConfig.todayCard,
      ...config?.todayCard,
      defaultStyle:
        config?.todayCard?.defaultStyle ??
        defaultComponentConfig.todayCard.defaultStyle,
      enableTextProtection:
        config?.todayCard?.enableTextProtection ??
        defaultComponentConfig.todayCard.enableTextProtection,
      enableGradientEffects:
        config?.todayCard?.enableGradientEffects ??
        defaultComponentConfig.todayCard.enableGradientEffects,
    },
    hero: {
      ...defaultComponentConfig.hero,
      ...config?.hero,
      enableVideoAutoplay:
        config?.hero?.enableVideoAutoplay ??
        defaultComponentConfig.hero.enableVideoAutoplay,
      defaultProfile:
        config?.hero?.defaultProfile ??
        defaultComponentConfig.hero.defaultProfile,
      enableCollectionIcons:
        config?.hero?.enableCollectionIcons ??
        defaultComponentConfig.hero.enableCollectionIcons,
    },
    carousel: {
      ...defaultComponentConfig.carousel,
      ...config?.carousel,
      enableBackgroundArtwork:
        config?.carousel?.enableBackgroundArtwork ??
        defaultComponentConfig.carousel.enableBackgroundArtwork,
      enableSwipeNavigation:
        config?.carousel?.enableSwipeNavigation ??
        defaultComponentConfig.carousel.enableSwipeNavigation,
      defaultActiveIndex:
        config?.carousel?.defaultActiveIndex ??
        defaultComponentConfig.carousel.defaultActiveIndex,
    },
    artwork: {
      ...defaultComponentConfig.artwork,
      ...config?.artwork,
      defaultQuality:
        config?.artwork?.defaultQuality ??
        defaultComponentConfig.artwork.defaultQuality,
      enableLazyLoading:
        config?.artwork?.enableLazyLoading ??
        defaultComponentConfig.artwork.enableLazyLoading,
      defaultProfile:
        config?.artwork?.defaultProfile ??
        defaultComponentConfig.artwork.defaultProfile,
    },
    ambientBackgroundArtwork: {
      ...defaultComponentConfig.ambientBackgroundArtwork,
      ...config?.ambientBackgroundArtwork,
      enableAnimation:
        config?.ambientBackgroundArtwork?.enableAnimation ??
        defaultComponentConfig.ambientBackgroundArtwork.enableAnimation,
      enableIntersectionObserver:
        config?.ambientBackgroundArtwork?.enableIntersectionObserver ??
        defaultComponentConfig.ambientBackgroundArtwork
          .enableIntersectionObserver,
      defaultAspectRatio:
        config?.ambientBackgroundArtwork?.defaultAspectRatio ??
        defaultComponentConfig.ambientBackgroundArtwork.defaultAspectRatio,
    },
    global: {
      ...defaultComponentConfig.global,
      ...config?.global,
      enableResponsiveDesign:
        config?.global?.enableResponsiveDesign ??
        defaultComponentConfig.global.enableResponsiveDesign,
      enableReducedMotion:
        config?.global?.enableReducedMotion ??
        defaultComponentConfig.global.enableReducedMotion,
      defaultLanguage:
        config?.global?.defaultLanguage ??
        defaultComponentConfig.global.defaultLanguage,
      supportedLanguages:
        config?.global?.supportedLanguages ??
        defaultComponentConfig.global.supportedLanguages,
    },
  };
}
