import docs from '../../../package.json';

const version = (name: keyof typeof docs.devDependencies) => docs.devDependencies[name];

/**
 * A Vite project that runs one demo, in the shape StackBlitz's `/run` endpoint takes. Demos use
 * Tailwind classes and import from `@sveltery/base`, so the project installs both.
 */
export function stackBlitzProject(title: string, demo: string): Record<string, string> {
	return {
		'package.json': JSON.stringify(
			{
				name: 'sveltery-base-demo',
				private: true,
				type: 'module',
				scripts: { dev: 'vite', build: 'vite build' },
				dependencies: {
					'@sveltery/base': 'latest',
					svelte: version('svelte')
				},
				devDependencies: {
					'@sveltejs/vite-plugin-svelte': version('@sveltejs/vite-plugin-svelte'),
					'@tailwindcss/vite': version('@tailwindcss/vite'),
					tailwindcss: version('tailwindcss'),
					typescript: version('typescript'),
					vite: version('vite')
				}
			},
			null,
			2
		),
		'vite.config.ts': `import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({ plugins: [tailwindcss(), svelte()] });
`,
		'index.html': `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>${title}</title>
	</head>
	<body>
		<div id="app"></div>
		<script type="module" src="/src/main.ts"></script>
	</body>
</html>
`,
		'src/app.css': `@import 'tailwindcss';

body {
	display: flex;
	min-height: 100vh;
	align-items: center;
	justify-content: center;
}
`,
		'src/main.ts': `import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

mount(App, { target: document.getElementById('app')! });
`,
		'src/App.svelte': demo
	};
}

/** Opens the demo in a new StackBlitz project, the way Base UI's demos do. */
export function openStackBlitz(title: string, demo: string) {
	const form = document.createElement('form');
	form.method = 'POST';
	form.target = '_blank';
	form.action = 'https://stackblitz.com/run?file=src%2FApp.svelte';
	const fields: Record<string, string> = {
		'project[title]': title,
		'project[description]': `${title} demo from Sveltery Base`,
		'project[template]': 'node'
	};
	for (const [path, content] of Object.entries(stackBlitzProject(title, demo))) {
		fields[`project[files][${path}]`] = content;
	}
	for (const [name, value] of Object.entries(fields)) {
		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = name;
		input.value = value;
		form.append(input);
	}
	document.body.append(form);
	form.submit();
	form.remove();
}
