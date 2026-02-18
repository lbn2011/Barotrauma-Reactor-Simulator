// Responsive Design Utilities
// This file provides utilities for responsive design and media queries

import log from '../lib/utils/logger';

// Media Query Breakpoints
export const breakpoints = {
  xs: '0px',
  sm: '320px',
  md: '768px',
  lg: '1024px',
  xl: '1440px',
  '2xl': '1920px',
} as const;

// Media Query Functions
export function mediaQuery (minWidth: keyof typeof breakpoints): string {
  log.trace(`Generating media query: min-width ${breakpoints[minWidth]}`);
  return `@media (min-width: ${breakpoints[minWidth]})`;
}

export function mediaQueryMax (maxWidth: keyof typeof breakpoints): string {
  log.trace(`Generating media query: max-width ${breakpoints[maxWidth]}`);
  return `@media (max-width: ${breakpoints[maxWidth]})`;
}

export function mediaQueryRange (
  minWidth: keyof typeof breakpoints,
  maxWidth: keyof typeof breakpoints
): string {
  log.trace(`Generating media query range: ${breakpoints[minWidth]} - ${breakpoints[maxWidth]}`);
  return `@media (min-width: ${breakpoints[minWidth]}) and (max-width: ${breakpoints[maxWidth]})`;
}

// Device Detection
export function isMobile (): boolean {
  const result = window.innerWidth < 768;
  log.trace(`Device detection: mobile = ${result}`);
  return result;
}

export function isTablet (): boolean {
  const result = window.innerWidth >= 768 && window.innerWidth < 1024;
  log.trace(`Device detection: tablet = ${result}`);
  return result;
}

export function isDesktop (): boolean {
  const result = window.innerWidth >= 1024;
  log.trace(`Device detection: desktop = ${result}`);
  return result;
}

export function isLargeDesktop (): boolean {
  const result = window.innerWidth >= 1440;
  log.trace(`Device detection: large desktop = ${result}`);
  return result;
}

// Responsive Helpers
export function getResponsiveValue<T> (
  values: Partial<Record<keyof typeof breakpoints, T>>,
  defaultValue: T
): T {
  const width = window.innerWidth;
  log.trace(`Getting responsive value: screen width ${width}px`);

  if (width >= parseInt(breakpoints['2xl'])) {
    log.trace('Using 2xl breakpoint value');
    return (
      values['2xl'] ||
      values.xl ||
      values.lg ||
      values.md ||
      values.sm ||
      defaultValue
    );
  } else if (width >= parseInt(breakpoints.xl)) {
    log.trace('Using xl breakpoint value');
    return values.xl || values.lg || values.md || values.sm || defaultValue;
  } else if (width >= parseInt(breakpoints.lg)) {
    log.trace('Using lg breakpoint value');
    return values.lg || values.md || values.sm || defaultValue;
  } else if (width >= parseInt(breakpoints.md)) {
    log.trace('Using md breakpoint value');
    return values.md || values.sm || defaultValue;
  } else if (width >= parseInt(breakpoints.sm)) {
    log.trace('Using sm breakpoint value');
    return values.sm || defaultValue;
  } else {
    log.trace('Using default value');
    return defaultValue;
  }
}

// Responsive Class Generator
export function responsiveClass (
  baseClass: string,
  responsiveModifiers: Partial<Record<keyof typeof breakpoints, string>>
): string {
  log.trace(`Generating responsive class: ${baseClass}`);
  let classes = baseClass;

  Object.entries(responsiveModifiers).forEach(([breakpoint, modifier]) => {
    log.trace(`Adding ${breakpoint} breakpoint modifier: ${modifier}`);
    classes += ` ${breakpoint}:${baseClass}${modifier ? `-${modifier}` : ''}`;
  });

  return classes;
}

// Export breakpoints for use in CSS
export const breakpointValues = Object.values(breakpoints).map((bp) =>
  parseInt(bp)
);
