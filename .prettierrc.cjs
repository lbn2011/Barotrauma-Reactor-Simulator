module.exports = {
  // 基本配置
  semi: true,
  tabWidth: 2,
  singleQuote: true,
  printWidth: 80,
  trailingComma: 'es5',
  arrowParens: 'always',
  bracketSpacing: true,
  bracketSameLine: false,
  endOfLine: 'lf',
  htmlWhitespaceSensitivity: 'css',
  insertPragma: false,

  jsxSingleQuote: false,
  proseWrap: 'preserve',
  quoteProps: 'as-needed',
  requirePragma: false,
  useTabs: false,
  vueIndentScriptAndStyle: false,

  // Svelte配置
  plugins: ['prettier-plugin-svelte'],
  svelteSortOrder: 'scripts-styles-markup-options',
  svelteStrictMode: false,
  svelteAllowShorthand: true,

  // 覆盖配置
  overrides: [
    {
      files: '*.md',
      options: {
        printWidth: 100,
      },
    },
    {
      files: '*.json',
      options: {
        printWidth: 200,
      },
    },
  ],
};
