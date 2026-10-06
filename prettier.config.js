/** @type {import('prettier').Config} */
export default {
  singleQuote: true,
  quoteProps: 'preserve',
  trailingComma: 'all',
  htmlWhitespaceSensitivity: 'strict',
  tabWidth: 2,
  printWidth: 100,
  plugins: ['prettier-plugin-svelte'],
  overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
};
