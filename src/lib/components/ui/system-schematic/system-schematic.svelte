<script lang="ts">
  // 系统节点类型
  interface SystemNode {
    id: string;
    name: string;
    type: 'reactor' | 'turbine' | 'condenser' | 'deaerator' | 'pump' | 'valve' | 'tank' | 'heat_exchanger';
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

  // 系统连接类型
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

  // 系统状态类型
  interface SystemSchematicProps {
    nodes: SystemNode[];
    connections: SystemConnection[];
    width?: number;
    height?: number;
    interactive?: boolean;
    showLabels?: boolean;
    showParameters?: boolean;
  }

  export let nodes: SystemNode[] = [];
  export let connections: SystemConnection[] = [];
  export let width: number = 800;
  export let height: number = 600;
  export let interactive: boolean = true;
  export let showLabels: boolean = true;
  export let showParameters: boolean = true;

  // 获取节点状态对应的颜色
  function getNodeStatusColor(status: string) {
    switch (status) {
      case 'normal':
        return '#00ff00';
      case 'warning':
        return '#ffa500';
      case 'alarm':
        return '#ff0000';
      case 'offline':
        return '#808080';
      default:
        return '#00ff00';
    }
  }

  // 获取连接状态对应的颜色
  function getConnectionStatusColor(status: string) {
    switch (status) {
      case 'normal':
        return '#00ff00';
      case 'warning':
        return '#ffa500';
      case 'alarm':
        return '#ff0000';
      case 'offline':
        return '#808080';
      default:
        return '#00ff00';
    }
  }

  // 获取节点类型对应的图标
  function getNodeIcon(type: string) {
    switch (type) {
      case 'reactor':
        return '⚛️';
      case 'turbine':
        return '🌀';
      case 'condenser':
        return '🔄';
      case 'deaerator':
        return '💧';
      case 'pump':
        return '🔋';
      case 'valve':
        return '🚪';
      case 'tank':
        return '📦';
      case 'heat_exchanger':
        return '🔥';
      default:
        return '📌';
    }
  }

  // 计算两点之间的距离
  function calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  // 计算箭头位置
  function calculateArrowPosition(
    source: { x: number; y: number },
    target: { x: number; y: number },
    nodeRadius: number = 30
  ) {
    const distance = calculateDistance(source, target);
    const angle = Math.atan2(target.y - source.y, target.x - source.x);

    const sourceX = source.x + Math.cos(angle) * nodeRadius;
    const sourceY = source.y + Math.sin(angle) * nodeRadius;

    const targetX = target.x - Math.cos(angle) * nodeRadius;
    const targetY = target.y - Math.sin(angle) * nodeRadius;

    return { sourceX, sourceY, targetX, targetY };
  }
</script>

<div class="system-schematic">
  <h3 class="text-lg font-semibold text-white mb-4">系统流程图</h3>
  
  <div
    class="schematic-container bg-gray-900 border border-gray-700 rounded-lg overflow-hidden"
    style={`width: ${width}px; height: ${height}px; position: relative`}
  >
    <!-- 绘制连接线 -->
    {#each connections as connection}
      {#if nodes.find(n => n.id === connection.sourceId) && nodes.find(n => n.id === connection.targetId)}
        {@const sourceNode = nodes.find(n => n.id === connection.sourceId)!}
        {@const targetNode = nodes.find(n => n.id === connection.targetId)!}
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
          <!-- 箭头 -->
          <polygon
            points={`${arrowPos.targetX},${arrowPos.targetY} ${arrowPos.targetX - 10 * Math.cos(Math.atan2(targetNode.position.y - sourceNode.position.y, targetNode.position.x - sourceNode.position.x) - Math.PI / 6)},${arrowPos.targetY - 10 * Math.sin(Math.atan2(targetNode.position.y - sourceNode.position.y, targetNode.position.x - sourceNode.position.x) - Math.PI / 6)} ${arrowPos.targetX - 10 * Math.cos(Math.atan2(targetNode.position.y - sourceNode.position.y, targetNode.position.x - sourceNode.position.x) + Math.PI / 6)},${arrowPos.targetY - 10 * Math.sin(Math.atan2(targetNode.position.y - sourceNode.position.y, targetNode.position.x - sourceNode.position.x) + Math.PI / 6)}`}
            fill={getConnectionStatusColor(connection.status)}
          />
        </svg>

        <!-- 连接标签 -->
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

    <!-- 绘制节点 -->
    {#each nodes as node}
      <div
        class={`system-node cursor-pointer transition-all duration-300 ${interactive ? 'hover:scale-105' : ''}`}
        style={`position: absolute; left: ${node.position.x}px; top: ${node.position.y}px; transform: translate(-50%, -50%); z-index: 3`}
        on:click={() => console.log('Node clicked:', node.id)}
        on:keydown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && interactive) {
            e.preventDefault();
            console.log('Node clicked:', node.id);
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

        <!-- 节点标签 -->
        {#if showLabels}
          <div
            style={`position: absolute; top: 70px; left: 50%; transform: translateX(-50%); text-align: center; font-size: 12px; color: white; white-space: nowrap`}
          >
            {node.name}
          </div>
        {/if}

        <!-- 节点参数 -->
        {#if showParameters && node.parameters}
          <div
            style={`position: absolute; top: -40px; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.7); padding: 4px 8px; border-radius: 4px; font-size: 10px; color: white; white-space: nowrap`}
          >
            {node.parameters.value.toFixed(1)} {node.parameters.unit}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
