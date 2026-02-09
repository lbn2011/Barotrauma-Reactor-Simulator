<script lang="ts">
  import { reactorStore, setTargetPower } from '../../lib/stores/reactorStore';
  import { Card, CardContent } from '../../lib/components/ui/card';
  import { Button } from '../../lib/components/ui/button';
  import { Slider } from '../../lib/components/ui/slider';

  // 订阅状态
  let powerRegulation: {
    powerLevel: number;
    targetPower: number;
    reactivity: number;
  };
  let core: { temperature: number; pressure: number; waterLevel: number };

  reactorStore.subscribe((state) => {
    powerRegulation = state.powerRegulation;
    core = state.core;
  });

  // 处理目标功率变化
  function handleTargetPowerChange() {
    // 由于reactorStore是响应式的，powerRegulation.targetPower会自动更新
  }

  // 快速操作按钮
  function setPowerQuickly(power: number) {
    setTargetPower(power);
  }
</script>

<div class="bg-background border border-border rounded-lg p-8 shadow-md">
  <h1 class="text-2xl font-bold text-primary mb-8">2. 反应堆功率调节面板</h1>

  <div class="mb-8">
    <h2 class="text-lg font-semibold text-foreground mb-4">功率水平调节</h2>

    <div class="flex flex-col gap-4">
      <div class="my-8">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={powerRegulation.targetPower}
          on:input={(e) => setTargetPower(parseFloat((e.target as HTMLInputElement).value))}
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <Card class="bg-card border-border hover:border-primary/50 transition-all duration-300">
          <CardContent class="p-6">
            <div class="text-sm text-muted-foreground mb-2">当前功率水平</div>
            <div class="text-2xl font-bold text-foreground">
              {powerRegulation.powerLevel?.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card class="bg-card border-border hover:border-primary/50 transition-all duration-300">
          <CardContent class="p-6">
            <div class="text-sm text-muted-foreground mb-2">目标功率水平</div>
            <div class="text-2xl font-bold text-primary">
              {powerRegulation.targetPower?.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-8">
        <Button 
          variant="secondary" 
          class="py-4 hover:bg-secondary/80 transition-all duration-300"
          onclick={() => setPowerQuickly(0)}
        >
          0%
        </Button>
        <Button 
          variant="secondary" 
          class="py-4 hover:bg-secondary/80 transition-all duration-300"
          onclick={() => setPowerQuickly(25)}
        >
          25%
        </Button>
        <Button 
          variant="secondary" 
          class="py-4 hover:bg-secondary/80 transition-all duration-300"
          onclick={() => setPowerQuickly(50)}
        >
          50%
        </Button>
        <Button 
          variant="secondary" 
          class="py-4 hover:bg-secondary/80 transition-all duration-300"
          onclick={() => setPowerQuickly(75)}
        >
          75%
        </Button>
        <Button 
          variant="secondary" 
          class="py-4 hover:bg-secondary/80 transition-all duration-300"
          onclick={() => setPowerQuickly(100)}
        >
          100%
        </Button>
      </div>
    </div>
  </div>

  <div class="bg-card border border-border rounded-lg p-6 my-8 hover:border-primary/50 transition-all duration-300">
    <h3 class="text-center text-lg font-semibold text-primary mb-6">功率水平指示器</h3>
    <div class="relative w-[300px] h-[150px] mx-auto">
      <div class="absolute inset-0 rounded-t-[150px] bg-muted overflow-hidden"></div>
      <div class="absolute inset-0 rounded-t-[150px] bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transform rotate-180"></div>
      <div class="absolute bottom-0 left-1/2 w-[260px] h-[130px] bg-card rounded-t-[130px] -translate-x-1/2"></div>
      <div
        class="absolute bottom-0 left-1/2 w-[4px] h-[120px] bg-primary transform -translate-x-1/2 transition-transform duration-500 ease"
        style="transform-origin: bottom center; transform: translateX(-50%) rotate(calc(var(--angle, 0) * 1deg));"
        style:--angle={powerRegulation.powerLevel ? powerRegulation.powerLevel * 1.8 : 0}
      ></div>
      <div class="absolute bottom-4 left-1/2 w-[12px] h-[12px] bg-primary rounded-full -translate-x-1/2"></div>
      <div class="flex justify-between mt-4 px-5 text-xs text-muted-foreground">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
    <Card class="bg-card border-border hover:border-primary/50 transition-all duration-300">
      <CardContent class="p-6">
        <div class="text-sm text-muted-foreground mb-2">反应性</div>
        <div class={`text-xl font-bold ${powerRegulation.reactivity > 0 ? 'text-red-500' : 'text-green-500'}`}>
          {powerRegulation.reactivity?.toFixed(2)}
        </div>
      </CardContent>
    </Card>

    <Card class="bg-card border-border hover:border-primary/50 transition-all duration-300">
      <CardContent class="p-6">
        <div class="text-sm text-muted-foreground mb-2">堆芯温度</div>
        <div class="text-xl font-bold text-foreground">{core.temperature?.toFixed(1)}°C</div>
      </CardContent>
    </Card>

    <Card class="bg-card border-border hover:border-primary/50 transition-all duration-300">
      <CardContent class="p-6">
        <div class="text-sm text-muted-foreground mb-2">堆芯压力</div>
        <div class="text-xl font-bold text-foreground">{core.pressure?.toFixed(2)} MPa</div>
      </CardContent>
    </Card>
  </div>

  <div class="mt-12">
    <h2 class="text-lg font-semibold text-foreground mb-4">操作说明</h2>
    <Card class="bg-card border-border hover:border-primary/50 transition-all duration-300">
      <CardContent class="p-6">
        <ul class="list-disc pl-6 text-foreground space-y-2">
          <li>功率水平范围: 0% 到 100%</li>
          <li>调节目标功率后，反应堆会逐渐调整到该功率水平</li>
          <li>功率水平影响堆芯温度和压力，功率越高温度和压力越大</li>
          <li>正常运行时，功率水平通常保持在 30-70% 之间</li>
          <li>功率水平的变化会受到控制棒位置的影响</li>
        </ul>
      </CardContent>
    </Card>
  </div>
</div>
