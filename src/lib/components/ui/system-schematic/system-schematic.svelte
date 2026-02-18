<script lang="ts">
import { logger } from '../../../../utils/logger';

/**
 * System Schematic Component
 * Visualizes reactor system nodes and connections
 */

// System node type
/**
 * System node interface
 * @property id Node unique identifier
 * @property name Node name
 * @property type Node type
 * @property position Node position coordinates
 * @property status Node status
 * @property parameters Node parameters
 */
interface SystemNode {
  id: string;
  name: string;
  type:
    | 'reactor'
    | 'turbine'
    | 'condenser'
    | 'deaerator'
    | 'pump'
    | 'valve'
    | 'tank'
    | 'heat_exchanger';
  position: { x: number; y: number };
  status: 'normal' | 'warning' | 'alarm' | 'offline';
  parameters: {
    value: number;
    unit: string;
    min?: number;
    max?: number;
    alarmThreshold?: number;
  };
}

// System connection type
/**
 * System connection interface
 * @property id Connection unique identifier
 * @property sourceId Source node ID
 * @property targetId Target node ID
 * @property type Connection type
 * @property direction Connection direction
 * @property status Connection status
 * @property flowRate Flow rate
 * @property capacity Capacity
 */
interface SystemConnection {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'flow' | 'signal' | 'control';
  direction: 'bidirectional' | 'unidirectional';
  status: 'normal' | 'warning' | 'alarm' | 'offline';
  flowRate?: number;
  capacity?: number;
}

// Component properties
export let nodes: SystemNode[] = []; // System nodes array
export let connections: SystemConnection[] = []; // System connections array
export let width: number = 800; // Schematic width
export let height: number = 600; // Schematic height
export let interactive: boolean = true; // Whether interactive
export let showLabels: boolean = true; // Whether to show labels
export let showParameters: boolean = true; // Whether to show parameters

/**
 * Get color corresponding to node status
 * @param status Node status
 * @returns Corresponding color code
 */
function getNodeStatusColor (status: string) {
  switch (status) {
  case 'normal':
    return '#00ff00'; // Normal status - green
  case 'warning':
    return '#ffa500'; // Warning status - orange
  case 'alarm':
    return '#ff0000'; // Alarm status - red
  case 'offline':
    return '#808080'; // Offline status - gray
  default:
    return '#00ff00';
  }
}

/**
 * Get color corresponding to connection status
 * @param status Connection status
 * @returns Corresponding color code
 */
function getConnectionStatusColor (status: string) {
  switch (status) {
  case 'normal':
    return '#00ff00'; // Normal status - green
  case 'warning':
    return '#ffa500'; // Warning status - orange
  case 'alarm':
    return '#ff0000'; // Alarm status - red
  case 'offline':
    return '#808080'; // Offline status - gray
  default:
    return '#00ff00';
  }
}

/**
 * Get icon corresponding to node type
 * @param type Node type
 * @returns Corresponding icon
 */
function getNodeIcon (type: string) {
  switch (type) {
  case 'reactor':
    return '⚛️'; // Reactor icon
  case 'turbine':
    return '🌀'; // Turbine icon
  case 'condenser':
    return '🔄'; // Condenser icon
  case 'deaerator':
    return '💧'; // Deaerator icon
  case 'pump':
    return '🔋'; // Pump icon
  case 'valve':
    return '🚪'; // Valve icon
  case 'tank':
    return '📦'; // Tank icon
  case 'heat_exchanger':
    return '🔥'; // Heat exchanger icon
  default:
    return '📌'; // Default icon
  }
}

/**
 * Calculate arrow position
 * @param source Source node position
 * @param target Target node position
 * @param nodeRadius Node radius
 * @returns Arrow start and end positions
 */
function calculateArrowPosition (
  source: { x: number; y: number },
  target: { x: number; y: number },
  nodeRadius: number = 30
) {
  const angle = Math.atan2(target.y - source.y, target.x - source.x);

  // Calculate arrow start point (source node edge)
  const sourceX = source.x + Math.cos(angle) * nodeRadius;
  const sourceY = source.y + Math.sin(angle) * nodeRadius;

  // Calculate arrow end point (target node edge)
  const targetX = target.x - Math.cos(angle) * nodeRadius;
  const targetY = target.y - Math.sin(angle) * nodeRadius;

  return { sourceX, sourceY, targetX, targetY };
}

/**
 * Handle node click event
 * @param nodeId Node ID
 */
function handleNodeClick(nodeId: string) {
  logger.info(`System Schematic: Node clicked - ${nodeId}`);
}

// Log component initialization
logger.info('System Schematic component initialized', {
  nodesCount: nodes.length,
  connectionsCount: connections.length,
  width,
  height,
  interactive,
  showLabels,
  showParameters
});
</script>

<!--
  System Schematic Component

  Features:
  - Visualize reactor system nodes and connections
  - Display node status and parameters
  - Support interactive operations
  - Dynamic connection status updates
  - Responsive design

  UI Elements:
  - System nodes (with icons and status colors)
  - Node connections (with arrows and flow information)
  - Node labels
  - Node parameter display
  - Connection labels

  Technical Implementation:
  - SVG for drawing connections and arrows
  - Reactive state management
  - Dynamic style calculation
  - Interactive event handling
  - Conditional rendering
-->

<div class="system-schematic">
  <h3 class="text-lg font-semibold text-white mb-4">System Flow Diagram</h3>

  <div
    class="schematic-container bg-gray-900 border border-gray-700 rounded-lg overflow-hidden"
    style={`width: ${width}px; height: ${height}px; position: relative`}
  >
    <!-- Draw connections -->
    {#each connections as connection (connection.id)}
      {#if nodes.find((n) => n.id === connection.sourceId) && nodes.find((n) => n.id === connection.targetId)}
        {@const sourceNode = nodes.find((n) => n.id === connection.sourceId)!}
        {@const targetNode = nodes.find((n) => n.id === connection.targetId)!}
        {@const arrowPos = calculateArrowPosition(sourceNode.position, targetNode.position)}

        <svg
          style={`position: absolute; top: 0; left: 0; width: ${width}px; height: ${height}px; pointer-events: none; z-index: 1`}
        >
          <line
            x1={arrowPos.sourceX}
            y1={arrowPos.sourceY}
            x2={arrowPos.targetX}
            y2={arrowPos.targetY}
            stroke={getConnectionStatusColor(connection.status)}
            stroke-width="2"
            stroke-dasharray={connection.status === 'offline' ? '5,5' : 'none'}
          />
          <!-- Arrow -->
          <polygon
            points={`${arrowPos.targetX},${arrowPos.targetY} ${arrowPos.targetX - 10 * Math.cos(Math.atan2(targetNode.position.y - sourceNode.position.y, targetNode.position.x - sourceNode.position.x) - Math.PI / 6)},${arrowPos.targetY - 10 * Math.sin(Math.atan2(targetNode.position.y - sourceNode.position.y, targetNode.position.x - sourceNode.position.x) - Math.PI / 6)} ${arrowPos.targetX - 10 * Math.cos(Math.atan2(targetNode.position.y - sourceNode.position.y, targetNode.position.x - sourceNode.position.x) + Math.PI / 6)},${arrowPos.targetY - 10 * Math.sin(Math.atan2(targetNode.position.y - sourceNode.position.y, targetNode.position.x - sourceNode.position.x) + Math.PI / 6)}`}
            fill={getConnectionStatusColor(connection.status)}
          />
        </svg>

        <!-- Connection label -->
        {#if showLabels}
          <div
            style={`position: absolute; left: ${(arrowPos.sourceX + arrowPos.targetX) / 2}px; top: ${(arrowPos.sourceY + arrowPos.targetY) / 2}px; transform: translate(-50%, -50%); background: rgba(0, 0, 0, 0.7); padding: 2px 6px; border-radius: 4px; font-size: 10px; color: white; z-index: 2`}
          >
            {connection.type.toUpperCase()}
            {#if connection.flowRate}
              <br />
              {connection.flowRate.toFixed(1)} kg/s
            {/if}
          </div>
        {/if}
      {/if}
    {/each}

    <!-- Draw nodes -->
    {#each nodes as node (node.id)}
      <div
        class={`system-node cursor-pointer transition-all duration-300 ${interactive ? 'hover:scale-105' : ''}`}
        style={`position: absolute; left: ${node.position.x}px; top: ${node.position.y}px; transform: translate(-50%, -50%); z-index: 3`}
        on:click={() => handleNodeClick(node.id)}
        on:keydown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && interactive) {
            e.preventDefault();
            handleNodeClick(node.id);
          }
        }}
        role="button"
        tabindex={interactive ? 0 : -1}
        aria-label={`System node: ${node.name}`}
      >
        <div
          class="node-circle flex items-center justify-center"
          style={`width: 60px; height: 60px; border-radius: 50%; background: ${getNodeStatusColor(node.status)}; border: 2px solid white`}
        >
          <span style="font-size: 24px">{getNodeIcon(node.type)}</span>
        </div>

        <!-- Node label -->
        {#if showLabels}
          <div
            style="position: absolute; top: 70px; left: 50%; transform: translateX(-50%); text-align: center; font-size: 12px; color: white; white-space: nowrap"
          >
            {node.name}
          </div>
        {/if}

        <!-- Node parameters -->
        {#if showParameters && node.parameters}
          <div
            style="position: absolute; top: -40px; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.7); padding: 4px 8px; border-radius: 4px; font-size: 10px; color: white; white-space: nowrap"
          >
            {node.parameters.value.toFixed(1)}
            {node.parameters.unit}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
