<script lang="ts">
  import { writable } from 'svelte/store';
  import type {
    WebNavigation,
    WebNavigationLink,
    WebSearchFlowAction,
  } from '~/types';

  import AppStoreLogo from '~/components/icons/AppStoreLogo.svg';
  import PlatformSelectorDropdown from '~/components/jet/web-navigation/PlatformSelectorDropdown.svelte';
  import FlowAction from '~/components/jet/action/FlowAction.svelte';
  import SystemImage, {
    isSystemImageArtwork,
  } from '~/components/SystemImage.svelte';
  import SearchInput from '~/components/navigation/SearchInput.svelte';
  import SFSymbol from '~/components/SFSymbol.svelte';

  import { getJetPerform } from '~/jet';
  import { getI18n } from '~/stores/i18n';
  import { sidebarIsHidden } from '~/stores/sidebar-hidden';
  import mediaQueries from '~/utils/media-queries';

  import { fade, type EasingFunction } from 'svelte/transition';
  import { circOut } from 'svelte/easing';
  import { flyAndBlur } from '~/utils/transition';

  const i18n = getI18n();
  const perform = getJetPerform();

  const categoryTabsCache: Record<string, WebNavigationLink[]> = {};
  let categoryTabLinks: WebNavigationLink[] = [];
  let currentTabStore = writable<string | null>(null);

  export let webNavigation: WebNavigation;

  $: isXSmallViewport = $mediaQueries === 'xsmall';
  $: searchAction = webNavigation.searchAction as WebSearchFlowAction;
  $: inlinePlatformItems =
    isXSmallViewport || typeof window === 'undefined'
      ? webNavigation.platforms
      : [];

  function updateActiveStates(tabs: WebNavigationLink[]): WebNavigationLink[] {
    return tabs.map((link) => ({
      ...link,
      isActive: link.action?.destination?.id
        ? typeof window !== 'undefined' &&
          window.location.pathname.includes(link.action.destination.id)
        : false,
    }));
  }

  function updateCurrentTab() {
    const allLinks: WebNavigationLink[] = [
      ...categoryTabLinks,
      ...webNavigation.tabs,
    ];

    const activeLink = allLinks.find((link) => link.isActive);
    currentTabStore.set(
      activeLink ? activeLink.action?.destination?.id || null : null
    );
  }

  function handleMenuItemClick(event: CustomEvent<{ tab: WebNavigationLink }>) {
    const navigationItem = event.detail;
    const tab = navigationItem.tab;

    perform(tab.action);
  }

  const BASE_DELAY = 80;
  const BASE_DURATION = 150;
  const DURATION_SPREAD = 300;

  function getEasedDuration({
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
</style>

<div class="navigation-wrapper">
  <div class="navigation">
    <div slot="logo" class="platform-selector-container">
      <span
        id="app-store-icon-contianer"
        class="app-store-icon-container"
        role="img"
        aria-label={$i18n?.t?.('ASE.Web.AppStore.Navigation.AX.AppStoreLogo') ||
          'App Store Logo'}
      >
        <AppStoreLogo focusable={false} />
      </span>

      {#if !$sidebarIsHidden && !isXSmallViewport}
        <PlatformSelectorDropdown platformSelectors={webNavigation.platforms} />
      {/if}
    </div>

    <svelte:fragment slot="search">
      <div class="search-input-container">
        <SearchInput {searchAction} />
      </div>
    </svelte:fragment>

    <div slot="after-navigation-items" class="platform-selector-inline">
      {#if isXSmallViewport}
        <h3 in:fade out:fade={{ delay: 250, duration: BASE_DURATION }}>
          {$i18n?.t?.('ASE.Web.AppStore.Navigation.PlatformHeading') ||
            'Platforms'}
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
