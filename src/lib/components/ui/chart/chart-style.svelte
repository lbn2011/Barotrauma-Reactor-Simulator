<script lang="ts">
/**
 * 图表样式组件
 * 用于生成图表的CSS样式
 */
import { THEMES, type ChartConfig } from './chart-utils.js';

// 组件属性
let { id, config }: { id: string; config: ChartConfig } = $props();

// 派生的颜色配置
const colorConfig = $derived(
  config ? Object.entries(config).filter(([, config]) => config.theme || config.color) : null
);

// 派生的主题内容
const themeContents = $derived.by(() => {
  if (!colorConfig || !colorConfig.length) return;

  const themeContents = [];
  for (let [_theme, prefix] of Object.entries(THEMES)) {
    let content = `${prefix} [data-chart=${id}] {\n`;
    const color = colorConfig.map(([key, itemConfig]) => {
      const theme = _theme as keyof typeof itemConfig.theme;
      const color = itemConfig.theme?.[theme] || itemConfig.color;
      return color ? `\t--color-${key}: ${color};` : null;
    });

    content += color.join('\n') + '\n}';

    themeContents.push(content);
  }

  return themeContents.join('\n');
});
</script>

<!--
  图表样式组件

  功能：
  - 根据图表配置生成CSS样式
  - 支持不同主题的颜色配置
  - 为图表元素设置CSS变量
  - 动态生成样式标签

  技术实现：
  - 使用 Svelte 5 的新语法 ($props, $derived)
  - 使用 Object.entries 处理配置对象
  - 生成 CSS 变量
  - 条件渲染样式标签
  - 使用 {#key} 指令确保样式更新
-->

{#if themeContents}
  {#key id}
    <svelte:element this={'style'}>
      {themeContents}
    </svelte:element>
  {/key}
{/if}
