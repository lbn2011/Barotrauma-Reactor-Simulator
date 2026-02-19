<script lang="ts">
import TopBar from '@/lib/components/TopBar.svelte';
import MainDashboard from './components/MainDashboard.svelte';
</script>

<div class="flex flex-col min-h-screen bg-gray-100">
  <TopBar />
  <main class="flex-1 p-4">
    <MainDashboard />
  </main>
</div>
