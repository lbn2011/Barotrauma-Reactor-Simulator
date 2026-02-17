<script lang="ts">
  /**
   * 图表提示框组件
   * 用于显示图表数据的详细信息
   */
  import { cn, type WithElementRef, type WithoutChildren } from '@/lib/utils';
  import type { HTMLAttributes } from 'svelte/elements';
  import {
    getPayloadConfigFromPayload,
    useChart,
    type TooltipPayload,
  } from './chart-utils.js';
  import { getTooltipContext, Tooltip as TooltipPrimitive } from 'layerchart';
  import type { Snippet } from 'svelte';

  /**
   * 默认标签格式化函数
   * @param value 标签值
   * @param _payload 提示框数据
   * @returns 格式化后的标签
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function defaultFormatter(value: any, _payload: TooltipPayload[]) {
    return `${value}`;
  }

  // 组件属性
  let {
    ref = $bindable(null), // 元素引用
    class: className, // 自定义类名
    hideLabel = false, // 是否隐藏标签
    indicator = 'dot', // 指示器类型
    hideIndicator = false, // 是否隐藏指示器
    labelKey, // 标签键
    label, // 标签文本
    labelFormatter = defaultFormatter, // 标签格式化函数
    labelClassName, // 标签类名
    formatter, // 自定义格式化片段
    nameKey, // 名称键
    color, // 颜色
    ...restProps // 其他HTML属性
  }: WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> & {
    hideLabel?: boolean;
    label?: string;
    indicator?: 'line' | 'dot' | 'dashed';
    nameKey?: string;
    labelKey?: string;
    hideIndicator?: boolean;
    labelClassName?: string;
    labelFormatter?: // eslint-disable-next-line @typescript-eslint/no-explicit-any
      | ((value: any, payload: TooltipPayload[]) => string | number | Snippet)
      | null;
    formatter?: Snippet<
      [
        {
          value: unknown;
          name: string;
          item: TooltipPayload;
          index: number;
          payload: TooltipPayload[];
        },
      ]
    >;
  } = $props();

  // 获取图表上下文
  const chart = useChart();
  const tooltipCtx = getTooltipContext();

  // 格式化标签
  const formattedLabel = $derived.by(() => {
    if (hideLabel || !tooltipCtx.payload?.length) return null;

    const [item] = tooltipCtx.payload;
    const key = labelKey ?? item?.label ?? item?.name ?? 'value';

    const itemConfig = getPayloadConfigFromPayload(chart.config, item, key);

    const value =
      !labelKey && typeof label === 'string'
        ? (chart.config[label as keyof typeof chart.config]?.label ?? label)
        : (itemConfig?.label ?? item.label);

    if (value === undefined) return null;
    if (!labelFormatter) return value;
    return labelFormatter(value, tooltipCtx.payload);
  });

  // 是否嵌套标签
  const nestLabel = $derived(
    tooltipCtx.payload.length === 1 && indicator !== 'dot'
  );
</script>

<!--
  图表提示框组件
  
  功能：
  - 显示图表数据的详细信息
  - 支持自定义标签和格式化
  - 支持不同类型的指示器（点、线、虚线）
  - 支持自定义颜色
  - 响应式布局
  - 支持嵌套标签
  
  界面元素：
  - 提示框容器
  - 标签显示
  - 数据项列表
  - 指示器
  - 数据值
  
  技术实现：
  - 使用 LayerChart 的 TooltipPrimitive
  - 使用 Svelte 5 的新语法 ($props, $bindable, $derived)
  - 条件渲染
  - 自定义格式化函数
  - 动态样式
  - 片段渲染
-->

{#snippet TooltipLabel()}
  {#if formattedLabel}
    <div class={cn('font-medium', labelClassName)}>
      {#if typeof formattedLabel === 'function'}
        {@render formattedLabel()}
      {:else}
        {formattedLabel}
      {/if}
    </div>
  {/if}
{/snippet}

<TooltipPrimitive.Root variant="none">
  <div
    class={cn(
      'border-border/50 bg-background grid min-w-[9rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl',
      className
    )}
    {...restProps}
  >
    {#if !nestLabel}
      {@render TooltipLabel()}
    {/if}
    <div class="grid gap-1.5">
      {#each tooltipCtx.payload as item, i (item.key + i)}
        {@const key = `${nameKey || item.key || item.name || 'value'}`}
        {@const itemConfig = getPayloadConfigFromPayload(
          chart.config,
          item,
          key
        )}
        {@const indicatorColor = color || item.payload?.color || item.color}
        <div
          class={cn(
            '[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-2.5',
            indicator === 'dot' && 'items-center'
          )}
        >
          {#if formatter && item.value !== undefined && item.name}
            {@render formatter({
              value: item.value,
              name: item.name,
              item,
              index: i,
              payload: tooltipCtx.payload,
            })}
          {:else}
            {#if itemConfig?.icon}
              <itemConfig.icon />
            {:else if !hideIndicator}
              <div
                style="--color-bg: {indicatorColor}; --color-border: {indicatorColor};"
                class={cn(
                  'shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)',
                  {
                    'size-2.5': indicator === 'dot',
                    'h-full w-1': indicator === 'line',
                    'w-0 border-[1.5px] border-dashed bg-transparent':
                      indicator === 'dashed',
                    'my-0.5': nestLabel && indicator === 'dashed',
                  }
                )}
              ></div>
            {/if}
            <div
              class={cn(
                'flex flex-1 shrink-0 justify-between leading-none',
                nestLabel ? 'items-end' : 'items-center'
              )}
            >
              <div class="grid gap-1.5">
                {#if nestLabel}
                  {@render TooltipLabel()}
                {/if}
                <span class="text-muted-foreground">
                  {itemConfig?.label || item.name}
                </span>
              </div>
              {#if item.value !== undefined}
                <span
                  class="text-foreground font-mono font-medium tabular-nums"
                >
                  {item.value.toLocaleString()}
                </span>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</TooltipPrimitive.Root>
