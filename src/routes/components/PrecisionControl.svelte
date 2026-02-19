<script lang="ts">
	import { simulationController, type PrecisionLevel } from '../../lib/controllers/SimulationController';
	import log from '../../lib/utils/logger';

	// 组件状态
	let selectedLevel: PrecisionLevel = simulationController.precisionLevel;
	let precisionConfigs = simulationController.getPrecisionConfigs();

	// 处理精度级别变化
	function handlePrecisionChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const newLevel = target.value as PrecisionLevel;
		log.info(`Changing precision level to ${newLevel}`);
		selectedLevel = newLevel;
		simulationController.setPrecisionLevel(newLevel);
		log.success(`Precision level changed to ${newLevel}`);
	}

	// 获取当前精度配置
	function getCurrentConfig() {
		return precisionConfigs.find(config => config.level === selectedLevel) || precisionConfigs[1];
	}
</script>

<div class="bg-white rounded-lg shadow-md p-4">
	<div class="flex flex-col gap-4">
		<div>
			<label for="precision-select" class="block text-sm font-medium text-gray-700 mb-2">模拟精度调节</label>
			<select
				id="precision-select"
				class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
				value={selectedLevel}
				on:change={handlePrecisionChange}
			>
				<option value="low">低精度 (快速)</option>
				<option value="medium">中等精度 (平衡)</option>
				<option value="high">高精度 (准确)</option>
				<option value="very-high">极高精度 (非常准确)</option>
			</select>
		</div>

		<div class="bg-gray-50 p-3 rounded-md">
			<h4 class="font-medium text-gray-800 mb-2">当前精度配置</h4>
			{#if getCurrentConfig()}
				<div class="space-y-1 text-sm">
					<p class="text-gray-600">{getCurrentConfig().description}</p>
					<p class="text-gray-600">迭代次数: {getCurrentConfig().iterationCount}</p>
					<p class="text-gray-600">时间步长: {getCurrentConfig().timeStep}s</p>
					<p class="text-gray-600">采样率: {getCurrentConfig().samplingRate}Hz</p>
					<p class="text-gray-600">性能影响: {getCurrentConfig().performanceImpact}</p>
				</div>
			{/if}
		</div>

		<div class="flex items-center gap-2">
			<div class="flex-1 bg-gray-200 rounded-full h-2.5">
				{#if getCurrentConfig().level === 'low'}
					<div class="bg-green-500 h-2.5 rounded-full" style="width: 25%"></div>
				{:else if getCurrentConfig().level === 'medium'}
					<div class="bg-blue-500 h-2.5 rounded-full" style="width: 50%"></div>
				{:else if getCurrentConfig().level === 'high'}
					<div class="bg-purple-500 h-2.5 rounded-full" style="width: 75%"></div>
				{:else if getCurrentConfig().level === 'very-high'}
					<div class="bg-red-500 h-2.5 rounded-full" style="width: 100%"></div>
				{/if}
			</div>
			<span class="text-xs text-gray-500 whitespace-nowrap">
				{getCurrentConfig()?.level}
			</span>
		</div>
	</div>
</div>
