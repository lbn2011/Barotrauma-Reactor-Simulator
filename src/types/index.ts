// App Store API models
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
