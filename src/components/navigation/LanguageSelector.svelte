<script lang="ts">
  import { onMount } from 'svelte';
  import i18nStore, { setLanguage } from '@/stores/i18n';
  import { defaultComponentConfig } from '@/config/components';

  interface Props {
    config?: any;
  }

  const props = withDefaults(defineProps<Props>(), {
    config: defaultComponentConfig,
  });

  let isOpen = false;
  let currentLanguage: string;
  let currentDirection: 'ltr' | 'rtl';

  // 支持的语言列表
  const supportedLanguages = [
    { code: 'en-US', name: 'English' },
    { code: 'zh-CN', name: 'Chinese' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'ar-SA', name: 'Arabic' },
  ];

  // 订阅语言变化
  i18nStore.subscribe((value) => {
    currentLanguage = value.language;
    currentDirection = value.direction;
  });

  // 切换语言
  function handleLanguageChange(languageCode: string) {
    setLanguage(languageCode);
    // 保存语言偏好到本地存储
    localStorage.setItem('preferredLanguage', languageCode);
    isOpen = false;
  }

  // 切换下拉菜单
  function toggleDropdown() {
    isOpen = !isOpen;
  }

  // 点击外部关闭下拉菜单
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.language-selector')) {
      isOpen = false;
    }
  }

  // 初始化时加载保存的语言偏好
  onMount(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && supportedLanguages.some(lang => lang.code === savedLanguage)) {
      setLanguage(savedLanguage);
    }

    // 添加点击外部事件监听器
    document.addEventListener('click', handleClickOutside);

    // 清理函数
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<style lang="scss">
  .language-selector {
    position: relative;
  }

  .language-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    &:focus {
      outline: none;
      border-color: currentColor;
    }

    @media (prefers-color-scheme: dark) {
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }

  .language-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    padding: 8px 0;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    min-width: 160px;
    z-index: 1000;

    @media (prefers-color-scheme: dark) {
      background: #1a1a1a;
      border-color: #333333;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    &:dir(rtl) {
      right: auto;
      left: 0;
    }
  }

  .language-option {
    display: block;
    width: 100%;
    padding: 8px 16px;
    text-align: left;
    background: transparent;
    border: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: #f5f5f5;
    }

    &.active {
      font-weight: 500;
      background: #e6f0ff;
    }

    @media (prefers-color-scheme: dark) {
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      &.active {
        background: rgba(0, 102, 255, 0.2);
      }
    }

    &:dir(rtl) {
      text-align: right;
    }
  }

  .chevron {
    transition: transform 0.2s ease;
  }

  .open .chevron {
    transform: rotate(180deg);
  }
</style>

<div class="language-selector" dir={currentDirection}>
  <button
    class={`language-button ${isOpen ? 'open' : ''}`}
    on:click={toggleDropdown}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    aria-label={$i18nStore.t('Language')}
  >
    <span>{$i18nStore.t('Language')}</span>
    <span class="chevron">▼</span>
  </button>

  {#if isOpen}
    <div class="language-dropdown" role="listbox">
      {#each supportedLanguages as language}
        <button
          class={`language-option ${currentLanguage === language.code ? 'active' : ''}`}
          on:click={() => handleLanguageChange(language.code)}
          role="option"
          aria-selected={currentLanguage === language.code}
        >
          {$i18nStore.t(language.name)}
        </button>
      {/each}
    </div>
  {/if}
</div>
