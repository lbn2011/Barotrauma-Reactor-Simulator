import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte'],

  kit: {
    adapter: adapter({}),
    alias: {
      $lib: 'src/lib',
      '$lib/*': 'src/lib/*',
      $routes: 'src/routes',
      '$routes/*': 'src/routes/*',
      $assets: 'src/assets',
      '$assets/*': 'src/assets/*',
    },
    appDir: 'internal',
  },
};

export default config;
