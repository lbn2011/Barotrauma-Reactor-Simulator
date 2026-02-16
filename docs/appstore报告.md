## 1. TodayCard 组件 - 毛玻璃保护层

TodayCard组件实现了经典的毛玻璃效果，用于保护文本内容的可读性。

### 组件代码

```svelte
<script lang="ts">
  import type { TodayCard } from '@jet-app/app-store/api/models';

  import Artwork, { type Profile, getNaturalProfile } from '~/components/Artwork.svelte';
  import LineClamp from '@amp/web-app-components/src/components/LineClamp/LineClamp.svelte';
  import { sanitizeHtml } from '@amp/web-app-components/src/utils/sanitize-html';
  import TodayCardMedia from '~/components/jet/today-card/TodayCardMedia.svelte';
  import TodayCardOverlay from '~/components/jet/today-card/TodayCardOverlay.svelte';
  import { isTodayCardMediaList } from '~/components/jet/today-card/media/TodayCardMediaList.svelte';
  import LinkWrapper from '~/components/LinkWrapper.svelte';

  import { colorAsString } from '~/utils/color';
  import { bestBackgroundColor } from './background-color-utils';

  export let card: TodayCard;

  /**
   * When set to `true`, this component will not enable the `clickAction` provided by the
   * `card`
   *
   * This can be useful on the "story" page, where the card will link back to the page
   * currently being viewed
   */
  export let suppressClickAction: boolean = false;

  /**
   * A `Profile` to override the default for the card's media
   */
  export let artworkProfile: Profile | undefined = undefined;

  let useProtectionLayer: boolean;
  let useBlurryProtectionLayer: boolean;
  let useGradientProtectionLayer: boolean;
  let useListStyle: boolean;
  let accentColor: string;

  $: ({
    heading,
    title,
    inlineDescription,
    titleArtwork,
    overlay,
    media,
    editorialDisplayOptions,
    style = 'light',
    clickAction,
  } = card);
  $: action = suppressClickAction ? undefined : clickAction;

  $: {
    const isAppEvent = media?.kind === 'appEvent';
    const isList = !!media && isTodayCardMediaList(media);

    useListStyle = isList;
    useProtectionLayer =
      editorialDisplayOptions?.useTextProtectionColor ||
      editorialDisplayOptions?.useMaterialBlur ||
      false;
    useBlurryProtectionLayer = useProtectionLayer && !isAppEvent && !isList;
    useGradientProtectionLayer = useProtectionLayer && isAppEvent;
    accentColor = colorAsString(bestBackgroundColor(card.media));
  }
</script>

<style lang="scss">
  @property --gradient-color {
    syntax: '<color>';
    inherits: true;
    initial-value: #000;
  }

  .today-card {
    --today-card-gutter: 16px;
    --today-card-border-radius: var(--border-radius, var(--global-border-radius-large));
    --protection-layer-bottom-offset: 0px;
    --gradient-color: var(--today-card-accent-color);
    background-color: var(--today-card-accent-color);
    position: relative;
    display: flex;
    align-items: end;
    height: 100%;
    overflow: hidden;
    color: var(--today-card-text-color);
    container-type: size;
    container-name: today-card;
    border-radius: var(--today-card-border-radius);
    box-shadow: var(--shadow-small);
  }

  .today-card.with-overlay {
    --protection-layer-bottom-offset: 80px;
  }

  .today-card.light,
  .today-card.dark {
    --today-card-text-color: rgb(255, 255, 255);
    --today-card-text-accent-color: rgba(255, 255, 255, 0.56);
    --today-card-text-accent-blend-mode: plus-lighter;
    --today-card-background-tint-color: rgba(0, 0, 0, 0.18);
  }

  .today-card.white {
    --today-card-text-color: var(--systemPrimary-onLight);
    --today-card-text-accent-color: rgba(0, 0, 0, 0.56);
    --today-card-background-tint-color: rgba(255, 255, 255, 0.33);
    --today-card-text-accent-blend-mode: revert;
  }

  .today-card :global(.artwork-component) {
    z-index: unset;
  }

  .wrapper {
    position: absolute;
    display: flex;
    width: 100%;
    height: 100%;
  }

  .content-container {
    position: relative;
  }

  .information-layer {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: end;
    align-self: flex-end;
    width: 100%;
    height: 100%;
    border-radius: var(--today-card-border-radius);
    overflow: hidden;
  }

  .information-layer > :global(a) {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    justify-content: end;
  }

  .information-layer.with-gradient {
    // A smooth bottom-to-top gradient with an intermediate stop at 60% of the accent color's
    // opacity to ease the hard transition.
    --gradient-color-end-position: 22%;
    --gradient-fade-end-position: 50%;
    background: linear-gradient(
      0deg,
      var(--gradient-color) var(--gradient-color-end-position),
      color-mix(in srgb, var(--gradient-color) 60%, transparent)
        calc((var(--gradient-color-end-position) + var(--gradient-fade-end-position)) / 2),
      transparent var(--gradient-fade-end-position)
    );
    transition:
      --accent-color-end 500ms ease-out,
      --fade-end 350ms ease-out,
      --gradient-color 350ms ease-out;
  }

  .information-layer.with-gradient.with-action:has(> a:hover) {
    // Darkens the color used in the gradient on hover
    --gradient-color: color-mix(in srgb, var(--today-card-accent-color) 93%, black);
  }

  @container today-card (aspect-ratio >= 16/9) {
    .information-layer.with-gradient {
      --accent-color-end: 30%;
    }
  }

  .protection-layer {
    --brightness: 0.95;
    position: absolute;
    width: 100%;
    // On cards with overlays (app lockups at the bottom), we increase the height of the
    // protection layer and shift it downward the same amount, so it is aligned to bottom
    // of the overlay.
    height: calc(100% + var(--protection-layer-bottom-offset) + 60px);
    bottom: calc(-1 * var(--protection-layer-bottom-offset));
    background: var(--today-card-background-tint-color);
    backdrop-filter: blur(34px) brightness(var(--brightness)) saturate(1.6) contrast(1.1);
    mask-image: linear-gradient(
      to top,
      black 30%,
      rgba(0, 0, 0, 0.75) 70%,
      rgba(0, 0, 0, 0.4) 86%,
      transparent 100%
    );
    transition: backdrop-filter 210ms ease-in;
  }

  .information-layer:has(> a:hover) .protection-layer {
    --brightness: 0.88;
  }

  .badge {
    font: var(--callout-emphasized);
    margin-bottom: 4px;
    mix-blend-mode: var(--today-card-text-accent-blend-mode);
    color: var(--today-card-text-accent-color);
  }

  .title-container {
    width: auto;
    position: relative;
    padding: 0 var(--today-card-gutter) var(--today-card-gutter);
  }

  @container today-card (orientation: landscape) {
    .title-artwork-container {
      width: 33%;
      min-width: 200px;
      max-width: 300px;
      padding-bottom: 8px;
    }
  }

  @container today-card (orientation: portrait) {
    .title-artwork-container {
      max-width: 75%;
      padding-bottom: 8px;
    }
  }

  .title {
    font: var(--header-emphasized);
    color: var(--today-card-text-color);
    text-wrap: pretty;
  }

  .description {
    font: var(--body);
    padding-top: calc(var(--today-card-gutter) / 2);
    mix-blend-mode: var(--today-card-text-accent-blend-mode);
    color: var(--today-card-text-accent-color);
    text-wrap: pretty;
    z-index: 1;
    position: relative;
  }

  .overlay {
    z-index: 1;
    position: relative;
    padding: var(--today-card-gutter);
  }

  .overlay.blur-only {
    backdrop-filter: blur(50px);
  }

  .overlay.light {
    background-image: linear-gradient(rgba(225, 225, 225, 0.15) 0 0);
  }

  .overlay.dark {
    background-image: linear-gradient(rgba(0, 0, 0, 0.15) 0 0);
  }

  .list {
    background: var(--systemPrimary-onDark);
    padding: var(--today-card-gutter) 0;
    width: 100%;
    flex-direction: column;

    @media (prefers-color-scheme: dark) {
      --title-color: var(--systemPrimary);
      background: var(--systemQuaternary);

      .title {
        --today-card-text-color: var(--systemPrimary);
      }

      .badge {
        --today-card-text-accent-color: var(--systemSecondary);
      }
    }
  }

  .list .wrapper {
    position: relative;
    height: auto;
    width: 100%;
  }

  .list .information-layer {
    padding-top: 0;
  }
</style>

<!--
    We don't wrap the entire card with an action if there is an `overlay`, since the overlay has
    it's own link / action (and we don't want nesting `a` tags, of course).
-->
<LinkWrapper action={overlay || useListStyle ? null : action}>
  <div
    class="today-card"
    class:light={style === 'light'}
    class:dark={style === 'dark'}
    class:white={style === 'white'}
    class:list={useListStyle}
    class:with-overlay={overlay}
    style:--today-card-accent-color={accentColor}
  >
    {#if media && !useListStyle}
      <TodayCardMedia {media} {artworkProfile} />
    {/if}

    <div class="wrapper">
      <div
        class="information-layer"
        class:with-gradient={useGradientProtectionLayer}
        class:with-action={!!action}
      >
        <LinkWrapper action={useListStyle ? null : action}>
          <div class="content-container">
            {#if useBlurryProtectionLayer}
              <div class="protection-layer" />
            {/if}

            <div class="title-container">
              {#if heading && !titleArtwork}
                <p class="badge">
                  <LineClamp clamp={1}>
                    {heading}
                  </LineClamp>
                </p>
              {/if}

              {#if titleArtwork}
                <div class="title-artwork-container">
                  <Artwork artwork={titleArtwork} profile={getNaturalProfile(titleArtwork)} />
                </div>
              {/if}

              {#if title && !titleArtwork}
                <h3 class="title">
                  <LinkWrapper action={useListStyle ? action : null}>
                    {@html sanitizeHtml(title)}
                  </LinkWrapper>
                </h3>
              {/if}

              {#if inlineDescription}
                <LineClamp clamp={2}>
                  <p class="description">
                    {@html sanitizeHtml(inlineDescription)}
                  </p>
                </LineClamp>
              {/if}
            </div>
          </div>
        </LinkWrapper>

        {#if overlay}
          <div
            class="overlay"
            class:blur-only={!useProtectionLayer}
            class:dark={useProtectionLayer && style !== 'dark'}
            class:light={useProtectionLayer && style === 'dark'}
          >
            <TodayCardOverlay
              {overlay}
              buttonVariant={useProtectionLayer ? 'transparent' : 'dark-gray'}
              --text-color="var(--today-card-text-color)"
              --text-accent-color="var(--today-card-text-accent-color)"
              --text-accent-blend-mode="var(--today-card-text-accent-blend-mode)"
            />
          </div>
        {/if}
      </div>
    </div>

    {#if media && useListStyle}
      <TodayCardMedia {media} {artworkProfile} />
    {/if}
  </div>
</LinkWrapper>
```

### 关键实现细节

1. **backdrop-filter 属性**:

   ```scss
   .protection-layer {
     backdrop-filter: blur(34px) brightness(var(--brightness)) saturate(1.6) contrast(1.1);
   }
   ```

   - `blur(34px)` - 创建34像素的高斯模糊效果
   - `brightness()` - 调整亮度
   - `saturate()` - 增加饱和度
   - `contrast()` - 增加对比度

2. **mask-image 属性**:

   ```scss
   mask-image: linear-gradient(
     to top,
     black 30%,
     rgba(0, 0, 0, 0.75) 70%,
     rgba(0, 0, 0, 0.4) 86%,
     transparent 100%
   );
   ```

   - 创建渐变遮罩，使模糊效果在底部更明显

3. **悬停效果**:

   ```scss
   .information-layer:has(> a:hover) .protection-layer {
     --brightness: 0.88;
   }
   ```

   - 当鼠标悬停时调整亮度

## 2. GradientOverlay 组件 - 简单的渐变模糊层

GradientOverlay是一个简单的组件，用于创建带模糊效果的渐变覆盖层。

### 组件代码

```svelte
<script lang="ts">
  export let shouldDarken: boolean = true;
</script>

<style>
  .gradient-overlay {
    position: absolute;
    z-index: 1;
    bottom: 0;
    width: 100%;
    height: var(--height, 60%);
    border-radius: var(--border-radius, var(--global-border-radius-large));
    background: linear-gradient(
      transparent,
      var(--color, var(--systemSecondary-onLight)) var(--height, 100%)
    );
    backdrop-filter: blur(10px);
    filter: saturate(1.5) brightness(var(--brightness));
    mask-image: linear-gradient(180deg, transparent 6%, rgb(0, 0, 0.5) 85%);
  }
</style>

<div class="gradient-overlay" style:--brightness={shouldDarken ? 0.85 : 1} />
```

### 关键实现细节

1. **backdrop-filter**: `blur(10px)` - 较轻微的模糊效果
2. **filter**: `saturate(1.5) brightness(var(--brightness))` - 颜色调整
3. **mask-image**: 创建透明度渐变效果

## 3. AmbientBackgroundArtwork 组件 - 背景艺术作品的动态模糊

这个组件创建了一个动态的背景模糊效果，带有动画和复杂的视觉处理。

### 组件代码

```svelte
<script lang="ts">
  import type { Artwork as JetArtworkType } from '@jet-app/app-store/api/models';
  import { intersectionObserver } from '@amp/web-app-components/src/actions/intersection-observer';
  import { buildSrc } from '@amp/web-app-components/src/components/Artwork/utils/srcset';
  import ResizeDetector from '@amp/web-app-components/src/components/helpers/ResizeDetector.svelte';
  import { colorAsString } from '~/utils/color';

  export let artwork: JetArtworkType;
  export let active: boolean = false;

  $: isBackgroundImageLoaded = false;
  $: backgroundImage = artwork
    ? buildSrc(
        artwork.template,
        {
          crop: 'sr',
          width: 400,
          height: Math.floor(400 / 1.6667),
          fileType: 'webp',
        },
        {}
      )
    : undefined;

  $: if (backgroundImage) {
    const img = new Image();
    img.onload = () => (isBackgroundImageLoaded = true);
    img.src = backgroundImage;
  }

  let resizing = false;
  const handleResizeUpdate = (e: CustomEvent<{ isResizing: boolean }>) =>
    (resizing = e.detail.isResizing);

  let isOutOfView = true;
  const handleIntersectionOberserverUpdate = (isIntersectingViewport: boolean) =>
    (isOutOfView = !isIntersectingViewport);
</script>

<style>
  .container {
    --veil: rgb(240, 240, 240, 0.65);
    --speed: 0.66s;
    --aspect-ratio: 16/9;
    --scale: 1.2;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    aspect-ratio: var(--aspect-ratio);
    max-height: 900px;
    opacity: 0;

    /*
            This stack of background images represents the following three layers, listed front-to-back:

            1) A gradient from transparent to white that acts as a mask for the entire container.
               `mask-image` caused too much thrashing and CPU usage when animating and resizing,
               so we are mimicking its functionality with this top-layer background image.
            2) A semi-transparent veil to evenly fade out the bg. Note that this is not technically
               a gradient, but we are using `linear-gradient` because a regular `rgb` value can't be
               used in `background-image`.
            3) The joe color of the background image that will eventualy be loaded.
        */
    background-image:
      linear-gradient(180deg, rgba(255, 255, 255, 0) 50%, var(--pageBg) 80%),
      linear-gradient(0deg, var(--veil) 0%, var(--veil) 80%),
      linear-gradient(0deg, var(--background-color) 0%, var(--background-color) 80%);
    background-position: center;
    background-size: 120%;

    /*
            Blurring via the CSS filter does not extend edge-to-edge of the contents width, but we
            can mitigate that by ever-so-slightly bumping up the `scale` of content so it bleeds off
            the page cleanly.
        */
    filter: blur(20px) saturate(1.3);
    transform: scale(var(--scale));
    transition:
      opacity calc(var(--speed) * 2) ease-out,
      background-size var(--speed) ease-in;

    @media (prefers-color-scheme: dark) {
      --veil: rgba(0, 0, 0, 0.5);
    }
  }

  .container.loaded {
    /*
            This stack of background images represents the following three layers, listed front-to-front:

            1) A gradient from transparent to white that acts as a mask for the entire container.
               `mask-image` caused too much thrashing and CPU usage when animating and resizing,
               so we are mimicking its functionality with this top-layer background image.
            2) A semi-transparent veil to evenly fade out the image. Note that this is not technically
               a gradient, but we are using `linear-gradient` because a regular `rgb` value can't be
               used in `background-image`.
            3) The actual background image.
        */
    background-image:
      linear-gradient(180deg, rgba(255, 255, 255, 0) 50%, var(--pageBg) 80%),
      linear-gradient(0deg, var(--veil) 0%, var(--veil) 80%), var(--background-image);
  }

  .container.active {
    opacity: 1;
    transition: opacity calc(var(--speed) / 2) ease-in;
    background-size: 100%;
  }

  .overlay {
    position: absolute;
    z-index: 2;
    top: 0;
    left: 0;
    width: 100%;
    aspect-ratio: var(--aspect-ratio);
    max-height: 900px;
    opacity: 0;
    background-image: var(--background-image);
    background-position: 100% 100%;
    background-size: 250%;
    filter: brightness(1.3) saturate(0);
    mix-blend-mode: overlay;
    will-change: opacity, background-position;
    animation: shift-background 60s infinite linear alternate;
    animation-play-state: paused;
    transition: opacity var(--speed) ease-in;
  }

  .active .overlay {
    opacity: 0.3;
    animation-play-state: running;
    transition: opacity calc(var(--speed) * 2) ease-in calc(var(--speed) * 2);
  }

  .active.out-of-view .overlay,
  .active.resizing .overlay {
    animation-play-state: paused;
    opacity: 0;
  }

  @keyframes shift-background {
    0% {
      background-position: 0% 50%;
      background-size: 250%;
    }

    25% {
      background-position: 60% 20%;
      background-size: 300%;
    }

    50% {
      background-position: 100% 50%;
      background-size: 320%;
    }

    75% {
      background-position: 40% 100%;
      background-size: 220%;
    }

    100% {
      background-position: 20% 50%;
      background-size: 300%;
    }
  }
</style>

{#if backgroundImage}
  <ResizeDetector on:resizeUpdate={handleResizeUpdate} />

  <div
    class="container"
    class:active
    class:resizing
    class:loaded={isBackgroundImageLoaded}
    class:out-of-view={isOutOfView}
    style:--background-image={`url(${backgroundImage})`}
    style:--background-color={artwork.backgroundColor && colorAsString(artwork.backgroundColor)}
    use:intersectionObserver={{
      callback: handleIntersectionOberserverUpdate,
      threshold: 0,
    }}
  >
    <div class="overlay" />
  </div>
{/if}
```

### 关键实现细节

1. **多层背景图像**:

   ```scss
   background-image:
     linear-gradient(180deg, rgba(255, 255, 255, 0) 50%, var(--pageBg) 80%),
     linear-gradient(0deg, var(--veil) 0%, var(--veil) 80%),
     linear-gradient(0deg, var(--background-color) 0%, var(--background-color) 80%);
   ```

2. **filter 属性 (而非 backdrop-filter)**:

   ```scss
   filter: blur(20px) saturate(1.3);
   ```

   - 对整个元素应用模糊效果，而不是仅对背景应用

3. **动画效果**:
   ```scss
   animation: shift-background 60s infinite linear alternate;
   ```

## 4. Hero 组件 - 英雄区域的模糊效果

Hero组件在大标题区域使用了backdrop-filter来创建文本保护层。

### 组件代码（相关部分）

```svelte
<div class="gradient" style="--color: {color};" />
```

```scss
.gradient {
  --rotation: 55deg;

  &:dir(rtl) {
    --rotation: -55deg;
    mask-image:
      radial-gradient(
        ellipse 127% 130% at 95% 100%,
        rgb(0, 0, 0) 18%,
        rgb(0, 0, 0.33) 24%,
        rgba(0, 0, 0, 0.66) 32%,
        transparent 40%
      ),
      linear-gradient(-129deg, rgb(0, 0, 0) 0%, rgba(255, 255, 255, 0) 55%);
  }
  position: absolute;
  z-index: -1;
  width: 100%;
  height: 100%;
  // stylelint-disable color-function-notation
  background: linear-gradient(
    var(--rotation),
    rgb(from var(--color) r g b / 0.25) 0%,
    transparent 50%
  );
  // stylelint-enable color-function-notation
  filter: saturate(1.5) brightness(0.9);
  backdrop-filter: blur(40px);
  mask-image:
    radial-gradient(
      ellipse 127% 130% at 5% 100%,
      rgb(0, 0, 0) 18%,
      rgb(0, 0, 0.33) 24%,
      rgba(0, 0, 0, 0.66) 32%,
      transparent 40%
    ),
    linear-gradient(51deg, rgb(0, 0, 0) 0%, rgba(255, 255, 255, 0) 55%);

  @media (--range-xsmall-down) {
    --rotation: 0deg;
    mask-image: linear-gradient(var(--rotation), rgb(0, 0, 0) 28%, rgba(0, 0, 0, 0) 56%);
  }
}
```

### 关键实现细节

1. **backdrop-filter**: `blur(40px)` - 高强度的模糊效果
2. **复杂的径向渐变遮罩** - 创建自然的模糊边界
3. **颜色转换函数**: `rgb(from var(--color) r g b / 0.25)` - 使用现代CSS颜色语法

## 5. Carousel 组件 - 背景模糊的协调

Carousel组件协调多个Hero组件的背景模糊效果。

### 组件代码（相关部分）

```svelte
{#if !import.meta.env.SSR}
  {@const backgroundArtwork = deriveBackgroundArtworkFromItem(item)}

  {#if backgroundArtwork}
    <div use:portal={portalId}>
      <AmbientBackgroundArtwork artwork={backgroundArtwork} active={activeIndex === index} />
    </div>
  {/if}
{/if}
```

## 实现要点总结

### 1. backdrop-filter vs filter

- **backdrop-filter**: 仅对元素背后的内容应用滤镜效果，适用于创建毛玻璃效果
- **filter**: 对元素本身应用滤镜效果，适用于对整个元素进行视觉处理

### 2. 性能优化

- 使用 `will-change` 属性提示浏览器哪些属性会变化
- 使用 CSS 变量进行动态样式调整
- 在 `prefers-reduced-motion` 环境下禁用动画

### 3. 响应式设计

- 使用容器查询 (`@container`) 实现基于容器尺寸的样式调整
- 使用媒体查询适配不同屏幕尺寸

### 4. 可访问性

- 提供足够的文本对比度
- 在暗色模式下调整颜色值
- 使用语义化的HTML结构

### 5. 浏览器兼容性

- 提供适当的回退方案
- 使用标准化的CSS属性

### 7.1 模糊效果实现

网站使用多种方式实现半透明模糊效果：

1. **TodayCard组件**:
   - 使用backdrop-filter: blur(34px)
   - 结合mask-image创建渐变遮罩

2. **GradientOverlay组件**:
   - 使用backdrop-filter: blur(10px)
   - 配合saturate和brightness调整

3. **AmbientBackgroundArtwork组件**:
   - 使用filter: blur(20px)而非backdrop-filter
   - 实现背景动态模糊

### 7.2 响应式设计

- 使用CSS容器查询(@container)
- 多断点响应式布局
- 左右阅读方向支持

## 8. 状态管理和数据流

### 8.1 Jet框架集成

- Jet作为核心状态管理框架
- 统一的数据获取和操作接口
- 意图(Intent)驱动的状态更新

### 8.2 上下文(Context)

- TodayCard布局上下文
- 国际化上下文
- 媒体查询上下文

## 9. 性能优化

### 9.1 图片优化

- Artwork组件的响应式图片加载
- WebP格式优先
- 懒加载和预连接

### 9.2 组件懒加载

- 异步组件加载
- 骨架屏显示
- 预加载关键资源

### 9.3 动画优化

- 使用CSS硬件加速
- will-change属性优化
- 减少重排重绘

## 10. 国际化和本地化

- 完整的国际化支持
- RTL(从右到左)布局支持
- 本地化数据管理

## 11. 可访问性

- ARIA标签和角色
- 键盘导航支持
- 屏幕阅读器兼容性
- 颜色对比度合规

## Navigation.svelte - 导航组件

```svelte
<script lang="ts">
  import { writable } from 'svelte/store';
  import { isSome } from '@jet/environment/types/optional';
  import type {
    WebNavigation,
    WebNavigationLink,
  } from '@jet-app/app-store/api/models/web-navigation';
  import type { WebSearchFlowAction } from '@jet-app/app-store/common/search/web-search-action';
  import { isSearchResultsPageIntent } from '@jet-app/app-store/api/intents/search-results-page-intent';

  import Navigation from '@amp/web-app-components/src/components/Navigation/Navigation.svelte';
  import { sidebarIsHidden } from '@amp/web-app-components/src/stores/sidebar-hidden';

  import AppStoreLogo from '~/components/icons/AppStoreLogo.svg';
  import PlatformSelectorDropdown from '~/components/jet/web-navigation/PlatformSelectorDropdown.svelte';
  import FlowAction from '~/components/jet/action/FlowAction.svelte';
  import SystemImage, { isSystemImageArtwork } from '~/components/SystemImage.svelte';
  import SearchInput from '~/components/navigation/SearchInput.svelte';
  import SFSymbol from '~/components/SFSymbol.svelte';

  import { getJetPerform } from '~/jet';
  import { getI18n } from '~/stores/i18n';
  import {
    type NavigationItemWithTab,
    navigationIdFromLink,
    makeNavLinks,
  } from '~/components/navigation/navigation-items';
  import mediaQueries from '~/utils/media-queries';

  import { fade, type EasingFunction } from 'svelte/transition';
  import { circOut } from 'svelte/easing';
  import { flyAndBlur } from '~/utils/transition';
  import { makeCategoryTabsIntent } from '@jet-app/app-store/api/intents/category-tabs-intent';
  import { getJet } from '~/jet';
  import { getPlatformFromPage } from '~/utils/seo/common';
  import type { NavigationId } from '@amp/web-app-components/src/types';

  const i18n = getI18n();
  const perform = getJetPerform();
  const jet = getJet();

  const categoryTabsCache: Record<string, WebNavigationLink[]> = {};
  let categoryTabLinks: WebNavigationLink[] = [];
  let currentTabStore = writable<NavigationId | null>(null);

  export let webNavigation: WebNavigation;

  $: isXSmallViewport = $mediaQueries === 'xsmall';
  $: searchAction = webNavigation.searchAction as WebSearchFlowAction;
  // Mobile first means the inline items are hidden
  // However, we still want the list visible in SSR (which is fine for mobile
  // since the menu won't be expanded by default)
  $: inlinePlatformItems =
    isXSmallViewport || typeof window === 'undefined' ? webNavigation.platforms : [];

  $: if (webNavigation && typeof window !== 'undefined') {
    fetchCategoryTabs(webNavigation);
  }

  async function fetchCategoryTabs(nav: WebNavigation) {
    const platform = getPlatformFromPage({
      webNavigation: nav,
    });

    if (!platform) {
      categoryTabLinks = [];
      return;
    }

    if (categoryTabsCache[platform]) {
      categoryTabLinks = updateActiveStates(categoryTabsCache[platform]);
    } else {
      try {
        const data = await jet.dispatch(
          makeCategoryTabsIntent({
            platform,
          })
        );

        categoryTabsCache[platform] = data;
        categoryTabLinks = updateActiveStates(data);
      } catch (error) {
        categoryTabLinks = [];
      }
    }

    updateCurrentTab();
  }

  function updateActiveStates(tabs: WebNavigationLink[]): WebNavigationLink[] {
    return tabs.map((link) => ({
      ...link,
      isActive: link.action?.destination?.id
        ? window.location.pathname.includes(link.action.destination.id)
        : false,
    }));
  }

  function updateCurrentTab() {
    const allLinks: WebNavigationLink[] = [...categoryTabLinks, ...webNavigation.tabs];

    const activeLink = allLinks.find((link) => link.isActive);
    currentTabStore.set(activeLink ? navigationIdFromLink(activeLink) : null);
  }

  function handleMenuItemClick(event: CustomEvent<NavigationItemWithTab>) {
    const navigationItem = event.detail;
    const tab = navigationItem.tab;

    perform(tab.action);
  }

  const BASE_DELAY = 80;
  const BASE_DURATION = 150;
  const DURATION_SPREAD = 300;

  // Returns an eased duration for a list item based on its index, e.g. items later in the list
  // get longer durations, between BASE_DURATION and BASE_DURATION + DURATION_SPREAD.
  function getEasedDuration({
    i,
    totalNumberOfItems,
    easing = circOut,
  }: {
    i: number;
    totalNumberOfItems: number;
    easing?: EasingFunction;
  }) {
    const t = i / (totalNumberOfItems - 1);
    return BASE_DURATION + easing(t) * DURATION_SPREAD;
  }
</script>

<style lang="scss">
  .navigation-wrapper {
    display: contents;
  }

  .platform-selector-container {
    --header-gap: 3px;
    --platform-selector-trigger-gap: var(--header-gap);
    display: flex;
    gap: var(--header-gap);
    position: relative;

    @media (--sidebar-visible) {
      padding: 19px 25px 14px;
    }
  }

  // Japanese and Catalonian both require scaling down the platform selector in order to make it
  // fit cleanly in the sidebar, due to their longer character lengths.
  .platform-selector-container:lang(ja),
  .platform-selector-container:lang(ca) {
    --scale-factor: 0.1;
    z-index: 3;
    transform: scale(calc(1 - var(--scale-factor)));
    transform-origin: center left;

    & :global(dialog) {
      top: 60px;
      // Since the `dialog` is a child of `platform-selector-container, we re-scale it back
      // to it's original size by applying the inverse scale transformation.
      transform: scale(calc(1 + var(--scale-factor)));
      transform-origin: center left;
    }
  }

  .app-store-icon-container {
    display: flex;
    align-items: center;
    gap: var(--header-gap);
    font: var(--title-1);
    font-weight: 600;
  }

  .app-store-icon-container :global(svg) {
    height: 18px;
    position: relative;
    top: 0.33px;
    width: auto;

    @media (--sidebar-visible) and (--range-xsmall-only) {
      height: 22px;
      width: auto;
    }
  }

  .search-input-container {
    margin: 0 25px;
  }

  .navigation-wrapper :global(.navigation__header) {
    @media (--sidebar-visible) {
      display: flex;
      flex-direction: column;
    }
  }

  .navigation-wrapper :global(.navigation-item__link) {
    height: 100%;
    display: flex;
  }

  .navigation-wrapper :global(.navigation-item__icon) {
    --navigation-item-icon-size: 32px;
    width: var(--navigation-item-icon-size);
    height: var(--navigation-item-icon-size);
    display: flex;
    justify-content: center;

    @media (--sidebar-visible) {
      --navigation-item-icon-size: 24px;
    }
  }

  // Our SVG icons for the landing pages are sized differently than other Onyx apps,
  // so we have to reach into the navigation component and style them so they look
  // visually similar to the other Onyx apps
  .navigation-wrapper :global(.navigation-item__icon svg) {
    color: var(--keyColor);
    width: 20px;

    @media (--sidebar-visible) {
      width: 18px;
    }
  }

  // Below is styling for the "inline" version of the Platform Selector
  .platform-selector-inline {
    margin: 8px 32px;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  h3 {
    color: var(--systemTertiary);
    font: var(--body-emphasized);
    margin: 0 0 10px;
    padding-top: 20px;

    @media (--sidebar-visible) {
      font: var(--footnote-emphasized);
      margin: 0 0 6px;
      padding-top: 7px;
    }
  }

  .platform {
    display: flex;
    gap: 10px;
    padding: 8px 0;
    color: var(--systemTertiary);

    @media (prefers-color-scheme: dark) {
      color: var(--systemSecondary);
    }
  }

  .platform,
  .platform :global(svg) {
    transition: color 210ms ease-out;
  }

  .platform:not(.is-active):hover,
  .platform:not(.is-active):hover :global(svg) {
    color: var(--systemPrimary);
  }

  .platform.is-active {
    color: var(--systemPrimary);
    font: var(--body-emphasized);
  }

  .platform.is-active :global(svg) {
    color: currentColor;
  }

  .icon-container {
    display: flex;
  }

  .icon-container :global(svg) {
    color: var(--systemTertiary);
    width: 18px;
    max-height: 16px;

    @media (prefers-color-scheme: dark) {
      color: var(--systemSecondary);
    }
  }

  .search-icon-container {
    display: flex;
  }

  .search-icon-container :global(svg) {
    fill: var(--systemSecondary);
    width: 16px;
  }

  .platform-title {
    font: var(--body);
    flex-grow: 1;
  }
</style>

<div class="navigation-wrapper">
  <Navigation
    translateFn={$i18n.t}
    items={makeNavLinks(webNavigation.tabs, {
      shouldShowSearchTab: $sidebarIsHidden,
    })}
    personalizedItemsHeader={$i18n.t('ASE.Web.AppStore.Navigation.Categories.Title')}
    personalizedItems={makeNavLinks(categoryTabLinks, {
      shouldShowSearchTab: $sidebarIsHidden,
    })}
    currentTab={currentTabStore}
    libraryItems={[]}
    on:menuItemClick={handleMenuItemClick}
  >
    <div slot="logo" class="platform-selector-container">
      <span
        id="app-store-icon-contianer"
        class="app-store-icon-container"
        role="img"
        aria-label={$i18n.t('ASE.Web.AppStore.Navigation.AX.AppStoreLogo')}
      >
        <AppStoreLogo focusable={false} />
      </span>

      {#if !$sidebarIsHidden && !isXSmallViewport}
        <PlatformSelectorDropdown platformSelectors={webNavigation.platforms} />
      {/if}
    </div>

    <svelte:fragment slot="search">
      <div class="search-input-container">
        <SearchInput {searchAction} />
      </div>
    </svelte:fragment>

    <div slot="after-navigation-items" class="platform-selector-inline">
      {#if isXSmallViewport}
        <h3 in:fade out:fade={{ delay: 250, duration: BASE_DURATION }}>
          {$i18n.t('ASE.Web.AppStore.Navigation.PlatformHeading')}
        </h3>
      {/if}

      <ul>
        {#each inlinePlatformItems as platformSelector, i (platformSelector.action.title)}
          {@const { action, isActive } = platformSelector}
          {@const artwork = action.artwork}
          {@const totalNumberOfItems = inlinePlatformItems.length}
          <li
            in:flyAndBlur={{
              y: -50,
              delay: i * BASE_DELAY,
              duration: getEasedDuration({
                i,
                totalNumberOfItems,
              }),
            }}
            out:flyAndBlur={{
              y: i * -5,
              delay:
                // This delay is calculated in a negative/backwards manner,
                // which makes it so the items build out from the bottom to the top.
                (totalNumberOfItems - i - 1) * (BASE_DELAY / 2),
              duration: BASE_DURATION,
            }}
          >
            <FlowAction destination={action}>
              <span class="platform" class:is-active={isActive}>
                {#if isSome(artwork) && isSystemImageArtwork(artwork)}
                  <div class="icon-container" aria-hidden="true">
                    <SystemImage {artwork} />
                  </div>
                {/if}

                <span class="platform-title">
                  {action.title}
                </span>

                {#if action.destination && isSearchResultsPageIntent(action.destination)}
                  <span aria-hidden={true} class="search-icon-container">
                    <SFSymbol name="magnifyingglass" />
                  </span>
                {/if}
              </span>
            </FlowAction>
          </li>
        {/each}
      </ul>
    </div>
  </Navigation>
</div>
```

**功能**:

- 网站主导航栏
- 平台选择器
- 搜索功能集成

**关键特性**:

- 支持侧边栏和顶部导航模式
- 平台选择下拉菜单
- 动画过渡效果
- 国际化支持

### 2.3 Page.svelte - 页面路由分发器

```svelte
<script lang="ts">
  import {
    type Page,
    hasVisionProUrl,
    isAppEventDetailPage,
    isArticlePage,
    isChartsHubPage,
    isGenericPage,
    isSearchLandingPage,
    isShelfBasedProductPage,
    isTopChartsPage,
    isTodayPage,
    isSearchResultsPage,
    isStaticMessagePage,
    isSeeAllPage,
    isErrorPage,
  } from '~/jet/models';

  import AppEventDetailPage from './pages/AppEventDetailPage.svelte';
  import ArticlePage from './pages/ArticlePage.svelte';
  import ChartsHubPage from './pages/ChartsHubPage.svelte';
  import DefaultPage from './pages/DefaultPage.svelte';
  import ErrorPage from './pages/ErrorPage.svelte';
  import ProductPage from './pages/ProductPage.svelte';
  import VisionProPage from './pages/VisionProPage.svelte';
  import StaticMessagePageComponent from './pages/StaticMessagePage.svelte';
  import SearchLandingPage from './pages/SearchLandingPage.svelte';
  import SearchResultsPage from './pages/SearchResultsPage.svelte';
  import TopChartsPage from './pages/TopChartsPage.svelte';
  import TodayPage from './pages/TodayPage.svelte';
  import SeeAllPage from './pages/SeeAllPage.svelte';
  import MetaTags from '~/components/structure/MetaTags.svelte';
  import PageModal from '~/components/PageModal.svelte';

  export let page: Page;
</script>

<MetaTags {page} />

<PageModal />

{#if isAppEventDetailPage(page)}
  <AppEventDetailPage {page} />
{:else if isArticlePage(page)}
  <ArticlePage {page} />
{:else if isChartsHubPage(page)}
  <ChartsHubPage {page} />
{:else if isSearchLandingPage(page)}
  <SearchLandingPage {page} />
{:else if isSearchResultsPage(page)}
  <SearchResultsPage {page} />
{:else if isShelfBasedProductPage(page)}
  <ProductPage {page} />
{:else if isTopChartsPage(page)}
  <TopChartsPage {page} />
{:else if isGenericPage(page) && hasVisionProUrl(page)}
  <VisionProPage {page} />
{:else if isTodayPage(page)}
  <TodayPage {page} />
{:else if isStaticMessagePage(page)}
  <StaticMessagePageComponent {page} />
{:else if isSeeAllPage(page)}
  <SeeAllPage {page} />
{:else if isErrorPage(page)}
  <ErrorPage {page} />
{:else}
  <DefaultPage {page} />
{/if}
```

**功能**:

- 根据页面类型渲染相应的页面组件
- 支持多种页面类型：TodayPage, ProductPage, ChartsHubPage等
- 集成MetaTags和PageModal组件

### 2.2 PageResolver.svelte - 页面解析器

```svelte
<script lang="ts">
  import type { Page } from '~/jet/models';

  import PageComponent from '~/components/Page.svelte';
  import ErrorComponent from '~/components/Error.svelte';
  import LoadingSpinner from '@amp/web-app-components/src/components/LoadingSpinner/LoadingSpinner.svelte';

  export let page: Promise<Page> | Page;
  export let isFirstPage: boolean;
</script>

{#await page}
  <div data-testid="page-loading">
    <!--
            Delay showing the spinner on initial page load after app boot.
            After that, the FlowAction handler already waits 500ms before
            it changes DOM, so we only need to wait 1000ms.
        -->
    <LoadingSpinner delay={isFirstPage ? 1500 : 1000} />
  </div>
{:then page}
  <PageComponent {page} />
{:catch error}
  <ErrorComponent {error} />
{/await}
```

**功能**:

- 解析页面Promise对象
- 延迟加载页面内容
- 显示加载状态
- 错误捕获和处理

**关键特性**:

- 使用Svelte的await/then/catch语法处理异步页面数据
- 集成LoadingSpinner组件
- 错误边界处理

### 1. 技术栈选择

- **Svelte 框架**: 轻量级、高性能的前端框架，编译时优化，运行时体积小
- **TypeScript**: 提供静态类型检查，增强代码质量和可维护性
- **ES6+ 特性**: 充分利用现代 JavaScript 特性
- **Vite 构建工具**: 快速的开发服务器和构建过程

````
---

### 3. 组件化架构

#### 共享组件系统
- **可复用组件**: 如 Artwork、Shelf、Navigation、Modal 等
- **配置驱动**: 组件行为可通过配置文件定制
- **响应式设计**: 自动适配不同屏幕尺寸

#### 组件设计原则
- **单一职责**: 每个组件只负责特定功能
- **可组合性**: 组件可以嵌套组合形成复杂界面
- **可测试性**: 组件易于单元测试

## 状态管理

### 1. Svelte Stores
- 利用 Svelte 内置的响应式 store
- 提供 writable、readable、derived stores
- 简单直观，无需额外状态管理库

### 2. Jet 框架
- 业务逻辑层，处理复杂状态和副作用
- 提供意图(Intent)模式进行状态变更
- 统一的数据获取和缓存策略

## 性能优化

### 1. 渐进式加载
- **代码分割**: 按需加载组件
- **懒加载**: 图片和非关键组件延迟加载
- **预加载**: 关键资源提前加载

### 2. 资源优化
- **响应式图片**: 使用 srcset 和 sizes 属性
- **WebP 格式**: 提供现代图片格式支持
- **CDN 集成**: 静态资源通过 CDN 分发

### 3. 渲染优化
- **虚拟滚动**: 对于长列表组件
- **可见性检测**: Intersection Observer API
- **防抖节流**: 减少不必要的计算

## 用户界面设计

### 1. 视觉设计原则

#### 简洁性
- 减少视觉噪音，突出核心内容
- 一致的间距和布局系统
- 有限的颜色调色板

#### 层次感
- 通过颜色、大小和阴影建立视觉层次
- 重要的内容获得更多的视觉权重
- 适当的留白增强可读性

#### 品牌一致性
- 遵循苹果设计语言
- 统一的字体和图标系统
- 一致的交互模式

### 2. 响应式设计

#### 断点策略
- 移动优先的设计方法
- 关键断点：375px, 740px, 1000px, 1320px, 1680px
- 流畅的尺寸过渡

#### 网格系统
- 灵活的 CSS Grid 和 Flexbox 布局
- 自适应列数和间距
- 容器查询(Container Queries)支持

### 3. 交互设计

#### 动画和过渡
- 平滑的页面切换动画
- 微交互动画增强用户体验
- 一致的动画持续时间和缓动函数

#### 可访问性
- 键盘导航支持
- ARIA 属性完善
- 高对比度模式支持
- 屏幕阅读器兼容

## 开发实践

### 1. 代码组织

#### 文件命名约定
- 组件文件使用 PascalCase (如 Button.svelte)
- 工具函数使用 camelCase (如 utils.ts)
- 类型定义使用 PascalCase (如 Types.ts)

#### 导入排序
```typescript
// 标准库
import { onMount } from 'svelte';

// 第三方库
import { makeSafeTick } from '@amp/web-app-components/src/utils/makeSafeTick';

// 项目内部模块
import { FILE_TO_MIME_TYPE } from './constants';
````

### 2. 类型安全

#### Props 验证

```svelte
<script lang="ts">
  export let artwork: Artwork;
  export let alt: string = '';
  export let profile: Profile | string;
</script>
```

#### 类型定义集中管理

- 在单独文件中定义复杂的类型结构
- 使用 TypeScript 接口描述数据形状
- 类型复用和继承

### 3. 测试策略

#### 组件测试

- 单元测试验证组件行为
- 集成测试验证组件协作
- 快照测试捕获UI变化

#### 端到端测试

- 关键用户流程自动化测试
- 跨浏览器兼容性验证

## 国际化支持

### 1. 多语言架构

- 基于键值对的翻译系统
- RTL (从右到左) 文本方向支持
- 数字、日期、货币格式化

### 2. 本地化适配

- 区域设置检测
- 内容本地化策略
- 文化敏感性考虑

## 最佳实践总结

### 1. 架构原则

- **关注点分离**: 将UI逻辑、业务逻辑和数据获取分离
- **渐进增强**: 在基础功能之上添加高级特性
- **性能优先**: 从项目初期就考虑性能影响

### 2. 代码质量

- **类型安全**: 充分利用 TypeScript 的类型系统
- **可维护性**: 编写清晰、易懂的代码
- **可测试性**: 设计易于测试的组件和函数

### 3. 用户体验

- **加载性能**: 优化关键渲染路径
- **交互响应**: 确保界面响应迅速
- **无障碍访问**: 遵循 WCAG 指南
