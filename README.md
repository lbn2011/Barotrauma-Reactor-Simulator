# Barotrauma 反应堆模拟器

这是一个基于 SvelteKit 和 Cloudflare Workers 的高级反应堆模拟器，旨在模拟 Barotrauma 游戏中的 RBMK-1000 反应堆系统。该模拟器提供了多个控制面板，允许用户监控和操作反应堆的各种参数。

## 功能特性

- **现代化 UI 组件**：使用 shadcn-svelte 组件库提供美观一致的界面
- **全面的反应堆监控**：实时监控功率、温度、压力等关键参数
- **多面板控制系统**：包括控制棒、功率调节、循环泵、应急冷却等多个控制面板
- **数据可视化**：使用 Chart.js 实现趋势图和实时数据展示
- **自动化警报系统**：自动监测异常状况并发出警报
- **存档/加载功能**：保存和恢复模拟器状态
- **响应式设计**：支持不同屏幕尺寸的设备
- **优雅的动效**：使用 Tailwind CSS 实现平滑的过渡动画和悬停效果

## 技术栈

- **前端框架**：SvelteKit 5
- **UI 组件库**：shadcn-svelte
- **样式**：Tailwind CSS
- **图表库**：Chart.js
- **部署平台**：Cloudflare Workers
- **状态管理**：Svelte stores
- **构建工具**：Vite

## 安装与运行

### 前置要求

- Node.js (版本 18 或更高)
- pnpm (推荐) 或 npm

### 初始化 shadcn-svelte

如果需要添加新的 shadcn-svelte 组件，请按照以下步骤操作：

1. 初始化 shadcn-svelte 配置：
   ```bash
   npx shadcn-svelte init
   ```

2. 安装所需的组件：
   ```bash
   npx shadcn-svelte add button card input slider
   ```

### 本地开发

1. 克隆仓库：
   ```bash
   git clone <repository-url>
   cd barotrauma-reactor-simulator
   ```

2. 安装依赖：
   ```bash
   pnpm install
   # 或者如果你使用 npm
   npm install
   ```

3. 启动开发服务器：
   ```bash
   pnpm dev
   # 或者
   npm run dev
   ```

4. 在浏览器中访问 `http://localhost:5173`

### 构建项目

要构建生产版本：

```bash
pnpm build
# 或者
npm run build
```

### 预览生产构建

要预览生产构建：

```bash
pnpm preview
# 或者
npm run preview
```

## 部署到 Cloudflare

该项目已配置为使用 Cloudflare Workers 进行部署。

### 部署步骤

1. 确保已安装 wrangler CLI：
   ```bash
   npm install -g wrangler
   ```

2. 登录到 Cloudflare：
   ```bash
   wrangler login
   ```

3. 部署项目：
   ```bash
   pnpm run deploy
   # 或者
   wrangler deploy
   ```

## 项目结构

```
src/
├── routes/                 # SvelteKit 路由
│   ├── panels/            # 各种控制面板组件
│   │   ├── ControlRodPanel.svelte
│   │   ├── PowerControlPanel.svelte
│   │   ├── RecirculationPumpPanel.svelte
│   │   └── ...           # 更多面板
│   ├── Overview.svelte    # 概述页面
│   ├── SaveEditor.svelte  # 存档编辑器
│   └── +page.svelte       # 主页路由
├── lib/                   # 共享库和工具函数
│   ├── components/        # 可复用组件
│   │   └── ui/            # shadcn-svelte UI 组件
│   │       ├── button/
│   │       ├── card/
│   │       ├── slider/
│   │       └── ...        # 更多组件
│   └── stores/            # Svelte stores
│       └── reactorStore.ts # 反应堆状态管理
├── app.html              # 应用主 HTML 模板
└── App.svelte            # 主应用组件
```

## 控制面板说明

### 1. 反应堆控制棒面板
- 控制反应堆的核裂变过程
- 调节控制棒插入深度以控制反应性

### 2. 功率调节面板
- 监控和调节反应堆功率输出
- 设置目标功率水平

### 3. 再循环泵面板
- 控制主循环回路的泵送系统
- 调节冷却剂流量

### 4. 应急冷却泵面板
- 在紧急情况下激活备用冷却系统
- 确保反应堆安全

### 5. 汽轮机控制面板
- 控制蒸汽涡轮发电机
- 调节电力输出

### 6. 除氧器控制面板
- 管理给水系统中的氧气去除
- 防止系统腐蚀

### 7. 数据趋势图面板
- 显示历史数据趋势
- 分析反应堆性能

## 配置

### Cloudflare 配置

项目使用 `wrangler.toml` 文件进行 Cloudflare 配置：

```toml
name = "barotrauma-reactor-simulator"
main = "./.svelte-kit/cloudflare/_worker.js"
compatibility_date = "2026-02-05"
workers_dev = false
route = "your-domain.com/*"  # 替换为你的域名

[env.production]
account_id = "your-account-id"
workers_dev = false
compatibility_date = "2026-02-05"
compatibility_flags = ["nodejs_compat"]

[vars]
ENVIRONMENT = "production"

[assets]
directory = "./.svelte-kit/cloudflare/static"
binding = "ASSETS"
```

## 开发指南

### 添加新面板

要在应用中添加新面板：

1. 在 `src/routes/panels/` 目录下创建新的 Svelte 组件
2. 在组件中使用 shadcn-svelte UI 组件增强界面：
   ```svelte
   <script>
     import { Card, CardContent } from '$lib/components/ui/card';
     import { Button } from '$lib/components/ui/button';
     import { Slider } from '$lib/components/ui/slider';
   </script>
   
   <Card>
     <CardContent>
       <Slider min={0} max={100} value={[50]} />
       <Button>操作按钮</Button>
     </CardContent>
   </Card>
   ```
3. 在 `App.svelte` 文件中的 `panelMap` 对象中注册新面板
4. 在侧边栏导航中添加相应的按钮

### 状态管理

反应堆状态通过 `reactorStore` 进行管理，包含以下主要部分：

- `core`: 反应堆核心参数（温度、压力、水位）
- `powerRegulation`: 功率调节系统
- `controlRods`: 控制棒系统
- `alarms`: 警报系统
- `trends`: 数据趋势

### 自定义主题

应用使用 Tailwind CSS 和 shadcn-svelte 组件库进行样式设计，主要颜色方案包括：

- 主色：#00bcd4 (青色)
- 背景色：#121212 (深灰)
- 边框色：#333 (中灰)

#### 使用 shadcn-svelte 组件

要添加新的 shadcn-svelte 组件：

1. 使用 CLI 安装组件：
   ```bash
   npx shadcn-svelte add [component-name]
   ```

2. 在组件中导入并使用：
   ```svelte
   import { Button } from '$lib/components/ui/button';
   import { Card, CardContent } from '$lib/components/ui/card';
   ```

3. 遵循 Tailwind CSS 的实用优先样式方法，利用预设的样式类和变体。

## 故障排除

### 常见问题

1. **页面空白**
   - 检查浏览器控制台是否有错误
   - 确保所有依赖项都已正确安装
   - 验证 Cloudflare 配置是否正确

2. **构建失败**
   - 确保 Node.js 版本符合要求
   - 尝试清理缓存：`pnpm clean` 或删除 `node_modules` 并重新安装

3. **部署问题**
   - 确认 wrangler 已登录
   - 检查账户权限
   - 验证域名配置

4. **shadcn-svelte 组件问题**
   - 如果组件无法渲染，请检查组件导入路径是否正确
   - 确保在 `components.json` 中正确配置了组件库
   - 验证 Tailwind CSS 配置是否正确集成

5. **Tailwind CSS 样式问题**
   - 如果样式未生效，请运行 `npx tailwindcss -i ./src/app.pcss -o ./static/tailwind.css --watch` 重新生成样式
   - 检查 `tailwind.config.js` 是否包含了正确的路径
   - 确认组件类名拼写是否正确

### 性能优化

- 使用 Svelte 的内置优化
- 合理使用 store 订阅避免不必要的重渲染
- 懒加载大型组件
- 利用 Tailwind CSS 的 JIT 模式减少 CSS 包大小
- 按需导入 shadcn-svelte 组件以减少打包体积
- 使用 Svelte 5 的反应性语法优化组件更新

## 贡献

欢迎提交 Issue 和 Pull Request 来改进项目！

### 开发流程

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

此项目遵循 MIT 许可证。详情请参阅 [LICENSE](./LICENSE) 文件。

## 致谢

- 感谢 SvelteKit 团队提供的优秀框架
- 感谢 Cloudflare 提供的 Workers 平台
- 感谢 Barotrauma 游戏及其社区
- 感谢 shadcn-svelte 团队提供的高质量 UI 组件库
- 感谢 Tailwind CSS 团队提供的实用优先 CSS 框架

## 支持

如需技术支持或有任何疑问，请创建 Issue 或联系项目维护者。