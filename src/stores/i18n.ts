import { writable } from 'svelte/store';

// 定义翻译类型
export interface Translations {
  [key: string]: string;
}

// 定义本地化选项类型
export interface LocalizationOptions {
  locale: string;
  direction: 'ltr' | 'rtl';
  translations: Translations;
}

// 定义i18n存储类型
export interface I18nStore {
  language: string;
  direction: 'ltr' | 'rtl';
  t: (key: string, options?: any) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (value: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (value: number, currency?: string, options?: Intl.NumberFormatOptions) => string;
}

// 默认翻译
const defaultTranslations: Translations = {
  'ASE.Web.AppStore.Navigation.AX.AppStoreLogo': 'App Store Logo',
  'ASE.Web.AppStore.Navigation.PlatformHeading': 'Platforms',
  'Loading': 'Loading...',
  'Error': 'Error',
  'Overview': 'Overview',
  'SaveEditor': 'Save Editor',
  'Language': 'Language',
  'English': 'English',
  'Chinese': '中文',
  'This is the overview page for the reactor simulator.': 'This is the overview page for the reactor simulator.',
};

// 中文翻译
const zhCNTranslations: Translations = {
  ...defaultTranslations,
  'ASE.Web.AppStore.Navigation.AX.AppStoreLogo': 'App Store 标志',
  'ASE.Web.AppStore.Navigation.PlatformHeading': '平台',
  'Loading': '加载中...',
  'Error': '错误',
  'Overview': '概述',
  'SaveEditor': '存档编辑器',
  'Language': '语言',
  'English': '英语',
  'Chinese': '中文',
  'Spanish': '西班牙语',
  'French': '法语',
  'Arabic': '阿拉伯语',
  'This is the overview page for the reactor simulator.': '这是反应堆模拟器的概述页面。',
};

// 英语翻译
const enUSTranslations: Translations = {
  ...defaultTranslations,
  'Spanish': 'Spanish',
  'French': 'French',
  'Arabic': 'Arabic',
};

// 西班牙语翻译
const esESTranslations: Translations = {
  ...defaultTranslations,
  'ASE.Web.AppStore.Navigation.AX.AppStoreLogo': 'Logotipo de App Store',
  'ASE.Web.AppStore.Navigation.PlatformHeading': 'Plataformas',
  'Loading': 'Cargando...',
  'Error': 'Error',
  'Overview': 'Descripción general',
  'SaveEditor': 'Editor de guardado',
  'Language': 'Idioma',
  'English': 'Inglés',
  'Chinese': 'Chino',
  'Spanish': 'Español',
  'French': 'Francés',
  'Arabic': 'Árabe',
};

// 法语翻译
const frFRTranslations: Translations = {
  ...defaultTranslations,
  'ASE.Web.AppStore.Navigation.AX.AppStoreLogo': 'Logo de l’App Store',
  'ASE.Web.AppStore.Navigation.PlatformHeading': 'Plateformes',
  'Loading': 'Chargement...',
  'Error': 'Erreur',
  'Overview': 'Aperçu',
  'SaveEditor': 'Éditeur de sauvegarde',
  'Language': 'Langue',
  'English': 'Anglais',
  'Chinese': 'Chinois',
  'Spanish': 'Espagnol',
  'French': 'Français',
  'Arabic': 'Arabe',
};

// 阿拉伯语翻译
const arSATranslations: Translations = {
  ...defaultTranslations,
  'ASE.Web.AppStore.Navigation.AX.AppStoreLogo': 'شعار متجر التطبيقات',
  'ASE.Web.AppStore.Navigation.PlatformHeading': 'المنصات',
  'Loading': 'جار التحميل...',
  'Error': 'خطأ',
  'Overview': 'نظرة عامة',
  'SaveEditor': 'محرر الحفظ',
  'Language': 'لغة',
  'English': 'الإنجليزية',
  'Chinese': 'الصينية',
  'Spanish': 'الإسبانية',
  'French': 'الفرنسية',
  'Arabic': 'العربية',
};

// 所有翻译
const translations: Record<string, Translations> = {
  'zh-CN': zhCNTranslations,
  'en-US': enUSTranslations,
  'es-ES': esESTranslations,
  'fr-FR': frFRTranslations,
  'ar-SA': arSATranslations,
};

// 语言方向
const languageDirections: Record<string, 'ltr' | 'rtl'> = {
  'zh-CN': 'ltr',
  'en-US': 'ltr',
  'es-ES': 'ltr',
  'fr-FR': 'ltr',
  'ar-SA': 'rtl',
};

// 创建i18n存储
function createI18nStore() {
  const { subscribe, set, update } = writable<I18nStore>({
    language: 'zh-CN',
    direction: 'ltr',
    t: (key: string) => key,
    formatNumber: (value: number) => value.toString(),
    formatDate: (value: Date | string) => new Date(value).toLocaleString(),
    formatCurrency: (value: number) => value.toFixed(2),
  });

  // 更新存储
  function updateStore(language: string) {
    const direction = languageDirections[language] || 'ltr';
    const langTranslations = translations[language] || defaultTranslations;

    set({
      language,
      direction,
      t: (key: string, options?: any) => {
        const translation = langTranslations[key] || key;
        if (options) {
          return Object.entries(options).reduce((result, [placeholder, value]) => {
            return result.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(value));
          }, translation);
        }
        return translation;
      },
      formatNumber: (value: number, options?: Intl.NumberFormatOptions) => {
        return new Intl.NumberFormat(language, options).format(value);
      },
      formatDate: (value: Date | string, options?: Intl.DateTimeFormatOptions) => {
        return new Intl.DateTimeFormat(language, options).format(new Date(value));
      },
      formatCurrency: (value: number, currency: string = 'USD', options?: Intl.NumberFormatOptions) => {
        return new Intl.NumberFormat(language, {
          style: 'currency',
          currency,
          ...options,
        }).format(value);
      },
    });
  }

  // 初始更新
  updateStore('zh-CN');

  return {
    subscribe,
    setLanguage: (language: string) => {
      updateStore(language);
    },
  };
}

// 导出i18n存储
const i18nStore = createI18nStore();
export default i18nStore;

// 导出getI18n函数，保持向后兼容
export function getI18n() {
  let storeValue: I18nStore | undefined;
  i18nStore.subscribe(value => storeValue = value)();
  return storeValue!;
}

// 导出setLanguage函数
export function setLanguage(language: string) {
  i18nStore.setLanguage(language);
}

