# Barotrauma 反应堆模拟器

这是一个基于 SvelteKit 的反应堆模拟器，旨在模拟 RBMK 反应堆。该模拟器提供了多个控制面板，允许用户监控和操作反应堆的各种参数，实现了高度逼真的反应堆运行和控制体验。

## 功能特性

- **现代化 UI 组件**：使用 shadcn-svelte 组件库提供美观一致的界面，支持深色主题
- **全面的反应堆监控**：实时监控功率、温度、压力、水位等关键参数
- **多面板控制系统**：包括控制棒、功率调节、循环泵、应急冷却等多个专业控制面板
- **数据可视化**：使用 Chart.js 实现趋势图和实时数据展示，支持多参数对比分析
- **自动化警报系统**：自动监测异常状况并发出警报，提供故障诊断
- **存档/加载功能**：保存和恢复模拟器状态，方便实验和教学
- **响应式设计**：支持不同屏幕尺寸的设备，从手机到桌面端
- **优雅的动效**：使用 Tailwind CSS 实现平滑的过渡动画和悬停效果
- **详细的物理模型**：模拟中子物理、热工水力、流体力学等真实物理过程
- **系统故障模拟**：支持模拟各种系统故障和异常情况
- **三冲量水位控制**：实现核电站真实的水位控制系统
- **汽轮机旁路系统**：模拟蒸汽压力调节和旁路控制
- **堆芯冷却剂净化系统**：模拟冷却剂杂质去除过程
- **Web Workers 优化**：使用 Web Workers 处理计算密集型物理模拟，提高性能
- **实时日志系统**：详细记录系统运行状态和操作历史
- **多语言支持**：集成 i18n 国际化支持

## 技术栈

- **前端框架**：SvelteKit 5
- **UI 组件库**：shadcn-svelte
- **样式**：Tailwind CSS
- **图表库**：Chart.js
- **部署平台**：Cloudflare Workers
- **状态管理**：Svelte stores
- **构建工具**：Vite
- **Web Workers**：用于计算密集型物理模拟
- **数据存储**：idb-keyval (本地存储)
- **国际化**：i18n 支持

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

该项目已配置为使用 Cloudflare Workers 进行部署，提供高性能、全球分布式的访问体验。

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
│   │   ├── alarm-crt/            # 警报 CRT 面板
│   │   ├── condensate-system/    # 凝结水系统面板
│   │   ├── condenser-circulation-pump/ # 凝汽器循环泵面板
│   │   ├── condenser-vacuum/     # 凝汽器真空系统面板
│   │   ├── control-rod/           # 控制棒面板
│   │   ├── data-trend/            # 数据趋势图面板
│   │   ├── deaerator-steam/       # 除氧器蒸汽面板
│   │   ├── drain-control/         # 排水控制面板
│   │   ├── emergency-cooling-pump/ # 应急冷却泵面板
│   │   ├── feedwater-pump/        # 给水泵面板
│   │   ├── hepa-filter/           # HEPA 过滤器面板
│   │   ├── hotwell-level/         # 热井液位面板
│   │   ├── makeup-water/          # 补水系统面板
│   │   ├── offline-cooling-pump/  # 离线冷却泵面板
│   │   ├── power-control/         # 功率控制面板
│   │   ├── recirculation-pump/    # 再循环泵面板
│   │   ├── schematic-crt/         # 系统示意图 CRT
│   │   ├── steam-exhaust/         # 蒸汽排汽面板
│   │   ├── turbine-auxiliary/     # 汽轮机辅助系统面板
│   │   ├── turbine-control/       # 汽轮机控制面板
│   │   └── ...                    # 更多面板
│   ├── Overview.svelte    # 概述页面
│   ├── SaveEditor.svelte  # 存档编辑器
│   └── +page.svelte       # 主页路由
├── lib/                   # 共享库和工具函数
│   ├── components/        # 可复用组件
│   │   └── ui/            # shadcn-svelte UI 组件
│   │       ├── button/            # 按钮组件
│   │       ├── card/              # 卡片组件
│   │       ├── chart/             # 图表组件
│   │       ├── confirmation-dialog/ # 确认对话框
│   │       ├── history-viewer/    # 历史查看器
│   │       ├── input/             # 输入组件
│   │       ├── quick-actions/     # 快速操作
│   │       ├── slider/            # 滑块组件
│   │       ├── system-schematic/  # 系统示意图
│   │       └── ...                # 更多组件
│   ├── stores/            # Svelte stores
│   │   └── reactorStore.ts # 反应堆状态管理
│   └── utils.ts           # 工具函数
├── models/                # 物理模型
│   ├── neutron/           # 中子物理模型
│   │   ├── controlRodPhysics.ts   # 控制棒物理
│   │   ├── voidCoefficient.ts     # 空泡系数
│   │   └── xenonPoisoning.ts       # 氙中毒
│   ├── systems/           # 系统模型
│   │   ├── control/       # 控制系统
│   │   ├── corePurification.ts     # 堆芯净化
│   │   ├── faultSimulation.ts      # 故障模拟
│   │   ├── reactorCore.ts          # 反应堆核心
│   │   └── steamBypass.ts          # 汽轮机旁路
│   └── thermal/           # 热工模型
│       ├── energyBalance.ts        # 能量平衡
│       ├── flowResistance.ts       # 流动阻力
│       ├── iapws97.ts              # 水蒸汽性质
│       ├── massBalance.ts          # 质量平衡
│       └── waterSteamProperties.ts # 水蒸汽性质
├── workers/               # Web Workers
│   ├── dataProcessing.worker.ts    # 数据处理
│   ├── physicsCalculation.worker.ts # 物理计算
│   └── workerManager.ts            # Worker 管理
├── app.css                # 应用样式
├── app.html               # 应用主 HTML 模板
└── vite-env.d.ts          # Vite 环境类型定义
```

## 控制面板说明

### 1. 反应堆控制棒面板

- 控制反应堆的核裂变过程
- 调节控制棒插入深度以控制反应性
- 监控控制棒位置和插入速度
- 支持紧急停堆操作

### 2. 功率调节面板

- 监控和调节反应堆功率输出
- 设置目标功率水平
- 显示功率偏差和反应性
- 支持功率限制和保护

### 3. 再循环泵面板

- 控制主循环回路的泵送系统
- 调节冷却剂流量和速度
- 监控泵的运行状态和性能
- 支持泵的启动/停止控制

### 4. 应急冷却泵面板

- 在紧急情况下激活备用冷却系统
- 确保反应堆安全
- 调节应急冷却剂流量
- 监控应急系统状态

### 5. 汽轮机控制面板

- 控制蒸汽涡轮发电机
- 调节电力输出和负载
- 监控汽轮机转速和效率
- 支持汽轮机启动/停止控制

### 6. 除氧器控制面板

- 管理给水系统中的氧气去除
- 防止系统腐蚀
- 调节除氧器压力和液位
- 监控除氧效果

### 7. 数据趋势图面板

- 显示历史数据趋势
- 分析反应堆性能
- 支持多参数对比
- 可调整时间范围

### 8. 警报 CRT 面板

- 显示系统警报和故障
- 提供警报优先级和分类
- 支持警报确认和处理
- 记录警报历史

### 9. 凝汽器真空系统面板

- 控制凝汽器真空度
- 调节真空系统运行参数
- 监控真空系统状态
- 支持真空系统启动/停止

### 10. 汽轮机辅助系统面板

- 监控和控制汽轮机润滑油系统
- 管理密封油系统
- 调节油温和油压
- 确保汽轮机安全运行

### 11. 堆芯冷却剂净化系统面板

- 控制冷却剂净化过程
- 调节净化流量和效率
- 监控杂质浓度
- 支持净化系统启动/停止

### 12. 三冲量水位控制面板

- 实现核电站真实的水位控制系统
- 调节给水流量以维持水位
- 监控水位误差和流量误差
- 支持水位保护和警报

## 物理模型说明

### 1. 中子物理模型

- **控制棒物理**：模拟控制棒对反应性的影响
- **空泡系数**：模拟冷却剂空泡对反应性的影响
- **氙中毒**：模拟氙-135对中子的吸收

### 2. 热工水力模型

- **能量平衡**：模拟反应堆能量产生和传递
- **质量平衡**：模拟冷却剂质量流动
- **流动阻力**：模拟冷却剂流动阻力和压降
- **水蒸汽性质**：使用 IAPWS-97 方程计算水和蒸汽的热物理性质

### 3. 系统模型

- **反应堆核心**：整合中子物理和热工水力模型
- **汽轮机旁路**：模拟蒸汽压力调节
- **堆芯净化**：模拟冷却剂杂质去除
- **故障模拟**：模拟各种系统故障

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

### 项目配置

- **tailwind.config.js**：Tailwind CSS 配置，包括颜色方案和自定义工具类
- **svelte.config.js**：SvelteKit 配置，包括适配器和插件
- **vite.config.ts**：Vite 构建配置
- **components.json**：shadcn-svelte 组件配置

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

3. 在路由系统中注册新面板

### 状态管理

反应堆状态通过 `reactorStore` 进行管理，包含以下主要部分：

- `core`: 反应堆核心参数（温度、压力、水位）
- `powerRegulation`: 功率调节系统
- `controlRods`: 控制棒系统
- `recirculationPumps`: 再循环泵系统
- `emergencyCoolingPumps`: 应急冷却泵系统
- `turbine`: 汽轮机系统
- `deaerator`: 除氧器系统
- `condenserVacuum`: 凝汽器真空系统
- `steamDump`: 蒸汽排汽系统
- `turbineAuxiliary`: 汽轮机辅助系统
- `condenserHotwell`: 凝汽器热井系统
- `condenserCirculationPumps`: 凝汽器循环泵系统
- `makeUpWater`: 补水系统
- `reactorFeedPumps`: 反应堆给水泵系统
- `hepaFilters`: HEPA 过滤器系统
- `alarms`: 警报系统
- `crtDiagram`: CRT 示意图系统
- `condensateSystem`: 凝结水系统
- `physics`: 物理模型参数
- `steamBypass`: 汽轮机旁路系统
- `corePurification`: 堆芯冷却剂净化系统
- `threeImpulseLevelControl`: 三冲量水位控制系统
- `faultSimulation`: 故障模拟系统
- `logs`: 操作日志

### 自定义主题

应用使用 Tailwind CSS 和 shadcn-svelte 组件库进行样式设计，主要颜色方案包括：

- 主色：#00bcd4 (青色)
- 背景色：#121212 (深灰)
- 边框色：#333 (中灰)
- 强调色：#ff9800 (橙色)
- 成功色：#4caf50 (绿色)
- 警告色：#ff5722 (红色)
- 信息色：#2196f3 (蓝色)

#### 使用 shadcn-svelte 组件

要添加新的 shadcn-svelte 组件：

1. 使用 CLI 安装组件：

   ```bash
   npx shadcn-svelte add [component-name]
   ```

2. 在组件中导入并使用：

   ```svelte
   import {Button} from '$lib/components/ui/button'; import {(Card, CardContent)} from '$lib/components/ui/card';
   ```

3. 遵循 Tailwind CSS 的实用优先样式方法，利用预设的样式类和变体。

## 故障排除

### 常见问题

1. **页面空白**
   - 检查浏览器控制台是否有错误
   - 确保所有依赖项都已正确安装
   - 验证 Cloudflare 配置是否正确
   - 尝试清除浏览器缓存

2. **构建失败**
   - 确保 Node.js 版本符合要求
   - 尝试清理缓存：`pnpm clean` 或删除 `node_modules` 并重新安装
   - 检查 TypeScript 类型错误
   - 验证依赖项版本兼容性

3. **部署问题**
   - 确认 wrangler 已登录
   - 检查账户权限
   - 验证域名配置
   - 检查 Cloudflare Workers 限制

4. **shadcn-svelte 组件问题**
   - 如果组件无法渲染，请检查组件导入路径是否正确
   - 确保在 `components.json` 中正确配置了组件库
   - 验证 Tailwind CSS 配置是否正确集成
   - 检查组件依赖项是否安装

5. **Tailwind CSS 样式问题**
   - 如果样式未生效，请运行 `npx tailwindcss -i ./src/app.pcss -o ./static/tailwind.css --watch` 重新生成样式
   - 检查 `tailwind.config.js` 是否包含了正确的路径
   - 确认组件类名拼写是否正确
   - 验证 Tailwind CSS 版本兼容性

6. **物理模型计算问题**
   - 检查 Web Worker 是否正常运行
   - 验证物理参数是否在合理范围内
   - 检查计算精度和数值稳定性

### 性能优化

- 使用 Svelte 的内置优化
- 合理使用 store 订阅避免不必要的重渲染
- 懒加载大型组件
- 利用 Tailwind CSS 的 JIT 模式减少 CSS 包大小
- 按需导入 shadcn-svelte 组件以减少打包体积
- 使用 Svelte 5 的反应性语法优化组件更新
- 利用 Web Workers 处理计算密集型任务
- 优化图表渲染和数据更新频率
- 使用防抖和节流减少频繁更新
- 合理使用浏览器缓存

## 贡献

欢迎提交 Issue 和 Pull Request 来改进项目！

### 开发流程

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码规范

- 遵循 TypeScript 编码规范
- 使用 Prettier 格式化代码
- 遵循 Svelte 最佳实践
- 保持代码简洁明了
- 添加适当的注释
- 遵循项目日志记录规范

## 许可证

此项目遵循 GNU General Public License v3 许可证。详情请参阅 [LICENSE](./LICENSE) 文件。

## 开发声明

本项目由 lbn2011 和 AI 共同开发，结合了人类的专业知识和人工智能的技术能力，打造了这个功能完善的反应堆模拟器。

## 致谢

- 感谢 SvelteKit 团队提供的优秀框架
- 感谢 Cloudflare 提供的 Workers 平台
- 感谢 Barotrauma 游戏及其社区
- 感谢 shadcn-svelte 团队提供的高质量 UI 组件库
- 感谢 Tailwind CSS 团队提供的实用优先 CSS 框架
- 感谢 Chart.js 团队提供的强大图表库
- 感谢所有为项目做出贡献的开发者

## 支持

如需技术支持或有任何疑问，请创建 Issue 或联系项目维护者。

### 联系方式

- GitHub Issues: [项目 Issues 页面](https://github.com/your-username/barotrauma-reactor-simulator/issues)
- 电子邮件: [maintainer@example.com](mailto:maintainer@example.com)

### 贡献者

- [Your Name](https://github.com/your-username) - 项目维护者
- [Contributor 1](https://github.com/contributor1) - 核心开发者
- [Contributor 2](https://github.com/contributor2) - UI/UX 设计

## 版本历史

### v1.0.0 (2026-02-05)

- 初始版本发布
- 实现基本反应堆模拟功能
- 添加核心控制面板
- 部署到 Cloudflare Workers

### v1.1.0 (2026-02-15)

- 添加更多控制面板
- 增强物理模型
- 改进数据可视化
- 添加故障模拟功能

### v1.2.0 (计划)

- 添加多语言支持
- 实现更复杂的故障场景
- 改进性能和用户体验
- 添加更多详细的物理模型
- 增强数据导出和分析功能

---

**享受模拟反应堆的乐趣！** 🎉
