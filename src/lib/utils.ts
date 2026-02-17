/**
 * 工具函数库
 * 包含CSS类名合并和TypeScript类型工具
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并CSS类名
 * 结合clsx和tailwind-merge的功能，处理条件类名和Tailwind类名冲突
 *
 * @param inputs 类名输入
 * @returns 合并后的类名字符串
 *
 * @example
 * cn('class1', { 'class2': true }, ['class3'])
 */
export function cn (...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 移除类型中的child属性
 * @template T 原始类型
 */

export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;

/**
 * 移除类型中的children属性
 * @template T 原始类型
 */

export type WithoutChildren<T> = T extends { children?: any }
  ? Omit<T, 'children'>
  : T;

/**
 * 移除类型中的child和children属性
 * @template T 原始类型
 */
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;

/**
 * 为类型添加元素引用属性
 * @template T 原始类型
 * @template U 元素类型，默认为HTMLElement
 */
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
  ref?: U | null;
};
