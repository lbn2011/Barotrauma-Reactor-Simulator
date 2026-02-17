// i18n Utilities
// This file provides utilities for internationalization

import i18nStore, { getI18n } from '~/stores/i18n';

// Get current language
export function getCurrentLanguage(): string {
  const i18n = getI18n();
  return i18n.language;
}

// Get current text direction
export function getTextDirection(): 'ltr' | 'rtl' {
  const i18n = getI18n();
  return i18n.direction;
}

// Check if current language is RTL
export function isRTL(): boolean {
  return getTextDirection() === 'rtl';
}

// Translate text
export function t(key: string, options?: any): string {
  const i18n = getI18n();
  return i18n.t(key, options);
}

// Format number
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  const i18n = getI18n();
  return i18n.formatNumber(value, options);
}

// Format date
export function formatDate(value: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const i18n = getI18n();
  return i18n.formatDate(value, options);
}

// Format currency
export function formatCurrency(value: number, currency?: string, options?: Intl.NumberFormatOptions): string {
  const i18n = getI18n();
  return i18n.formatCurrency(value, currency, options);
}

// Get language name in current language
export function getLanguageName(languageCode: string): string {
  const languageNames: Record<string, string> = {
    'zh-CN': t('Chinese'),
    'en-US': t('English'),
  };
  return languageNames[languageCode] || languageCode;
}
