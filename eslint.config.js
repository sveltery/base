import path from 'node:path';
import js from '@eslint/js';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import svelte from 'eslint-plugin-svelte';
import ts from 'typescript-eslint';

export default defineConfig(
  includeIgnoreFile(path.resolve(import.meta.dirname, '.gitignore')),
  { ignores: ['parity/**'] },
  js.configs.recommended,
  ts.configs.recommended,
  svelte.configs.recommended,
  prettier,
  svelte.configs.prettier,
  { languageOptions: { globals: { ...globals.node, ...globals.browser } } },
  {
    rules: {
      'svelte/no-at-const-tags': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  // TypeScript checks undeclared names; retain no-undef for JavaScript scripts.
  { files: ['**/*.ts', '**/*.svelte'], rules: { 'no-undef': 'off' } },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
      },
    },
  },
  // Empty defaults preserve upstream generic event-detail types.
  {
    files: ['packages/base/src/lib/internals/createBaseUIEventDetails.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': ['error', { allowObjectTypes: 'always' }],
    },
  },
  // Preserve the source-derived no-op branch until that port is deliberately revised.
  {
    files: ['packages/base/src/lib/merge-props/index.ts'],
    rules: { 'no-self-assign': 'off' },
  },
);
