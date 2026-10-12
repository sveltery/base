import prettier from 'eslint-config-prettier';
import path from 'node:path';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import sveltery from './eslint/plugin.js';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

/**
 * Imports the library must not make. `@sveltery/base/form/kit` may import SvelteKit and
 * `@sveltery/base/form/tanstack` may import TanStack Form, and nothing imports either subpath,
 * so the core never depends on an optional peer.
 * @param {{ kit?: boolean, tanstack?: boolean }} allow
 */
function restrictedImports({ kit = false, tanstack = false } = {}) {
	return [
		{
			group: ['react', 'react-dom', 'react/*', 'react-dom/*', '@base-ui/*'],
			message: 'React belongs in src/routes reference fixtures only.'
		},
		...(kit
			? []
			: [
					{
						group: ['$app/*', '@sveltejs/kit', '@sveltejs/kit/*'],
						message: 'The library must not depend on SvelteKit. Only src/lib/form/kit may.'
					}
				]),
		...(tanstack
			? []
			: [
					{
						group: ['@tanstack/*'],
						message: 'Only src/lib/form/tanstack may depend on TanStack Form.'
					}
				]),
		{
			regex: String.raw`(^|/)form/(kit|tanstack)(/|$)|^\.\.?/(kit|tanstack)(/|$)`,
			message: 'The integration subpaths are entry points. Nothing in the library imports them.'
		},
		{
			group: ['@sveltery/*/*', '**/packages/**', '**/src/lib/**'],
			message:
				'Import a workspace package by its name only. Packages must not import the base library.'
		}
	];
}

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
		// The published packages stay React- and SvelteKit-free; React belongs in reference fixtures.
		// The integration subpaths are the exception, each for its own dependency only.
		files: ['src/lib/**', 'packages/*/src/**'],
		rules: {
			'no-restricted-imports': ['error', { patterns: restrictedImports() }]
		}
	},
	{
		files: ['src/lib/form/kit/**'],
		rules: {
			'no-restricted-imports': ['error', { patterns: restrictedImports({ kit: true }) }]
		}
	},
	{
		files: ['src/lib/form/tanstack/**'],
		rules: {
			'no-restricted-imports': ['error', { patterns: restrictedImports({ tanstack: true }) }]
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
		files: ['src/**', 'packages/*/src/**'],
		ignores: ['src/routes/fixtures/**/react-reference.ts'],
		plugins: { sveltery },
		rules: {
			'sveltery/no-cloned-event': 'error',
			'sveltery/no-derived-inline-attachment': 'error',
			'sveltery/no-layout-read-in-derived': 'error',
			'sveltery/no-unscoped-timer': 'error',
			'sveltery/no-previous-value-effect': 'error',
			'sveltery/no-process-env': 'error',
			'sveltery/no-prop-state-sync': 'error',
			'sveltery/no-react-refs': 'error',
			'sveltery/no-split-effect-lifecycle': 'error',
			'sveltery/no-state-updater': 'error'
		}
	},
	{
		// The one port of upstream useValueChanged. Parent writes reach no handler,
		// so the field meta updates that follow every value change run here.
		files: ['src/lib/internal/useValueChanged.svelte.ts'],
		rules: {
			'sveltery/no-previous-value-effect': 'off'
		}
	},
	{
		// React useState in the shared reference helpers. `setCalls`, `setValues`,
		// and `setSubmitted` take React's functional updater. Other project rules
		// still apply to these files.
		files: ['src/routes/fixtures/checked-reference.ts', 'src/routes/fixtures/react-fixture.ts'],
		rules: {
			'sveltery/no-state-updater': 'off'
		}
	}
);
