<script lang="ts">
  import { Button } from '../components/ui/button';

  let darkMode = $state(false);

  // 检查用户首选项或本地存储中的主题设置
  $effect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;

      if (savedTheme) {
        darkMode = savedTheme === 'dark';
      } else {
        darkMode = prefersDark;
      }

      updateTheme();
    }
  });

  function toggleTheme() {
    darkMode = !darkMode;
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    updateTheme();
  }

  function updateTheme() {
    if (typeof document !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
</script>

<div
  class="top-bar bg-background border-b border-border h-16 flex items-center justify-between px-6 z-50"
>
  <div class="top-bar-left flex items-center">
    <h1 class="text-xl font-bold text-foreground">RBMK-1000模拟器</h1>
  </div>

  <div class="top-bar-right flex items-center gap-4">
    <Button
      variant="ghost"
      size="sm"
      class="p-2"
      on:click={toggleTheme}
      aria-label="Toggle theme"
    >
      {#if darkMode}
        <span class="text-lg">☀️</span>
      {:else}
        <span class="text-lg">🌙</span>
      {/if}
    </Button>
  </div>
</div>
