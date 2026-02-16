import js from '@eslint/js';

export default [
  // 忽略文件
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '*.log',
      'pnpm-lock.yaml',
      'package-lock.json',
      'yarn.lock',
      '.svelte-kit/', // 排除 SvelteKit 生成的目录
      '.svelte-kit/**/*',
      'src/**/*.js', // 排除可能的 JS 文件
    ],
  },

  // JavaScript/TypeScript 配置
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        browser: true,
        node: true,
        module: true,
      },
    },
    rules: {
      // 基本规则
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'no-empty': 'error',
      'no-extra-semi': 'error',
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'eol-last': ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'comma-spacing': ['error', { before: false, after: true }],
      'space-infix-ops': 'error',
      'space-before-blocks': 'error',
      'space-before-function-paren': ['error', 'always'],
      'arrow-spacing': ['error', { before: true, after: true }],
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    },
  },

  // Svelte 配置 - 忽略 Svelte 文件，因为它们需要特殊配置
  {
    ignores: ['**/*.svelte'],
  },
];
