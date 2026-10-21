// Lists every part handler that calls a consumer handler and then runs its own code, and
// whether that code is skipped when the consumer calls `event.preventDefault()`.
// Base UI merges each part handler with the consumer's through `mergeProps`, so a consumer's
// `preventBaseUIHandler()` skips it. Here `preventDefault()` is that signal (AGENTS.md).
// Usage: node scripts/check-handler-prevention.mjs [--all]
// Exits 1 when a handler runs its own code without a check and is not in ALLOWED.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../src/lib/', import.meta.url));

// Handlers that may run after a prevented consumer handler, with the reason.
// Key: `<file>:<function>`. An entry that matches no handler fails the check.
const ALLOWED = {
	'number-field/NumberFieldScrubArea.svelte:handleClickCapture':
		'It records the native click. Skipped, the scrub area would send a second click.',
	'select/SelectLabel.svelte:handlePointerDown':
		'It only prevents the default, as the consumer did.',
	'combobox/ComboboxLabel.svelte:handlePointerDown':
		'It only prevents the default, as the consumer did.',
	'toolbar/ToolbarInput.svelte:onclick': 'It only prevents the default, as the consumer did.',
	'toolbar/ToolbarInput.svelte:onpointerdown': 'It only prevents the default, as the consumer did.',
	'tabs/TabsTab.svelte:onkeydown': 'The code after the call is the other branch of its `if`.'
};

function* files(dir) {
	for (const name of readdirSync(dir)) {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) yield* files(path);
		else if (
			/\.svelte$|\.svelte\.ts$|(?<!\.spec)\.ts$/.test(name) &&
			!/\.spec\.|\.test\./.test(name)
		)
			yield path;
	}
}

// A consumer handler call: `onfocus?.(event)`, `props.onblur?.(event)`, `rest.onclick(event)`.
const CALL =
	/(?<![\w.])((?:props|rest|elementProps|restProps|handlers)\.)?(on[a-z]+)\??\.?\(\s*event\b/g;

function enclosingBody(source, index) {
	let depth = 0;
	for (let i = index; i >= 0; i--) {
		const char = source[i];
		if (char === '}') depth++;
		else if (char === '{') {
			if (depth === 0) {
				let end = i;
				let inner = 0;
				for (; end < source.length; end++) {
					if (source[end] === '{') inner++;
					else if (source[end] === '}' && --inner === 0) break;
				}
				const head = source.slice(Math.max(0, i - 200), i);
				const name =
					/(?:function\s+(\w+)\s*\([^)]*\)|(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?|(\w+)\s*[:=]\s*(?:\([^)]*\)|event)\s*(?::[^=]+)?=>)\s*$/.exec(
						head.replace(/\s+/g, ' ')
					);
				return { start: i, end, name: name?.[1] ?? name?.[2] ?? name?.[3] ?? '?' };
			}
			depth--;
		}
	}
	return null;
}

// `onfocus(event: FocusEvent) {` defines a part handler. It is not a call.
function isDefinition(source, index) {
	let depth = 1;
	let i = index;
	for (; i < source.length && depth > 0; i++) {
		if (source[i] === '(') depth++;
		else if (source[i] === ')') depth--;
	}
	return /^\s*(?::[^;{=]+)?\{/.test(source.slice(i, i + 200));
}

function stripComments(code) {
	return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

const rows = [];
for (const path of files(root)) {
	const source = readFileSync(path, 'utf8');
	const file = relative(root, path);
	for (const match of source.matchAll(CALL)) {
		if (isDefinition(source, match.index + match[0].length)) continue;
		const body = enclosingBody(source, match.index);
		if (!body) continue;
		const after = stripComments(source.slice(match.index + match[0].length, body.end))
			.replace(/^[^;\n]*[;\n]/, '')
			.trim();
		const ownCode = after.replace(/[\s;}]/g, '').length > 0;
		// The check must be the next statement, so no part code runs before it.
		const checked = /^if\s*\([^)]*(defaultPrevented|isPrevented|prevented\b)/.test(after);
		const line = source.slice(0, match.index).split('\n').length;
		const key = `${file}:${body.name}`;
		const status = !ownCode ? 'last' : checked ? 'checked' : ALLOWED[key] ? 'allowed' : 'UNCHECKED';
		rows.push({
			status,
			where: `${file}:${line}`,
			key,
			fn: body.name,
			handler: match[2]
		});
	}
}

const all = process.argv.includes('--all');
const shown = all ? rows : rows.filter((row) => row.status === 'UNCHECKED');
for (const row of shown)
	console.log(`${row.status.padEnd(9)} ${row.where} ${row.fn} ${row.handler}`);
const used = new Set(rows.filter((row) => row.status === 'allowed').map((row) => row.key));
const stale = Object.keys(ALLOWED).filter((key) => !used.has(key));
for (const key of stale) console.log(`STALE     ALLOWED entry ${key} matches no unchecked handler`);
const unchecked = rows.filter((row) => row.status === 'UNCHECKED').length;
console.log(
	`\n${rows.length} consumer handler calls, ${unchecked} run part code without a prevention check.`
);
process.exit(unchecked || stale.length ? 1 : 0);
