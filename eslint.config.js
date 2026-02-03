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
    ],
  },

  // 通用配置
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
];
