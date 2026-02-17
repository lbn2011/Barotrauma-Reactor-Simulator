// Responsive Design Utilities
// This file provides utilities for responsive design and media queries

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
  return `@media (min-width: ${breakpoints[minWidth]})`;
}

export function mediaQueryMax (maxWidth: keyof typeof breakpoints): string {
  return `@media (max-width: ${breakpoints[maxWidth]})`;
}

export function mediaQueryRange (
  minWidth: keyof typeof breakpoints,
  maxWidth: keyof typeof breakpoints
): string {
  return `@media (min-width: ${breakpoints[minWidth]}) and (max-width: ${breakpoints[maxWidth]})`;
}

// Device Detection
export function isMobile (): boolean {
  return window.innerWidth < 768;
}

export function isTablet (): boolean {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

export function isDesktop (): boolean {
  return window.innerWidth >= 1024;
}

export function isLargeDesktop (): boolean {
  return window.innerWidth >= 1440;
}

// Responsive Helpers
export function getResponsiveValue<T> (
  values: Partial<Record<keyof typeof breakpoints, T>>,
  defaultValue: T
): T {
  const width = window.innerWidth;

  if (width >= parseInt(breakpoints['2xl'])) {
    return (
      values['2xl'] ||
      values.xl ||
      values.lg ||
      values.md ||
      values.sm ||
      defaultValue
    );
  } else if (width >= parseInt(breakpoints.xl)) {
    return values.xl || values.lg || values.md || values.sm || defaultValue;
  } else if (width >= parseInt(breakpoints.lg)) {
    return values.lg || values.md || values.sm || defaultValue;
  } else if (width >= parseInt(breakpoints.md)) {
    return values.md || values.sm || defaultValue;
  } else if (width >= parseInt(breakpoints.sm)) {
    return values.sm || defaultValue;
  } else {
    return defaultValue;
  }
}

// Responsive Class Generator
export function responsiveClass (
  baseClass: string,
  responsiveModifiers: Partial<Record<keyof typeof breakpoints, string>>
): string {
  let classes = baseClass;

  Object.entries(responsiveModifiers).forEach(([breakpoint, modifier]) => {
    classes += ` ${breakpoint}:${baseClass}${modifier ? `-${modifier}` : ''}`;
  });

  return classes;
}

// Export breakpoints for use in CSS
export const breakpointValues = Object.values(breakpoints).map((bp) =>
  parseInt(bp)
);
