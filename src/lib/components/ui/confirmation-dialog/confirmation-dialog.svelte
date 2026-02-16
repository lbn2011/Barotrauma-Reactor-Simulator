<script lang="ts">
  import { Button } from '../button';

  export let isOpen = false;
  export let title = '确认操作';
  export let message = '您确定要执行此操作吗？';
  export let confirmText = '确认';
  export let cancelText = '取消';
  export let danger = false;

  let resolve: ((value: boolean) => void) | null = null;

  function confirm() {
    if (resolve) {
      resolve(true);
      resolve = null;
    }
    isOpen = false;
  }

  function cancel() {
    if (resolve) {
      resolve(false);
      resolve = null;
    }
    isOpen = false;
  }

  export async function open(): Promise<boolean> {
    isOpen = true;
    return new Promise((_resolve) => {
      resolve = _resolve;
    });
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full">
      <h3 class="text-xl font-semibold text-white mb-4">{title}</h3>
      <p class="text-gray-300 mb-6">{message}</p>
      <div class="flex justify-end space-x-4">
        <Button variant="secondary" on:click={cancel}>
          {cancelText}
        </Button>
        <Button variant={danger ? "destructive" : "default"} on:click={confirm}>
          {confirmText}
        </Button>
      </div>
    </div>
  </div>
{/if}
