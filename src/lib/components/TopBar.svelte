<script lang="ts">
	import Button from './ui/button/button.svelte';
	import { toggleInstructions, toggleFeedback, toggleProjectInfo } from '../stores/uiStore';

	// 处理按钮点击事件
	function handleInstructionsClick() {
		toggleInstructions();
	}

	function handleFeedbackClick() {
		toggleFeedback();
	}

	function handleProjectInfoClick() {
		toggleProjectInfo();
	}
</script>

<header class="bg-blue-100 border-b border-blue-200 px-6 py-3">
	<div class="container mx-auto flex justify-between items-center">
		<div class="text-xl font-bold text-blue-800">
			RBMK - 反应堆模拟器
		</div>
		<div class="flex space-x-4">
			<Button variant="secondary" onClick={handleInstructionsClick}>
				使用说明
			</Button>
			<Button variant="secondary" onClick={handleFeedbackClick}>
				问题反馈
			</Button>
			<Button variant="secondary" onClick={handleProjectInfoClick}>
				项目信息
			</Button>
		</div>
	</div>
</header>
