<script lang="ts">
	import Button from '../../lib/components/ui/button/button.svelte';

	// 组件属性
	export let isRunning: boolean;

	// 事件回调
	export let onStart: () => void;
	export let onReset: () => void;
</script>

<div class="flex flex-col sm:flex-row gap-4 p-4">
	<Button
		variant={isRunning ? 'destructive' : 'default'}
		size="lg"
		class="flex-1 sm:flex-none sm:px-8 py-3 text-lg"
		onClick={onStart}
	>
		{isRunning ? '停止' : '开始'}
	</Button>
	
	<Button
		variant="secondary"
		size="lg"
		class="flex-1 sm:flex-none sm:px-8 py-3 text-lg"
		onClick={onReset}
	>
		重置
	</Button>
</div>
