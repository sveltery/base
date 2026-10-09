import prettier from 'eslint-config-prettier';
import path from 'node:path';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import sveltery from './eslint/plugin.js';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	{
		// Rule fixtures are linted by eslint/*.spec.ts, including the fixture the
		// rule must reject. They are not product source.
		ignores: ['eslint/fixtures/**']
	},
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser
			}
		}
	},
	{
		// The published library stays React- and SvelteKit-free; React belongs in reference fixtures.
		files: ['src/lib/**'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['react', 'react-dom', 'react/*', 'react-dom/*', '@base-ui/*'],
							message: 'React belongs in src/routes reference fixtures only.'
						},
						{
							group: ['$app/*', '@sveltejs/kit', '@sveltejs/kit/*'],
							message: 'The library must not depend on SvelteKit.'
						},
						{
							group: [
								'**/floating-ui-react',
								'**/floating-ui-react/**',
								'**/internal/useAnchorPositioning*',
								'**/internal/usePosition*'
							],
							message:
								'Import overlay internals through src/lib/internal/floating-ui or src/lib/internal/popups.'
						}
					]
				}
			]
		}
	},
	{
		// The fork and the popup store may import each other. Component files may not.
		files: ['src/lib/internal/**'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['react', 'react-dom', 'react/*', 'react-dom/*', '@base-ui/*'],
							message: 'React belongs in src/routes reference fixtures only.'
						},
						{
							group: ['$app/*', '@sveltejs/kit', '@sveltejs/kit/*'],
							message: 'The library must not depend on SvelteKit.'
						}
					]
				}
			]
		}
	},
	{
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			]
		}
	},
	{
		// Svelte has no React refs. React reference fixtures are the comparison
		// implementation and may keep React's own ref APIs.
		files: ['src/**'],
		ignores: ['src/routes/fixtures/**/react-reference.ts'],
		plugins: { sveltery },
		rules: {
			'sveltery/no-cloned-event': 'error',
			'sveltery/no-direct-field-registration': 'error',
			'sveltery/no-copied-helper': 'error',
			'sveltery/no-derived-inline-attachment': 'error',
			'sveltery/no-inline-composite-keys': 'error',
			'sveltery/no-late-bound-getter': 'error',
			'sveltery/no-uncontrolled-bindable': 'error',
			'sveltery/no-unscoped-timer': 'error',
			'sveltery/no-computed-style-direction': 'error',
			'sveltery/no-foreign-context': 'error',
			'sveltery/no-previous-value-effect': 'error',
			'sveltery/no-process-env': 'error',
			'sveltery/no-public-callback-untracked': 'error',
			'sveltery/no-prop-state-sync': 'error',
			'sveltery/no-react-refs': 'error',
			'sveltery/no-split-effect-lifecycle': 'error',
			'sveltery/no-state-updater': 'error',
			'sveltery/no-void-signal-read': 'error'
		}
	}
);
