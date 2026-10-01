import js from '@eslint/js';
import globals from 'globals';
import svelte from 'eslint-plugin-svelte';
import ts from 'typescript-eslint';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.svelte-kit/**',
      '**/.checks/**',
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  { languageOptions: { globals: { ...globals.node, ...globals.browser } } },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
  // Empty defaults preserve upstream generic event-detail types.
  {
    files: ['packages/base/src/lib/internals/createBaseUIEventDetails.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowObjectTypes: 'always' },
      ],
    },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: { parserOptions: { parser: ts.parser } },
  },
  // Existing mergeProps preserves the upstream no-op branch; remove when that port is revised.
  {
    files: ['packages/base/src/lib/merge-props/index.ts'],
    rules: { 'no-self-assign': 'off' },
  },
];
