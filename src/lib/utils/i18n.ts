import log from './logger';

// 定义翻译资源类型
export interface TranslationResources {
  [locale: string]: {
    [namespace: string]: {
      [key: string]: string;
    };
  };
}

// 定义翻译选项类型
export interface TranslateOptions {
  interpolate?: Record<string, string | number>;
}

// 国际化管理器类
export class I18nManager {
  // 当前语言
  private currentLocale: string = 'zh-CN';

  // 默认语言
  private defaultLocale: string = 'zh-CN';

  // 支持的语言
  private supportedLocales: string[] = ['zh-CN', 'en-US'];

  // 翻译资源
  private resources: TranslationResources = {
    'zh-CN': {
      common: {
        appTitle: '潜水艇反应堆模拟器',
        start: '开始',
        stop: '停止',
        reset: '重置',
        save: '保存',
        load: '加载',
        export: '导出',
        import: '导入',
        language: '语言',
        settings: '设置',
        help: '帮助',
        about: '关于',
        exit: '退出',
        confirm: '确认',
        cancel: '取消',
        delete: '删除',
        edit: '编辑',
        add: '添加',
        remove: '移除',
        success: '成功',
        error: '错误',
        warning: '警告',
        info: '信息',
      },
      reactor: {
        coreStatus: '堆芯状态',
        power: '功率',
        temperature: '温度',
        pressure: '压力',
        flowRate: '流量',
        controlRods: '控制棒',
        coolingSystem: '冷却系统',
        steamSystem: '蒸汽系统',
        fuelStatus: '燃料状态',
        neutronFlux: '中子通量',
        reactivity: '反应性',
        thermalPower: '热功率',
        electricalPower: '电功率',
        efficiency: '效率',
        fuelTemperature: '燃料温度',
        coolantTemperature: '冷却剂温度',
        moderatorTemperature: '慢化剂温度',
        primaryPressure: '一回路压力',
        secondaryPressure: '二回路压力',
        coolantFlowRate: '冷却剂流量',
        steamFlowRate: '蒸汽流量',
        controlRodPosition: '控制棒位置',
        emergencyCooling: '应急冷却',
        overallStatus: '整体状态',
        safetyMargins: '安全裕度',
        DNBR: '偏离泡核沸腾比',
        fuelTemperatureMargin: '燃料温度裕度',
        pressureMargin: '压力裕度',
      },
      fault: {
        faultSimulation: '故障模拟',
        activeFaults: '活跃故障',
        faultProbability: '故障概率',
        systemImpact: '系统影响',
        coolingSystemFailure: '冷却系统故障',
        controlRodMalfunction: '控制棒故障',
        steamGeneratorLeak: '蒸汽发生器泄漏',
        pumpFailure: '泵故障',
        valveStuck: '阀门卡住',
        critical: '严重',
        high: '高',
        medium: '中',
        low: '低',
      },
      ui: {
        panelTitle: '面板标题',
        panelDescription: '面板描述',
        detailedOperation: '详细操作',
        systemStatus: '系统状态',
        dataTrend: '数据趋势',
        parameters: '参数',
        results: '结果',
        calculation: '计算',
        visualization: '可视化',
        configuration: '配置',
        monitoring: '监控',
        analysis: '分析',
        simulation: '模拟',
        training: '培训',
        research: '研究',
      },
      error: {
        loadFailed: '加载失败',
        saveFailed: '保存失败',
        exportFailed: '导出失败',
        importFailed: '导入失败',
        calculationFailed: '计算失败',
        connectionError: '连接错误',
        validationError: '验证错误',
        unknownError: '未知错误',
      },
      info: {
        welcome: '欢迎使用潜水艇反应堆模拟器',
        guide: '操作指南',
        feedback: '反馈建议',
        projectInfo: '项目信息',
        version: '版本',
        copyright: '版权所有',
        license: '许可证',
        contributors: '贡献者',
        acknowledgements: '致谢',
      },
    },
    'en-US': {
      common: {
        appTitle: 'Barotrauma Reactor Simulator',
        start: 'Start',
        stop: 'Stop',
        reset: 'Reset',
        save: 'Save',
        load: 'Load',
        export: 'Export',
        import: 'Import',
        language: 'Language',
        settings: 'Settings',
        help: 'Help',
        about: 'About',
        exit: 'Exit',
        confirm: 'Confirm',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        remove: 'Remove',
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info',
      },
      reactor: {
        coreStatus: 'Core Status',
        power: 'Power',
        temperature: 'Temperature',
        pressure: 'Pressure',
        flowRate: 'Flow Rate',
        controlRods: 'Control Rods',
        coolingSystem: 'Cooling System',
        steamSystem: 'Steam System',
        fuelStatus: 'Fuel Status',
        neutronFlux: 'Neutron Flux',
        reactivity: 'Reactivity',
        thermalPower: 'Thermal Power',
        electricalPower: 'Electrical Power',
        efficiency: 'Efficiency',
        fuelTemperature: 'Fuel Temperature',
        coolantTemperature: 'Coolant Temperature',
        moderatorTemperature: 'Moderator Temperature',
        primaryPressure: 'Primary Pressure',
        secondaryPressure: 'Secondary Pressure',
        coolantFlowRate: 'Coolant Flow Rate',
        steamFlowRate: 'Steam Flow Rate',
        controlRodPosition: 'Control Rod Position',
        emergencyCooling: 'Emergency Cooling',
        overallStatus: 'Overall Status',
        safetyMargins: 'Safety Margins',
        DNBR: 'Departure from Nucleate Boiling Ratio',
        fuelTemperatureMargin: 'Fuel Temperature Margin',
        pressureMargin: 'Pressure Margin',
      },
      fault: {
        faultSimulation: 'Fault Simulation',
        activeFaults: 'Active Faults',
        faultProbability: 'Fault Probability',
        systemImpact: 'System Impact',
        coolingSystemFailure: 'Cooling System Failure',
        controlRodMalfunction: 'Control Rod Malfunction',
        steamGeneratorLeak: 'Steam Generator Leak',
        pumpFailure: 'Pump Failure',
        valveStuck: 'Valve Stuck',
        critical: 'Critical',
        high: 'High',
        medium: 'Medium',
        low: 'Low',
      },
      ui: {
        panelTitle: 'Panel Title',
        panelDescription: 'Panel Description',
        detailedOperation: 'Detailed Operation',
        systemStatus: 'System Status',
        dataTrend: 'Data Trend',
        parameters: 'Parameters',
        results: 'Results',
        calculation: 'Calculation',
        visualization: 'Visualization',
        configuration: 'Configuration',
        monitoring: 'Monitoring',
        analysis: 'Analysis',
        simulation: 'Simulation',
        training: 'Training',
        research: 'Research',
      },
      error: {
        loadFailed: 'Load Failed',
        saveFailed: 'Save Failed',
        exportFailed: 'Export Failed',
        importFailed: 'Import Failed',
        calculationFailed: 'Calculation Failed',
        connectionError: 'Connection Error',
        validationError: 'Validation Error',
        unknownError: 'Unknown Error',
      },
      info: {
        welcome: 'Welcome to Barotrauma Reactor Simulator',
        guide: 'Operation Guide',
        feedback: 'Feedback',
        projectInfo: 'Project Information',
        version: 'Version',
        copyright: 'Copyright',
        license: 'License',
        contributors: 'Contributors',
        acknowledgements: 'Acknowledgements',
      },
    },
  };

  // 构造函数
  constructor () {
    // 从本地存储加载语言设置
    this.loadLanguageSetting();
    log.info(`I18n manager initialized with locale: ${this.currentLocale}`);
  }

  // 加载语言设置
  private loadLanguageSetting () {
    try {
      const savedLocale = localStorage.getItem('language');
      if (savedLocale && this.supportedLocales.includes(savedLocale)) {
        this.currentLocale = savedLocale;
      } else {
        // 检测浏览器语言
        const browserLocale = navigator.language;
        const matchedLocale = this.supportedLocales.find((locale) =>
          browserLocale.startsWith(locale.split('-')[0])
        );
        if (matchedLocale) {
          this.currentLocale = matchedLocale;
        }
      }
    } catch (error) {
      log.error('Failed to load language setting:', error);
    }
  }

  // 保存语言设置
  private saveLanguageSetting (locale: string) {
    try {
      localStorage.setItem('language', locale);
    } catch (error) {
      log.error('Failed to save language setting:', error);
    }
  }

  // 设置当前语言
  setLocale (locale: string): void {
    if (!this.supportedLocales.includes(locale)) {
      log.warn(
        `Unsupported locale: ${locale}, using default: ${this.defaultLocale}`
      );
      locale = this.defaultLocale;
    }

    this.currentLocale = locale;
    this.saveLanguageSetting(locale);
    log.info(`Locale changed to: ${locale}`);

    // 触发语言变化事件
    this.emitLocaleChangeEvent();
  }

  // 获取当前语言
  getLocale (): string {
    return this.currentLocale;
  }

  // 获取支持的语言
  getSupportedLocales (): string[] {
    return this.supportedLocales;
  }

  // 翻译文本
  translate (key: string, options?: TranslateOptions): string {
    const [namespace, actualKey] = key.split('.');

    // 尝试在当前语言中查找
    let translation =
      this.resources[this.currentLocale]?.[namespace]?.[actualKey];

    // 如果找不到，尝试在默认语言中查找
    if (!translation) {
      translation =
        this.resources[this.defaultLocale]?.[namespace]?.[actualKey];
    }

    // 如果仍然找不到，返回原始键
    if (!translation) {
      log.warn(`Translation not found for key: ${key}`);
      return key;
    }

    // 处理插值
    if (options?.interpolate) {
      translation = Object.entries(options.interpolate).reduce(
        (result, [placeholder, value]) => {
          return result.replace(
            new RegExp(`{${placeholder}}`, 'g'),
            String(value)
          );
        },
        translation
      );
    }

    return translation;
  }

  // 添加翻译资源
  addResources (
    locale: string,
    resources: TranslationResources[typeof locale]
  ): void {
    if (!this.resources[locale]) {
      this.resources[locale] = {};
    }

    // 合并资源
    for (const [namespace, keys] of Object.entries(resources)) {
      if (!this.resources[locale][namespace]) {
        this.resources[locale][namespace] = {};
      }

      Object.assign(this.resources[locale][namespace], keys);
    }

    // 如果是新语言，添加到支持列表
    if (!this.supportedLocales.includes(locale)) {
      this.supportedLocales.push(locale);
    }

    log.info(`Added resources for locale: ${locale}`);
  }

  // 触发语言变化事件
  private emitLocaleChangeEvent (): void {
    try {
      window.dispatchEvent(
        new CustomEvent('localeChange', {
          detail: { locale: this.currentLocale },
        })
      );
    } catch (error) {
      log.error('Failed to emit locale change event:', error);
    }
  }
}

// 导出单例
export const i18n = new I18nManager();

// 导出翻译函数
export function t (key: string, options?: TranslateOptions): string {
  return i18n.translate(key, options);
}
