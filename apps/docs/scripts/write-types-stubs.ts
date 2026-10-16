// Gives each page that writes `<ApiPart name="..." part="..." />` a `types.ts` beside it, as Base UI's
// pages have, renders `<TypesAccordion.Root />` in place of each tag, and deletes the hand-written
// data-attribute and CSS-variable tables the library's exports now generate.
// Run with `node scripts/write-types-stubs.ts` from apps/docs.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { apiReference, type ApiPart } from '../markdown/api.ts';
import { pageFiles } from '../markdown/pages.ts';
import { shortName } from '../markdown/types.ts';

const docs = new URL('..', import.meta.url).pathname;
const routes = join(docs, 'src/routes/(docs)');
const lib = join(docs, '../../src/lib');

const TAG = /^<ApiPart name="([\w-]+)" part="(\w+)" \/>$/;
const SECTION_LABEL = /^\*\*(Parameters|Return value|Properties|Methods)\*\*$/m;
const TABLE_KINDS: Record<string, 'dataAttributes' | 'cssVariables'> = {
	attribute: 'dataAttributes',
	'css variable': 'cssVariables'
};

const exportName = (part: ApiPart) => part.name.split('.')[0];

for (const { path } of pageFiles(routes)) {
	const source = readFileSync(path, 'utf8');
	const lines = source.split('\n');
	const tags = lines.flatMap((line) => {
		const match = TAG.exec(line);
		return match ? [{ folder: match[1], part: match[2] }] : [];
	});
	if (!tags.length) continue;

	const folders = [...new Set(tags.map((tag) => tag.folder))];
	const parts = new Map(folders.map((folder) => [folder, apiReference(lib, folder)]));
	const imports = folders.map((folder) => [exportName(parts.get(folder)![0]), folder] as const);
	const name = `Types${imports[0][0]}`;
	// Base UI's `createTypes` hides the part's description. A page with one part and a function's
	// reference sections documents several types, so it shows it.
	const multiple = tags.length > 1 || SECTION_LABEL.test(source);
	const argument =
		imports.length > 1 ? `{ ${imports.map(([ident]) => ident).join(', ')} }` : imports[0][0];
	const single = tags.length === 1 ? shortName(tags[0].part) : undefined;
	const stub = [
		...imports.map(([ident, folder]) => `import { ${ident} } from '@sveltery/base/${folder}';`),
		`import { ${multiple ? 'createMultipleTypes' : 'createTypes'} } from '#lib/docs/create-types.ts';`,
		'',
		multiple
			? [
					`const { types } = createMultipleTypes(import.meta.url, ${argument});`,
					'',
					`export const ${name} = types${single ? `.${single}` : ''};`
				].join('\n')
			: `export const ${name} = createTypes(import.meta.url, ${argument});`,
		''
	].join('\n');
	writeFileSync(join(dirname(path), 'types.ts'), stub);

	const out: string[] = [];
	let current: ApiPart | undefined;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (/^## API reference$/.test(line)) {
			out.push(line, '', '<script>', `\timport { ${name} } from './types';`, '</script>');
			continue;
		}
		if (/^#{1,3} /.test(line)) current = undefined;
		const tag = TAG.exec(line);
		if (tag) {
			current = parts.get(tag[1])!.find((part) => shortName(part.name) === tag[2]);
			if (!current) throw new Error(`${path}: ${tag[1]} has no part ${tag[2]}`);
			out.push(single || !multiple ? `<${name} />` : `<${name}.${tag[2]} />`);
			continue;
		}
		const kind = current && TABLE_KINDS[/^\| ([^|]+?) +\|/.exec(line)?.[1].toLowerCase() ?? ''];
		if (kind && current![kind].length) {
			while (i + 1 < lines.length && lines[i + 1].startsWith('|')) i++;
			if (lines[i + 1] === '' && out.at(-1) === '') i++;
			continue;
		}
		out.push(line);
	}
	writeFileSync(path, out.join('\n'));
}
