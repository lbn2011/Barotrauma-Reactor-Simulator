<script lang="ts">
  import {
  reactorStore,
} from '../../lib/stores/reactorStore';
  import { onMount } from 'svelte';

  let crtDiagram: any;

  // 订阅状态
  onMount(() => {
    const unsubscribe = reactorStore.subscribe((state) => {
      crtDiagram = state.crtDiagram;
    });

    return unsubscribe;
  });
</script>

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

  .crt-container {
    background-color: #252525;
    border: 2px solid #333;
    border-radius: 8px;
    padding: 2rem;
  }

  .crt-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .crt-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #00bcd4;
    margin-bottom: 1rem;
  }

  .reactor-status {
    font-size: 1.5rem;
    font-weight: 600;
    color: #4caf50;
  }

  .system-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .system-card {
    background-color: #2d2d2d;
    padding: 1.5rem;
    border-radius: 6px;
    border-left: 4px solid #00bcd4;
  }

  .system-card-title {
    font-size: 1rem;
    font-weight: 600;
    color: #e0e0e0;
    margin-bottom: 1rem;
  }

  .system-status {
    font-size: 1.2rem;
    font-weight: 600;
    color: #4caf50;
  }

  .status-indicator {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 0.5rem;
  }

  .status-indicator.online {
    background-color: #4caf50;
  }

  .status-indicator.offline {
    background-color: #f44336;
  }

  .diagram-section {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid #333;
  }

  .diagram-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #00bcd4;
    margin-bottom: 1.5rem;
  }

  .diagram-placeholder {
    background-color: #2d2d2d;
    border-radius: 6px;
    padding: 4rem;
    text-align: center;
    color: #9e9e9e;
    font-size: 1.1rem;
  }
</style>

<div class="panel">
  <h1 class="panel-title">21. CRT示意图</h1>

  <div class="crt-container">
    <div class="crt-header">
      <h2 class="crt-title">RBMK-1000 反应堆状态示意图</h2>
      <div class="reactor-status">
        {crtDiagram?.reactorStatus || 'NORMAL'}
      </div>
    </div>

    <div class="system-grid">
      <div class="system-card">
        <h3 class="system-card-title">反应堆系统</h3>
        <div class="system-status">
          <span
            class="status-indicator"
            class:online={crtDiagram?.systemStatus?.reactor === 'ONLINE'}
            class:offline={crtDiagram?.systemStatus?.reactor !== 'ONLINE'}
          ></span>
          {crtDiagram?.systemStatus?.reactor || 'OFFLINE'}
        </div>
      </div>

      <div class="system-card">
        <h3 class="system-card-title">汽轮机系统</h3>
        <div class="system-status">
          <span
            class="status-indicator"
            class:online={crtDiagram?.systemStatus?.turbine === 'ONLINE'}
            class:offline={crtDiagram?.systemStatus?.turbine !== 'ONLINE'}
          ></span>
          {crtDiagram?.systemStatus?.turbine || 'OFFLINE'}
        </div>
      </div>

      <div class="system-card">
        <h3 class="system-card-title">冷却系统</h3>
        <div class="system-status">
          <span
            class="status-indicator"
            class:online={crtDiagram?.systemStatus?.cooling === 'ONLINE'}
            class:offline={crtDiagram?.systemStatus?.cooling !== 'ONLINE'}
          ></span>
          {crtDiagram?.systemStatus?.cooling || 'OFFLINE'}
        </div>
      </div>

      <div class="system-card">
        <h3 class="system-card-title">电气系统</h3>
        <div class="system-status">
          <span
            class="status-indicator"
            class:online={crtDiagram?.systemStatus?.electrical === 'ONLINE'}
            class:offline={crtDiagram?.systemStatus?.electrical !== 'ONLINE'}
          ></span>
          {crtDiagram?.systemStatus?.electrical || 'OFFLINE'}
        </div>
      </div>
    </div>

    <div class="diagram-section">
      <h3 class="diagram-title">系统连接示意图</h3>
      <div class="diagram-placeholder">
        反应堆系统连接示意图
        <br />
        <small>显示反应堆各系统之间的连接关系和流向</small>
      </div>
    </div>
  </div>
</div>
