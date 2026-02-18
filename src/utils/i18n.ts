// i18n Utilities
// This file provides utilities for internationalization

import { getI18n } from '~/stores/i18n';
import log from '../lib/utils/logger';

// Get current language
export function getCurrentLanguage (): string {
  const i18n = getI18n();
  const language = i18n.language;
  log.trace(`Getting current language: ${language}`);
  return language;
}

// Get current text direction
export function getTextDirection (): 'ltr' | 'rtl' {
  const i18n = getI18n();
  const direction = i18n.direction;
  log.trace(`Getting text direction: ${direction}`);
  return direction;
}

// Check if current language is RTL
export function isRTL (): boolean {
  const result = getTextDirection() === 'rtl';
  log.trace(`Is RTL language: ${result}`);
  return result;
}

// Translate text
export function t (key: string, options?: any): string {
  const i18n = getI18n();
  const translation = i18n.t(key, options);
  log.trace(`Translating text: ${key} -> ${translation}`);
  return translation;
}

// Format number
export function formatNumber (
  value: number,
  options?: Intl.NumberFormatOptions
): string {
  const i18n = getI18n();
  const formatted = i18n.formatNumber(value, options);
  log.trace(`Formatting number: ${value} -> ${formatted}`);
  return formatted;
}

// Format date
export function formatDate (
  value: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const i18n = getI18n();
  const formatted = i18n.formatDate(value, options);
  log.trace(`Formatting date: ${value} -> ${formatted}`);
  return formatted;
}

// Format currency
export function formatCurrency (
  value: number,
  currency?: string,
  options?: Intl.NumberFormatOptions
): string {
  const i18n = getI18n();
  const formatted = i18n.formatCurrency(value, currency, options);
  log.trace(`Formatting currency: ${value} -> ${formatted}`);
  return formatted;
}

// Get language name in current language
export function getLanguageName (languageCode: string): string {
  log.trace(`Getting language name: ${languageCode}`);
  const languageNames: Record<string, string> = {
    'zh-CN': t('Chinese'),
    'en-US': t('English'),
  };
  const name = languageNames[languageCode] || languageCode;
  log.trace(`Language name: ${name}`);
  return name;
}
