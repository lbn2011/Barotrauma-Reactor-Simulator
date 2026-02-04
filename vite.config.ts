import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@lib': resolve(__dirname, './src/lib'),
    },
  },
  build: {
    // 启用代码分割
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('chart.js')) {
            return 'vendor';
          }
          if (id.includes('svelte')) {
            return 'svelte';
          }
        },
      },
    },
    // 启用压缩
    minify: 'esbuild',
    // 生成 sourcemap 用于调试
    sourcemap: false,
    // 配置构建输出目录
    outDir: 'dist',
    // 配置静态资源输出目录
    assetsDir: 'assets',
    // 配置资源文件名哈希
    assetsInlineLimit: 4096,
  },
  // 开发服务器配置
  server: {
    port: 5173,
    open: true,
  },
  // 启用依赖预构建
  optimizeDeps: {
    include: ['chart.js'],
    exclude: ['svelte-chartjs'],
  },
});
