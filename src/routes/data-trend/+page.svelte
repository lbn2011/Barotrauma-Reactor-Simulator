<script lang="ts">
	import DataTrendChart from '../components/DataTrendChart.svelte';
</script>

<div class="container mx-auto p-4">
	<h1 class="text-2xl font-bold mb-6 text-center">数据趋势图</h1>
	
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<div class="bg-white rounded-lg shadow-md p-4">
			<DataTrendChart type="temperature" title="温度趋势图" />
		</div>
		
		<div class="bg-white rounded-lg shadow-md p-4">
			<DataTrendChart type="turbine" title="涡轮输出趋势图" />
		</div>
	</div>
</div>
