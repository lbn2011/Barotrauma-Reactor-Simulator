<script lang="ts">
/**
 * Confirmation Dialog Component
 * Used to display operation confirmation messages, especially for high-risk operations
 */
import { Button } from '../button';
import { logger } from '@/lib/utils/logger';

// Component properties
export let isOpen = false; // Whether the dialog is open
export let title = 'Confirm Operation'; // Dialog title
export let message = 'Are you sure you want to perform this operation?'; // Dialog message
export let confirmText = 'Confirm'; // Confirm button text
export let cancelText = 'Cancel'; // Cancel button text
export let danger = false; // Whether it's a dangerous operation

// Internal state
let resolve: ((value: boolean) => void) | null = null; // Promise resolve function

/**
 * Confirm operation
 * Resolve Promise to true and close the dialog
 */
function confirm () {
  if (resolve) {
    resolve(true);
    resolve = null;
    logger.info('ConfirmationDialog', `Operation confirmed: ${title}`);
  }
  isOpen = false;
}

/**
 * Cancel operation
 * Resolve Promise to false and close the dialog
 */
function cancel () {
  if (resolve) {
    resolve(false);
    resolve = null;
    logger.info('ConfirmationDialog', `Operation cancelled: ${title}`);
  }
  isOpen = false;
}

/**
 * Open the dialog
 * @returns Promise<boolean> Whether the operation was confirmed
 */
export async function open (): Promise<boolean> {
  isOpen = true;
  logger.debug('ConfirmationDialog', `Dialog opened: ${title}`);
  return new Promise((_resolve) => {
    resolve = _resolve;
  });
}
</script>

<!--
  Confirmation Dialog Component

  Features:
  - Displays operation confirmation messages
  - Supports custom title, message, and button text
  - Supports danger operation styling
  - Returns operation confirmation status
  - Modal dialog effect

  UI Elements:
  - Dialog title
  - Confirmation message
  - Cancel button
  - Confirm button (supports danger styling)

  Technical Implementation:
  - Promise asynchronous processing
  - Modal dialog
  - Responsive design
  - Conditional rendering
  - Event handling
-->

{#if isOpen}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full">
      <h3 class="text-xl font-semibold text-white mb-4">{title}</h3>
      <p class="text-gray-300 mb-6">{message}</p>
      <div class="flex justify-end space-x-4">
        <Button variant="secondary" on:click={cancel}>
          {cancelText}
        </Button>
        <Button variant={danger ? 'destructive' : 'default'} on:click={confirm}>
          {confirmText}
        </Button>
      </div>
    </div>
  </div>
{/if}
