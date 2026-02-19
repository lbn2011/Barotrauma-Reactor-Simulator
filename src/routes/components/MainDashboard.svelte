<script lang="ts">
import { onMount } from 'svelte';
import Panel from './Panel.svelte';
import ControlButtons from './ControlButtons.svelte';
import PrecisionControl from './PrecisionControl.svelte';
import { simulationController } from '../../lib/controllers/SimulationController';
import { reactorController } from '../../lib/controllers/ReactorController';
import logger, { ModuleType } from '@/lib/utils/logger';

const panels = [
  {
    id: 'reactor-power',
    title: '反应堆功率调节面板',
    description: '控制反应堆功率和中子调节',
  },
  {
    id: 'recirculation-pumps',
    title: '反应堆再循环泵',
    description: '控制反应堆再循环泵的运行',
  },
  {
    id: 'emergency-cooling',
    title: '反应堆应急冷却（ERC）泵',
    description: '控制应急冷却系统',
  },
  {
    id: 'reactor-drain',
    title: '反应堆排水控制',
    description: '控制反应堆排水系统',
  },
  {
    id: 'offline-cooling',
    title: '堆芯离线冷却泵',
    description: '控制堆芯离线冷却系统',
  },
  {
    id: 'turbine-control',
    title: '汽轮机控制',
    description: '控制汽轮机的运行',
  },
  {
    id: 'deaerator',
    title: '除氧器蒸汽控制',
    description: '控制除氧器蒸汽系统',
  },
  {
    id: 'condenser-vacuum',
    title: '凝汽器真空系统',
    description: '控制凝汽器真空系统',
  },
  {
    id: 'steam-dump',
    title: '蒸汽排汽控制',
    description: '控制蒸汽排汽系统',
  },
  {
    id: 'turbine-support',
    title: '汽轮机辅助系统',
    description: '控制汽轮机辅助系统',
  },
  {
    id: 'condenser-level',
    title: '凝汽器热井液位控制',
    description: '控制凝汽器热井液位',
  },
  {
    id: 'condenser-circulation',
    title: '凝汽器循环水泵',
    description: '控制凝汽器循环水泵',
  },
  {
    id: 'makeup-water',
    title: '补水系统',
    description: '控制补水系统',
  },
  {
    id: 'feedwater-pumps',
    title: '反应堆给水泵控制',
    description: '控制反应堆给水泵',
  },
  {
    id: 'data-trend',
    title: '数据趋势图',
    description: '显示系统数据趋势',
  },
  {
    id: 'hepa-filter',
    title: 'HEPA过滤器控制',
    description: '控制HEPA过滤器系统',
  },
  {
    id: 'alarm-crt',
    title: '警报CRT',
    description: '显示系统警报信息',
  },
  {
    id: 'schematic-crt',
    title: 'CRT示意图',
    description: '显示系统示意图',
  },
  {
    id: 'condensate-system',
    title: '凝结水系统',
    description: '控制凝结水系统',
  },
];

let activePanel: string | null = null;
let isRunning: boolean = false;

onMount(() => {
  logger.trace(ModuleType.UI, 'MainDashboard component mounted');

  isRunning = simulationController.isRunning;

  const statusCheckInterval = setInterval(() => {
    logger.trace(ModuleType.UI, 'Checking system status');
    reactorController.checkSystemStatus();
  }, 5000);

  return () => {
    clearInterval(statusCheckInterval);
    logger.trace(ModuleType.UI, 'MainDashboard component unmounted');
  };
});

function handlePanelClick (panelId: string) {
  activePanel = panelId;
  logger.info(ModuleType.UI, `Opening panel: ${panelId}`, { panelId });
}

function handleStart () {
  logger.info(ModuleType.UI, `Simulation ${isRunning ? 'stopping' : 'starting'}`, { isRunning });

  if (isRunning) {
    simulationController.stopSimulation();
  } else {
    simulationController.startSimulation();
  }
  isRunning = !isRunning;

  logger.info(ModuleType.UI, `Simulation ${isRunning ? 'started' : 'stopped'}`);
}

function handleReset () {
  logger.info(ModuleType.UI, 'Resetting simulation');
  simulationController.resetSimulation();
  isRunning = false;
  logger.info(ModuleType.UI, 'Simulation reset completed');
}
</script>

<div class="flex flex-col sm:flex-row gap-4 p-4">
  <ControlButtons {isRunning} onStart={handleStart} onReset={handleReset} />

  <div class="w-full sm:w-1/3">
    <PrecisionControl />
  </div>
</div>

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
  {#each panels as panel (panel.id)}
    <Panel
      title={panel.title}
      description={panel.description}
      onClick={() => handlePanelClick(panel.id)}
    />
  {/each}
</div>

{#if activePanel}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
      <h2 class="text-xl font-bold mb-4">
        {panels.find((p) => p.id === activePanel)?.title}
      </h2>
      <p class="mb-6">详细操作页面内容将在此显示...</p>
      <button
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        on:click={() => (activePanel = null)}
      >
        关闭
      </button>
    </div>
  </div>
{/if}
