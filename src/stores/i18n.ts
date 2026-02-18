import { writable } from 'svelte/store';
import log from '../lib/utils/logger';

// Define translation type
export interface Translations {
  [key: string]: string;
}

// Define localization options type
export interface LocalizationOptions {
  locale: string;
  direction: 'ltr' | 'rtl';
  translations: Translations;
}

// Define i18n store type
export interface I18nStore {
  language: string;
  direction: 'ltr' | 'rtl';
  t: (key: string, options?: any) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (
    value: Date | string,
    options?: Intl.DateTimeFormatOptions
  ) => string;
  formatCurrency: (
    value: number,
    currency?: string,
    options?: Intl.NumberFormatOptions
  ) => string;
}

// Default translations
const defaultTranslations: Translations = {
  'ASE.Web.AppStore.Navigation.AX.AppStoreLogo': 'App Store Logo',
  'ASE.Web.AppStore.Navigation.PlatformHeading': 'Platforms',
  Loading: 'Loading...',
  Error: 'Error',
  Overview: 'Overview',
  SaveEditor: 'Save Editor',
  Language: 'Language',
  English: 'English',
  Chinese: '中文',
  'This is the overview page for the reactor simulator.':
    'This is the overview page for the reactor simulator.',
};

// Chinese translations
const zhCNTranslations: Translations = {
  ...defaultTranslations,
  'ASE.Web.AppStore.Navigation.AX.AppStoreLogo': 'App Store 标志',
  'ASE.Web.AppStore.Navigation.PlatformHeading': '平台',
  Loading: '加载中...',
  Error: '错误',
  Overview: '概述',
  SaveEditor: '存档编辑器',
  Language: '语言',
  English: '英语',
  Chinese: '中文',
  Spanish: '西班牙语',
  French: '法语',
  Arabic: '阿拉伯语',
  'This is the overview page for the reactor simulator.':
    '这是反应堆模拟器的概述页面。',
};

// English translations
const enUSTranslations: Translations = {
  ...defaultTranslations,
  Spanish: 'Spanish',
  French: 'French',
  Arabic: 'Arabic',
};

// Spanish translations
const esESTranslations: Translations = {
  ...defaultTranslations,
  'ASE.Web.AppStore.Navigation.AX.AppStoreLogo': 'Logotipo de App Store',
  'ASE.Web.AppStore.Navigation.PlatformHeading': 'Plataformas',
  Loading: 'Cargando...',
  Error: 'Error',
  Overview: 'Descripción general',
  SaveEditor: 'Editor de guardado',
  Language: 'Idioma',
  English: 'Inglés',
  Chinese: 'Chino',
  Spanish: 'Español',
  French: 'Francés',
  Arabic: 'Árabe',
};

// French translations
const frFRTranslations: Translations = {
  ...defaultTranslations,
  'ASE.Web.AppStore.Navigation.AX.AppStoreLogo': 'Logo de l’App Store',
  'ASE.Web.AppStore.Navigation.PlatformHeading': 'Plateformes',
  Loading: 'Chargement...',
  Error: 'Erreur',
  Overview: 'Aperçu',
  SaveEditor: 'Éditeur de sauvegarde',
  Language: 'Langue',
  English: 'Anglais',
  Chinese: 'Chinois',
  Spanish: 'Espagnol',
  French: 'Français',
  Arabic: 'Arabe',
};

// Arabic translations
const arSATranslations: Translations = {
  ...defaultTranslations,
  'ASE.Web.AppStore.Navigation.AX.AppStoreLogo': 'شعار متجر التطبيقات',
  'ASE.Web.AppStore.Navigation.PlatformHeading': 'المنصات',
  Loading: 'جار التحميل...',
  Error: 'خطأ',
  Overview: 'نظرة عامة',
  SaveEditor: 'محرر الحفظ',
  Language: 'لغة',
  English: 'الإنجليزية',
  Chinese: 'الصينية',
  Spanish: 'الإسبانية',
  French: 'الفرنسية',
  Arabic: 'العربية',
};

// All translations
const translations: Record<string, Translations> = {
  'zh-CN': zhCNTranslations,
  'en-US': enUSTranslations,
  'es-ES': esESTranslations,
  'fr-FR': frFRTranslations,
  'ar-SA': arSATranslations,
};

// Language directions
const languageDirections: Record<string, 'ltr' | 'rtl'> = {
  'zh-CN': 'ltr',
  'en-US': 'ltr',
  'es-ES': 'ltr',
  'fr-FR': 'ltr',
  'ar-SA': 'rtl',
};

// Create i18n store
function createI18nStore () {
  log.info('Starting to create internationalization store');
  const { subscribe, set } = writable<I18nStore>({
    language: 'zh-CN',
    direction: 'ltr',
    t: (key: string) => key,
    formatNumber: (value: number) => value.toString(),
    formatDate: (value: Date | string) => new Date(value).toLocaleString(),
    formatCurrency: (value: number) => value.toFixed(2),
  });

  // Update store
  function updateStore (language: string) {
    log.info(
      `Starting to update internationalization store, language: ${language}`
    );
    const direction = languageDirections[language] || 'ltr';
    const langTranslations = translations[language] || defaultTranslations;
    log.debug('Language direction and translations loaded', {
      language,
      direction,
      hasTranslations: !!translations[language],
    });

    set({
      language,
      direction,
      t: (key: string, options?: any) => {
        log.trace('Executing translation', { key, options });
        const translation = langTranslations[key] || key;
        if (options) {
          const result = Object.entries(options).reduce(
            (result, [placeholder, value]) => {
              return result.replace(
                new RegExp(`{${placeholder}}`, 'g'),
                String(value)
              );
            },
            translation
          );
          log.trace('Translation with parameters completed', { key, result });
          return result;
        }
        log.trace('Translation completed', { key, translation });
        return translation;
      },
      formatNumber: (value: number, options?: Intl.NumberFormatOptions) => {
        log.trace('Executing number formatting', { value, options });
        const result = new Intl.NumberFormat(language, options).format(value);
        log.trace('Number formatting completed', { value, result });
        return result;
      },
      formatDate: (
        value: Date | string,
        options?: Intl.DateTimeFormatOptions
      ) => {
        log.trace('Executing date formatting', { value, options });
        const result = new Intl.DateTimeFormat(language, options).format(
          new Date(value)
        );
        log.trace('Date formatting completed', { value, result });
        return result;
      },
      formatCurrency: (
        value: number,
        currency: string = 'USD',
        options?: Intl.NumberFormatOptions
      ) => {
        log.trace('Executing currency formatting', {
          value,
          currency,
          options,
        });
        const result = new Intl.NumberFormat(language, {
          style: 'currency',
          currency,
          ...options,
        }).format(value);
        log.trace('Currency formatting completed', { value, currency, result });
        return result;
      },
    });
    log.success('Internationalization store updated successfully', {
      language,
      direction,
    });
  }

  // Initial update
  log.debug('Executing initial language setup');
  updateStore('zh-CN');

  return {
    subscribe,
    setLanguage: (language: string) => {
      updateStore(language);
    },
  };
}

// Export i18n store
const i18nStore = createI18nStore();
export default i18nStore;

// Export getI18n function for backward compatibility
export function getI18n () {
  log.trace('Getting internationalization store instance');
  let storeValue: I18nStore | undefined;
  i18nStore.subscribe((value) => (storeValue = value))();
  log.debug('Internationalization store value:', storeValue);
  return storeValue!;
}

// Export setLanguage function
export function setLanguage (language: string) {
  log.info(`Setting language: ${language}`);
  i18nStore.setLanguage(language);
}

// Internationalization module loaded log
log.success(
  'Internationalization store module loaded successfully, supporting 5 languages'
);
