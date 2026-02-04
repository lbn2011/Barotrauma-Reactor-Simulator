<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Overview from './routes/Overview.svelte';
  import ControlRodPanel from './routes/panels/ControlRodPanel.svelte';
  import PowerControlPanel from './routes/panels/PowerControlPanel.svelte';
  import RecirculationPumpPanel from './routes/panels/RecirculationPumpPanel.svelte';
  import EmergencyCoolingPumpPanel from './routes/panels/EmergencyCoolingPumpPanel.svelte';
  import DrainControlPanel from './routes/panels/DrainControlPanel.svelte';
  import OfflineCoolingPumpPanel from './routes/panels/OfflineCoolingPumpPanel.svelte';
  import TurbineControlPanel from './routes/panels/TurbineControlPanel.svelte';
  import DeaeratorSteamPanel from './routes/panels/DeaeratorSteamPanel.svelte';
  import CondenserVacuumPanel from './routes/panels/CondenserVacuumPanel.svelte';
  import SteamExhaustPanel from './routes/panels/SteamExhaustPanel.svelte';
  import TurbineAuxiliaryPanel from './routes/panels/TurbineAuxiliaryPanel.svelte';
  import HotwellLevelPanel from './routes/panels/HotwellLevelPanel.svelte';
  import CondenserCirculationPumpPanel from './routes/panels/CondenserCirculationPumpPanel.svelte';
  import MakeupWaterPanel from './routes/panels/MakeupWaterPanel.svelte';
  import FeedwaterPumpPanel from './routes/panels/FeedwaterPumpPanel.svelte';
  import DataTrendPanel from './routes/panels/DataTrendPanel.svelte';
  import HEPAFilterPanel from './routes/panels/HEPAFilterPanel.svelte';
  import AlarmCRTPanel from './routes/panels/AlarmCRTPanel.svelte';
  import SchematicCRTPanel from './routes/panels/SchematicCRTPanel.svelte';
  import CondensateSystemPanel from './routes/panels/CondensateSystemPanel.svelte';
  import { reactorStore, updateReactorState } from './lib/stores/reactorStore';

  let currentView: string = 'overview';
  let sidebarOpen: boolean = true;

  // 模拟更新定时器
  let updateInterval: number;

  onMount(() => {
    // 启动模拟更新
    updateInterval = window.setInterval(updateReactorState, 1000);
  });

  onDestroy(() => {
    // 清除定时器
    clearInterval(updateInterval);
  });

  // 导航到面板
  function navigateToPanel(panel: string) {
    currentView = panel;
  }

  // 切换侧边栏
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
</script>

<style>
  :root {
    --sidebar-width: 280px;
    --sidebar-width-collapsed: 80px;
  }

  .app-container {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background-color: #121212;
    color: #e0e0e0;
  }

  .sidebar {
    width: var(--sidebar-width);
    background-color: #1e1e1e;
    border-right: 1px solid #333;
    transition: width 0.3s ease;
    overflow-y: auto;
    padding: 1rem;
  }

  .sidebar.collapsed {
    width: var(--sidebar-width-collapsed);
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #333;
  }

  .sidebar-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #00bcd4;
  }

  .sidebar-toggle {
    background: none;
    border: none;
    color: #e0e0e0;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .sidebar-toggle:hover {
    background-color: #333;
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
    color: #e0e0e0;
  }

  .nav-item:hover {
    background-color: #333;
  }

  .nav-item.active {
    background-color: #00bcd4;
    color: #121212;
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
  }

  .sidebar.collapsed .nav-text {
    display: none;
  }

  .sidebar.collapsed .sidebar-title {
    display: none;
  }
</style>

<div class="app-container">
  <!-- 侧边栏导航 -->
  <nav class="sidebar" class:collapsed={!sidebarOpen}>
    <div class="sidebar-header">
      <h1 class="sidebar-title">RBMK-1000</h1>
      <button class="sidebar-toggle" on:click={toggleSidebar}>
        {sidebarOpen ? '‹' : '›'}
      </button>
    </div>

    <div class="nav-menu">
      <button
        class="nav-item"
        class:active={currentView === 'overview'}
        on:click={() => navigateToPanel('overview')}
      >
        <span class="nav-icon">📊</span>
        <span class="nav-text">概述</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'panel1'}
        on:click={() => navigateToPanel('panel1')}
      >
        <span class="nav-icon">⚙️</span>
        <span class="nav-text">1. 反应堆控制棒</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'panel2'}
        on:click={() => navigateToPanel('panel2')}
      >
        <span class="nav-icon">📈</span>
        <span class="nav-text">2. 功率调节面板</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'panel3'}
        on:click={() => navigateToPanel('panel3')}
      >
        <span class="nav-icon">🔄</span>
        <span class="nav-text">3/4. 再循环泵</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'panel5'}
        on:click={() => navigateToPanel('panel5')}
      >
        <span class="nav-icon">🚨</span>
        <span class="nav-text">5/6. 应急冷却泵</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'panel7'}
        on:click={() => navigateToPanel('panel7')}
      >
        <span class="nav-icon">💧</span>
        <span class="nav-text">7. 排水控制</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'panel8'}
        on:click={() => navigateToPanel('panel8')}
      >
        <span class="nav-icon">❄️</span>
        <span class="nav-text">8. 离线冷却泵</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'panel9'}
        on:click={() => navigateToPanel('panel9')}
      >
        <span class="nav-icon">🌀</span>
        <span class="nav-text">9. 汽轮机控制</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'panel10'}
        on:click={() => navigateToPanel('panel10')}
      >
        <span class="nav-icon">☁️</span>
        <span class="nav-text">10. 除氧器控制</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'panel11'}
        on:click={() => navigateToPanel('panel11')}
      >
        <span class="nav-icon">🔍</span>
        <span class="nav-text">11. 凝汽器真空</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'panel12'}
        on:click={() => navigateToPanel('panel12')}
      >
        <span class="nav-icon">💨</span>
        <span class="nav-text">12. 蒸汽排汽</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'panel13'}
        on:click={() => navigateToPanel('panel13')}
      >
        <span class="nav-icon">⚡</span>
        <span class="nav-text">13. 汽轮机辅助</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'panel14'}
        on:click={() => navigateToPanel('panel14')}
      >
        <span class="nav-icon">📏</span>
        <span class="nav-text">14. 热井液位</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'panel15'}
        on:click={() => navigateToPanel('panel15')}
      >
        <span class="nav-icon">🌊</span>
        <span class="nav-text">15. 循环水泵</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'panel16'}
        on:click={() => navigateToPanel('panel16')}
      >
        <span class="nav-icon">🚿</span>
        <span class="nav-text">16. 补水系统</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'panel17'}
        on:click={() => navigateToPanel('panel17')}
      >
        <span class="nav-icon">📝</span>
        <span class="nav-text">17. 给水泵控制</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'panel18'}
        on:click={() => navigateToPanel('panel18')}
      >
        <span class="nav-icon">📊</span>
        <span class="nav-text">18. 数据趋势图</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'panel19'}
        on:click={() => navigateToPanel('panel19')}
      >
        <span class="nav-icon">🧹</span>
        <span class="nav-text">19. HEPA过滤器</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'panel20'}
        on:click={() => navigateToPanel('panel20')}
      >
        <span class="nav-icon">⚠️</span>
        <span class="nav-text">20. 警报CRT</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'panel21'}
        on:click={() => navigateToPanel('panel21')}
      >
        <span class="nav-icon">🖥️</span>
        <span class="nav-text">21. CRT示意图</span>
      </button>

      <button
        class="nav-item"
        class:active={currentView === 'panel22'}
        on:click={() => navigateToPanel('panel22')}
      >
        <span class="nav-icon">💧</span>
        <span class="nav-text">22. 凝结水系统</span>
      </button>
    </div>
  </nav>

  <!-- 主内容区域 -->
  <main class="main-content">
    {#if currentView === 'overview'}
      <Overview />
    {:else if currentView === 'panel1'}
      <ControlRodPanel />
    {:else if currentView === 'panel2'}
      <PowerControlPanel />
    {:else if currentView === 'panel3'}
      <RecirculationPumpPanel />
    {:else if currentView === 'panel5'}
      <EmergencyCoolingPumpPanel />
    {:else if currentView === 'panel7'}
      <DrainControlPanel />
    {:else if currentView === 'panel8'}
      <OfflineCoolingPumpPanel />
    {:else if currentView === 'panel9'}
      <TurbineControlPanel />
    {:else if currentView === 'panel10'}
      <DeaeratorSteamPanel />
    {:else if currentView === 'panel11'}
      <CondenserVacuumPanel />
    {:else if currentView === 'panel12'}
      <SteamExhaustPanel />
    {:else if currentView === 'panel13'}
      <TurbineAuxiliaryPanel />
    {:else if currentView === 'panel14'}
      <HotwellLevelPanel />
    {:else if currentView === 'panel15'}
      <CondenserCirculationPumpPanel />
    {:else if currentView === 'panel16'}
      <MakeupWaterPanel />
    {:else if currentView === 'panel17'}
      <FeedwaterPumpPanel />
    {:else if currentView === 'panel18'}
      <DataTrendPanel />
    {:else if currentView === 'panel19'}
      <HEPAFilterPanel />
    {:else if currentView === 'panel20'}
      <AlarmCRTPanel />
    {:else if currentView === 'panel21'}
      <SchematicCRTPanel />
    {:else if currentView === 'panel22'}
      <CondensateSystemPanel />
    {:else}
      <h2>控制面板 {currentView.replace('panel', '')}</h2>
      <p>控制面板 {currentView.replace('panel', '')} 内容</p>
    {/if}
  </main>
</div>
