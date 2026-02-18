<script lang="ts">
// 导入反应堆状态管理
import { reactorStore } from '../../lib/stores/reactorStore';
import { onMount } from 'svelte';
import log from '@/lib/utils/logger';

// Component initialization logs
log.info('AlarmCRTPanel component initialized');

// 警报数据
let alarms: any;

// 组件挂载时订阅状态
onMount(() => {
  log.debug('AlarmCRTPanel mounting, subscribing to reactor store');

  const unsubscribe = reactorStore.subscribe((state) => {
    log.trace('AlarmCRTPanel state updated', { alarms: state.alarms });
    alarms = state.alarms;
  });

  log.debug('AlarmCRTPanel mounted successfully');
  return unsubscribe;
});
</script>

<!--
  警报CRT面板组件

  功能：
  - 显示反应堆系统的警报信息
  - 实时监控警报状态
  - 提供警报历史记录
  - 视觉化警报严重性

  界面元素：
  - 警报状态指示器
  - 活跃警报计数
  - 警报消息列表
  - CRT风格的视觉效果

  状态管理：
  - 从reactorStore订阅alarms状态
  - 实时更新警报信息
-->

<style>
.panel {
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #00bcd4;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
}

.alarm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.alarm-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-indicator {
  font-size: 1rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 12px;
}

.status-indicator.active {
  background-color: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.status-indicator.inactive {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.alarm-count {
  font-size: 1rem;
  color: #9e9e9e;
}

.alarm-list {
  background-color: #2d2d2d;
  border-radius: 8px;
  padding: 1.5rem;
  max-height: 500px;
  overflow-y: auto;
}

.alarm-item {
  background-color: #333;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid #f44336;
}

.alarm-item:last-child {
  margin-bottom: 0;
}

.alarm-message {
  font-size: 1rem;
  font-weight: 500;
  color: #e0e0e0;
  margin-bottom: 0.5rem;
}

.alarm-time {
  font-size: 0.8rem;
  color: #9e9e9e;
}

.no-alarms {
  text-align: center;
  padding: 4rem 2rem;
  color: #9e9e9e;
  font-size: 1.1rem;
}

.crt-border {
  border: 2px solid #333;
  border-radius: 8px;
  padding: 1rem;
  background-color: #252525;
}

.crt-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #f44336;
  text-align: center;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 10px rgba(244, 67, 54, 0.5);
}
</style>

<div class="panel">
  <h1 class="panel-title">20. 警报CRT</h1>

  <div class="crt-border">
    <h2 class="crt-title">反应堆警报系统</h2>

    <div class="alarm-header">
      <div class="alarm-status">
        <span
          class="status-indicator"
          class:active={alarms?.active}
          class:inactive={!alarms?.active}
        >
          {alarms?.active ? '警报激活' : '无警报'}
        </span>
      </div>
      <div class="alarm-count">
        活跃警报: {alarms?.messages?.length || 0}
      </div>
    </div>

    <div class="alarm-list">
      {#if alarms?.messages?.length > 0}
        {#each alarms.messages as message, i (i)}
          <div class="alarm-item">
            <div class="alarm-message">{message}</div>
            <div class="alarm-time">{new Date().toLocaleTimeString()}</div>
          </div>
        {/each}
      {:else}
        <div class="no-alarms">无活跃警报</div>
      {/if}
    </div>
  </div>
</div>
