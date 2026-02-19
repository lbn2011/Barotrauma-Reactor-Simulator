import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn (...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type WithElementRef<T = globalThis.HTMLDivElement> = {
  elementRef?: (node: T) => void;
};

export type WithoutChildrenOrChild = {
  children?: never;
  child?: never;
};
