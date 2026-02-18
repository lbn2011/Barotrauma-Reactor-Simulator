<script lang="ts">
/**
 * Top Bar Component
 * Displays application title, core control buttons, and theme switching functionality
 */
import { Button } from './ui/button';
import { startSimulation, stopSimulation, resetSimulation } from '../stores/reactorStore';
import { reactorStore } from '../stores/reactorStore';
import { logger } from '../utils/logger';

// Subscribe to state
let isRunning = $state(false);
reactorStore.subscribe((state) => {
  isRunning = state.isRunning;
  logger.debug('TopBar', `Simulation state updated: ${isRunning ? 'running' : 'stopped'}`);
});

// Theme state management
let darkMode = $state(false); // Current theme mode

/**
 * Check user preferences or saved theme settings in local storage
 * Executed during component initialization
 */
$effect(() => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme'); // Get saved theme from local storage
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; // Check system preferred theme

    logger.debug('TopBar', 'Initializing theme settings');

    // Use saved theme setting if available, otherwise use system preference
    if (savedTheme) {
      darkMode = savedTheme === 'dark';
      logger.debug('TopBar', `Loaded saved theme: ${savedTheme}`);
    } else {
      darkMode = prefersDark;
      logger.debug('TopBar', `Using system preferred theme: ${prefersDark ? 'dark' : 'light'}`);
    }

    updateTheme(); // Apply theme settings
  }
});

/**
 * Toggle theme mode
 * Save theme setting to local storage and update interface
 */
function toggleTheme() {
  darkMode = !darkMode; // Toggle theme state
  localStorage.setItem('theme', darkMode ? 'dark' : 'light'); // Save theme setting
  logger.info('TopBar', `Theme toggled to: ${darkMode ? 'dark' : 'light'}`);
  updateTheme(); // Apply theme settings
}

/**
 * Update theme settings
 * Add or remove dark class based on current theme mode
 */
function updateTheme() {
  if (typeof document !== 'undefined') {
    if (darkMode) {
      document.documentElement.classList.add('dark'); // Add dark class to enable dark mode
      logger.debug('TopBar', 'Applied dark theme');
    } else {
      document.documentElement.classList.remove('dark'); // Remove dark class to enable light mode
      logger.debug('TopBar', 'Applied light theme');
    }
  }
}
</script>

<!--
  Top Bar Component

  Features:
  - Displays application title "RBMK-1000 Simulator"
  - Provides theme switching functionality
  - Responsive design
  - Saves user theme preferences

  UI Elements:
  - Left: Application title
  - Right: Theme toggle button

  Technical Implementation:
  - Uses reactive state management ($state)
  - Uses side effects ($effect) for theme initialization
  - Local storage for theme preference persistence
  - System preference detection
  - Conditional rendering of theme icons
-->

<div
  class="top-bar bg-light-background dark:bg-dark-background border-b border-light-border dark:border-dark-border h-16 flex items-center justify-between px-6 z-50"
>
  <div class="top-bar-left flex items-center">
    <h1 class="text-lg font-bold text-light-foreground dark:text-dark-foreground">
      RBMK-1000 Simulator
    </h1>
  </div>

  <div class="top-bar-center flex items-center gap-3">
    {#if !isRunning}
      <Button
        class="bg-light-primary dark:bg-dark-primary hover:bg-light-primary/90 dark:hover:bg-dark-primary/90 text-light-primary-foreground dark:text-dark-primary-foreground"
        on:click={() => {
          logger.info('TopBar', 'Starting simulation');
          startSimulation();
        }}
      >
        Start Simulation
      </Button>
    {:else}
      <Button
        class="bg-light-secondary dark:bg-dark-secondary hover:bg-light-secondary/90 dark:hover:bg-dark-secondary/90 text-light-secondary-foreground dark:text-dark-secondary-foreground"
        on:click={() => {
          logger.info('TopBar', 'Stopping simulation');
          stopSimulation();
        }}
      >
        Stop Simulation
      </Button>
    {/if}
    <Button
      class="bg-light-destructive dark:bg-dark-destructive hover:bg-light-destructive/90 dark:hover:bg-dark-destructive/90 text-light-destructive-foreground dark:text-dark-destructive-foreground"
      on:click={() => {
        logger.info('TopBar', 'Resetting simulation');
        resetSimulation();
      }}
    >
      Reset Simulation
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
        <span class="text-lg">☀️</span> <!-- Light mode icon -->
      {:else}
        <span class="text-lg">🌙</span> <!-- Dark mode icon -->
      {/if}
    </Button>
  </div>
</div>
