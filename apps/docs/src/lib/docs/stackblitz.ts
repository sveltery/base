import docs from '../../../package.json';
import type { DemoVariant } from '../../../markdown/demos.ts';

const version = (name: keyof typeof docs.devDependencies) => docs.devDependencies[name];

/** Where the variant's entry file goes. The files it imports sit beside it, under their tab names. */
const ENTRY = 'src/lib/App.svelte';

/**
 * A SvelteKit project that runs one demo variant, in the shape StackBlitz's `/run` endpoint takes.
 * SvelteKit, not plain Vite, because demos such as the Superforms one import `$app` modules.
 */
export function stackBlitzProject(title: string, variant: DemoVariant): Record<string, string> {
	const [entry, ...files] = variant.files;
	return {
		'package.json': JSON.stringify(
			{
				name: 'sveltery-base-demo',
				private: true,
				type: 'module',
				scripts: { dev: 'vite dev', build: 'vite build' },
				dependencies: { '@sveltery/base': 'latest', ...variant.dependencies },
				devDependencies: {
					'@sveltejs/kit': version('@sveltejs/kit'),
					'@sveltejs/vite-plugin-svelte': version('@sveltejs/vite-plugin-svelte'),
					'@tailwindcss/vite': version('@tailwindcss/vite'),
					svelte: version('svelte'),
					tailwindcss: version('tailwindcss'),
					typescript: version('typescript'),
					vite: version('vite')
				}
			},
			null,
			2
		),
		'vite.config.ts': `import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({ plugins: [tailwindcss(), sveltekit()] });
`,
		'src/app.html': `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>${title} - Sveltery Base Example</title>
		%sveltekit.head%
	</head>
	<body>
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
`,
		// Base UI's `demo.css`, with Tailwind.
		'src/app.css': `@import 'tailwindcss';

:root {
	color-scheme: light dark;
}

body {
	font-family: system-ui;
	margin: 0;
	position: relative;
}

.root {
	display: flex;
	flex-direction: column;
	align-items: center;
	min-height: 100vh;
	padding: 3rem;
	box-sizing: border-box;
	isolation: isolate;
}
`,
		'src/routes/+layout.svelte': `<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="root">{@render children()}</div>
`,
		'src/routes/+page.svelte': `<script lang="ts">
	import App from '../lib/App.svelte';
</script>

<App />
`,
		[ENTRY]: entry.code,
		...Object.fromEntries(files.map((file) => [`src/lib/${file.name}`, file.code]))
	};
}

/** Opens the demo variant in a new StackBlitz project, the way Base UI's demos do. */
export function openStackBlitz(title: string, variant: DemoVariant) {
	const form = document.createElement('form');
	form.method = 'POST';
	form.target = '_blank';
	form.action = `https://stackblitz.com/run?file=${encodeURIComponent(ENTRY)}`;
	const fields: Record<string, string> = {
		'project[title]': `${title} - Sveltery Base Example`,
		'project[description]': `${title} demo from Sveltery Base`,
		'project[template]': 'node'
	};
	for (const [path, content] of Object.entries(stackBlitzProject(title, variant))) {
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
