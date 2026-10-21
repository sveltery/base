// Reads a SvelteKit remote form through its public instance: `method`, `action`, its attachment,
// `fields`, `pending` and `submitted`. Base never imports SvelteKit and never builds or decodes
// a submitted name in production, so these types restate only the shape it reads.

/** One issue as a remote form reports it: a message and the path of the field it belongs to. */
export interface RemoteFormIssue {
	message: string;
	path: (string | number)[];
}

/**
 * A SvelteKit remote form, an instance from its `for(id)`, or the value its `enhance()` returns.
 * Only `method`, `action` and the attachment are required, because the `enhance()` value carries
 * nothing else during the server render.
 */
export interface RemoteFormSource {
	readonly method: 'POST';
	readonly action: string;
	readonly [attachment: symbol]: (node: HTMLFormElement) => void;
	readonly fields?: unknown;
	readonly pending?: number;
	readonly submitted?: boolean;
}

/** A node of a remote form's `fields` proxy. Every key answers with another node. */
export interface RemoteFieldNode {
	issues?: () => RemoteFormIssue[] | undefined;
	allIssues?: () => RemoteFormIssue[] | undefined;
	value?: () => unknown;
	as?: (type: string, value?: unknown) => Record<string, unknown>;
}

export type FieldPath = (string | number)[];

/** Splits a path such as `members[0].email` or `members.0.email` into `['members', 0, 'email']`. */
export function parseFieldPath(name: string): FieldPath {
	const path: FieldPath = [];
	for (const match of name.matchAll(/([^.[\]]+)|\[(\d+)\]/g)) {
		if (match[2] !== undefined) path.push(Number(match[2]));
		else path.push(/^\d+$/.test(match[1]) ? Number(match[1]) : match[1]);
	}
	return path;
}

/** The path as one string, in the form `members[0].email`. */
export function fieldPathKey(path: FieldPath): string {
	let key = '';
	for (const segment of path) {
		if (typeof segment === 'number') key += `[${segment}]`;
		else key += key === '' ? segment : `.${segment}`;
	}
	return key;
}

/** Whether `key` is the field `base` or a field inside it. */
export function isWithinField(key: string, base: string): boolean {
	if (key === base) return true;
	if (base === '') return true;
	if (!key.startsWith(base)) return false;
	const next = key[base.length];
	return next === '.' || next === '[';
}

/** The node of `fields` at `path`. Kit builds a new proxy per access, so this is never cached. */
export function resolveFieldNode(fields: unknown, path: FieldPath): RemoteFieldNode | undefined {
	let node = fields;
	for (const key of path) {
		if (node == null || (typeof node !== 'object' && typeof node !== 'function')) return undefined;
		node = (node as Record<string | number, unknown>)[key];
	}
	return (node ?? undefined) as RemoteFieldNode | undefined;
}

/** Every issue the form holds, form-level ones included. */
export function readRemoteIssues(source: RemoteFormSource | undefined): RemoteFormIssue[] {
	const root = source?.fields as RemoteFieldNode | undefined;
	return root?.allIssues?.() ?? [];
}

/** The `<form>` attributes a remote form spreads: `method`, `action` and its attachment. */
export function remoteFormAttributes(source: RemoteFormSource): Record<string | symbol, unknown> {
	const attributes: Record<string | symbol, unknown> = {
		method: source.method,
		action: source.action
	};
	for (const key of Object.getOwnPropertySymbols(source)) {
		attributes[key] = source[key];
	}
	return attributes;
}
