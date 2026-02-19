<script lang="ts">
	import Button from './ui/button/button.svelte';
	import { toggleInstructions, toggleFeedback, toggleProjectInfo } from '../stores/uiStore';
	import log from '../utils/logger';

	// 主题类型定义
	type Theme = 'light' | 'dark' | 'system';

	// 语言类型定义
	type Language = 'zh' | 'en';

	// 模拟精度类型定义
	type Precision = 'low' | 'medium' | 'high';

	// 状态管理
	let currentTheme: Theme = 'system';
	let currentLanguage: Language = 'zh';
	let currentPrecision: Precision = 'medium';
	let isThemeMenuOpen = false;
	let isLanguageMenuOpen = false;
	let isPrecisionMenuOpen = false;

	// 多语言文本
	const translations = {
		zh: {
			title: 'RBMK - 反应堆模拟器',
			instructions: '使用说明',
			feedback: '问题反馈',
			projectInfo: '项目信息',
			theme: '主题',
			themeLight: '浅色',
			themeDark: '暗色',
			themeSystem: '跟随系统',
			language: '语言',
			languageZh: '中文',
			languageEn: '英文',
			precision: '精度',
			precisionLow: '低',
			precisionMedium: '中',
			precisionHigh: '高',
			simulation: '模拟',
			start: '开始',
			pause: '暂停',
			reset: '重置'
		},
		en: {
			title: 'RBMK - Reactor Simulator',
			instructions: 'Instructions',
			feedback: 'Feedback',
			projectInfo: 'Project Info',
			theme: 'Theme',
			themeLight: 'Light',
			themeDark: 'Dark',
			themeSystem: 'System',
			language: 'Language',
			languageZh: 'Chinese',
			languageEn: 'English',
			precision: 'Precision',
			precisionLow: 'Low',
			precisionMedium: 'Medium',
			precisionHigh: 'High',
			simulation: 'Simulation',
			start: 'Start',
			pause: 'Pause',
			reset: 'Reset'
		}
	};

	// 获取当前语言的文本
	function t(key: keyof typeof translations.zh) {
		return translations[currentLanguage][key];
	}

	// 初始化主题
	function initTheme() {
		log.trace('Initializing theme');
		const savedTheme = localStorage.getItem('theme') as Theme | null;
		const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		if (savedTheme) {
			currentTheme = savedTheme;
			applyTheme(savedTheme, systemPrefersDark);
		} else {
			applyTheme('system', systemPrefersDark);
		}

		// 监听系统主题变化
		setupThemeListener();
		log.success('Theme initialized successfully');
	}

	// 应用主题
	function applyTheme(theme: Theme, systemPrefersDark?: boolean) {
		log.trace('Applying theme:', { theme, systemPrefersDark });
		const html = document.documentElement;
		const prefersDark = systemPrefersDark ?? window.matchMedia('(prefers-color-scheme: dark)').matches;

		// 移除所有主题类
		html.classList.remove('light', 'dark');

		if (theme === 'light') {
			html.classList.add('light');
		} else if (theme === 'dark') {
			html.classList.add('dark');
		} else { // system
			if (prefersDark) {
				html.classList.add('dark');
			}
		}

		// 保存主题偏好
		localStorage.setItem('theme', theme);
		currentTheme = theme;
		log.info('Theme applied:', theme);
	}

	// 监听系统主题变化
	function setupThemeListener() {
		log.trace('Setting up theme listener');
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
			if (currentTheme === 'system') {
				applyTheme('system', e.matches);
			}
		});
		log.success('Theme listener setup completed');
	}

	// 切换主题
	function handleThemeChange(theme: Theme) {
		log.trace('Theme change requested:', theme);
		applyTheme(theme);
		isThemeMenuOpen = false;
		log.success('Theme changed to:', theme);
	}

	// 切换语言
	function handleLanguageChange(language: Language) {
		log.trace('Language change requested:', language);
		currentLanguage = language;
		localStorage.setItem('language', language);
		isLanguageMenuOpen = false;
		log.success('Language changed to:', language);
	}

	// 切换模拟精度
	function handlePrecisionChange(precision: Precision) {
		log.trace('Precision change requested:', precision);
		currentPrecision = precision;
		localStorage.setItem('precision', precision);
		isPrecisionMenuOpen = false;
		log.success('Precision changed to:', precision);
	}

	// 处理按钮点击事件
	function handleInstructionsClick() {
		log.trace('Instructions button clicked');
		toggleInstructions();
		log.info('Instructions toggled');
	}

	function handleFeedbackClick() {
		log.trace('Feedback button clicked');
		toggleFeedback();
		log.info('Feedback toggled');
	}

	function handleProjectInfoClick() {
		log.trace('Project info button clicked');
		toggleProjectInfo();
		log.info('Project info toggled');
	}

	// 模拟控制
	let isSimulationRunning = false;

	function handleStartSimulation() {
		log.trace('Start simulation requested');
		isSimulationRunning = true;
		log.success('Simulation started');
	}

	function handlePauseSimulation() {
		log.trace('Pause simulation requested');
		isSimulationRunning = false;
		log.info('Simulation paused');
	}

	function handleResetSimulation() {
		log.trace('Reset simulation requested');
		isSimulationRunning = false;
		log.info('Simulation reset');
	}

	// 初始化
	function init() {
		log.trace('Initializing TopBar component');
		initTheme();
		
		// 加载保存的语言偏好
		const savedLanguage = localStorage.getItem('language') as Language | null;
		if (savedLanguage) {
			currentLanguage = savedLanguage;
		}

		// 加载保存的精度偏好
		const savedPrecision = localStorage.getItem('precision') as Precision | null;
		if (savedPrecision) {
			currentPrecision = savedPrecision;
		}

		log.success('TopBar component initialized successfully');
	}

	// 组件挂载时初始化
	init();
</script>

<style>
	.dropdown-item {
		transition: background-color var(--transition-interactive);
	}

	.dropdown-item:hover {
		background-color: var(--bg-hover);
	}
</style>

<header class="border-b border-border-primary px-6 py-3" style="background-color: var(--bg-secondary);">
	<div class="container mx-auto flex justify-between items-center">
		<div class="text-xl font-bold" style="color: var(--text-primary);">
			{t('title')}
		</div>
		<div class="flex space-x-4 items-center">
			<!-- 模拟控制 -->
			<div class="flex space-x-2">
				<Button 
					variant="primary" 
					onClick={isSimulationRunning ? handlePauseSimulation : handleStartSimulation}
					style="background-color: var(--btn-primary); color: white;"
				>
					{isSimulationRunning ? t('pause') : t('start')}
				</Button>
				<Button 
					variant="secondary" 
					onClick={handleResetSimulation}
					style="background-color: var(--btn-secondary); color: var(--text-primary);"
				>
					{t('reset')}
				</Button>
			</div>

			<!-- 模拟精度控制 -->
			<div class="relative">
				<Button 
					variant="secondary" 
					onClick={() => isPrecisionMenuOpen = !isPrecisionMenuOpen}
					style="background-color: var(--btn-secondary); color: var(--text-primary);"
				>
					{t('precision')}: {currentPrecision === 'low' ? t('precisionLow') : currentPrecision === 'medium' ? t('precisionMedium') : t('precisionHigh')}
				</Button>
				{#if isPrecisionMenuOpen}
					<div class="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10" style="background-color: var(--bg-secondary); border: 1px solid var(--border-primary);">
						<div 
							onClick={() => handlePrecisionChange('low')}
							class="px-4 py-2 cursor-pointer dropdown-item"
							style="color: var(--text-primary);"
						>
							{t('precisionLow')}
						</div>
						<div 
							onClick={() => handlePrecisionChange('medium')}
							class="px-4 py-2 cursor-pointer dropdown-item"
							style="color: var(--text-primary);"
						>
							{t('precisionMedium')}
						</div>
						<div 
							onClick={() => handlePrecisionChange('high')}
							class="px-4 py-2 cursor-pointer dropdown-item"
							style="color: var(--text-primary);"
						>
							{t('precisionHigh')}
						</div>
					</div>
				{/if}
			</div>

			<!-- 语言选择 -->
			<div class="relative">
				<Button 
					variant="secondary" 
					onClick={() => isLanguageMenuOpen = !isLanguageMenuOpen}
					style="background-color: var(--btn-secondary); color: var(--text-primary);"
				>
					{t('language')}: {currentLanguage === 'zh' ? t('languageZh') : t('languageEn')}
				</Button>
				{#if isLanguageMenuOpen}
					<div class="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10" style="background-color: var(--bg-secondary); border: 1px solid var(--border-primary);">
						<div 
							onClick={() => handleLanguageChange('zh')}
							class="px-4 py-2 cursor-pointer dropdown-item"
							style="color: var(--text-primary);"
						>
							{t('languageZh')}
						</div>
						<div 
							onClick={() => handleLanguageChange('en')}
							class="px-4 py-2 cursor-pointer dropdown-item"
							style="color: var(--text-primary);"
						>
							{t('languageEn')}
						</div>
					</div>
				{/if}
			</div>

			<!-- 主题切换 -->
			<div class="relative">
				<Button 
					variant="secondary" 
					onClick={() => isThemeMenuOpen = !isThemeMenuOpen}
					style="background-color: var(--btn-secondary); color: var(--text-primary);"
				>
					{t('theme')}: {currentTheme === 'light' ? t('themeLight') : currentTheme === 'dark' ? t('themeDark') : t('themeSystem')}
				</Button>
				{#if isThemeMenuOpen}
					<div class="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10" style="background-color: var(--bg-secondary); border: 1px solid var(--border-primary);">
						<div 
							onClick={() => handleThemeChange('light')}
							class="px-4 py-2 cursor-pointer dropdown-item"
							style="color: var(--text-primary);"
						>
							{t('themeLight')}
						</div>
						<div 
							onClick={() => handleThemeChange('dark')}
							class="px-4 py-2 cursor-pointer dropdown-item"
							style="color: var(--text-primary);"
						>
							{t('themeDark')}
						</div>
						<div 
							onClick={() => handleThemeChange('system')}
							class="px-4 py-2 cursor-pointer dropdown-item"
							style="color: var(--text-primary);"
						>
							{t('themeSystem')}
						</div>
					</div>
				{/if}
			</div>

			<!-- 原有按钮 -->
			<Button 
				variant="secondary" 
				onClick={handleInstructionsClick}
				style="background-color: var(--btn-secondary); color: var(--text-primary);"
			>
				{t('instructions')}
			</Button>
			<Button 
				variant="secondary" 
				onClick={handleFeedbackClick}
				style="background-color: var(--btn-secondary); color: var(--text-primary);"
			>
				{t('feedback')}
			</Button>
			<Button 
				variant="secondary" 
				onClick={handleProjectInfoClick}
				style="background-color: var(--btn-secondary); color: var(--text-primary);"
			>
				{t('projectInfo')}
			</Button>
		</div>
	</div>
</header>
