/**
 * Utility functions library
 * Contains CSS class name merging and TypeScript type utilities
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { logger } from './utils/logger';

/**
 * Merge CSS class names
 * Combines the functionality of clsx and tailwind-merge to handle conditional class names and Tailwind class name conflicts
 *
 * @param inputs Class name inputs
 * @returns Merged class name string
 *
 * @example
 * cn('class1', { 'class2': true }, ['class3'])
 */
export function cn (...inputs: ClassValue[]) {
  const mergedClasses = twMerge(clsx(inputs));
  logger.debug('Utils', `Merged classes: ${mergedClasses}`);
  return mergedClasses;
}

/**
 * Remove child property from type
 * @template T Original type
 */

export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;

/**
 * Remove children property from type
 * @template T Original type
 */

export type WithoutChildren<T> = T extends { children?: any }
  ? Omit<T, 'children'>
  : T;

/**
 * Remove child and children properties from type
 * @template T Original type
 */
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;

/**
 * Add element reference property to type
 * @template T Original type
 * @template U Element type, defaults to HTMLElement
 */
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
  ref?: U | null;
};
