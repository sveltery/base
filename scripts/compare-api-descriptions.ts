/**
 * Lists every part and prop description the docs' API tables show beside the text Base UI's
 * `types.md` shows for it, and flags the ones that differ.
 *
 *   node scripts/compare-api-descriptions.ts <base-ui checkout at the pinned commit> [--all] [--json] [--defaults]
 *
 * `--defaults` lists only upstream's `default*` props, such as `defaultOpen`, with our status.
 *
 * Exits 1 when a description differs from upstream for a reason `explained` does not name.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { apiReference, type ApiProp } from '../apps/docs/markdown/api.ts';

const [upstreamRoot, ...flags] = process.argv.slice(2);
if (!upstreamRoot) throw new Error('usage: compare-api-descriptions.ts <base-ui checkout> [--all]');
const showAll = flags.includes('--all');
const json = flags.includes('--json');
const defaultsOnly = flags.includes('--defaults');
const lib = resolve(import.meta.dirname, '../src/lib');
const docs = join(upstreamRoot, 'docs/src/app/(docs)/react');

/** React prop names that Svelte spells as the HTML attribute. */
const htmlNames: Record<string, string> = {
	readOnly: 'readonly',
	autoComplete: 'autocomplete',
	inputMode: 'inputmode',
	tabIndex: 'tabindex',
	onClick: 'onclick',
	onBlur: 'onblur',
	onFocus: 'onfocus',
	onKeyDown: 'onkeydown'
};

/** Upstream wording that names a React API, the Svelte wording that replaces it, and why. */
const rewordings: Array<[RegExp, string, string]> = [
	[
		/`RefObject`: Move focus to the ref element\./g,
		'`HTMLElement`: Move focus to that element.',
		'Focus targets are elements, not ref objects.'
	],
	[
		/use the `((?!default)\w+)` prop instead/g,
		'use `bind:$1` instead',
		'`bind:` controls the prop.'
	],
	[/\bReact\b/g, 'Svelte', 'Names Svelte, not React.'],
	[
		/\]\(https:\/\/base-ui\.com\/react\/components\//g,
		'](https://base.sveltery.dev/components/',
		'Links to our component page.'
	]
];

const preventDefault =
	'Svelte has no `preventBaseUIHandler`. `event.preventDefault()` skips the part handler (AGENTS.md).';

/** Upstream rows that have no counterpart in a Svelte props table. */
const reactOnly: Record<string, string> = {
	className: 'Svelte takes `class` as an HTML attribute, so the table has no row.',
	style: 'Svelte takes `style` as an HTML attribute, so the table has no row.',
	actionsRef: '`bind:this` on the root gives `close()` and `unmount()`.',
	inputRef: 'Not ported (docs/upstream-differences.md).',
	onclick: 'An HTML event attribute, so the table has no row.',
	onblur: 'An HTML event attribute, so the table has no row.',
	onfocus: 'An HTML event attribute, so the table has no row.',
	onkeydown: 'An HTML event attribute, so the table has no row.',
	tabindex: 'An HTML attribute, so the table has no row.'
};

const renderLead =
	"Allows you to replace the component's HTML element with a different tag, or compose it with another component.";
/** Our `render` description: a snippet, where upstream takes a ReactElement or a function. */
const renderTexts = [
	`${renderLead} Accepts a snippet that receives the props to spread onto the element, the component's state, and the children to render.`,
	`${renderLead} Accepts a snippet that receives the props to spread onto the element and the component's state.`
];

/** HTML attributes our types redeclare. Upstream inherits them and lists no row. */
const htmlAttributes = new Set(['id', 'disabled', 'type', 'aria-live', 'onsubmit', 'novalidate']);

/**
 * Differences that follow from the Svelte API, keyed `Component.Part`, `Component.Part prop`, or
 * `* prop` for every part.
 */
const explained: Record<string, string> = {
	'* children': 'A Svelte snippet.',
	'Accordion.Trigger onclick': preventDefault,
	'Checkbox.Root onclick': preventDefault,
	'Collapsible.Trigger onclick': preventDefault,
	'Radio.Root onclick': preventDefault,
	'Switch.Root onclick': preventDefault,
	'Tabs.Tab onclick': preventDefault,
	'Toggle.Toggle onclick': preventDefault,
	'Button.Button onclick': 'Ours documents which clicks reach `onclick`.',
	'Toolbar.Button onclick': 'Ours documents which clicks reach `onclick`.',
	'AlertDialog.Trigger id':
		'`Dialog.Trigger` props, shared with `AlertDialog`. Upstream says `DialogRoot` here.',
	'ContextMenu.RadioItem value':
		'`Menu.RadioItem` file, shared with `ContextMenu`. It names `Menu.RadioGroup`.',
	'Drawer.Root defaultSnapPoint': '`bind:snapPoint` makes the snap point controlled.',
	'Field.Control defaultValue': 'Declared once with `Input`, whose upstream row has this text.',
	'Field.Control value': 'Bindable. Upstream lists only `defaultValue` on `Field.Control`.',
	'RadioGroup.Root': 'Ours exports it as `Radio.Root`, compared under Radio.',
	'RadioGroup.Indicator': 'Ours exports it as `Radio.Indicator`, compared under Radio.',
	'Radio.RadioGroup': 'Ours exports it as `RadioGroup`, compared under RadioGroup.',
	'Toolbar.Input defaultValue': 'An HTML input attribute, so the table has no row.'
};

type Text = { description: string; props: Map<string, string> };
type Status = 'same' | 'explained' | 'DIFF' | 'OURS ONLY' | 'UPSTREAM ONLY';

const squash = (text: string) => text.replace(/\s+/g, ' ').trim();
/** `types.md` drops list markers and line breaks inside a table cell, so compare without them. */
const key = (text: string) => text.replace(/(^|\s)-\s+/g, ' ').replace(/\s+/g, '');

/** Parses the `### Part` sections of an upstream `types.md` into descriptions and prop rows. */
function upstreamParts(file: string): Map<string, Text> {
	const parts = new Map<string, Text>();
	for (const section of readFileSync(file, 'utf8').split(/^### /m).slice(1)) {
		const [heading, ...lines] = section.split('\n');
		const name = heading.trim();
		if (/\.(Props|State)$/.test(name) || name.includes(' ')) continue;
		const body = lines.join('\n');
		const props = new Map<string, string>();
		const table = body.match(/^\*\*[^*]+ Props:\*\*\n\n((?:\|.*\n?)+)/m)?.[1];
		for (const row of table?.split('\n').slice(2) ?? []) {
			const cells = row
				.split(/(?<!\\)\|/)
				.slice(1, -1)
				.map((cell) => cell.replace(/\\\|/g, '|').trim());
			if (cells.length < 4) continue;
			const prop = cells[0].replace(/\\\*$/, '').replace(/\\/g, '');
			const text = cells[3].replace(/&#xA;/g, '\n');
			props.set(htmlNames[prop] ?? prop, text === '-' ? '' : text);
		}
		parts.set(name, { description: body.split(/^\*\*|^```|^\|/m)[0], props });
	}
	return parts;
}

/** Upstream documents `Radio` on the Radio Group page. */
const upstreamFolders: Record<string, string> = { radio: 'radio-group' };

function upstreamFile(folder: string): string | undefined {
	for (const kind of ['components', 'utils']) {
		const file = join(docs, kind, upstreamFolders[folder] ?? folder, 'types.md');
		if (existsSync(file)) return file;
	}
}

/** Compares one description and names the reason for any difference. */
function compare(
	ours: string | undefined,
	theirs: string | undefined,
	keys: string[],
	prop?: ApiProp
): { status: Status; why?: string } {
	const listed = keys.map((k) => explained[k]).find(Boolean);
	if (ours === undefined) {
		const why = listed ?? reactOnly[keys[0].split(' ')[1]];
		return why ? { status: 'explained', why } : { status: 'UPSTREAM ONLY' };
	}
	if (theirs === undefined) {
		if (listed) return { status: 'explained', why: listed };
		if (prop && htmlAttributes.has(prop.name)) {
			return { status: 'explained', why: 'An HTML attribute our types redeclare.' };
		}
		return { status: 'OURS ONLY' };
	}
	if (key(ours) === key(theirs)) return { status: 'same' };
	if (prop?.name === 'render' && renderTexts.some((text) => key(text) === key(ours))) {
		return { status: 'explained', why: 'A snippet, not a ReactElement or a function.' };
	}
	let reworded = theirs;
	const reasons: string[] = [];
	for (const [pattern, replacement, reason] of rewordings) {
		if (!pattern.test(reworded)) continue;
		reworded = reworded.replace(pattern, replacement);
		reasons.push(reason);
	}
	if (reasons.length && key(ours) === key(reworded)) {
		return { status: 'explained', why: [...new Set(reasons)].join(' ') };
	}
	if (listed) return { status: 'explained', why: listed };
	if (prop?.bindable) {
		return { status: 'explained', why: `\`bind:${prop.name}\` replaces the controlled pair.` };
	}
	return { status: 'DIFF' };
}

let unexplained = 0;
const lines: string[] = [];
const entries: object[] = [];

function report(
	where: { folder: string; part: string; file?: string; prop?: string },
	label: string,
	ours: string,
	theirs: string,
	{ status, why }: { status: Status; why?: string }
) {
	entries.push({ status, label, ...where, ours, upstream: theirs, why });
	if (status !== 'same' && status !== 'explained') unexplained++;
	if (status === 'same' && !showAll) return;
	lines.push(`[${status}] ${label}`);
	lines.push(`  ours:     ${squash(ours) || '(none)'}`);
	lines.push(`  upstream: ${squash(theirs) || '(none)'}`);
	if (why) lines.push(`  why:      ${why}`);
}

for (const folder of readdirSync(lib).sort()) {
	if (!existsSync(join(lib, folder, 'index.ts'))) continue;
	let ours;
	try {
		ours = apiReference(lib, folder);
	} catch {
		continue;
	}
	if (!ours.length) continue;
	const file = upstreamFile(folder);
	if (!file) {
		lines.push(`[NO UPSTREAM PAGE] ${folder}`);
		continue;
	}
	const theirs = upstreamParts(file);
	const namespace = ours[0].name.split('.')[0];
	const seenParts = new Set<string>();
	for (const part of ours) {
		const partName = part.name.split('.').slice(1).join('.') || part.name;
		seenParts.add(partName);
		const upstream = theirs.get(partName);
		const label = `${namespace}.${partName}`;
		const where = { folder, part: part.name, file: part.files[0] };
		const result = compare(part.description, upstream?.description, [label]);
		report(where, label, part.description, upstream?.description ?? '', result);
		if (!upstream) continue;
		const seen = new Set<string>();
		const keys = (prop: string) => [`${label} ${prop}`, `${namespace} ${prop}`, `* ${prop}`];
		for (const prop of part.props) {
			seen.add(prop.name);
			const text = upstream.props.get(prop.name);
			const result = compare(prop.description, text, keys(prop.name), prop);
			report(
				{ ...where, prop: prop.name },
				`${label} ${prop.name}`,
				prop.description,
				text ?? '',
				result
			);
		}
		for (const [prop, text] of upstream.props) {
			if (seen.has(prop)) continue;
			const result = compare(undefined, text, keys(prop));
			report({ ...where, prop }, `${label} ${prop}`, '', text, result);
		}
	}
	for (const [partName, upstream] of theirs) {
		if (seenParts.has(partName) || !upstream.props.size) continue;
		const label = `${namespace}.${partName}`;
		const result = compare(undefined, upstream.description, [label]);
		report({ folder, part: label }, label, '', upstream.description, result);
	}
}

if (defaultsOnly) {
	const rows = entries.filter((e): e is { status: Status; label: string; prop: string } =>
		/^default[A-Z]/.test((e as { prop?: string }).prop ?? '')
	);
	for (const { status, label } of rows) console.log(`${status}\t${label}`);
} else if (json) console.log(JSON.stringify(entries, null, '\t'));
else console.log(`${lines.join('\n')}\n\n${unexplained} unexplained difference(s)`);
process.exit(unexplained ? 1 : 0);
