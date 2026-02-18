<script lang="ts">
import type { WebNavigation, WebSearchFlowAction } from '@/types';
import { logger } from '../lib/utils/logger';

import AppStoreLogo from '@/components/icons/AppStoreLogo.svelte';
import PlatformSelectorDropdown from '@/components/jet/web-navigation/PlatformSelectorDropdown.svelte';
import FlowAction from '@/components/jet/action/FlowAction.svelte';
import SystemImage from '@/components/SystemImage.svelte';
import SearchInput from '@/components/navigation/SearchInput.svelte';
import SFSymbol from '@/components/SFSymbol.svelte';

import { getI18n, setLanguage } from '@/stores/i18n';
import { sidebarIsHidden } from '@/stores/sidebar-hidden';
import mediaQueries from '@/utils/media-queries';
import { defaultComponentConfig } from '@/config/components';
import { getLanguageName } from '@/utils/i18n';

import { fade, type EasingFunction } from 'svelte/transition';
import { circOut } from 'svelte/easing';
import { flyAndBlur } from '@/utils/transition';

const i18n = getI18n();
let languageDropdownOpen = false;

export let webNavigation: WebNavigation;
export let config = defaultComponentConfig;

// Log navigation component initialization
logger.info('Navigation component initialized', {
  platformCount: webNavigation.platforms.length,
  hasSearchAction: !!webNavigation.searchAction
});

function isSystemImageArtwork (artwork: any): boolean {
  return artwork.type === 'system';
}

$: isXSmallViewport = $mediaQueries === 'xsmall';
$: searchAction = webNavigation.searchAction as WebSearchFlowAction;
$: inlinePlatformItems =
  isXSmallViewport || typeof window === 'undefined' ? webNavigation.platforms : [];
$: supportedLanguages = config.global?.supportedLanguages || ['zh-CN', 'en-US'];
$: currentLanguage = i18n?.language || config.global?.defaultLanguage || 'zh-CN';

function handleLanguageChange (language: string) {
  logger.info('Language changed', { from: currentLanguage, to: language });
  setLanguage(language);
  languageDropdownOpen = false;
}

const BASE_DELAY = 80;
const BASE_DURATION = 150;
const DURATION_SPREAD = 300;

function getEasedDuration ({
  i,
  totalNumberOfItems,
  easing = circOut,
}: {
  i: number;
  totalNumberOfItems: number;
  easing?: EasingFunction;
}) {
  const t = i / (totalNumberOfItems - 1);
  return BASE_DURATION + easing(t) * DURATION_SPREAD;
}
</script>

<style lang="scss">
.navigation-wrapper {
  display: contents;
}

.platform-selector-container {
  --header-gap: 3px;
  --platform-selector-trigger-gap: var(--header-gap);
  display: flex;
  gap: var(--header-gap);
  position: relative;
}

.platform-selector-container:lang(ja),
.platform-selector-container:lang(ca) {
  --scale-factor: 0.1;
  z-index: 3;
  transform: scale(calc(1 - var(--scale-factor)));
  transform-origin: center left;

  & :global(dialog) {
    top: 60px;
    transform: scale(calc(1 + var(--scale-factor)));
    transform-origin: center left;
  }
}

.app-store-icon-container {
  display: flex;
  align-items: center;
  gap: var(--header-gap);
  font: var(--title-1);
  font-weight: 600;
}

.app-store-icon-container :global(svg) {
  height: 18px;
  position: relative;
  top: 0.33px;
  width: auto;
}

.search-input-container {
  margin: 0 25px;
}

.platform-selector-inline {
  margin: 8px 32px;
}

ul {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

h3 {
  color: var(--systemTertiary);
  font: var(--body-emphasized);
  margin: 0 0 10px;
  padding-top: 20px;
}

.platform {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  color: var(--systemTertiary);
}

@media (prefers-color-scheme: dark) {
  .platform {
    color: var(--systemSecondary);
  }
}

.platform,
.platform :global(svg) {
  transition: color 210ms ease-out;
}

.platform:not(.is-active):hover,
.platform:not(.is-active):hover :global(svg) {
  color: var(--systemPrimary);
}

.platform.is-active {
  color: var(--systemPrimary);
  font: var(--body-emphasized);
}

.platform.is-active :global(svg) {
  color: currentColor;
}

.icon-container {
  display: flex;
}

.icon-container :global(svg) {
  color: var(--systemTertiary);
  width: 18px;
  max-height: 16px;
}

@media (prefers-color-scheme: dark) {
  .icon-container :global(svg) {
    color: var(--systemSecondary);
  }
}

.search-icon-container {
  display: flex;
}

.search-icon-container :global(svg) {
  fill: var(--systemSecondary);
  width: 16px;
}

.platform-title {
  font: var(--body);
  flex-grow: 1;
}

.language-selector {
  position: relative;
  margin-left: 16px;
}

.language-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: none;
  border: 1px solid var(--sidebar-border);
  border-radius: 6px;
  color: var(--text-color);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.language-button:hover {
  background-color: var(--sidebar-hover);
}

.language-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background-color: var(--sidebar-bg);
  border: 1px solid var(--sidebar-border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  z-index: 100;
  overflow: hidden;
}

.language-option {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.language-option:hover {
  background-color: var(--sidebar-hover);
}

.language-option.active {
  background-color: var(--nav-item-active);
  color: var(--nav-item-active-text);
}
</style>

<div class="navigation-wrapper">
  <div class="navigation">
    <div class="platform-selector-container">
      <span
        id="app-store-icon-contianer"
        class="app-store-icon-container"
        role="img"
        aria-label={i18n?.t?.('ASE.Web.AppStore.Navigation.AX.AppStoreLogo') || 'App Store Logo'}
      >
        <AppStoreLogo focusable={false} />
      </span>

      {#if !$sidebarIsHidden && !isXSmallViewport}
        <PlatformSelectorDropdown platformSelectors={webNavigation.platforms} />
      {/if}

      {#if config.navigation?.showLanguageSelector}
        <div class="language-selector">
          <button
            class="language-button"
            on:click={() => (languageDropdownOpen = !languageDropdownOpen)}
            aria-expanded={languageDropdownOpen}
            aria-haspopup="true"
          >
            <span>{getLanguageName(currentLanguage)}</span>
            <SFSymbol name={languageDropdownOpen ? 'chevron-up' : 'chevron-down'} />
          </button>

          {#if languageDropdownOpen}
            <div class="language-dropdown">
              {#each supportedLanguages as lang, index (index)}
                <button
                  class="language-option"
                  class:active={lang === currentLanguage}
                  on:click={() => handleLanguageChange(lang)}
                  on:keydown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Space') {
                      e.preventDefault();
                      handleLanguageChange(lang);
                    }
                  }}
                  role="menuitem"
                  tabindex="-1"
                >
                  {getLanguageName(lang)}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <div class="search-input-container">
      <SearchInput {searchAction} />
    </div>

    <div class="platform-selector-inline">
      {#if isXSmallViewport}
        <h3 in:fade out:fade={{ delay: 250, duration: BASE_DURATION }}>
          {i18n?.t?.('ASE.Web.AppStore.Navigation.PlatformHeading') || 'Platforms'}
        </h3>
      {/if}

      <ul>
        {#each inlinePlatformItems as platformSelector, i (platformSelector.action.title)}
          {@const { action, isActive } = platformSelector}
          {@const artwork = action.artwork}
          {@const totalNumberOfItems = inlinePlatformItems.length}
          <li
            in:flyAndBlur={{
              y: -50,
              delay: i * BASE_DELAY,
              duration: getEasedDuration({
                i,
                totalNumberOfItems,
              }),
            }}
            out:flyAndBlur={{
              y: i * -5,
              delay: (totalNumberOfItems - i - 1) * (BASE_DELAY / 2),
              duration: BASE_DURATION,
            }}
          >
            <FlowAction destination={action}>
              <span class="platform" class:is-active={isActive}>
                {#if artwork && isSystemImageArtwork(artwork)}
                  <div class="icon-container" aria-hidden="true">
                    <SystemImage {artwork} />
                  </div>
                {/if}

                <span class="platform-title">
                  {action.title}
                </span>

                {#if action.destination && action.destination.type === 'search'}
                  <span aria-hidden={true} class="search-icon-container">
                    <SFSymbol name="magnifyingglass" />
                  </span>
                {/if}
              </span>
            </FlowAction>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div>
