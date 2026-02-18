<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import TopBar from '../lib/components/TopBar.svelte';
import { updateReactorState } from '../lib/stores/reactorStore';
import { page } from '$app/stores';
import { resolve } from '$app/paths';
import log from '@/utils/logger';

let sidebarOpen: boolean = true;

// Simulation update timer
let updateInterval: number;

// Component initialization logs
log.info('+layout.svelte component initialized');
log.debug('Starting to load layout dependencies and state');

onMount(() => {
  log.info('+layout.svelte component mounting started');
  // Start simulation updates
  updateInterval = window.setInterval(updateReactorState, 1000);
  log.success('Reactor state update timer started', { interval: 1000 });
  log.info('+layout.svelte component mounting completed');
});

onDestroy(() => {
  log.info('+layout.svelte component destruction started');
  // Clear timer
  clearInterval(updateInterval);
  log.success('Reactor state update timer cleared');
  log.info('+layout.svelte component destruction completed');
});

// Toggle sidebar
function toggleSidebar () {
  log.debug('Starting to toggle sidebar state', { currentState: sidebarOpen });
  sidebarOpen = !sidebarOpen;
  log.success('Sidebar state toggled', { newState: sidebarOpen });
}
</script>

<style>
:root {
  --sidebar-width: 240px;
  --sidebar-width-collapsed: 80px;
  --top-bar-height: 4rem;
  --bg-color: #ffffff;
  --text-color: #121212;
  --sidebar-bg: #f8f9fa;
  --sidebar-border: #dee2e6;
  --sidebar-hover: #e9ecef;
  --nav-item-active: #00bcd4;
  --nav-item-active-text: #121212;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: var(--sidebar-width);
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  transition: width 0.3s ease;
  overflow-y: auto;
  padding: 1rem;
  height: calc(100vh - var(--top-bar-height)); /* 减去顶部栏的高度 */
  position: relative;
}

.sidebar.collapsed {
  width: var(--sidebar-width-collapsed);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--sidebar-border);
}

.sidebar-toggle {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.sidebar-toggle:hover {
  background-color: var(--sidebar-hover);
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  color: var(--text-color);
  background: none;
  border: none;
  width: 100%;
  text-align: left;
}

.nav-item:hover {
  background-color: var(--sidebar-hover);
}

.nav-item.active {
  background-color: var(--nav-item-active);
  color: var(--nav-item-active-text);
}

.nav-icon {
  font-size: 1.2rem;
  min-width: 24px;
}

.nav-text {
  font-size: 0.9rem;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  height: calc(100vh - var(--top-bar-height)); /* 减去顶部栏的高度 */
  overflow-y: auto;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.sidebar.collapsed .nav-text {
  display: none;
}
</style>

<div class="app-container">
  <TopBar />
  <div class="main-container">
    <nav class="sidebar" class:collapsed={!sidebarOpen}>
      <div class="sidebar-header">
        <button class="sidebar-toggle" on:click={toggleSidebar}>
          {sidebarOpen ? '‹' : '›'}
        </button>
      </div>

      <div class="nav-menu">
        <a href={resolve('/')} class="nav-item" class:active={$page.url.pathname === '/'}>
          <span class="nav-icon">📊</span>
          <span class="nav-text">概述</span>
        </a>

        <a
          href={resolve('/panels/control-rod')}
          class="nav-item"
          class:active={$page.url.pathname === '/panels/control-rod'}
        >
          <span class="nav-icon">⚙️</span>
          <span class="nav-text">1. 反应堆控制棒</span>
        </a>

        <a
          href={resolve('/panels/power-control')}
          class="nav-item"
          class:active={$page.url.pathname === '/panels/power-control'}
        >
          <span class="nav-icon">📈</span>
          <span class="nav-text">2. 功率调节面板</span>
        </a>

        <a
          href={resolve('/panels/recirculation-pump')}
          class="nav-item"
          class:active={$page.url.pathname === '/panels/recirculation-pump'}
        >
          <span class="nav-icon">🔄</span>
          <span class="nav-text">3/4. 再循环泵</span>
        </a>

        <a
          href={resolve('/panels/emergency-cooling-pump')}
          class="nav-item"
          class:active={$page.url.pathname === '/panels/emergency-cooling-pump'}
        >
          <span class="nav-icon">🚨</span>
          <span class="nav-text">5/6. 应急冷却泵</span>
        </a>

        <a
          href={resolve('/panels/drain-control')}
          class="nav-item"
          class:active={$page.url.pathname === '/panels/drain-control'}
        >
          <span class="nav-icon">💧</span>
          <span class="nav-text">7. 排水控制</span>
        </a>

        <a
          href={resolve('/panels/offline-cooling-pump')}
          class="nav-item"
          class:active={$page.url.pathname === '/panels/offline-cooling-pump'}
        >
          <span class="nav-icon">❄️</span>
          <span class="nav-text">8. 离线冷却泵</span>
        </a>

        <a
          href={resolve('/panels/turbine-control')}
          class="nav-item"
          class:active={$page.url.pathname === '/panels/turbine-control'}
        >
          <span class="nav-icon">🌀</span>
          <span class="nav-text">9. 汽轮机控制</span>
        </a>

        <a
          href={resolve('/panels/deaerator-steam')}
          class="nav-item"
          class:active={$page.url.pathname === '/panels/deaerator-steam'}
        >
          <span class="nav-icon">☁️</span>
          <span class="nav-text">10. 除氧器控制</span>
        </a>

        <a
          href={resolve('/panels/condenser-vacuum')}
          class="nav-item"
          class:active={$page.url.pathname === '/panels/condenser-vacuum'}
        >
          <span class="nav-icon">🔍</span>
          <span class="nav-text">11. 凝汽器真空</span>
        </a>

        <a
          href={resolve('/panels/steam-exhaust')}
          class="nav-item"
          class:active={$page.url.pathname === '/panels/steam-exhaust'}
        >
          <span class="nav-icon">💨</span>
          <span class="nav-text">12. 蒸汽排汽</span>
        </a>

        <a
          href={resolve('/panels/turbine-auxiliary')}
          class="nav-item"
          class:active={$page.url.pathname === '/panels/turbine-auxiliary'}
        >
          <span class="nav-icon">⚡</span>
          <span class="nav-text">13. 汽轮机辅助</span>
        </a>

        <a
          href={resolve('/panels/hotwell-level')}
          class="nav-item"
          class:active={$page.url.pathname === '/panels/hotwell-level'}
        >
          <span class="nav-icon">📏</span>
          <span class="nav-text">14. 热井液位</span>
        </a>

        <a
          href={resolve('/panels/condenser-circulation-pump')}
          class="nav-item"
          class:active={$page.url.pathname === '/panels/condenser-circulation-pump'}
        >
          <span class="nav-icon">🌊</span>
          <span class="nav-text">15. 循环水泵</span>
        </a>

        <a
          href={resolve('/panels/makeup-water')}
          class="nav-item"
          class:active={$page.url.pathname === '/panels/makeup-water'}
        >
          <span class="nav-icon">🚿</span>
          <span class="nav-text">16. 补水系统</span>
        </a>

        <a
          href={resolve('/panels/feedwater-pump')}
          class="nav-item"
          class:active={$page.url.pathname === '/panels/feedwater-pump'}
        >
          <span class="nav-icon">📝</span>
          <span class="nav-text">17. 给水泵控制</span>
        </a>

        <a
          href={resolve('/panels/data-trend')}
          class="nav-item"
          class:active={$page.url.pathname === '/panels/data-trend'}
        >
          <span class="nav-icon">📊</span>
          <span class="nav-text">18. 数据趋势图</span>
        </a>

        <a
          href={resolve('/panels/hepa-filter')}
          class="nav-item"
          class:active={$page.url.pathname === '/panels/hepa-filter'}
        >
          <span class="nav-icon">🧹</span>
          <span class="nav-text">19. HEPA过滤器</span>
        </a>

        <a
          href={resolve('/panels/alarm-crt')}
          class="nav-item"
          class:active={$page.url.pathname === '/panels/alarm-crt'}
        >
          <span class="nav-icon">⚠️</span>
          <span class="nav-text">20. 警报CRT</span>
        </a>

        <a
          href={resolve('/panels/schematic-crt')}
          class="nav-item"
          class:active={$page.url.pathname === '/panels/schematic-crt'}
        >
          <span class="nav-icon">🖥️</span>
          <span class="nav-text">21. CRT示意图</span>
        </a>

        <a
          href={resolve('/panels/condensate-system')}
          class="nav-item"
          class:active={$page.url.pathname === '/panels/condensate-system'}
        >
          <span class="nav-icon">💧</span>
          <span class="nav-text">22. 凝结水系统</span>
        </a>

        <a
          href={resolve('/save-editor')}
          class="nav-item"
          class:active={$page.url.pathname === '/save-editor'}
        >
          <span class="nav-icon">💾</span>
          <span class="nav-text">存档编辑器</span>
        </a>
      </div>
    </nav>

    <main class="main-content">
      <slot />
    </main>
  </div>
</div>
