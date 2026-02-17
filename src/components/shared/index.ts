// Shared Components Index
// This file serves as the entry point for all shared components

// Layout Components
export { default as Navigation } from '../Navigation.svelte';
export { default as Page } from '../Page.svelte';
export { default as PageResolver } from '../PageResolver.svelte';

// UI Components
export { default as TodayCard } from '../jet/today-card/TodayCard.svelte';
export { default as GradientOverlay } from '../GradientOverlay.svelte';
export { default as AmbientBackgroundArtwork } from '../AmbientBackgroundArtwork.svelte';
export { default as Hero } from '../Hero.svelte';
export { default as Carousel } from '../Carousel.svelte';
export { default as Artwork } from '../Artwork.svelte';
export { default as Video } from '../Video.svelte';
export { default as LazyComponent } from './LazyComponent.svelte';
export { default as VirtualList } from './VirtualList.svelte';
export { default as ResponsiveContainer } from './ResponsiveContainer.svelte';

// Utils
export * from '../../utils/color';
export * from '../../utils/media-queries';
export * from '../../utils/responsive';
export * from '../../utils/performance';
export * from '../../utils/i18n';
export * from '../../utils/component-factory';

// Config
export * from '../../config/components';
export * from '../../config/design';

// Stores
export * from '../../stores/prefers-reduced-motion';
export * from '../../stores/i18n';
export * from '../../stores';
