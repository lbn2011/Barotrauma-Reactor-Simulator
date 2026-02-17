<script lang="ts" module>
  export interface QuickAction {
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

  export interface QuickActionsProps {
    actions?: QuickAction[];
    layout?: 'grid' | 'list';
    showLabels?: boolean;
  }
</script>

<script lang="ts">
  /**
   * 快捷操作组件
   * 用于显示和执行系统的快捷操作
   */
  import { Button } from '../button';
  import { ConfirmationDialog } from '../confirmation-dialog';

  // 快捷操作类型
  /**
   * 快捷操作接口
   * @property id 操作唯一标识符
   * @property name 操作名称
   * @property icon 操作图标
   * @property category 操作分类
   * @property shortcut 快捷键
   * @property riskLevel 风险级别
   * @property usageFrequency 使用频率
   * @property lastUsedTime 最后使用时间
   * @property enabled 是否启用
   * @property action 操作函数
   */
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
  export let actions: QuickAction[] = []; // 快捷操作数组
  export let layout: 'grid' | 'list' = 'grid'; // 布局类型
  export let showLabels: boolean = true; // 是否显示标签

  // 确认对话框
  let confirmationDialog: any; // 确认对话框实例

  /**
   * 执行操作
   * @param action 要执行的操作
   */
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

  /**
   * 获取风险级别对应的颜色
   * @param riskLevel 风险级别
   * @returns 对应的颜色类名
   */
  function getRiskColor(riskLevel: string) {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-600'; // 危急风险 - 红色
      case 'high':
        return 'bg-orange-500'; // 高风险 - 橙色
      case 'medium':
        return 'bg-yellow-500'; // 中等风险 - 黄色
      case 'low':
        return 'bg-green-500'; // 低风险 - 绿色
      default:
        return 'bg-gray-500'; // 默认 - 灰色
    }
  }

  /**
   * 获取分类对应的颜色
   * @param category 操作分类
   * @returns 对应的颜色类名
   */
  function getCategoryColor(category: string) {
    switch (category) {
      case 'emergency':
        return 'border-red-500'; // 紧急操作 - 红色边框
      case 'startup':
        return 'border-green-500'; // 启动操作 - 绿色边框
      case 'shutdown':
        return 'border-blue-500'; // 关闭操作 - 蓝色边框
      case 'routine':
        return 'border-gray-500'; // 常规操作 - 灰色边框
      default:
        return 'border-gray-500'; // 默认 - 灰色边框
    }
  }
</script>

<!--
  快捷操作组件
  
  功能：
  - 显示系统的快捷操作
  - 支持网格和列表两种布局
  - 按风险级别显示不同颜色
  - 对高风险操作进行确认
  - 跟踪操作使用频率和最后使用时间
  - 支持启用/禁用操作
  
  界面元素：
  - 操作按钮（带图标和标签）
  - 风险级别指示器
  - 快捷键显示
  - 确认对话框（用于高风险操作）
  
  技术实现：
  - 响应式布局
  - 条件渲染
  - 异步操作执行
  - 风险级别管理
  - 操作统计跟踪
-->

<div class="quick-actions">
  <h3 class="text-lg font-semibold text-white mb-4">快捷操作</h3>

  <div
    class={`${layout === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3' : 'flex flex-col gap-2'}`}
  >
    {#each actions.filter((a) => a.enabled) as action}
      <Button
        variant="default"
        class={`${layout === 'grid' ? 'flex flex-col items-center justify-center p-4' : 'flex items-center justify-start p-3'}`}
        on:click={() => executeAction(action)}
      >
        <div
          class={`w-8 h-8 rounded-full ${getRiskColor(action.riskLevel)} flex items-center justify-center mb-2 ${layout === 'grid' ? '' : 'mr-3'}`}
        >
          <span class="text-white font-bold">{action.icon}</span>
        </div>
        {#if showLabels}
          <span class={`text-sm ${layout === 'grid' ? 'text-center' : ''}`}
            >{action.name}</span
          >
          <span class="text-xs text-gray-400 mt-1">{action.shortcut}</span>
        {/if}
      </Button>
    {/each}
  </div>

  <ConfirmationDialog bind:this={confirmationDialog} />
</div>
