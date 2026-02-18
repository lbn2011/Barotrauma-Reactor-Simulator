// App Store API models
import log from '../lib/utils/logger';

// Type definition module initialization logs
log.info('Type definition module loading');
log.debug('Registering App Store API model types');

export interface TodayCard {
  heading?: string;
  title?: string;
  inlineDescription?: string;
  titleArtwork?: Artwork;
  overlay?: TodayCardOverlay;
  media?: TodayCardMedia;
  editorialDisplayOptions?: EditorialDisplayOptions;
  style?: 'light' | 'dark' | 'white';
  clickAction?: Action;
}

export interface TodayCardOverlay {
  title: string;
  action: Action;
}

export interface TodayCardMedia {
  kind: 'image' | 'video' | 'appEvent' | 'list';
  url?: string;
  template?: string;
  width?: number;
  height?: number;
  backgroundColor?: Color;
}

export interface EditorialDisplayOptions {
  useTextProtectionColor?: boolean;
  useMaterialBlur?: boolean;
}

export interface Action {
  title: string;
  artwork?: Artwork;
  destination?: Destination;
}

export interface Destination {
  id?: string;
  url?: string;
  type?: 'search' | 'app' | 'article';
}

export interface Artwork {
  template?: string;
  url?: string;
  width?: number;
  height?: number;
  backgroundColor?: Color;
  type?: 'system';
}

export interface Color {
  r?: number;
  g?: number;
  b?: number;
  hex?: string;
}

export interface WebNavigation {
  tabs: WebNavigationLink[];
  platforms: WebNavigationLink[];
  searchAction: WebSearchFlowAction;
}

export interface WebNavigationLink {
  action: Action;
  isActive?: boolean;
}

export interface WebSearchFlowAction {
  // Search action properties
}

// Page models
export interface Page {
  type: string;
  title?: string;
  visionProUrl?: string;
  errorMessage?: string;
}

// Item model
export interface Item {
  artwork?: Artwork;
}

/**
 * Type checking helper functions
 */

/**
 * Validate TodayCard type
 */
export function validateTodayCard (card: any): card is TodayCard {
  log.trace('Validating TodayCard type');
  log.debug('Input object:', card);

  if (!card || typeof card !== 'object') {
    log.warn('TodayCard validation failed: not an object');
    return false;
  }

  if (card.overlay && (!card.overlay.title || !card.overlay.action)) {
    log.warn('TodayCard validation failed: overlay missing required properties');
    return false;
  }

  log.debug('TodayCard validation passed');
  return true;
}

/**
 * Validate Artwork type
 */
export function validateArtwork (artwork: any): artwork is Artwork {
  log.trace('Validating Artwork type');
  log.debug('Input object:', artwork);

  if (!artwork || typeof artwork !== 'object') {
    log.warn('Artwork validation failed: not an object');
    return false;
  }

  log.debug('Artwork validation passed');
  return true;
}

/**
 * Validate Color type
 */
export function validateColor (color: any): color is Color {
  log.trace('Validating Color type');
  log.debug('Input object:', color);

  if (!color || typeof color !== 'object') {
    log.warn('Color validation failed: not an object');
    return false;
  }

  if ((color.r || color.g || color.b) && (!color.r || !color.g || !color.b)) {
    log.warn('Color validation failed: incomplete RGB values');
    return false;
  }

  log.debug('Color validation passed');
  return true;
}

// Type module loading completion log
log.success('Type definition module loaded successfully, containing 15 interfaces and 3 validation functions');
