<script lang="ts">
import Button from '../../lib/components/ui/button/button.svelte';

// 组件属性
export let title: string;
export let description: string;
export let onClick: () => void;
</script>

<div
  class="bg-white rounded-lg shadow-md p-4 flex flex-col h-full min-h-[160px] transition-all duration-300 hover:shadow-lg"
>
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
    <h3 class="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">{title}</h3>
    <Button size="sm" {onClick} class="w-full sm:w-auto mt-2 sm:mt-0">详细操作</Button>
  </div>
  <p class="text-gray-600 text-sm mb-4 flex-grow">{description}</p>
  <div class="mt-auto">
    <div class="w-full bg-gray-200 rounded-full h-2.5">
      <div class="bg-blue-600 h-2.5 rounded-full" style="width: 65%"></div>
    </div>
    <p class="text-xs text-gray-500 mt-2">状态: 正常运行</p>
  </div>
</div>
