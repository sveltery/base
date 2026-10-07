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
		// Rule fixtures are linted by eslint/no-react-refs.spec.ts, including the
		// fixture the rule must reject. They are not product source.
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
			'sveltery/no-react-refs': 'error'
		}
	}
);
