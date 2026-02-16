<script lang="ts">
  import { Button } from '../button';
  import { ConfirmationDialog } from '../confirmation-dialog';

  // 快捷操作类型
  interface QuickAction {
    id: string;
    name: string;
    icon: string;
    category: 'startup' | 'shutdown' | 'emergency' | 'routine';
    shortcut: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    usageFrequency: number;
    lastUsedTime: number;
    enabled: boolean;
    action: () => void;
  }

  // 快捷操作配置
  export let actions: QuickAction[] = [];
  export let layout: 'grid' | 'list' = 'grid';
  export let showLabels: boolean = true;

  // 确认对话框
  let confirmationDialog: any;

  // 执行操作
  async function executeAction(action: QuickAction) {
    // 对于高风险操作，显示确认对话框
    if (action.riskLevel === 'high' || action.riskLevel === 'critical') {
      const confirmed = await confirmationDialog.open();
      if (!confirmed) return;
    }

    // 执行操作
    action.action();

    // 更新使用频率和最后使用时间
    action.usageFrequency++;
    action.lastUsedTime = Date.now();
  }

  // 获取风险级别对应的颜色
  function getRiskColor(riskLevel: string) {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  }

  // 获取分类对应的颜色
  function getCategoryColor(category: string) {
    switch (category) {
      case 'emergency':
        return 'border-red-500';
      case 'startup':
        return 'border-green-500';
      case 'shutdown':
        return 'border-blue-500';
      case 'routine':
        return 'border-gray-500';
      default:
        return 'border-gray-500';
    }
  }
</script>

<div class="quick-actions">
  <h3 class="text-lg font-semibold text-white mb-4">快捷操作</h3>
  
  <div class={`${layout === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3' : 'flex flex-col gap-2'}`}>
    {#each actions.filter(a => a.enabled) as action}
      <Button
        variant="default"
        class={`${layout === 'grid' ? 'flex flex-col items-center justify-center p-4' : 'flex items-center justify-start p-3'}`}
        on:click={() => executeAction(action)}
      >
        <div class={`w-8 h-8 rounded-full ${getRiskColor(action.riskLevel)} flex items-center justify-center mb-2 ${layout === 'grid' ? '' : 'mr-3'}`}>
          <span class="text-white font-bold">{action.icon}</span>
        </div>
        {#if showLabels}
          <span class={`text-sm ${layout === 'grid' ? 'text-center' : ''}`}>{action.name}</span>
          <span class="text-xs text-gray-400 mt-1">{action.shortcut}</span>
        {/if}
      </Button>
    {/each}
  </div>

  <ConfirmationDialog bind:this={confirmationDialog} />
</div>
