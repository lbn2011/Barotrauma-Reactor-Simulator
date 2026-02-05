import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte'],

  kit: {
    adapter: adapter({
      // 使用默认配置，让适配器自动生成 wrangler.toml
    }),
    alias: {
      '$lib': 'src/lib',
      '$lib/*': 'src/lib/*',
      '$routes': 'src/routes',
      '$routes/*': 'src/routes/*',
      '$assets': 'src/assets',
      '$assets/*': 'src/assets/*',
    },
    appDir: 'internal',
    files: {
      routes: 'src/routes',
      lib: 'src/lib',
      assets: 'static'
    }
  }
};

export default config;
