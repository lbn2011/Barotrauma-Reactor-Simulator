<script lang="ts">
/**
 * 确认对话框组件
 * 用于显示操作确认信息，特别是高风险操作
 */
import { Button } from '../button';

// 组件属性
export let isOpen = false; // 是否打开对话框
export let title = '确认操作'; // 对话框标题
export let message = '您确定要执行此操作吗？'; // 对话框消息
export let confirmText = '确认'; // 确认按钮文本
export let cancelText = '取消'; // 取消按钮文本
export let danger = false; // 是否为危险操作

// 内部状态
let resolve: ((value: boolean) => void) | null = null; // Promise解析函数

/**
 * 确认操作
 * 解析Promise为true并关闭对话框
 */
function confirm () {
  if (resolve) {
    resolve(true);
    resolve = null;
  }
  isOpen = false;
}

/**
 * 取消操作
 * 解析Promise为false并关闭对话框
 */
function cancel () {
  if (resolve) {
    resolve(false);
    resolve = null;
  }
  isOpen = false;
}

/**
 * 打开对话框
 * @returns Promise<boolean> 操作是否被确认
 */
export async function open (): Promise<boolean> {
  isOpen = true;
  return new Promise((_resolve) => {
    resolve = _resolve;
  });
}
</script>

<!--
  确认对话框组件

  功能：
  - 显示操作确认信息
  - 支持自定义标题、消息和按钮文本
  - 支持危险操作样式
  - 返回操作确认状态
  - 模态对话框效果

  界面元素：
  - 对话框标题
  - 确认消息
  - 取消按钮
  - 确认按钮（支持危险样式）

  技术实现：
  - Promise异步处理
  - 模态对话框
  - 响应式设计
  - 条件渲染
  - 事件处理
-->

{#if isOpen}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full">
      <h3 class="text-xl font-semibold text-white mb-4">{title}</h3>
      <p class="text-gray-300 mb-6">{message}</p>
      <div class="flex justify-end space-x-4">
        <Button variant="secondary" on:click={cancel}>
          {cancelText}
        </Button>
        <Button variant={danger ? 'destructive' : 'default'} on:click={confirm}>
          {confirmText}
        </Button>
      </div>
    </div>
  </div>
{/if}
