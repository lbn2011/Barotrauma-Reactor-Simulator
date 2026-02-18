<script lang="ts" module>
export interface QuickAction {
  id: string;
  name: string;
  icon: string;
  category: 'startup' | 'shutdown' | 'emergency' | 'routine';
  shortcut: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  usageFrequency: number;
  lastUsedTime: number;
  enabled: boolean;
  action: () => void;
}

export interface QuickActionsProps {
  actions?: QuickAction[];
  layout?: 'grid' | 'list';
  showLabels?: boolean;
}
</script>

<script lang="ts">
import log from '@/lib/utils/logger';

// Use log instead of logger for consistency
const logger = log;

/**
 * Quick Actions Component
 * Displays and executes system quick actions
 */
import { Button } from '../button';
import { ConfirmationDialog } from '../confirmation-dialog';

// Quick action type
/**
 * Quick action interface
 * @property id Action unique identifier
 * @property name Action name
 * @property icon Action icon
 * @property category Action category
 * @property shortcut Shortcut key
 * @property riskLevel Risk level
 * @property usageFrequency Usage frequency
 * @property lastUsedTime Last used time
 * @property enabled Whether enabled
 * @property action Action function
 */
interface QuickAction {
  id: string;
  name: string;
  icon: string;
  category: 'startup' | 'shutdown' | 'emergency' | 'routine';
  shortcut: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  usageFrequency: number;
  lastUsedTime: number;
  enabled: boolean;
  action: () => void;
}

// Quick action configuration
export let actions: QuickAction[] = []; // Quick actions array
export let layout: 'grid' | 'list' = 'grid'; // Layout type
export let showLabels: boolean = true; // Whether to show labels

// Confirmation dialog
let confirmationDialog: any; // Confirmation dialog instance

/**
 * Execute action
 * @param action Action to execute
 */
async function executeAction (action: QuickAction) {
  logger.info(`Quick Actions: Executing action - ${action.name} (${action.id})`, {
    category: action.category,
    riskLevel: action.riskLevel,
    shortcut: action.shortcut,
  });

  // For high-risk actions, show confirmation dialog
  if (action.riskLevel === 'high' || action.riskLevel === 'critical') {
    logger.warn(
      `Quick Actions: High-risk action detected - ${action.name}, requiring confirmation`,
      {
        riskLevel: action.riskLevel,
      }
    );

    const confirmed = await confirmationDialog.open();
    if (!confirmed) {
      logger.info(`Quick Actions: Action cancelled by user - ${action.name}`);
      return;
    }

    logger.info(`Quick Actions: Action confirmed by user - ${action.name}`);
  }

  try {
    // Execute action
    action.action();

    // Update usage frequency and last used time
    action.usageFrequency++;
    action.lastUsedTime = Date.now();

    logger.info(`Quick Actions: Action executed successfully - ${action.name}`, {
      newUsageFrequency: action.usageFrequency,
      lastUsedTime: action.lastUsedTime,
    });
  } catch (error) {
    logger.error(`Quick Actions: Error executing action - ${action.name}`, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Get color corresponding to risk level
 * @param riskLevel Risk level
 * @returns Corresponding color class name
 */
function getRiskColor (riskLevel: string) {
  switch (riskLevel) {
  case 'critical':
    return 'bg-red-600'; // Critical risk - red
  case 'high':
    return 'bg-orange-500'; // High risk - orange
  case 'medium':
    return 'bg-yellow-500'; // Medium risk - yellow
  case 'low':
    return 'bg-green-500'; // Low risk - green
  default:
    return 'bg-gray-500'; // Default - gray
  }
}

// Log component initialization
logger.info('Quick Actions component initialized', {
  actionsCount: actions.length,
  layout,
  showLabels,
});
</script>

<!--
  Quick Actions Component

  Features:
  - Displays system quick actions
  - Supports grid and list layouts
  - Shows different colors by risk level
  - Confirms high-risk actions
  - Tracks action usage frequency and last used time
  - Supports enabling/disabling actions

  UI Elements:
  - Action buttons (with icons and labels)
  - Risk level indicators
  - Shortcut key display
  - Confirmation dialog (for high-risk actions)

  Technical Implementation:
  - Responsive layout
  - Conditional rendering
  - Asynchronous action execution
  - Risk level management
  - Action statistics tracking
-->

<div class="quick-actions">
  <h3 class="text-lg font-semibold text-white mb-4">Quick Actions</h3>

  <div
    class={`${layout === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3' : 'flex flex-col gap-2'}`}
  >
    {#each actions.filter((a) => a.enabled) as action (action.id)}
      <Button
        variant="default"
        class={`${layout === 'grid' ? 'flex flex-col items-center justify-center p-4' : 'flex items-center justify-start p-3'}`}
        on:click={() => executeAction(action)}
      >
        <div
          class={`w-8 h-8 rounded-full ${getRiskColor(action.riskLevel)} flex items-center justify-center mb-2 ${layout === 'grid' ? '' : 'mr-3'}`}
        >
          <span class="text-white font-bold">{action.icon}</span>
        </div>
        {#if showLabels}
          <span class={`text-sm ${layout === 'grid' ? 'text-center' : ''}`}>{action.name}</span>
          <span class="text-xs text-gray-400 mt-1">{action.shortcut}</span>
        {/if}
      </Button>
    {/each}
  </div>

  <ConfirmationDialog bind:this={confirmationDialog} />
</div>
