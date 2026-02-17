<script lang="ts">
  /**
   * 顶部导航栏组件
   * 显示应用标题、核心控制按钮和主题切换功能
   */
  import { Button } from '../components/ui/button';
  import { startSimulation, stopSimulation, resetSimulation } from '../stores/reactorStore';
  import { reactorStore } from '../stores/reactorStore';

  // 订阅状态
  let isRunning = $state(false);
  const unsubscribe = reactorStore.subscribe((state) => {
    isRunning = state.isRunning;
  });

  // 主题状态管理
  let darkMode = $state(false); // 当前主题模式

  /**
   * 检查用户首选项或本地存储中的主题设置
   * 在组件初始化时执行
   */
  $effect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme'); // 从本地存储获取保存的主题
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches; // 检查系统偏好的主题

      // 优先使用本地存储的主题设置，否则使用系统偏好
      if (savedTheme) {
        darkMode = savedTheme === 'dark';
      } else {
        darkMode = prefersDark;
      }

      updateTheme(); // 应用主题设置
    }
  });

  /**
   * 切换主题模式
   * 保存主题设置到本地存储并更新界面
   */
  function toggleTheme() {
    darkMode = !darkMode; // 切换主题状态
    localStorage.setItem('theme', darkMode ? 'dark' : 'light'); // 保存主题设置
    updateTheme(); // 应用主题设置
  }

  /**
   * 更新主题设置
   * 根据当前主题模式添加或移除dark类
   */
  function updateTheme() {
    if (typeof document !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark'); // 添加dark类启用深色模式
      } else {
        document.documentElement.classList.remove('dark'); // 移除dark类启用浅色模式
      }
    }
  }
</script>

<!--
  顶部导航栏组件
  
  功能：
  - 显示应用标题 "RBMK-1000模拟器"
  - 提供主题切换功能
  - 响应式设计
  - 保存用户主题偏好
  
  界面元素：
  - 左侧：应用标题
  - 右侧：主题切换按钮
  
  技术实现：
  - 使用响应式状态管理 ($state)
  - 使用副作用 ($effect) 初始化主题
  - 本地存储保存主题偏好
  - 系统偏好检测
  - 条件渲染主题图标
-->

<div
  class="top-bar bg-light-background dark:bg-dark-background border-b border-light-border dark:border-dark-border h-16 flex items-center justify-between px-6 z-50"
>
  <div class="top-bar-left flex items-center">
    <h1 class="text-lg font-bold text-light-foreground dark:text-dark-foreground">RBMK-1000模拟器</h1>
  </div>

  <div class="top-bar-center flex items-center gap-3">
    {#if !isRunning}
      <Button
        class="bg-light-primary dark:bg-dark-primary hover:bg-light-primary/90 dark:hover:bg-dark-primary/90 text-light-primary-foreground dark:text-dark-primary-foreground"
        on:click={startSimulation}
      >
        启动模拟
      </Button>
    {:else}
      <Button
        class="bg-light-secondary dark:bg-dark-secondary hover:bg-light-secondary/90 dark:hover:bg-dark-secondary/90 text-light-secondary-foreground dark:text-dark-secondary-foreground"
        on:click={stopSimulation}
      >
        停止模拟
      </Button>
    {/if}
    <Button
      class="bg-light-destructive dark:bg-dark-destructive hover:bg-light-destructive/90 dark:hover:bg-dark-destructive/90 text-light-destructive-foreground dark:text-dark-destructive-foreground"
      on:click={resetSimulation}
    >
      重置模拟
    </Button>
  </div>

  <div class="top-bar-right flex items-center gap-4">
    <Button
      variant="ghost"
      size="sm"
      class="p-2 text-light-foreground dark:text-dark-foreground hover:bg-light-accent dark:hover:bg-dark-accent"
      on:click={toggleTheme}
      aria-label="Toggle theme"
    >
      {#if darkMode}
        <span class="text-lg">☀️</span> <!-- 浅色模式图标 -->
      {:else}
        <span class="text-lg">🌙</span> <!-- 深色模式图标 -->
      {/if}
    </Button>
  </div>
</div>
